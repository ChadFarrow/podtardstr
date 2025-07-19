import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SecureImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export function SecureImage({ src, alt, className, fallback = '🎵' }: SecureImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // Convert HTTP to HTTPS for security
    let secureSrc = src;
    if (src.startsWith('http://')) {
      secureSrc = src.replace('http://', 'https://');
    }

    // Use image proxy for HTTP images to avoid mixed content
    if (src.startsWith('http://')) {
      secureSrc = `https://images.weserv.nl/?url=${encodeURIComponent(src)}&w=800&h=800&fit=cover`;
    }

    setImgSrc(secureSrc);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-800 text-gray-400 text-4xl', className)}>
        {fallback}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={cn('animate-pulse bg-gray-800', className)} />
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}