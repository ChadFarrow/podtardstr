import { useState, useCallback } from 'react';
import { requestProvider, launchModal } from '@getalby/bitcoin-connect';

export interface LightningWallet {
  sendPayment: (invoice: string) => Promise<void>;
  getBalance?: () => Promise<number>;
  signMessage?: (message: string) => Promise<string>;
}

export function useLightningWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async (): Promise<LightningWallet | null> => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Try to get existing provider
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
        return provider;
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

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    connectWallet,
    disconnectWallet,
    isConnecting,
    isConnected,
    error
  };
} 