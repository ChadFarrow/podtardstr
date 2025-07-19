import { ReactNode } from 'react';
import { useColorExtraction } from '@/hooks/useColorExtraction';

interface AlbumBackgroundProps {
  artwork: string;
  children: ReactNode;
}

export function AlbumBackground({ artwork, children }: AlbumBackgroundProps) {
  const { colors, isLoading } = useColorExtraction(artwork);



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
                  ${colors.primary}60 0%, 
                  ${colors.secondary}50 50%, 
                  ${colors.accent}40 70%,
                  #000000cc 100%)`
              }
            : {}
        }
      />
      
      {/* Debug: Show extracted colors */}
      {colors && !isLoading && (
        <div className="absolute top-4 right-4 z-50 bg-black/80 p-2 rounded text-xs text-white">
          <div>Primary: {colors.primary}</div>
          <div>Secondary: {colors.secondary}</div>
          <div>Accent: {colors.accent}</div>
        </div>
      )}
      
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