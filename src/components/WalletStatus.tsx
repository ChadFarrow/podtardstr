import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useLightningWallet } from '@/hooks/useLightningWallet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function WalletStatus() {
  const { 
    isConnected, 
    walletProvider, 
    disconnectWallet, 
    isConnecting, 
    connectionAttemptInProgress, 
    resetConnectionState 
  } = useLightningWallet();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      disconnectWallet();
      setShowDisconnectDialog(false);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Show debug info if connection is stuck
  if (isConnecting || connectionAttemptInProgress) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Wallet Status</h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
            <span className="text-foreground">Connecting...</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetConnectionState}
            className="w-full text-xs"
          >
            Reset Connection
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          If stuck, try the reset button
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  const getWalletName = () => {
    return walletProvider === 'bitcoin-connect' ? 'Bitcoin Connect' : 'Lightning Wallet';
  };

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Wallet Status</h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-green-500" />
            <span className="text-foreground">{getWalletName()}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDisconnectDialog(true)}
            className="w-full text-xs"
            disabled={isDisconnecting}
          >
            {isDisconnecting ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <LogOut className="h-3 w-3 mr-1" />
            )}
            Disconnect Wallet
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Connected for Lightning payments
        </p>
      </div>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Wallet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your Lightning wallet. You'll need to reconnect to make payments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}