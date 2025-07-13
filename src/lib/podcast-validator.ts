// Podcast Namespace Validator
// Inspired by RSS Blue tools but implemented in TypeScript
// Validates RSS feeds against Podcast Namespace standards

export interface ValidationError {
  level: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  element?: string;
  line?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  feedInfo?: {
    title?: string;
    description?: string;
    language?: string;
    author?: string;
    categories?: string[];
    episodeCount: number;
  };
  namespaceSupport?: {
    podcastNamespace: boolean;
    valueSupport: boolean;
    chaptersSupport: boolean;
    transcriptSupport: boolean;
    socialInteract: boolean;
    alternateEnclosure: boolean;
  };
}

export class PodcastValidator {
  private doc: Document;
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];
  private info: ValidationError[] = [];

  constructor(xmlContent: string) {
    const parser = new DOMParser();
    this.doc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Check for XML parsing errors
    const parserError = this.doc.querySelector('parsererror');
    if (parserError) {
      this.addError('PARSE_ERROR', 'Failed to parse XML document', parserError.textContent || 'Unknown parsing error');
    }
  }

  public validate(): ValidationResult {
    this.errors = [];
    this.warnings = [];
    this.info = [];

    try {
      this.validateBasicStructure();
      this.validateRequiredElements();
      this.validatePodcastNamespace();
      this.validateValueElements();
      this.validateEpisodes();
      this.validateUrls();
    } catch (error) {
      this.addError('VALIDATION_ERROR', 'Validation process failed', error instanceof Error ? error.message : 'Unknown error');
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
      feedInfo: this.extractFeedInfo(),
      namespaceSupport: this.checkNamespaceSupport(),
    };
  }

  private addError(code: string, message: string, details?: string) {
    this.errors.push({
      level: 'error',
      code,
      message: details ? `${message}: ${details}` : message,
    });
  }

  private addWarning(code: string, message: string, element?: string) {
    this.warnings.push({
      level: 'warning',
      code,
      message,
      element,
    });
  }

  private addInfo(code: string, message: string, element?: string) {
    this.info.push({
      level: 'info',
      code,
      message,
      element,
    });
  }

  private validateBasicStructure() {
    const rss = this.doc.querySelector('rss');
    if (!rss) {
      this.addError('MISSING_RSS', 'Document must have an <rss> root element');
      return;
    }

    const version = rss.getAttribute('version');
    if (version !== '2.0') {
      this.addWarning('RSS_VERSION', `RSS version should be 2.0, found: ${version || 'none'}`);
    }

    const channel = this.doc.querySelector('rss > channel');
    if (!channel) {
      this.addError('MISSING_CHANNEL', 'RSS must contain a <channel> element');
    } else {
      // Debug: Count channel children
      const channelChildren = channel.children.length;
      this.addInfo('CHANNEL_STRUCTURE', `Channel contains ${channelChildren} child elements`);
    }
  }

  private validateRequiredElements() {
    const requiredElements = [
      { name: 'title', selector: 'channel > title' },
      { name: 'description', selector: 'channel > description' },
      { name: 'link', selector: 'channel > link' }
    ];
    
    for (const { name, selector } of requiredElements) {
      const element = this.doc.querySelector(selector);
      if (!element || !element.textContent?.trim()) {
        // For link, provide more debugging info
        if (name === 'link') {
          const allLinks = this.doc.querySelectorAll('link');
          const channelLinks = this.doc.querySelectorAll('channel link');
          this.addError('MISSING_REQUIRED', 
            `Channel must contain a <${name}> element with content. ` +
            `Found ${allLinks.length} total links, ${channelLinks.length} in channel`
          );
        } else {
          this.addError('MISSING_REQUIRED', `Channel must contain a <${name}> element with content`);
        }
      } else {
        // Add debug info for successful detection
        if (name === 'link') {
          this.addInfo('CHANNEL_LINK_FOUND', `Found channel link: ${element.textContent.trim()}`);
        }
      }
    }

    // Check for language
    const language = this.doc.querySelector('channel > language');
    if (!language) {
      this.addWarning('MISSING_LANGUAGE', 'Channel should include a <language> element');
    }
  }

  private validatePodcastNamespace() {
    const rss = this.doc.querySelector('rss');
    const podcastNamespace = rss?.getAttribute('xmlns:podcast');
    
    if (!podcastNamespace) {
      this.addInfo('NO_PODCAST_NS', 'Feed does not declare podcast namespace (xmlns:podcast)');
      return;
    }

    if (podcastNamespace !== 'https://podcastindex.org/namespace/1.0') {
      this.addWarning('PODCAST_NS_VERSION', `Podcast namespace should be https://podcastindex.org/namespace/1.0, found: ${podcastNamespace}`);
    } else {
      this.addInfo('PODCAST_NS_FOUND', 'Feed declares podcast namespace - enhanced features available');
    }

    // Check for podcast:guid using multiple approaches
    let podcastGuid = this.doc.querySelector('podcast\\:guid');
    if (!podcastGuid) {
      // Try alternative approaches for namespaced elements
      const allElements = this.doc.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        if (element.tagName === 'podcast:guid' || element.localName === 'guid' && element.namespaceURI === 'https://podcastindex.org/namespace/1.0') {
          podcastGuid = element;
          break;
        }
      }
    }
    
    if (!podcastGuid) {
      this.addWarning('MISSING_PODCAST_GUID', 'Consider adding <podcast:guid> for feed identification');
    } else {
      this.addInfo('PODCAST_GUID_FOUND', `Found podcast:guid: ${podcastGuid.textContent?.trim()}`);
    }

    // Check for podcast:locked
    let locked = this.doc.querySelector('podcast\\:locked');
    if (!locked) {
      const allElements = this.doc.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        if (element.tagName === 'podcast:locked' || element.localName === 'locked' && element.namespaceURI === 'https://podcastindex.org/namespace/1.0') {
          locked = element;
          break;
        }
      }
    }
    
    if (!locked) {
      this.addInfo('NO_LOCKED_TAG', 'Consider adding <podcast:locked> to prevent unauthorized feed moves');
    }
  }

  private validateValueElements() {
    // Find podcast:value elements using multiple approaches
    let valueElements = this.doc.querySelectorAll('podcast\\:value');
    if (valueElements.length === 0) {
      const allElements = this.doc.getElementsByTagName('*');
      const foundValues: Element[] = [];
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        if (element.tagName === 'podcast:value' || (element.localName === 'value' && element.namespaceURI === 'https://podcastindex.org/namespace/1.0')) {
          foundValues.push(element);
        }
      }
      valueElements = foundValues as unknown as NodeListOf<Element>;
    }
    
    if (valueElements.length === 0) {
      this.addInfo('NO_VALUE_TAGS', 'Feed does not contain Value4Value (podcast:value) elements');
      return;
    }

    valueElements.forEach((valueElement, index) => {
      const type = valueElement.getAttribute('type');
      const method = valueElement.getAttribute('method');
      const _suggested = valueElement.getAttribute('suggested');

      if (!type) {
        this.addError('VALUE_MISSING_TYPE', `podcast:value element ${index + 1} missing required 'type' attribute`);
      }

      if (!method) {
        this.addError('VALUE_MISSING_METHOD', `podcast:value element ${index + 1} missing required 'method' attribute`);
      }

      // Check for value recipients
      let recipients = valueElement.querySelectorAll('podcast\\:valueRecipient');
      if (recipients.length === 0) {
        // Try alternative approach for namespaced elements
        const children = valueElement.children;
        const foundRecipients: Element[] = [];
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.tagName === 'podcast:valueRecipient' || (child.localName === 'valueRecipient' && child.namespaceURI === 'https://podcastindex.org/namespace/1.0')) {
            foundRecipients.push(child);
          }
        }
        recipients = foundRecipients as unknown as NodeListOf<Element>;
      }
      
      if (recipients.length === 0) {
        this.addWarning('VALUE_NO_RECIPIENTS', `podcast:value element ${index + 1} has no recipients`);
      }

      let totalSplit = 0;
      recipients.forEach((recipient, recipientIndex) => {
        const name = recipient.getAttribute('name');
        const recipientType = recipient.getAttribute('type');
        const address = recipient.getAttribute('address');
        const split = recipient.getAttribute('split');

        if (!name) {
          this.addWarning('RECIPIENT_NO_NAME', `Value recipient ${recipientIndex + 1} missing 'name' attribute`);
        }

        if (!recipientType) {
          this.addError('RECIPIENT_NO_TYPE', `Value recipient ${recipientIndex + 1} missing required 'type' attribute`);
        }

        if (!address) {
          this.addError('RECIPIENT_NO_ADDRESS', `Value recipient ${recipientIndex + 1} missing required 'address' attribute`);
        }

        if (!split) {
          this.addError('RECIPIENT_NO_SPLIT', `Value recipient ${recipientIndex + 1} missing required 'split' attribute`);
        } else {
          const splitValue = parseInt(split);
          if (isNaN(splitValue) || splitValue < 0 || splitValue > 100) {
            this.addError('RECIPIENT_INVALID_SPLIT', `Value recipient ${recipientIndex + 1} has invalid split value: ${split}`);
          } else {
            totalSplit += splitValue;
          }
        }

        // Validate address format based on type
        if (recipientType && address) {
          this.validateRecipientAddress(recipientType, address, recipientIndex + 1);
        }
      });

      if (totalSplit !== 100) {
        this.addWarning('VALUE_SPLIT_NOT_100', `Value block ${index + 1} recipient splits total ${totalSplit}%, should total 100%`);
      }
    });
  }

  private validateRecipientAddress(type: string, address: string, recipientIndex: number) {
    switch (type.toLowerCase()) {
      case 'lud16':
        if (!address.includes('@') || !address.includes('.')) {
          this.addError('INVALID_LUD16', `Recipient ${recipientIndex}: LUD16 address should be in email format (user@domain.com)`);
        }
        break;
      case 'lud06':
        if (!address.startsWith('LNURL') && !address.startsWith('lnurl')) {
          this.addError('INVALID_LUD06', `Recipient ${recipientIndex}: LUD06 address should start with LNURL`);
        }
        break;
      case 'node':
      case 'keysend':
        if (!/^[0-9a-fA-F]{66}$/.test(address)) {
          this.addError('INVALID_NODE_KEY', `Recipient ${recipientIndex}: Node key should be 66 character hex string`);
        }
        break;
    }
  }

  private validateEpisodes() {
    const items = this.doc.querySelectorAll('channel > item');
    
    if (items.length === 0) {
      this.addWarning('NO_EPISODES', 'Feed contains no episodes (<item> elements)');
      return;
    }

    items.forEach((item, index) => {
      const title = item.querySelector('title');
      const enclosure = item.querySelector('enclosure');
      
      if (!title || !title.textContent?.trim()) {
        this.addWarning('EPISODE_NO_TITLE', `Episode ${index + 1} missing title`);
      }

      if (!enclosure) {
        this.addWarning('EPISODE_NO_ENCLOSURE', `Episode ${index + 1} missing audio/video enclosure`);
      } else {
        const url = enclosure.getAttribute('url');
        const type = enclosure.getAttribute('type');
        
        if (!url) {
          this.addError('ENCLOSURE_NO_URL', `Episode ${index + 1} enclosure missing URL`);
        }
        
        if (!type) {
          this.addWarning('ENCLOSURE_NO_TYPE', `Episode ${index + 1} enclosure missing type attribute`);
        }
      }
    });

    this.addInfo('EPISODE_COUNT', `Feed contains ${items.length} episodes`);
  }

  private validateUrls() {
    const urlElements = this.doc.querySelectorAll('link, enclosure[url], image > url');
    
    urlElements.forEach((element) => {
      const url = element.getAttribute('url') || element.textContent;
      if (url && !this.isValidUrl(url)) {
        this.addWarning('INVALID_URL', `Invalid URL found: ${url}`);
      }
    });
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  private extractFeedInfo() {
    const title = this.doc.querySelector('channel > title')?.textContent || undefined;
    const description = this.doc.querySelector('channel > description')?.textContent || undefined;
    const language = this.doc.querySelector('channel > language')?.textContent || undefined;
    let author = this.doc.querySelector('channel > managingEditor')?.textContent || undefined;
    if (!author) {
      const podcastAuthor = this.doc.querySelector('podcast\\:author') || 
        Array.from(this.doc.getElementsByTagName('*')).find(el => 
          el.tagName === 'podcast:author' || (el.localName === 'author' && el.namespaceURI === 'https://podcastindex.org/namespace/1.0')
        );
      author = podcastAuthor?.textContent || undefined;
    }
    
    const categories: string[] = [];
    this.doc.querySelectorAll('channel > category').forEach(cat => {
      const text = cat.textContent?.trim();
      if (text) categories.push(text);
    });

    const episodeCount = this.doc.querySelectorAll('channel > item').length;

    return {
      title,
      description,
      language,
      author,
      categories,
      episodeCount,
    };
  }

  private checkNamespaceSupport() {
    const rss = this.doc.querySelector('rss');
    const podcastNamespace = !!rss?.getAttribute('xmlns:podcast');
    
    // Helper function to count podcast namespace elements
    const countPodcastElements = (localName: string): number => {
      let count = this.doc.querySelectorAll(`podcast\\:${localName}`).length;
      if (count === 0) {
        const allElements = this.doc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const element = allElements[i];
          if (element.tagName === `podcast:${localName}` || (element.localName === localName && element.namespaceURI === 'https://podcastindex.org/namespace/1.0')) {
            count++;
          }
        }
      }
      return count;
    };
    
    return {
      podcastNamespace,
      valueSupport: countPodcastElements('value') > 0,
      chaptersSupport: countPodcastElements('chapters') > 0,
      transcriptSupport: countPodcastElements('transcript') > 0,
      socialInteract: countPodcastElements('socialInteract') > 0,
      alternateEnclosure: countPodcastElements('alternateEnclosure') > 0,
    };
  }
}

export async function validatePodcastFeed(feedUrl: string): Promise<ValidationResult> {
  try {
    // Try direct fetch first, then CORS proxy (same as our feed parser)
    let response: Response;
    let xmlText: string;
    
    try {
      response = await fetch(feedUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Direct fetch failed: ${response.status}`);
      }
      
      xmlText = await response.text();
    } catch {
      // Fallback to CORS proxy
      const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      response = await fetch(corsProxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
      }
      
      const proxyData = await response.json();
      xmlText = proxyData.contents;
      
      if (!xmlText) {
        throw new Error('No content received from feed');
      }
    }

    const validator = new PodcastValidator(xmlText);
    return validator.validate();
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        level: 'error',
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch feed',
      }],
      warnings: [],
      info: [],
    };
  }
}