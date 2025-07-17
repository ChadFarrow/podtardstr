import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, X } from 'lucide-react';
import { useLightningWallet } from '@/hooks/useLightningWallet';
// Temporarily disabled: import GetAlbyLoginButton from '@/components/GetAlbyLoginButton';
import { useValue4ValueData } from '@/hooks/useValueBlockFromRss';
import { useUserName } from '@/hooks/useUserName';
import confetti from 'canvas-confetti';
// Temporarily disabled: import { GetAlbyUser } from '@/lib/getalby-auth';
import { 
  getLightningRecipients, 
  processMultiplePayments, 
  formatPaymentStatus,
  type ValueDestination,
  type PaymentRecipient,
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

// Custom hook for payment processing
function usePaymentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');

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
    
    try {
      const result = await processMultiplePayments(provider as LightningProvider, recipients, totalAmount, metadata);
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

  return { processPayment, isProcessing, status, setStatus };
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
  const { connectWallet, /* connectGetAlbyWeb, */ isConnecting, walletProvider, /* getalbyUser */ } = useLightningWallet();
  const { processPayment, isProcessing, status, setStatus } = usePaymentProcessor();
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
        onOpenChange(false);
        setMessage('');
        setStatus('');
      }, 2000);
      
    } catch (error) {
      console.error('Boost payment error:', error);
      setStatus(error instanceof Error ? error.message : 'Payment failed or cancelled.');
    }
  }, [hasRecipients, connectWallet, processPayment, recipients, totalAmount, setStatus, contentTitle, message, onOpenChange, getDisplayName, triggerConfetti, episodeGuid, feedUrl, feedId, episodeId]);

  // Temporarily disabled GetAlby handlers due to OAuth server issues
  /*
  const handleGetAlbyLogin = useCallback(async (user: GetAlbyUser) => {
    try {
      await connectGetAlbyWeb(user);
      setStatus(`Connected to GetAlby as ${user.name || user.email}`);
    } catch (error) {
      console.error('GetAlby connection error:', error);
      setStatus('Failed to connect to GetAlby');
    }
  }, [connectGetAlbyWeb]);

  const handleGetAlbyError = useCallback((error: string) => {
    setStatus(`GetAlby error: ${error}`);
  }, []);
  */

  const handleClose = () => {
    onOpenChange(false);
    setMessage('');
    setStatus('');
  };

  if (v4vLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md" style={{ transform: 'none' }}>
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md" style={{ transform: 'none' }}>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" style={{ transform: 'none' }}>
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
              <div className="text-sm text-muted-foreground text-center">
                Connect your Lightning wallet to boost:
              </div>
              
              {/* GetAlby OAuth temporarily disabled due to server issues */}
              {/* <GetAlbyLoginButton 
                onLogin={handleGetAlbyLogin}
                onError={handleGetAlbyError}
              /> */}
              
              {/* Bitcoin Connect Button */}
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
            </div>
          )}

          {/* Boost button (shown when wallet is connected) */}
          {walletProvider && (
            <div className="space-y-2">
              {/* Temporarily disabled GetAlby user display */}
              {/* getalbyUser && (
                <div className="text-sm text-muted-foreground text-center">
                  Connected as {getalbyUser.name || getalbyUser.email}
                </div>
              ) */}
              
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