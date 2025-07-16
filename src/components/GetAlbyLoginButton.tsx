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
      // Check if user is already authenticated
      if (getalbyAuth.isAuthenticated()) {
        console.log('User already authenticated with GetAlby');
        // Get user info from their authenticated session
        const userInfo = await getalbyAuth.getUserInfo();
        if (userInfo) {
          onLogin(userInfo);
        } else {
          onError('Failed to get user information');
        }
        setIsLoading(false);
        return;
      }
      
      // Start OAuth flow for user to login with their GetAlby account
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
      
      if (errorMessage.includes('not configured')) {
        onError('GetAlby OAuth is not configured. Please contact support to enable user login.');
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