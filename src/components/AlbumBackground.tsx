import { ReactNode } from 'react';
import { useColorExtraction } from '@/hooks/useColorExtraction';

interface AlbumBackgroundProps {
  artwork: string;
  children: ReactNode;
}

export function AlbumBackground({ artwork, children }: AlbumBackgroundProps) {
  const { colors, isLoading } = useColorExtraction(artwork);

  // Create dynamic gradient based on extracted colors
  const createDynamicGradient = () => {
    if (!colors) {
      return 'from-black/60 via-black/70 to-black/90';
    }

    // Create a beautiful gradient using the extracted colors
    const primary = colors.primary + '40'; // 25% opacity
    const secondary = colors.secondary + '30'; // 19% opacity
    const accent = colors.accent + '20'; // 12% opacity

    return `from-[${primary}] via-[${secondary}] to-[${accent}]`;
  };

  // Create accent colors for UI elements
  const getAccentStyles = () => {
    if (!colors) return {};
    
    return {
      '--album-primary': colors.primary,
      '--album-secondary': colors.secondary,
      '--album-accent': colors.accent,
    } as React.CSSProperties;
  };

  return (
    <div 
      className="min-h-screen bg-black text-white overflow-hidden relative"
      style={getAccentStyles()}
    >
      {/* Album Art Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${artwork})`,
          filter: 'brightness(0.15) saturate(1.2)',
        }}
      />
      
      {/* Dynamic Color Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${
          isLoading || !colors 
            ? 'from-black/60 via-black/70 to-black/90'
            : ''
        }`}
        style={
          colors && !isLoading
            ? {
                background: `linear-gradient(135deg, 
                  ${colors.primary}40 0%, 
                  ${colors.secondary}30 50%, 
                  ${colors.accent}20 70%,
                  #000000e6 100%)`
              }
            : {}
        }
      />
      
      {/* Subtle Pattern Overlay for Texture */}
      {colors && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, ${colors.primary}20 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, ${colors.secondary}15 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, ${colors.accent}10 0%, transparent 50%)`
          }}
        />
      )}
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
} 