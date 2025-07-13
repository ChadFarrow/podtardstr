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
 * Filters and validates Lightning recipients from ValueBlock destinations
 */
export function getLightningRecipients(destinations?: ValueDestination[]): PaymentRecipient[] {
  if (!destinations || !Array.isArray(destinations)) return [];
  
  return destinations
    .filter(d => d.type === 'lud16' && d.address && isValidLightningAddress(d.address))
    .map(d => ({
      name: d.name || 'Unknown',
      address: d.address,
      type: d.type,
      split: Math.max(0, d.split || 0)
    }));
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
 * Creates LNURL-pay invoice for a recipient
 */
export async function createInvoice(
  recipient: PaymentRecipient, 
  amount: number
): Promise<string> {
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

/**
 * Processes a single payment to a recipient
 */
export async function processSinglePayment(
  provider: any,
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
  provider: any,
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
  result: PaymentResult, 
  totalRecipients: number
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