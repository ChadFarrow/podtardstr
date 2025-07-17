import { useState, useCallback, useEffect } from 'react';
import { requestProvider, launchModal } from '@getalby/bitcoin-connect';
import { getalbyAuth, GetAlbyUser } from '@/lib/getalby-auth';
import { emitWalletEvent, onWalletEvent } from '@/lib/wallet-events';

export interface LightningWallet {
  sendPayment: (invoice: string) => Promise<void>;
  getBalance?: () => Promise<number>;
  signMessage?: (message: string) => Promise<string>;
  keysend?: (args: { destination: string; amount: number; customRecords?: Record<string, string> }) => Promise<unknown>;
  provider?: 'bitcoin-connect' | 'getalby-web';
  user?: GetAlbyUser;
}

export function useLightningWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<'bitcoin-connect' | 'getalby-web' | null>(null);
  const [getalbyUser, setGetalbyUser] = useState<GetAlbyUser | null>(null);
  const [connectionAttemptInProgress, setConnectionAttemptInProgress] = useState(false);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      // Check GetAlby authentication
      if (getalbyAuth.isAuthenticated()) {
        const userInfo = getalbyAuth.getStoredUserInfo();
        if (userInfo) {
          setIsConnected(true);
          setWalletProvider('getalby-web');
          setGetalbyUser(userInfo);
          return;
        }
      }

      // Check Bitcoin Connect provider
      try {
        const provider = await requestProvider();
        if (provider) {
          console.log('Existing Bitcoin Connect provider found:', {
            provider,
            type: typeof provider,
            keys: Object.keys(provider),
            hasSendPayment: 'sendPayment' in provider
          });
          setIsConnected(true);
          setWalletProvider('bitcoin-connect');
        }
      } catch (err) {
        // No provider connected, which is fine
      }
    };

    checkExistingConnection();

    // Listen for wallet events from other components
    const unsubscribeConnected = onWalletEvent('CONNECTED', checkExistingConnection);
    const unsubscribeDisconnected = onWalletEvent('DISCONNECTED', () => {
      setIsConnected(false);
      setWalletProvider(null);
      setGetalbyUser(null);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  const connectWallet = useCallback(async (): Promise<LightningWallet | null> => {
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptInProgress) {
      console.log('Connection attempt already in progress, skipping...');
      return null;
    }
    
    setConnectionAttemptInProgress(true);
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if GetAlby web is already authenticated
      if (getalbyAuth.isAuthenticated()) {
        const userInfo = getalbyAuth.getStoredUserInfo();
        if (userInfo) {
          setIsConnected(true);
          setWalletProvider('getalby-web');
          setGetalbyUser(userInfo);
          emitWalletEvent('CONNECTED');
          return {
            sendPayment: async (invoice: string) => {
              await getalbyAuth.sendPayment(invoice);
            },
            getBalance: async () => {
              return await getalbyAuth.getBalance();
            },
            keysend: async (args: { destination: string; amount: number; customRecords?: Record<string, string> }) => {
              return await getalbyAuth.keysend(args.destination, args.amount, args.customRecords);
            },
            provider: 'getalby-web',
            user: userInfo,
          };
        }
      }
      
      // Try to get existing Bitcoin Connect provider with timeout
      let provider = await Promise.race([
        requestProvider(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Provider request timeout')), 5000))
      ]);
      
      if (!provider) {
        console.log('No existing provider, launching Bitcoin Connect modal...');
        
        // Launch connection modal with timeout
        await Promise.race([
          launchModal(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Modal launch timeout')), 10000))
        ]);
        
        // Add a small delay to ensure the modal is fully rendered and focusable
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Try to get provider again after modal launch with timeout
        provider = await Promise.race([
          requestProvider(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Provider request after modal timeout')), 5000))
        ]);
        
        // If still no provider, wait a bit more and try again
        if (!provider) {
          console.log('Provider still not available, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          provider = await Promise.race([
            requestProvider(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Final provider request timeout')), 3000))
          ]);
        }
      }

      if (provider) {
        console.log('Bitcoin Connect provider obtained:', {
          provider,
          type: typeof provider,
          keys: Object.keys(provider),
          hasWebln: 'webln' in provider,
          hasSendPayment: 'sendPayment' in provider,
          hasKeysend: 'keysend' in provider,
          proto: Object.getPrototypeOf(provider)
        });
        
        setIsConnected(true);
        setWalletProvider('bitcoin-connect');
        emitWalletEvent('CONNECTED');
        
        // Ensure methods are properly exposed
        const wallet: LightningWallet = {
          sendPayment: provider.sendPayment ? provider.sendPayment.bind(provider) : undefined,
          getBalance: provider.getBalance ? provider.getBalance.bind(provider) : undefined,
          signMessage: provider.signMessage ? provider.signMessage.bind(provider) : undefined,
          keysend: provider.keysend ? provider.keysend.bind(provider) : undefined,
          provider: 'bitcoin-connect',
        };
        
        console.log('Wallet object created:', {
          hasSendPayment: !!wallet.sendPayment,
          hasKeysend: !!wallet.keysend,
          hasGetBalance: !!wallet.getBalance,
          hasSignMessage: !!wallet.signMessage
        });
        
        return wallet;
      } else {
        // If Bitcoin Connect failed, provide helpful error message
        const errorMessage = 'No Lightning wallet connected. Please install a Lightning wallet extension (Alby, etc.) or try again.';
        setError(errorMessage);
        console.warn('No provider available after connection attempts');
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Lightning wallet';
      setError(errorMessage);
      console.error('Lightning wallet connection error:', err);
      
      // Don't throw for timeout errors, just return null
      if (errorMessage.includes('timeout')) {
        console.log('Connection timeout, user may try again');
        return null;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
      setConnectionAttemptInProgress(false);
    }
  }, [connectionAttemptInProgress]);

  const connectGetAlbyWeb = useCallback(async (user: GetAlbyUser): Promise<LightningWallet> => {
    setIsConnected(true);
    setWalletProvider('getalby-web');
    setGetalbyUser(user);
    emitWalletEvent('CONNECTED');
    
    return {
      sendPayment: async (invoice: string) => {
        await getalbyAuth.sendPayment(invoice);
      },
      getBalance: async () => {
        return await getalbyAuth.getBalance();
      },
      keysend: async (args: { destination: string; amount: number; customRecords?: Record<string, string> }) => {
        return await getalbyAuth.keysend(args.destination, args.amount, args.customRecords);
      },
      provider: 'getalby-web',
      user,
    };
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setError(null);
    setWalletProvider(null);
    setGetalbyUser(null);
    setConnectionAttemptInProgress(false); // Reset connection state
    
    // Logout from GetAlby if it was the connected provider
    if (walletProvider === 'getalby-web') {
      getalbyAuth.logout();
    }
    
    // Emit disconnect event for other components
    emitWalletEvent('DISCONNECTED');
  }, [walletProvider]);

  const resetConnectionState = useCallback(() => {
    setIsConnecting(false);
    setConnectionAttemptInProgress(false);
    setError(null);
    console.log('Connection state reset');
  }, []);

  return {
    connectWallet,
    connectGetAlbyWeb,
    disconnectWallet,
    resetConnectionState,
    isConnecting,
    isConnected,
    error,
    walletProvider,
    getalbyUser,
    connectionAttemptInProgress
  };
} 