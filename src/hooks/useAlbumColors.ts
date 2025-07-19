import { useEffect, useState } from 'react';

interface AlbumColors {
  primary: string;
  secondary: string;
  accent: string;
  isActive: boolean;
}

export const useAlbumColors = () => {
  const [colors, setColors] = useState<AlbumColors>({
    primary: '#000000',
    secondary: '#333333',
    accent: '#666666',
    isActive: false
  });

  useEffect(() => {
    const updateColors = () => {
      // Get CSS custom properties set by AlbumBackground
      const rootStyle = getComputedStyle(document.documentElement);
      const primary = rootStyle.getPropertyValue('--album-primary').trim();
      const secondary = rootStyle.getPropertyValue('--album-secondary').trim();
      const accent = rootStyle.getPropertyValue('--album-accent').trim();

      if (primary && secondary && accent) {
        setColors({
          primary,
          secondary,
          accent,
          isActive: true
        });
      } else {
        setColors({
          primary: '#000000',
          secondary: '#333333',
          accent: '#666666',
          isActive: false
        });
      }
    };

    // Initial check
    updateColors();

    // Set up observer to watch for color changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    // Also check periodically since CSS custom properties may change
    const interval = setInterval(updateColors, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return colors;
};