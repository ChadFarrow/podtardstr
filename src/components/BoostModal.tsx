import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, X } from 'lucide-react';
import { useLightningWallet } from '@/hooks/useLightningWallet';
import { useValue4ValueData } from '@/hooks/useValueBlockFromRss';
import { useUserName } from '@/hooks/useUserName';
import confetti from 'canvas-confetti';
import { 
  getLightningRecipients, 
  processMultiplePaymentsWithProgress, 
  formatPaymentStatus,
  type ValueDestination,
  type PaymentRecipient,
  type PaymentProgress,
  LightningProvider
} from '@/lib/payment-utils';
import { getAppVersion } from '@/lib/utils';

interface BoostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valueDestinations: ValueDestination[];
  feedUrl?: string;
  episodeGuid?: string;
  totalAmount?: number;
  contentTitle?: string;
  feedId?: string;
  episodeId?: string;
}

// Custom hook for payment processing with progress
function usePaymentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [paymentProgress, setPaymentProgress] = useState<PaymentProgress[]>([]);
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);

  const processPayment = useCallback(async (
    provider: unknown,
    recipients: PaymentRecipient[],
    totalAmount: number,
    metadata?: {
      feedId?: string | number;
      itemId?: string | number;
      episodeId?: string | number;
      contentTitle?: string;
      app?: string;
      appVersion?: string;
      message?: string;
      senderName?: string;
      episodeGuid?: string;
      feedUrl?: string;
      speed?: string;
      uuid?: string;
    }
  ) => {
    setIsProcessing(true);
    setStatus(`Boosting ${totalAmount} sats among ${recipients.length} recipients...`);
    setPaymentProgress([]);
    setCurrentPaymentIndex(0);
    
    try {
      const result = await processMultiplePaymentsWithProgress(
        provider as LightningProvider, 
        recipients, 
        totalAmount,
        (progress, currentIndex, total) => {
          setPaymentProgress(progress);
          setCurrentPaymentIndex(currentIndex);
          
          if (currentIndex < total) {
            const currentRecipient = progress[currentIndex];
            if (currentRecipient?.status === 'processing') {
              setStatus(`Paying ${currentRecipient.recipientName} (${currentRecipient.amount} sats)...`);
            }
          }
        },
        metadata
      );
      
      const statusMessage = formatPaymentStatus(result);
      setStatus(statusMessage);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setStatus(`❌ ${errorMessage}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { 
    processPayment, 
    isProcessing, 
    status, 
    setStatus, 
    paymentProgress, 
    currentPaymentIndex 
  };
}

export function BoostModal({ 
  open, 
  onOpenChange, 
  valueDestinations, 
  feedUrl,
  episodeGuid,
  totalAmount = 33, 
  contentTitle = 'Content',
  feedId,
  episodeId
}: BoostModalProps) {
  const { connectWallet, isConnecting, walletProvider, cancelConnection } = useLightningWallet();
  const { processPayment, isProcessing, status, setStatus, paymentProgress, currentPaymentIndex } = usePaymentProcessor();
  const [message, setMessage] = useState('');
  const { getDisplayName } = useUserName();
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Focus management for the modal - disabled to prevent zoom issues
  useEffect(() => {
    if (open) {
      // Don't auto-focus on mobile to prevent zoom issues
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        const timer = setTimeout(() => {
          if (messageInputRef.current) {
            messageInputRef.current.focus();
          }
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }
  }, [open]);

  // Clear error state when modal opens
  useEffect(() => {
    if (open) {
      setStatus('');
      setMessage('');
    }
  }, [open, setStatus]);

  // Prevent body scroll and viewport shifts when modal opens
  useEffect(() => {
    if (open) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent scrollbar jump
      
      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Confetti celebration function
  const triggerConfetti = useCallback(() => {
    // Create a burst of confetti from multiple angles
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#32CD32', '#1E90FF', '#DA70D6']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    // Fire confetti in different directions for dramatic effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  // Use the Value4Value hook to get complete data
  const { 
    recipients: v4vRecipients, 
    hasValue: hasV4VData, 
    dataSource, 
    isLoading: v4vLoading 
  } = useValue4ValueData(feedUrl, episodeGuid, valueDestinations);

  // Get recipients
  const { recipients, hasRecipients } = useMemo(() => {
    console.log(`🔍 Boost Modal for "${contentTitle}":`, {
      valueDestinations,
      destinationsCount: valueDestinations?.length || 0,
      feedUrl,
      episodeGuid,
      hasV4VData,
      dataSource,
      v4vRecipients: v4vRecipients
    });

    // Use the enhanced Value4Value data if available
    if (hasV4VData && v4vRecipients.length > 0) {
      const lightningRecipients = getLightningRecipients(v4vRecipients);
      console.log('Using enhanced V4V data for boost modal:', {
        dataSource,
        originalCount: valueDestinations?.length || 0,
        enhancedCount: v4vRecipients.length,
        parsedCount: lightningRecipients.length,
        recipients: lightningRecipients
      });
      return {
        recipients: lightningRecipients,
        hasRecipients: lightningRecipients.length > 0
      };
    }

    // Fallback to original Podcast Index data
    const lightningRecipients = getLightningRecipients(valueDestinations);
    const hasRealRecipients = lightningRecipients.length > 0;
    
    console.log(`⚡ Lightning recipients for boost modal "${contentTitle}":`, {
      recipients: lightningRecipients,
      hasRecipients: hasRealRecipients
    });

    return {
      recipients: lightningRecipients,
      hasRecipients: hasRealRecipients
    };
  }, [valueDestinations, contentTitle, feedUrl, episodeGuid, hasV4VData, v4vRecipients, dataSource]);

  const handleBoost = useCallback(async () => {
    if (!hasRecipients) {
      setStatus('No payment recipients available.');
      return;
    }

    try {
      setStatus('Connecting to Lightning wallet...');
      
      // Blur any active element to prevent focus issues with Bitcoin Connect modal
      // Only blur if not on mobile to prevent zoom issues
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      const provider = await connectWallet();
      
      if (!provider) {
        setStatus('No Lightning wallet connected.');
        return;
      }

      await processPayment(provider as LightningProvider, recipients, totalAmount, {
        feedId: feedId,
        episodeId: episodeId,
        contentTitle,
        app: 'Podtardstr',
        appVersion: getAppVersion(),
        message,
        senderName: getDisplayName(),
        episodeGuid: episodeGuid,
        feedUrl: feedUrl,
        speed: '1',
      });
      
      // Trigger confetti celebration on successful payment!
      triggerConfetti();
      
      // Close modal on success after a short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      console.error('Boost payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed or cancelled.';
      
      // Handle user cancellation more gracefully
      if (errorMessage.includes('cancelled') || errorMessage.includes('cancel') || errorMessage.includes('timeout')) {
        setStatus('Wallet connection cancelled. Try again to connect a Lightning wallet.');
      } else {
        setStatus(errorMessage);
      }
    }
  }, [hasRecipients, connectWallet, processPayment, recipients, totalAmount, setStatus, contentTitle, message, onOpenChange, getDisplayName, triggerConfetti, episodeGuid, feedUrl, feedId, episodeId]);



  const handleClose = () => {
    onOpenChange(false);
    setMessage('');
    setStatus('');
  };

  if (v4vLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading V4V Data...</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              ⚡ Loading payment recipients...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!hasRecipients) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>No Payment Recipients</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              {valueDestinations && valueDestinations.length > 0 
                ? '⚡ V4V enabled - loading recipients...'
                : '💰 V4V payment not configured'
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Boost {contentTitle}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Message input */}
          <div>
            <label htmlFor="boost-message" className="text-sm font-medium text-foreground">
              Message (optional)
            </label>
            <Input
              ref={messageInputRef}
              id="boost-message"
              type="text"
              placeholder="Add a message with your boost..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={240}
              disabled={isProcessing || isConnecting}
              className="mt-1 text-foreground bg-background border-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/240 characters
            </p>
          </div>

          {/* Recipients info */}
          <div className="text-sm text-muted-foreground">
            <p>Recipients ({recipients.length} splits): {recipients.map(r => r.name).join(', ')}</p>
            <p>Amount: {totalAmount} sats</p>
          </div>

          {/* Wallet connection options */}
          {!walletProvider && (
            <div className="space-y-3">
              {/* Check if mobile and show different message */}
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                <div className="text-sm text-muted-foreground text-center bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                  📱 Lightning payments are temporarily disabled on mobile devices.<br/>
                  Please use desktop/laptop to boost creators.
                </div>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground text-center">
                    Connect your Lightning wallet to boost:
                  </div>
                  
                  {/* Desktop instructions */}
                  <div className="text-xs text-muted-foreground text-center bg-muted p-2 rounded">
                    💻 Bitcoin Connect will help you connect your Lightning wallet
                  </div>
                </>
              )}
              

              
              {/* Bitcoin Connect Button - only show on desktop */}
              {!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleBoost();
                  }}
                  disabled={isProcessing || isConnecting}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isProcessing || isConnecting ? (
                    'Connecting...'
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Other Lightning Wallets
                    </>
                  )}
                </Button>
              )}
              
              {/* Cancel button when connecting - only on desktop */}
              {isConnecting && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    cancelConnection();
                    handleClose();
                  }}
                  className="w-full"
                  size="lg"
                  variant="ghost"
                >
                  Cancel
                </Button>
              )}
              
              {/* Skip boost option for users who don't want to connect */}
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                className="w-full"
                size="sm"
                variant="ghost"
              >
                {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Close' : 'Skip Boost'}
              </Button>
            </div>
          )}

          {/* Boost button (shown when wallet is connected) */}
          {walletProvider && (
            <div className="space-y-2">
              
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  handleBoost();
                }}
                disabled={isProcessing || isConnecting}
                className="w-full"
                size="lg"
              >
                {isProcessing || isConnecting ? (
                  'Processing...'
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Boost {totalAmount} sats
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Status message */}
          {status && (
            <p className="text-sm text-muted-foreground text-center">{status}</p>
          )}

          {/* Payment progress display */}
          {isProcessing && paymentProgress.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground text-center">
                Progress: {currentPaymentIndex}/{paymentProgress.length}
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPaymentIndex / paymentProgress.length) * 100}%` }}
                />
              </div>
              <div className="space-y-1">
                {paymentProgress.map((progress, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{progress.recipientName}</span>
                    <span className="text-muted-foreground mx-2">{progress.amount} sats</span>
                    <span className="flex items-center">
                      {progress.status === 'pending' && (
                        <span className="text-gray-400">⏳</span>
                      )}
                      {progress.status === 'processing' && (
                        <span className="text-blue-500 animate-pulse">⚡</span>
                      )}
                      {progress.status === 'success' && (
                        <span className="text-green-500">✅</span>
                      )}
                      {progress.status === 'failed' && (
                        <span className="text-red-500" title={progress.error}>❌</span>
                      )}
                      {progress.status === 'skipped' && (
                        <span className="text-yellow-500" title={progress.error}>⚠️</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test confetti button - development only */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={triggerConfetti}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              🎉 Test Confetti
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 