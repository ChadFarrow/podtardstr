import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getalbyAuth, GetAlbyUser } from '@/lib/getalby-auth';
import { Loader2, Zap } from 'lucide-react';

interface GetAlbyLoginButtonProps {
  onLogin: (user: GetAlbyUser) => void;
  onError: (error: string) => void;
}

export default function GetAlbyLoginButton({ onLogin, onError }: GetAlbyLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Check if already authenticated with direct access token
      if (getalbyAuth.isAuthenticated()) {
        console.log('GetAlby already authenticated with direct access token');
        // Get user info directly
        const userInfo = await getalbyAuth.getUserInfo();
        if (userInfo) {
          onLogin(userInfo);
        } else {
          onError('Failed to get user information');
        }
        setIsLoading(false);
        return;
      }
      
      // Try OAuth flow if not using direct access token
      await getalbyAuth.startOAuthFlow();
      
      // Check if we're authenticated after OAuth flow
      setTimeout(() => {
        const userInfo = getalbyAuth.getStoredUserInfo();
        if (userInfo) {
          onLogin(userInfo);
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('GetAlby login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Handle different error scenarios
      if (errorMessage.includes('already configured with a direct access token')) {
        // This means we have a direct token, try to get user info
        try {
          const userInfo = await getalbyAuth.getUserInfo();
          if (userInfo) {
            onLogin(userInfo);
          } else {
            onError('GetAlby is configured but failed to get user information');
          }
        } catch (userError) {
          onError('GetAlby authentication failed');
        }
      } else if (errorMessage.includes('not configured')) {
        onError('GetAlby OAuth is not yet configured. Please contact support to enable Lightning payments.');
      } else {
        onError(errorMessage);
      }
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full bg-[#FFDF00] hover:bg-[#FFD700] text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" />
          Login with GetAlby
        </>
      )}
    </Button>
  );
}