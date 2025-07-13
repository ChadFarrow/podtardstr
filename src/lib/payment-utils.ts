// Payment utility functions for Lightning Network payments

export interface ValueDestination {
  name: string;
  address: string;
  type: string;
  split: number;
}

export interface PaymentRecipient {
  name: string;
  address: string;
  type: string;
  split: number;
}

export interface PaymentResult {
  successCount: number;
  errors: string[];
  totalAmount: number;
}

export interface LightningProvider {
  sendPayment: (invoice: string) => Promise<void>;
}

/**
 * Validates a Lightning address format
 */
export function isValidLightningAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  
  // Basic format check: username@domain
  const parts = address.split('@');
  if (parts.length !== 2) return false;
  
  const [username, domain] = parts;
  if (!username || !domain) return false;
  
  // Domain should be valid
  if (!domain.includes('.')) return false;
  
  return true;
}

/**
 * Validates a node pubkey format (66 hex characters)
 */
export function isValidNodePubkey(pubkey: string): boolean {
  if (!pubkey || typeof pubkey !== 'string') return false;
  
  // Node pubkey should be 66 hex characters (33 bytes)
  const hexRegex = /^[0-9a-fA-F]{66}$/;
  return hexRegex.test(pubkey);
}

/**
 * Filters and validates Lightning recipients from ValueBlock destinations
 * Based on the Podcast Namespace value-recipient spec
 */
export function getLightningRecipients(destinations?: ValueDestination[]): PaymentRecipient[] {
  if (!destinations || !Array.isArray(destinations)) {
    console.log('No destinations provided or invalid format');
    return [];
  }
  
  console.log('Processing destinations:', destinations);
  
  const processed = destinations
    .map((d, index) => {
      // Validate address based on type
      let validAddress = false;
      let addressNote = '';
      
      switch (d.type) {
        case 'lud16':
        case 'lud06':
          validAddress = Boolean(d.address && isValidLightningAddress(d.address));
          addressNote = validAddress ? 'Valid Lightning address' : 'Invalid Lightning address format';
          break;
        case 'node':
        case 'keysend':
          validAddress = Boolean(d.address && isValidNodePubkey(d.address));
          addressNote = validAddress ? 'Valid node pubkey' : 'Invalid node pubkey format (need 66 hex chars)';
          break;
        default:
          addressNote = `Unsupported type: ${d.type}`;
      }

      console.log(`Destination ${index}:`, {
        type: d.type,
        address: d.address,
        name: d.name,
        split: d.split,
        validAddress,
        addressNote,
        addressLength: d.address?.length || 0
      });
      return d;
    })
    .filter(d => {
      // Support different recipient types according to Podcast Namespace spec
      const supportedTypes = ['lud16', 'lud06', 'node', 'keysend'];
      const validType = supportedTypes.includes(d.type);
      
      // Validate address format based on type
      let validAddress = false;
      switch (d.type) {
        case 'lud16':
        case 'lud06':
          validAddress = Boolean(d.address && isValidLightningAddress(d.address));
          break;
        case 'node':
        case 'keysend':
          validAddress = Boolean(d.address && isValidNodePubkey(d.address));
          break;
      }
      
      const hasValidSplit = d.split !== undefined && d.split > 0;
      
      console.log(`Filtering destination ${d.name || 'Unknown'}:`, {
        type: d.type,
        validType: validType,
        validAddress: validAddress,
        hasValidSplit: hasValidSplit,
        split: d.split,
        included: validType && validAddress && hasValidSplit,
        note: validType ? 
          (validAddress ? 'Supported and valid' : `Invalid ${d.type} address format`) : 
          `Unsupported type (${d.type})`
      });
      
      return validType && validAddress && hasValidSplit;
    })
    .map(d => ({
      name: d.name || 'Unknown Artist',
      address: d.address,
      type: d.type,
      split: Math.max(0, Number(d.split) || 0)
    }));
    
  console.log('Final processed recipients:', processed);
  return processed;
}

/**
 * Calculates individual payment amounts based on split percentages
 */
export function calculatePaymentAmounts(
  recipients: PaymentRecipient[], 
  totalAmount: number
): Array<{ recipient: PaymentRecipient; amount: number }> {
  const totalSplits = recipients.reduce((sum, r) => sum + r.split, 0);
  
  if (totalSplits === 0) return [];
  
  return recipients
    .map(recipient => {
      const amount = Math.floor((recipient.split / totalSplits) * totalAmount);
      return { recipient, amount };
    })
    .filter(({ amount }) => amount > 0); // Only include recipients with positive amounts
}

/**
 * Creates LNURL-pay invoice for a recipient based on their type
 */
export async function createInvoice(
  recipient: PaymentRecipient, 
  amount: number
): Promise<string> {
  // Handle different recipient types
  if (recipient.type === 'lud16' || recipient.type === 'lud06') {
    // Lightning address format: user@domain
    const [name, domain] = recipient.address.split('@');
    const lnurlp = `https://${domain}/.well-known/lnurlp/${name}`;
    
    const lnurlRes = await fetch(lnurlp);
    if (!lnurlRes.ok) {
      throw new Error(`Failed to fetch LNURL for ${recipient.address}: ${lnurlRes.status}`);
    }
    
    const lnurlData = await lnurlRes.json();
    const invoiceRes = await fetch(`${lnurlData.callback}?amount=${amount * 1000}`);
    
    if (!invoiceRes.ok) {
      throw new Error(`Failed to create invoice for ${recipient.address}: ${invoiceRes.status}`);
    }
    
    const invoiceData = await invoiceRes.json();
    return invoiceData.pr;
  } 
  
  if (recipient.type === 'node' || recipient.type === 'keysend') {
    // For node/keysend, we'd need to use a different approach
    // For now, throw an error as we need special handling
    throw new Error(`Payment type ${recipient.type} requires keysend support (not yet implemented)`);
  }
  
  throw new Error(`Unsupported recipient type: ${recipient.type}`);
}

/**
 * Processes a single payment to a recipient
 */
export async function processSinglePayment(
  provider: LightningProvider,
  recipient: PaymentRecipient,
  amount: number
): Promise<boolean> {
  try {
    const invoice = await createInvoice(recipient, amount);
    await provider.sendPayment(invoice);
    return true;
  } catch (error) {
    console.error(`❌ Payment failed to ${recipient.name}:`, error);
    return false;
  }
}

/**
 * Processes multiple payments with detailed error tracking
 */
export async function processMultiplePayments(
  provider: LightningProvider,
  recipients: PaymentRecipient[],
  totalAmount: number
): Promise<PaymentResult> {
  const paymentAmounts = calculatePaymentAmounts(recipients, totalAmount);
  let successCount = 0;
  const errors: string[] = [];

  for (const { recipient, amount } of paymentAmounts) {
    const success = await processSinglePayment(provider, recipient, amount);
    
    if (success) {
      successCount++;
    } else {
      errors.push(`Failed to pay ${amount} sats to ${recipient.name}`);
    }
  }

  return {
    successCount,
    errors,
    totalAmount
  };
}

/**
 * Formats payment status message
 */
export function formatPaymentStatus(
  result: PaymentResult
): string {
  const { successCount, errors } = result;
  
  if (successCount === 0) {
    return '❌ All payments failed';
  }
  
  const errorSummary = errors.length > 0 ? ` (${errors.length} failed)` : '';
  return `✅ Split ${result.totalAmount} sats among ${successCount} recipients! ⚡${errorSummary}`;
}

/**
 * Gets demo recipient for testing
 */
export function getDemoRecipient(): PaymentRecipient {
  return {
    name: 'Demo Artist',
    address: 'demo@getalby.com',
    type: 'lud16',
    split: 100
  };
} 