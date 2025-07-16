import { LN, oauth } from '@getalby/sdk';

// GetAlby OAuth configuration
const GETALBY_CONFIG = {
  authUrl: 'https://getalby.com/oauth',
  tokenUrl: 'https://api.getalby.com/oauth/token',
  clientId: import.meta.env.VITE_GETALBY_CLIENT_ID || 'demo-client-id',
  redirectUri: import.meta.env.VITE_GETALBY_REDIRECT_URI || `${window.location.origin}/oauth/callback`,
  scopes: ['account:read', 'payments:send', 'balance:read', 'invoices:create'],
};

// PKCE utilities
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

// Storage utilities
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'getalby_access_token',
  REFRESH_TOKEN: 'getalby_refresh_token',
  CODE_VERIFIER: 'getalby_code_verifier',
  USER_INFO: 'getalby_user_info',
};

export interface GetAlbyUser {
  identifier: string;
  email: string;
  lightning_address?: string;
  name?: string;
  avatar?: string;
  keysend_custom_key?: string;
  keysend_custom_value?: string;
  keysend_pubkey?: string;
  nostr_pubkey?: string;
}

export interface GetAlbyTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

export class GetAlbyAuth {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private ln: LN | null = null;
  private oauthClient: oauth.Client | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (this.accessToken) {
      try {
        // Initialize OAuth client with access token
        this.oauthClient = new oauth.Client(this.accessToken);
        // For LN operations, we'll use the OAuth client directly
        this.ln = null; // We'll use oauthClient instead
      } catch (error) {
        console.warn('Failed to initialize OAuth client with access token:', error);
        this.oauthClient = null;
        this.ln = null;
      }
    }
  }

  private saveTokensToStorage(tokens: GetAlbyTokens): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token || null;
    
    try {
      // Initialize OAuth client with access token
      this.oauthClient = new oauth.Client(this.accessToken);
      // For LN operations, we'll use the OAuth client directly
      this.ln = null; // We'll use oauthClient instead
    } catch (error) {
      console.warn('Failed to initialize OAuth client with access token:', error);
      this.oauthClient = null;
      this.ln = null;
    }
  }

  // Start OAuth flow
  async startOAuthFlow(): Promise<void> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
    
    const params = new URLSearchParams({
      client_id: GETALBY_CONFIG.clientId,
      response_type: 'code',
      redirect_uri: GETALBY_CONFIG.redirectUri,
      scope: GETALBY_CONFIG.scopes.join(' '),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    
    const authUrl = `${GETALBY_CONFIG.authUrl}?${params.toString()}`;
    
    // Open in popup or redirect
    if (window.innerWidth <= 768) {
      // Mobile - redirect
      window.location.href = authUrl;
    } else {
      // Desktop - popup
      const popup = window.open(
        authUrl,
        'getalby-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check if we got tokens
          this.loadTokensFromStorage();
        }
      }, 1000);
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(code: string): Promise<GetAlbyUser | null> {
    const codeVerifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }
    
    const tokenResponse = await fetch(GETALBY_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: GETALBY_CONFIG.clientId,
        code,
        redirect_uri: GETALBY_CONFIG.redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }
    
    const tokens: GetAlbyTokens = await tokenResponse.json();
    this.saveTokensToStorage(tokens);
    
    // Clean up
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
    
    // Get user info
    const userInfo = await this.getUserInfo();
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    }
    
    return userInfo;
  }

  // Get user info using GetAlby OAuth client
  async getUserInfo(): Promise<GetAlbyUser | null> {
    if (!this.oauthClient) return null;
    
    try {
      const response = await this.oauthClient.accountInformation();
      return response;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.oauthClient;
  }

  // Get stored user info
  getStoredUserInfo(): GetAlbyUser | null {
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Send payment using GetAlby OAuth client
  async sendPayment(invoice: string): Promise<unknown> {
    if (!this.oauthClient) {
      throw new Error('Not authenticated with GetAlby');
    }
    
    try {
      return await this.oauthClient.sendPayment({ invoice });
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  // Pay lightning address using GetAlby OAuth client
  async payLightningAddress(address: string, amount: number, comment?: string): Promise<unknown> {
    if (!this.oauthClient) {
      throw new Error('Not authenticated with GetAlby');
    }
    
    try {
      // For lightning address payments, we need to use keysend
      return await this.oauthClient.keysend({ 
        destination: address, 
        amount: amount * 1000, // Convert sats to millisats
        memo: comment 
      });
    } catch (error) {
      console.error('Lightning address payment error:', error);
      throw error;
    }
  }

  // Keysend payment using GetAlby OAuth client
  async keysend(destination: string, amount: number, customRecords?: Record<string, string>): Promise<unknown> {
    if (!this.oauthClient) {
      throw new Error('Not authenticated with GetAlby');
    }
    
    try {
      return await this.oauthClient.keysend({ 
        destination, 
        amount: amount * 1000, // Convert sats to millisats
        customRecords 
      });
    } catch (error) {
      console.error('Keysend payment error:', error);
      throw error;
    }
  }

  // Get balance using GetAlby OAuth client
  async getBalance(): Promise<number> {
    if (!this.oauthClient) {
      throw new Error('Not authenticated with GetAlby');
    }
    
    try {
      const data = await this.oauthClient.accountBalance();
      return data.balance;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Create invoice using GetAlby OAuth client
  async createInvoice(amount: number, description?: string): Promise<unknown> {
    if (!this.oauthClient) {
      throw new Error('Not authenticated with GetAlby');
    }
    
    try {
      return await this.oauthClient.createInvoice({ 
        amount: amount * 1000, // Convert sats to millisats
        description: description || ''
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
    
    this.accessToken = null;
    this.refreshToken = null;
    this.ln = null;
    this.oauthClient = null;
  }
}

// Singleton instance
export const getalbyAuth = new GetAlbyAuth();