import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';

interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  palette: string[];
}

export const useColorExtraction = (imageUrl: string | undefined) => {
  const [colors, setColors] = useState<ExtractedColors | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setColors(null);
      return;
    }

    const extractColors = async () => {
      setIsLoading(true);
      console.log('🎨 Starting color extraction for:', imageUrl);
      try {
        const colorThief = new ColorThief();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          try {
            // Get dominant color
            const dominantColor = colorThief.getColor(img);
            
            // Get color palette (5 colors)
            const palette = colorThief.getPalette(img, 5);
            
            // Convert RGB arrays to hex strings
            const rgbToHex = (rgb: number[]) => {
              return `#${rgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
            };

            // Enhance colors for better visibility
            const enhanceColor = (rgb: number[]) => {
              const [r, g, b] = rgb;
              // Calculate luminance to detect gray colors
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
              
              // If it's a very gray color (low saturation), add some color bias
              const maxChannel = Math.max(r, g, b);
              const minChannel = Math.min(r, g, b);
              const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;
              
              if (saturation < 0.3 && luminance > 100) {
                // Add blue bias for light grays
                return [Math.min(255, r + 20), Math.min(255, g + 30), Math.min(255, b + 60)];
              } else if (saturation < 0.3 && luminance <= 100) {
                // Add purple bias for dark grays
                return [Math.min(255, r + 40), Math.min(255, g + 20), Math.min(255, b + 50)];
              }
              
              // Boost saturation for all colors
              const boostedR = Math.min(255, Math.round(r * 1.2));
              const boostedG = Math.min(255, Math.round(g * 1.2));
              const boostedB = Math.min(255, Math.round(b * 1.2));
              
              return [boostedR, boostedG, boostedB];
            };

            const enhancedDominant = enhanceColor(dominantColor);
            const enhancedPalette = palette.map(enhanceColor);

            const primary = rgbToHex(enhancedDominant);
            const paletteHex = enhancedPalette.map(rgbToHex);
            
            // Use palette for variety
            const secondary = paletteHex[1] || primary;
            const accent = paletteHex[2] || secondary;

            const extractedColors = {
              primary,
              secondary,
              accent,
              palette: paletteHex
            };
            
            console.log('🎨 Colors extracted successfully:', extractedColors);
            setColors(extractedColors);
          } catch (error) {
            console.error('Error extracting colors:', error);
            setColors(null);
          }
        };

        img.onerror = () => {
          console.error('🎨 Failed to load image for color extraction:', imageUrl);
          setColors(null);
        };

        // Handle CORS issues with a proxy or fallback
        img.src = imageUrl;
      } catch (error) {
        console.error('Color extraction error:', error);
        setColors(null);
      } finally {
        setIsLoading(false);
      }
    };

    extractColors();
  }, [imageUrl]);

  return { colors, isLoading };
};