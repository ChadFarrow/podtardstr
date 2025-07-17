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
      
      // Try to get existing Bitcoin Connect provider
      let provider = await requestProvider();
      
      if (!provider) {
        // No provider connected, launch connection modal
        await launchModal();
        
        // Add a small delay to ensure the modal is fully rendered and focusable
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try to get provider again after modal launch
        provider = await requestProvider();
        
        // If still no provider, wait a bit more and try again
        if (!provider) {
          await new Promise(resolve => setTimeout(resolve, 500));
          provider = await requestProvider();
        }
      }

      if (provider) {
        setIsConnected(true);
        setWalletProvider('bitcoin-connect');
        emitWalletEvent('CONNECTED');
        return {
          ...provider,
          provider: 'bitcoin-connect',
        };
      } else {
        throw new Error('No Lightning wallet connected.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Lightning wallet';
      setError(errorMessage);
      console.error('Lightning wallet connection error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, []);

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
    
    // Logout from GetAlby if it was the connected provider
    if (walletProvider === 'getalby-web') {
      getalbyAuth.logout();
    }
    
    // Emit disconnect event for other components
    emitWalletEvent('DISCONNECTED');
  }, [walletProvider]);

  return {
    connectWallet,
    connectGetAlbyWeb,
    disconnectWallet,
    isConnecting,
    isConnected,
    error,
    walletProvider,
    getalbyUser
  };
} 