import { describe, it, expect } from 'vitest';
import { parseFeedXML, convertToPaymentRecipients, isValidFeedUrl } from '../feed-parser';

describe('Feed Parser', () => {
  describe('isValidFeedUrl', () => {
    it('should validate RSS feed URLs', () => {
      expect(isValidFeedUrl('https://example.com/feed.xml')).toBe(true);
      expect(isValidFeedUrl('https://example.com/feed.rss')).toBe(true);
      expect(isValidFeedUrl('https://example.com/feed')).toBe(true);
      expect(isValidFeedUrl('https://example.com/podcast.xml')).toBe(true);
      expect(isValidFeedUrl('https://example.com')).toBe(false);
      expect(isValidFeedUrl('not-a-url')).toBe(false);
    });
  });

  describe('parseFeedXML', () => {
    it('should parse basic RSS feed structure', async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss xmlns:podcast="https://podcastindex.org/namespace/1.0">
          <channel>
            <title>Test Podcast</title>
            <description>A test podcast</description>
            <link>https://example.com</link>
            
            <podcast:value type="lightning" method="keysend" suggested="0.00000015000">
              <podcast:valueRecipient 
                name="Artist 1" 
                type="lud16" 
                address="artist@getalby.com" 
                split="60" 
              />
              <podcast:valueRecipient 
                name="Artist 2" 
                type="node" 
                address="02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee4c7e839e33bef9174531d27f52" 
                split="40" 
              />
            </podcast:value>

            <item>
              <title>Episode 1</title>
              <description>First episode</description>
              <guid>episode-1</guid>
              <enclosure url="https://example.com/ep1.mp3" type="audio/mpeg" length="12345" />
              
              <podcast:value type="lightning" method="keysend">
                <podcast:valueRecipient 
                  name="Episode Artist" 
                  type="lud16" 
                  address="episode@getalby.com" 
                  split="100" 
                />
              </podcast:value>
            </item>
          </channel>
        </rss>`;

      const feed = await parseFeedXML(xml);

      expect(feed.title).toBe('Test Podcast');
      expect(feed.description).toBe('A test podcast');
      expect(feed.link).toBe('https://example.com');
      
      // Channel value block
      expect(feed.value).toBeDefined();
      expect(feed.value?.type).toBe('lightning');
      expect(feed.value?.method).toBe('keysend');
      expect(feed.value?.suggested).toBe('0.00000015000');
      expect(feed.value?.recipients).toHaveLength(2);
      
      // First recipient
      expect(feed.value?.recipients[0]).toMatchObject({
        name: 'Artist 1',
        type: 'lud16',
        address: 'artist@getalby.com',
        split: 60
      });
      
      // Second recipient
      expect(feed.value?.recipients[1]).toMatchObject({
        name: 'Artist 2',
        type: 'node',
        address: '02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee4c7e839e33bef9174531d27f52',
        split: 40
      });

      // Episodes
      expect(feed.episodes).toHaveLength(1);
      expect(feed.episodes[0].title).toBe('Episode 1');
      expect(feed.episodes[0].guid).toBe('episode-1');
      expect(feed.episodes[0].enclosure?.url).toBe('https://example.com/ep1.mp3');
      
      // Episode value block
      expect(feed.episodes[0].value).toBeDefined();
      expect(feed.episodes[0].value?.recipients).toHaveLength(1);
      expect(feed.episodes[0].value?.recipients[0]).toMatchObject({
        name: 'Episode Artist',
        type: 'lud16',
        address: 'episode@getalby.com',
        split: 100
      });
    });

    it('should handle feeds without value blocks', async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss>
          <channel>
            <title>Regular Podcast</title>
            <description>No value block</description>
            <item>
              <title>Regular Episode</title>
              <description>No value block</description>
            </item>
          </channel>
        </rss>`;

      const feed = await parseFeedXML(xml);

      expect(feed.title).toBe('Regular Podcast');
      expect(feed.value).toBeUndefined();
      expect(feed.episodes).toHaveLength(1);
      expect(feed.episodes[0].value).toBeUndefined();
    });

    it('should filter out invalid recipients', async () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss xmlns:podcast="https://podcastindex.org/namespace/1.0">
          <channel>
            <title>Test Podcast</title>
            
            <podcast:value type="lightning" method="keysend">
              <podcast:valueRecipient name="Valid" type="lud16" address="valid@getalby.com" split="50" />
              <podcast:valueRecipient name="Invalid - No Address" type="lud16" split="25" />
              <podcast:valueRecipient name="Invalid - No Split" type="lud16" address="invalid@getalby.com" />
              <podcast:valueRecipient name="Invalid - Zero Split" type="lud16" address="zero@getalby.com" split="0" />
            </podcast:value>
          </channel>
        </rss>`;

      const feed = await parseFeedXML(xml);

      expect(feed.value?.recipients).toHaveLength(1);
      expect(feed.value?.recipients[0].name).toBe('Valid');
    });
  });

  describe('convertToPaymentRecipients', () => {
    it('should convert value recipients to payment format', () => {
      const valueBlock = {
        type: 'lightning',
        method: 'keysend',
        recipients: [
          {
            name: 'Artist 1',
            type: 'lud16',
            address: 'artist1@getalby.com',
            split: 60
          },
          {
            type: 'node',
            address: '02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee4c7e839e33bef9174531d27f52',
            split: 40
          }
        ]
      };

      const recipients = convertToPaymentRecipients(valueBlock);

      expect(recipients).toHaveLength(2);
      expect(recipients[0]).toMatchObject({
        name: 'Artist 1',
        type: 'lud16',
        address: 'artist1@getalby.com',
        split: 60
      });
      expect(recipients[1]).toMatchObject({
        name: 'Unknown Artist', // Should default when name is missing
        type: 'node',
        address: '02d5c1bf8b940dc9cadca86d1b0a3c37fbe39cee4c7e839e33bef9174531d27f52',
        split: 40
      });
    });

    it('should handle undefined value block', () => {
      const recipients = convertToPaymentRecipients(undefined);
      expect(recipients).toHaveLength(0);
    });
  });
});