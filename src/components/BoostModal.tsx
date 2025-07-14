import { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, X } from 'lucide-react';
import { useLightningWallet } from '@/hooks/useLightningWallet';
import { useValue4ValueData } from '@/hooks/useValueBlockFromRss';
import { useUserName } from '@/hooks/useUserName';
import { 
  getLightningRecipients, 
  processMultiplePayments, 
  formatPaymentStatus,
  type ValueDestination,
  type PaymentRecipient,
  LightningProvider
} from '@/lib/payment-utils';

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
  const { connectWallet, isConnecting } = useLightningWallet();
  const { processPayment, isProcessing, status, setStatus } = usePaymentProcessor();
  const [message, setMessage] = useState('');
  const { getDisplayName } = useUserName();

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
        appVersion: '1.03',
        message,
        senderName: getDisplayName(),
        episodeGuid: episodeGuid,
        feedUrl: feedUrl,
        speed: '1',
      });
      
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
  }, [hasRecipients, connectWallet, processPayment, recipients, totalAmount, setStatus, contentTitle, message, onOpenChange, getDisplayName]);

  const handleClose = () => {
    onOpenChange(false);
    setMessage('');
    setStatus('');
  };

  if (v4vLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
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
      <Dialog open={open} onOpenChange={onOpenChange}>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <p>Recipients: {recipients.map(r => r.name).join(', ')}</p>
            <p>Amount: {totalAmount} sats</p>
          </div>

          {/* Boost button */}
          <Button 
            onClick={handleBoost}
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
          
          {/* Status message */}
          {status && (
            <p className="text-sm text-muted-foreground text-center">{status}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 