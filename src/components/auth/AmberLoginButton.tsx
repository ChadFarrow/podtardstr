import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink } from 'lucide-react';
import { useLoginActions } from '@/hooks/useLoginActions';

interface AmberLoginButtonProps {
  onLogin: () => void;
  onClose: () => void;
}

export default function AmberLoginButton({ onLogin, onClose }: AmberLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const login = useLoginActions();

  // Check if user is on Android
  const isAndroid = /Android/i.test(navigator.userAgent);

  const handleAmberLogin = async () => {
    setIsLoading(true);
    
    try {
      // Try to launch Amber app directly
      const amberUri = 'nostrsigner:';
      window.location.href = amberUri;
      
      // Show instructions after attempting to launch
      setTimeout(() => {
        setShowInstructions(true);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Amber launch failed:', error);
      setShowInstructions(true);
      setIsLoading(false);
    }
  };

  const handleBunkerUri = async (bunkerUri: string) => {
    if (!bunkerUri.trim() || !bunkerUri.startsWith('bunker://')) {
      alert('Please enter a valid bunker URI starting with bunker://');
      return;
    }
    
    setIsLoading(true);
    try {
      await login.bunker(bunkerUri);
      onLogin();
      onClose();
    } catch (error) {
      console.error('Bunker login failed:', error);
      alert('Failed to connect with Amber. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showInstructions) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <Smartphone className="w-8 h-8 mx-auto mb-2 text-orange-500" />
          <h3 className="font-semibold text-lg">Connect with Amber</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Secure Nostr key management for Android
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="space-y-2">
            <p className="font-medium">Step 1: Open Amber app</p>
            <p className="text-muted-foreground">
              If Amber didn't open automatically, launch it manually from your app drawer.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Step 2: Generate connection</p>
            <p className="text-muted-foreground">
              In Amber: Tap "Applications" → "Add Application" → Enter "Podtardstr" → Generate bunker URI
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Step 3: Paste bunker URI</p>
            <input
              type="text"
              placeholder="bunker://npub...@relay..."
              className="w-full p-2 border rounded bg-background"
              onPaste={(e) => {
                const uri = e.clipboardData.getData('text');
                if (uri.startsWith('bunker://')) {
                  handleBunkerUri(uri);
                }
              }}
              onChange={(e) => {
                if (e.target.value.startsWith('bunker://')) {
                  handleBunkerUri(e.target.value);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Paste the bunker URI from Amber here
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInstructions(false)}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://github.com/greenart7c3/Amber', '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Get Amber
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAmberLogin}
      disabled={isLoading}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-full"
    >
      {isLoading ? (
        'Opening Amber...'
      ) : (
        <>
          <Smartphone className="w-4 h-4 mr-2" />
          Login with Amber
          {!isAndroid && <span className="text-xs ml-1">(Android)</span>}
        </>
      )}
    </Button>
  );
}