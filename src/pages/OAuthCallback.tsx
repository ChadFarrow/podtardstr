import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getalbyAuth } from '@/lib/getalby-auth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }
        
        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }
        
        // Exchange code for tokens
        const userInfo = await getalbyAuth.handleOAuthCallback(code);
        
        if (userInfo) {
          setStatus('success');
          setMessage(`Welcome, ${userInfo.name || userInfo.email}!`);
          
          // Close popup if we're in a popup
          if (window.opener) {
            window.opener.postMessage({ type: 'getalby-auth-success', user: userInfo }, '*');
            window.close();
          } else {
            // Redirect to main app
            setTimeout(() => {
              navigate('/');
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('Failed to get user information');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };
    
    handleCallback();
  }, [navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
        <div className="mb-4 flex justify-center">
          {getIcon()}
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          GetAlby Authentication
        </h1>
        
        <p className={`text-lg ${getStatusColor()}`}>
          {message}
        </p>
        
        {status === 'error' && (
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Close
          </button>
        )}
        
        {status === 'success' && !window.opener && (
          <p className="mt-4 text-gray-400 text-sm">
            Redirecting to main app...
          </p>
        )}
      </div>
    </div>
  );
}