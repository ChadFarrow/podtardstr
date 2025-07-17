import { useState, useCallback, useEffect } from 'react';
// Bitcoin Connect imports - dynamic to prevent mobile issues
import { emitWalletEvent, onWalletEvent } from '@/lib/wallet-events';

export interface LightningWallet {
  sendPayment: (invoice: string) => Promise<void>;
  getBalance?: () => Promise<number>;
  signMessage?: (message: string) => Promise<string>;
  keysend?: (args: { destination: string; amount: number; customRecords?: Record<string, string> }) => Promise<unknown>;
  provider?: 'bitcoin-connect';
}

export function useLightningWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<'bitcoin-connect' | null>(null);
  const [connectionAttemptInProgress, setConnectionAttemptInProgress] = useState(false);
  const [connectionCancelRef, setConnectionCancelRef] = useState<{ cancel: () => void } | null>(null);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      // Check Bitcoin Connect provider - only on desktop
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        try {
          const { requestProvider } = await import('@getalby/bitcoin-connect');
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
        } catch {
          // No provider connected, which is fine
        }
      }
    };

    checkExistingConnection();

    // Listen for wallet events from other components
    const unsubscribeConnected = onWalletEvent('CONNECTED', checkExistingConnection);
    const unsubscribeDisconnected = onWalletEvent('DISCONNECTED', () => {
      setIsConnected(false);
      setWalletProvider(null);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);

  const connectWallet = useCallback(async (): Promise<LightningWallet | null> => {
    // Check if we're on mobile - Bitcoin Connect is disabled there
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      const errorMessage = 'Lightning payments are temporarily disabled on mobile devices. Please use desktop for boosting.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
    
    // Prevent multiple simultaneous connection attempts
    if (connectionAttemptInProgress) {
      console.log('Connection attempt already in progress, skipping...');
      return null;
    }
    
    setConnectionAttemptInProgress(true);
    setIsConnecting(true);
    setError(null);
    
    try {
      // Try to get existing Bitcoin Connect provider with timeout - use dynamic import
      const { requestProvider, launchModal, onConnected } = await import('@getalby/bitcoin-connect');
      
      let provider = await Promise.race([
        requestProvider(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Provider request timeout')), 5000))
      ]);
      
      if (!provider) {
        console.log('No existing provider, launching Bitcoin Connect modal...');
        
        // Use Promise to wait for actual connection
        provider = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Connection timeout after 30 seconds'));
          }, 30000);
          
          let unsubscribe: (() => void) | null = null;
          
          // Store cancel function
          const cancelRef = {
            cancel: () => {
              console.log('Connection cancelled by user');
              clearTimeout(timeout);
              if (unsubscribe) unsubscribe();
              reject(new Error('Connection cancelled by user'));
            }
          };
          setConnectionCancelRef(cancelRef);
          
          // Listen for connection event
          unsubscribe = onConnected((connectedProvider) => {
            console.log('Bitcoin Connect onConnected event fired:', connectedProvider);
            clearTimeout(timeout);
            setConnectionCancelRef(null);
            if (unsubscribe) unsubscribe();
            resolve(connectedProvider);
          });
          
          // Launch the modal
          launchModal().catch((err) => {
            console.error('Failed to launch Bitcoin Connect modal:', err);
            clearTimeout(timeout);
            setConnectionCancelRef(null);
            if (unsubscribe) unsubscribe();
            reject(err);
          });
        });
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
      
      // Don't throw for timeout errors or user cancellation, just return null
      if (errorMessage.includes('timeout') || errorMessage.includes('cancel') || errorMessage.includes('user')) {
        console.log('Connection cancelled or timeout, user may try again');
        return null;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
      setConnectionAttemptInProgress(false);
      setConnectionCancelRef(null);
    }
  }, [connectionAttemptInProgress]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setError(null);
    setWalletProvider(null);
    setConnectionAttemptInProgress(false); // Reset connection state
    
    // Emit disconnect event for other components
    emitWalletEvent('DISCONNECTED');
  }, []);

  const resetConnectionState = useCallback(() => {
    setIsConnecting(false);
    setConnectionAttemptInProgress(false);
    setError(null);
    console.log('Connection state reset');
  }, []);

  const cancelConnection = useCallback(() => {
    if (connectionCancelRef) {
      connectionCancelRef.cancel();
    } else {
      setIsConnecting(false);
      setConnectionAttemptInProgress(false);
      setError('Connection cancelled by user');
      console.log('Connection cancelled by user');
    }
  }, [connectionCancelRef]);

  return {
    connectWallet,
    disconnectWallet,
    resetConnectionState,
    cancelConnection,
    isConnecting,
    isConnected,
    error,
    walletProvider,
    connectionAttemptInProgress
  };
} 