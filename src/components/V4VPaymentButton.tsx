import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useValue4ValueData } from '@/hooks/useValueBlockFromRss';
import { BoostModal } from '@/components/BoostModal';
import type { ValueDestination } from '@/lib/payment-utils';

interface V4VPaymentButtonProps {
  valueDestinations?: ValueDestination[];
  feedUrl?: string;
  episodeGuid?: string;
  totalAmount?: number;
  contentTitle?: string;
  feedId?: string;
  episodeId?: string;
}

export function V4VPaymentButton({ 
  valueDestinations, 
  feedUrl,
  episodeGuid,
  totalAmount = 33, 
  contentTitle = 'Content',
  feedId,
  episodeId
}: V4VPaymentButtonProps) {
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  
  // Use the same enhanced V4V data that the modal uses
  const { 
    recipients: v4vRecipients, 
    hasValue: hasV4VData 
  } = useValue4ValueData(feedUrl, episodeGuid, valueDestinations);
  
  // Calculate split count using enhanced data when available
  const splitCount = hasV4VData && v4vRecipients.length > 0 
    ? v4vRecipients.length 
    : (valueDestinations?.length || 0);

  return (
    <div className="space-y-1.5 flex flex-col items-center">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Small delay to prevent any scroll jumping
          setTimeout(() => {
            setBoostModalOpen(true);
          }, 0);
        }}
        className="text-xs w-full h-8"
      >
        <Zap className="h-3 w-3 mr-1" />
        Boost {totalAmount} sats
      </Button>
      <p className="text-xs text-center text-muted-foreground leading-tight">
        {splitCount > 0 ? `${splitCount} ${splitCount === 1 ? 'recipient' : 'recipients'}` : 'No recipients'}
      </p>
      
      <BoostModal
        open={boostModalOpen}
        onOpenChange={setBoostModalOpen}
        valueDestinations={valueDestinations || []}
        feedUrl={feedUrl}
        episodeGuid={episodeGuid}
        totalAmount={totalAmount}
        contentTitle={contentTitle}
        feedId={feedId}
        episodeId={episodeId}
      />
    </div>
  );
} 