import React, { useState } from 'react';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallback?: string;
}

/**
 * SecureImage component that handles HTTP to HTTPS conversion and provides fallbacks
 * for podcast images that may be served over insecure connections
 */
export function SecureImage({ src, alt, fallback, ...props }: SecureImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Convert HTTP URLs to HTTPS-proxied versions
  const getSecureImageUrl = (url: string) => {
    if (!url) return fallback || '';
    
    // For any HTTP URL, immediately use proxy to avoid mixed content issues
    if (url.startsWith('http://')) {
      return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    }
    
    // HTTPS URLs can be used directly
    if (url.startsWith('https://')) {
      return url;
    }
    
    return url;
  };

  const handleImageError = () => {
    if (!imageError && currentSrc && currentSrc.startsWith('https://') && src?.startsWith('http://')) {
      // If HTTPS version failed and we have an HTTP original, try a different approach
      
      
      // Try using an image proxy service
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}`;
      setCurrentSrc(proxyUrl);
      setImageError(false);
    } else if (!imageError && fallback) {
      // Try fallback image
      setCurrentSrc(fallback);
      setImageError(false);
    } else {
      // No more options, show error state
      setImageError(true);
    }
  };

  if (imageError) {
    return (
      <div 
        {...props} 
        className={`bg-muted flex items-center justify-center text-muted-foreground text-xs ${props.className}`}
      >
        🎵
      </div>
    );
  }

  return (
    <img
      {...props}
      src={getSecureImageUrl(currentSrc || '')}
      alt={alt}
      onError={handleImageError}
      loading="lazy"
    />
  );
}