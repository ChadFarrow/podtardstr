import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

// Initialize Bitcoin Connect
import { init } from '@getalby/bitcoin-connect';

import App from './App.tsx';
import './index.css';

// Listen for OAuth callback messages from popups
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'getalby-auth-success') {
    console.log('GetAlby OAuth success:', event.data.user);
    // The popup will close itself, and the main app will detect the stored tokens
  }
});

// Custom font can be added here if needed:
// import '@fontsource-variable/<font-name>';

// Initialize Bitcoin Connect for Lightning payments
init({
  appName: 'Podtardstr',
});

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service Worker registered successfully:', registration.scope);
      
      // Handle service worker updates - less aggressive approach
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, but don't auto-refresh or force activation
              console.log('🔄 New app version available. Will activate on next visit.');
              
              // Dispatch update event for UI to handle if needed
              window.dispatchEvent(new CustomEvent('sw-update-available'));
              
              // Don't suggest immediate refresh to prevent loops
              console.log('💡 New version will be available on next app launch');
            }
          });
        }
      });
      
      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          console.log('📱 Service Worker update available');
        }
      });
      
    } catch (error) {
      console.warn('❌ Service Worker registration failed:', error);
    }
  });
}

// Handle PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 PWA install prompt available');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e as BeforeInstallPromptEvent;
  
  // Dispatch custom event for components to listen to
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

// Handle PWA installation
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA was installed successfully');
  deferredPrompt = null;
  
  // Optional: Track installation analytics
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Export install function for components to use
(window as Window & { installPWA?: () => Promise<boolean> }).installPWA = async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  }
  return false;
};

createRoot(document.getElementById("root")!).render(<App />);
