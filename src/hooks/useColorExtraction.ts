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

            const primary = rgbToHex(dominantColor);
            const paletteHex = palette.map(rgbToHex);
            
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