/**
 * Utility functions for handling HTML content safely
 */

/**
 * Strip HTML tags and decode HTML entities
 * Converts HTML content to plain text
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  // First decode HTML entities
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  let decoded = textArea.value;
  
  // Remove HTML tags
  decoded = decoded.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace
  decoded = decoded
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return decoded;
}

/**
 * Parse HTML content and render it safely
 * Returns a sanitized HTML string that can be used with dangerouslySetInnerHTML
 */
export function parseHtmlContent(html: string): { __html: string } {
  if (!html) return { __html: '' };
  
  // Create a temporary element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags and other dangerous elements
  const scripts = temp.querySelectorAll('script, iframe, object, embed, form');
  scripts.forEach(el => el.remove());
  
  // Remove event handlers
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all event handlers
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Remove javascript: URLs
    if (el.tagName === 'A') {
      const href = el.getAttribute('href');
      if (href && href.toLowerCase().includes('javascript:')) {
        el.removeAttribute('href');
      }
    }
  });
  
  return { __html: temp.innerHTML };
}

/**
 * Extract clean text content from HTML for preview/summary
 */
export function extractTextPreview(html: string, maxLength: number = 150): string {
  const text = htmlToText(html);
  if (text.length <= maxLength) return text;
  
  // Find a good break point
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}