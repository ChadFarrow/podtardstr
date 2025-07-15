# GetAlby OAuth Integration Setup

This guide explains how to set up GetAlby OAuth integration for Podtardstr to enable direct web-based Lightning wallet authentication.

## Overview

The GetAlby OAuth integration allows users to connect their GetAlby.com web accounts directly without needing the browser extension. This provides a seamless username/password login experience similar to LNBeats.

## Setup Steps

### 1. Register Your Application

1. Go to [GetAlby Developers](https://getalby.com/developers)
2. Log in with your GetAlby account
3. Create a new OAuth application
4. Fill in the application details:
   - **Application Name**: Podtardstr
   - **Description**: Nostr-based music discovery with V4V Lightning payments
   - **Application URL**: `https://podtardstr.vercel.app` (or your domain)
   - **Callback URL**: `https://podtardstr.vercel.app/oauth/callback`

### 2. Configure Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# GetAlby OAuth Configuration
VITE_GETALBY_CLIENT_ID=your_client_id_here
VITE_GETALBY_REDIRECT_URI=https://podtardstr.vercel.app/oauth/callback
```

For local development, use:
```bash
VITE_GETALBY_REDIRECT_URI=http://localhost:5173/oauth/callback
```

### 3. Update Vercel Deployment

If deploying to Vercel, add the environment variables to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the `VITE_GETALBY_CLIENT_ID` and `VITE_GETALBY_REDIRECT_URI` variables

## Features

### OAuth Flow
- **PKCE Security**: Uses Proof Key for Code Exchange for enhanced security
- **Popup/Redirect**: Supports both popup (desktop) and redirect (mobile) flows
- **Token Management**: Secure storage and automatic refresh of access tokens

### Payment Capabilities
- **Lightning Invoices**: Pay BOLT11 invoices
- **Lightning Addresses**: Pay to Lightning addresses (user@domain.com)
- **Keysend**: Direct node payments with TLV metadata
- **Balance Checking**: View wallet balance
- **V4V Payments**: Full Value4Value payment support with metadata

### User Experience
- **Seamless Login**: Username/password authentication like LNBeats
- **Persistent Sessions**: Stay logged in between visits
- **Dual Support**: Works alongside Bitcoin Connect for other wallet types
- **Mobile Optimized**: Works on mobile devices and PWAs

## Implementation Details

### Key Files
- `src/lib/getalby-auth.ts` - Core OAuth and payment logic
- `src/components/GetAlbyLoginButton.tsx` - Login button component
- `src/pages/OAuthCallback.tsx` - OAuth callback handler
- `src/hooks/useLightningWallet.ts` - Wallet connection management

### OAuth Scopes
The application requests the following scopes:
- `account:read` - Access to account information
- `payments:send` - Send Lightning payments
- `balance:read` - Read wallet balance
- `invoices:create` - Create invoices (if needed)

### Security Features
- **PKCE**: Prevents authorization code interception
- **Secure Storage**: Uses localStorage with proper cleanup
- **Token Refresh**: Automatic token refresh when needed
- **Error Handling**: Comprehensive error handling and user feedback

## Usage

### For Users
1. Click "Login with GetAlby" in the boost modal
2. Enter GetAlby username and password
3. Authorize the application
4. Start sending V4V payments immediately

### For Developers
```typescript
import { getalbyAuth } from '@/lib/getalby-auth';

// Check if authenticated
if (getalbyAuth.isAuthenticated()) {
  // Send payment
  await getalbyAuth.sendPayment('lnbc...');
  
  // Get balance
  const balance = await getalbyAuth.getBalance();
  
  // Keysend with metadata
  await getalbyAuth.keysend(pubkey, amount, { 
    '7629169': tlvMetadata 
  });
}
```

## Testing

### Local Development
1. Set up environment variables for localhost
2. Run `npm run dev`
3. Test OAuth flow with GetAlby sandbox account
4. Verify payments work correctly

### Production Testing
1. Deploy to staging environment
2. Update OAuth callback URL in GetAlby app settings
3. Test full payment flow
4. Verify mobile compatibility

## Troubleshooting

### Common Issues
- **OAuth redirect mismatch**: Ensure callback URL matches exactly
- **CORS errors**: Check API endpoint URLs and headers
- **Token expiration**: Implement proper refresh logic
- **Mobile issues**: Test popup vs redirect behavior

### Debug Mode
Set `NODE_ENV=development` to enable additional logging and debug features.

## Security Considerations

- Store client secrets securely (not in frontend code)
- Use HTTPS in production
- Implement proper error handling
- Clear tokens on logout
- Validate all API responses

## Next Steps

1. **User Testing**: Gather feedback on login flow
2. **Performance**: Optimize token refresh and API calls
3. **Error Handling**: Improve error messages and recovery
4. **Analytics**: Track usage and conversion rates
5. **Additional Features**: Implement additional GetAlby API features

## Support

For issues with the integration:
- Check GetAlby documentation: https://guides.getalby.com/developer-guide/alby-wallet-api
- GetAlby support: support@getalby.com
- GitHub issues: https://github.com/ChadFarrow/podtardstr/issues