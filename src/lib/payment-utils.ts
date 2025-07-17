// Payment utility functions for Lightning Network payments
// 
// TLV Record 7629169 follows Podcast Index 2.0 standard:
// - Required: podcast, action, ts
// - Standard: feedId, episodeId, amount, app, platform  
// - Optional: contentTitle, message

import { getAppVersion } from '@/lib/utils';

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
  keysend?: (args: { destination: string; amount: number; customRecords?: Record<string, string> }) => Promise<void>;
  provider?: 'bitcoin-connect' | 'getalby-web';
}

export interface TLVMetadata {
  podcast: string;
  feedID: number | string;
  itemID?: number | string;
  episode: string;
  episode_guid: string;
  ts: number;
  action: 'stream' | 'boost';
  speed: string;
  app_name: string;
  app_version?: string;
  value_msat: number;
  value_msat_total: number;
  name?: string; // Lightning address of the sender
  sender_name: string; // Human readable name of sender
  message?: string;
  uuid?: string;
  url?: string;
  amount?: number; // Optional amount in sats
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
 * Ensures all recipients get at least 1 sat if they have a valid split
 */
export function calculatePaymentAmounts(
  recipients: PaymentRecipient[], 
  totalAmount: number
): Array<{ recipient: PaymentRecipient; amount: number }> {
  const totalSplits = recipients.reduce((sum, r) => sum + r.split, 0);
  
  if (totalSplits === 0) return [];
  
  // Calculate initial amounts
  const initialAmounts = recipients.map(recipient => {
    const amount = Math.floor((recipient.split / totalSplits) * totalAmount);
    return { recipient, amount };
  });
  
  // Filter out recipients with 0 amounts
  const validAmounts = initialAmounts.filter(({ amount }) => amount > 0);
  
  // If we have recipients with 0 amounts but they have valid splits, give them at least 1 sat
  const zeroAmountRecipients = initialAmounts.filter(({ amount }) => amount === 0);
  if (zeroAmountRecipients.length > 0 && validAmounts.length > 0) {
    // Calculate how much we can spare (minimum 1 sat per zero recipient)
    const neededForZeros = zeroAmountRecipients.length;
    const currentTotal = validAmounts.reduce((sum, { amount }) => sum + amount, 0);
    const availableForZeros = Math.min(neededForZeros, totalAmount - currentTotal);
    
    if (availableForZeros > 0) {
      // Add 1 sat to each zero recipient
      zeroAmountRecipients.slice(0, availableForZeros).forEach(({ recipient }) => {
        validAmounts.push({ recipient, amount: 1 });
      });
    }
  }
  
  // Sort by split percentage (highest first) to prioritize larger splits
  return validAmounts.sort((a, b) => b.recipient.split - a.recipient.split);
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
    
    // LNURL-pay spec requires amount in millisats
    const amountMsats = amount * 1000;
    const invoiceRes = await fetch(`${lnurlData.callback}?amount=${amountMsats}`);
    
    if (!invoiceRes.ok) {
      throw new Error(`Failed to create invoice for ${recipient.address}: ${invoiceRes.status}`);
    }
    
    const invoiceData = await invoiceRes.json();
    return invoiceData.pr;
  } 
  
  if (recipient.type === 'node' || recipient.type === 'keysend') {
    // For node/keysend payments, we need to use the keysend method directly
    // This will be handled in processSinglePayment function
    throw new Error(`Keysend payments don't use invoices - use keysend method directly`);
  }
  
  throw new Error(`Unsupported recipient type: ${recipient.type}`);
}

/**
 * Processes a single payment to a recipient
 */
export async function processSinglePayment(
  provider: LightningProvider,
  recipient: PaymentRecipient,
  amount: number,
  metadata?: {
    feedId?: string | number;
    itemId?: string | number;
    episodeId?: string | number; // For backwards compatibility
    contentTitle?: string;
    totalAmount?: number;
    app?: string;
    appVersion?: string;
    message?: string;
    senderName?: string;
    episodeGuid?: string;
    feedUrl?: string;
    speed?: string;
    uuid?: string;
  }
): Promise<boolean> {
  try {
    // Log provider details for debugging
    console.log('Provider object:', {
      hasKeysend: !!provider.keysend,
      hasSendPayment: !!provider.sendPayment,
      providerType: provider.provider,
      methods: Object.keys(provider).filter(key => typeof (provider as any)[key] === 'function')
    });
    
    // Handle keysend payments (node type)
    if (recipient.type === 'node' || recipient.type === 'keysend') {
      console.log(`⚡ Attempting keysend payment to ${recipient.name} (${recipient.address})`);
      
      // Try to use keysend if available
      if (provider.keysend && typeof provider.keysend === 'function') {
        try {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const currentDate = new Date();
          console.log(`🕐 Timestamp Debug: ${currentTimestamp} (${currentDate.toISOString()})`);
          
          const tlvData = {
            podcast: metadata?.contentTitle || '',
            feedID: metadata?.feedId || '',
            itemID: metadata?.itemId || metadata?.episodeId || '', // Use itemId if available, fall back to episodeId
            episode: metadata?.contentTitle || '',
            episode_guid: metadata?.episodeGuid || '',
            ts: currentTimestamp, // Current Unix timestamp in seconds
            action: 'boost',
            speed: metadata?.speed || '1',
            app_name: metadata?.app || 'Podtardstr',
            app_version: metadata?.appVersion || getAppVersion(),
            value_msat: (amount || 0) * 1000,
            value_msat_total: metadata?.totalAmount ? metadata.totalAmount * 1000 : (amount || 0) * 1000,
            uuid: metadata?.uuid || crypto.randomUUID(),
            name: '', // This would be the sender's Lightning address (e.g., user@getalby.com)
            sender_name: metadata?.senderName || 'random podtardstr',
            message: metadata?.message || '',
            url: metadata?.feedUrl || '',
            amount: amount // Amount in sats
          };
          
          console.log('📤 TLV Data being sent:', tlvData);
          
          await provider.keysend({
            destination: recipient.address,
            amount: amount, // Alby keysend expects sats, not msats
            customRecords: {
              // TLV record 7629169 for Podcast Index 2.0 standard
              '7629169': JSON.stringify(tlvData)
            }
          });
          console.log(`✅ Keysend payment successful to ${recipient.name}`);
          return true;
        } catch (keysendError) {
          console.warn(`❌ Keysend failed for ${recipient.name}:`, keysendError);
        }
      }
      
      // Fallback: Try to use WebLN's sendPayment with a special keysend request
      if (provider.sendPayment && typeof provider.sendPayment === 'function') {
        try {
          // Some wallets support keysend through a special format
          // Note: keysend: URL scheme expects sats, not msats
          const keysendRequest = `keysend:${recipient.address}?amount=${amount}`;
          await provider.sendPayment(keysendRequest);
          console.log(`✅ Keysend payment successful to ${recipient.name} (via sendPayment fallback)`);
          return true;
        } catch (fallbackError) {
          console.warn(`❌ Keysend fallback failed for ${recipient.name}:`, fallbackError);
        }
      } else {
        console.warn(`⚠️ Wallet provider doesn't have sendPayment method for keysend fallback`);
      }
      
      // Final fallback: Skip keysend payments gracefully
      console.warn(`⚠️ Skipping keysend payment to ${recipient.name} - wallet doesn't support keysend`);
      return false;
    }
    
    // Handle invoice-based payments (lud16, lud06)
    const invoice = await createInvoice(recipient, amount);
    await provider.sendPayment(invoice);
    console.log(`✅ Invoice payment successful to ${recipient.name}`);
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
  totalAmount: number,
  metadata?: {
    feedId?: string | number;
    itemId?: string | number;
    episodeId?: string | number; // For backwards compatibility
    contentTitle?: string;
    app?: string;
    appVersion?: string;
    message?: string;
    senderName?: string;
    episodeGuid?: string;
    feedUrl?: string;
    speed?: string;
    uuid?: string;
  }
): Promise<PaymentResult> {
  const paymentAmounts = calculatePaymentAmounts(recipients, totalAmount);
  
  // Debug logging for split calculation
  console.log('🔍 Payment Split Debug:', {
    totalAmount,
    recipientCount: recipients.length,
    paymentAmountsCount: paymentAmounts.length,
    recipients: recipients.map(r => ({ name: r.name, split: r.split, type: r.type })),
    calculatedAmounts: paymentAmounts.map(({ recipient, amount }) => ({ 
      name: recipient.name, 
      split: recipient.split, 
      amount,
      type: recipient.type 
    })),
    totalCalculated: paymentAmounts.reduce((sum, { amount }) => sum + amount, 0)
  });
  
  let successCount = 0;
  const errors: string[] = [];

  for (const { recipient, amount } of paymentAmounts) {
    const success = await processSinglePayment(provider, recipient, amount, {
      ...metadata,
      totalAmount
    });
    
    if (success) {
      successCount++;
    } else {
      // Categorize the error type
      if (recipient.type === 'node' || recipient.type === 'keysend') {
        errors.push(`Skipped keysend payment to ${recipient.name} (${amount} sats)`);
      } else {
        errors.push(`Failed to pay ${amount} sats to ${recipient.name}`);
      }
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
  
  if (errors.length > 0) {
    const skippedKeysend = errors.filter(error => error.includes('keysend')).length;
    if (skippedKeysend > 0) {
      return `✅ Split ${result.totalAmount} sats among ${successCount} recipients! ⚡\n⚠️ ${skippedKeysend} keysend payments skipped (wallet doesn't support keysend)`;
    } else {
      return `✅ Split ${result.totalAmount} sats among ${successCount} recipients! ⚡\n❌ ${errors.length} payments failed`;
    }
  }
  
  return `✅ Split ${result.totalAmount} sats among ${successCount} recipients! ⚡`;
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