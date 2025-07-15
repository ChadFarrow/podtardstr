import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { APP_VERSION } from './version'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gets the current app version
 * This should match the APP_VERSION in VersionDisplay.tsx
 */
export function getAppVersion(): string {
  return APP_VERSION;
}

/**
 * Cleans and sanitizes HTML content for better readability
 * Removes HTML tags and decodes HTML entities
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content (removes all HTML tags)
  let cleanText = tempDiv.textContent || tempDiv.innerText || '';
  
  // Decode common HTML entities
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
  };
  
  // Replace HTML entities
  Object.entries(htmlEntities).forEach(([entity, replacement]) => {
    cleanText = cleanText.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Clean up extra whitespace
  cleanText = cleanText
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
    .trim();
  
  return cleanText;
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Formats episode description for better readability
 */
export function formatEpisodeDescription(description: string, maxLength: number = 200): string {
  const cleanDescription = cleanHtmlContent(description);
  return truncateText(cleanDescription, maxLength);
}
