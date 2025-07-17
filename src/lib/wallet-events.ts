// Global wallet connection event system
export const WALLET_EVENTS = {
  CONNECTED: 'wallet:connected',
  DISCONNECTED: 'wallet:disconnected',
} as const;

export function emitWalletEvent(event: keyof typeof WALLET_EVENTS) {
  window.dispatchEvent(new CustomEvent(WALLET_EVENTS[event]));
}

export function onWalletEvent(event: keyof typeof WALLET_EVENTS, callback: () => void) {
  window.addEventListener(WALLET_EVENTS[event], callback);
  return () => window.removeEventListener(WALLET_EVENTS[event], callback);
}