import { ReactNode } from 'react';

interface AlbumBackgroundProps {
  artwork: string;
  children: ReactNode;
}

export function AlbumBackground({ artwork, children }: AlbumBackgroundProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Album Art Background */}
      <div 
        className="absolute inset-0 bg-repeat bg-top"
        style={{
          backgroundImage: `url(${artwork})`,
          backgroundSize: '300px 300px',
          filter: 'brightness(0.3) blur(1px)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/60 to-black/80" />
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
} 