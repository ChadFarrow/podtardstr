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
    
    // If already HTTPS, use as-is
    if (url.startsWith('https://')) {
      return url;
    }
    
    // If HTTP, try converting to HTTPS first
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    return url;
  };

  const handleImageError = () => {
    if (!imageError && currentSrc && currentSrc.startsWith('https://') && src?.startsWith('http://')) {
      // If HTTPS version failed and we have an HTTP original, try a different approach
      console.log(`Failed to load HTTPS version of: ${currentSrc}`);
      
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