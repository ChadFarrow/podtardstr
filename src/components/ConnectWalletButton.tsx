import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useLightningWallet } from '@/hooks/useLightningWallet';

interface ConnectWalletButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ConnectWalletButton({ 
  className = '', 
  variant = 'outline', 
  size = 'sm' 
}: ConnectWalletButtonProps) {
  const { connectWallet, isConnecting } = useLightningWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      // Error is already handled in the hook
      console.error('Failed to connect wallet:', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      className={className}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-3 w-3 mr-1" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}