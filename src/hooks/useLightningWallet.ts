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

  // Listen for wallet events from other components
  useEffect(() => {
    // Only listen for wallet events, don't check for existing connection
    // This prevents the Bitcoin Connect modal from popping up on page load
    const unsubscribeConnected = onWalletEvent('CONNECTED', () => {
      setIsConnected(true);
      setWalletProvider('bitcoin-connect');
    });
    
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
      // Import Bitcoin Connect functions - use dynamic import
      const { init, launchModal, onConnected } = await import('@getalby/bitcoin-connect');
      
      // Always initialize Bitcoin Connect before using it
      console.log('Initializing Bitcoin Connect...');
      await init({
        appName: 'Podtardstr',
      });
      
      console.log('Launching Bitcoin Connect modal...');
      
      // Always launch the modal directly without checking for existing provider
      // This ensures the modal only appears when user explicitly clicks connect
      const provider = await new Promise((resolve, reject) => {
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
          try {
            launchModal();
            // Modal launched successfully, connection will be handled by onConnected
          } catch (err) {
            console.error('Failed to launch Bitcoin Connect modal:', err);
            clearTimeout(timeout);
            setConnectionCancelRef(null);
            if (unsubscribe) unsubscribe();
            reject(err);
          }
        });

      if (provider && typeof provider === 'object') {
        const providerObj = provider as Record<string, unknown> & {
          sendPayment?: (invoice: string) => Promise<void>;
          getBalance?: () => Promise<number>;
          signMessage?: (message: string) => Promise<string>;
          keysend?: (args: { destination: string; amount: number; customRecords?: Record<string, string> }) => Promise<unknown>;
        };
        console.log('Bitcoin Connect provider obtained:', {
          provider,
          type: typeof provider,
          keys: Object.keys(providerObj),
          hasWebln: 'webln' in providerObj,
          hasSendPayment: 'sendPayment' in providerObj,
          hasKeysend: 'keysend' in providerObj,
          proto: Object.getPrototypeOf(providerObj)
        });
        
        setIsConnected(true);
        setWalletProvider('bitcoin-connect');
        emitWalletEvent('CONNECTED');
        
        // Ensure methods are properly exposed
        const wallet: LightningWallet = {
          sendPayment: providerObj.sendPayment ? providerObj.sendPayment.bind(providerObj) : undefined,
          getBalance: providerObj.getBalance ? providerObj.getBalance.bind(providerObj) : undefined,
          signMessage: providerObj.signMessage ? providerObj.signMessage.bind(providerObj) : undefined,
          keysend: providerObj.keysend ? providerObj.keysend.bind(providerObj) : undefined,
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