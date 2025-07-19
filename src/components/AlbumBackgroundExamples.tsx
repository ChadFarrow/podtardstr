import { ReactNode, useState } from 'react';

interface AlbumBackgroundExamplesProps {
  artwork: string;
  children: ReactNode;
}

type BackgroundStyle = 'repeat' | 'single' | 'blurred' | 'watermark' | 'gradient' | 'sidebar' | 'solid';

export function AlbumBackgroundExamples({ artwork, children }: AlbumBackgroundExamplesProps) {
  const [currentStyle, setCurrentStyle] = useState<BackgroundStyle>('repeat');

  const backgroundStyles = {
    repeat: {
      className: "absolute inset-0 bg-repeat bg-top",
      style: {
        backgroundImage: `url(${artwork})`,
        backgroundSize: '300px 300px',
        filter: 'brightness(0.3) blur(1px)',
      }
    },
    single: {
      className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
      style: {
        backgroundImage: `url(${artwork})`,
        filter: 'brightness(0.2)',
      }
    },
    blurred: {
      className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
      style: {
        backgroundImage: `url(${artwork})`,
        filter: 'blur(20px) brightness(0.3)',
        transform: 'scale(1.1)', // Prevent blur edge artifacts
      }
    },
    watermark: {
      className: "absolute inset-0 bg-contain bg-center bg-no-repeat opacity-10",
      style: {
        backgroundImage: `url(${artwork})`,
        backgroundSize: '60%',
      }
    },
    gradient: {
      className: "absolute inset-0",
      style: {
        background: `linear-gradient(135deg, 
          rgba(220, 38, 38, 0.2) 0%, 
          rgba(0, 0, 0, 0.8) 50%, 
          rgba(0, 0, 0, 1) 100%)`,
      }
    },
    sidebar: {
      className: "absolute left-0 top-0 w-1/3 h-full bg-cover bg-center",
      style: {
        backgroundImage: `url(${artwork})`,
        filter: 'brightness(0.4)',
      }
    },
    solid: {
      className: "absolute inset-0 bg-black",
      style: {}
    }
  };

  const overlayStyles = {
    repeat: "absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/60 to-black/80",
    single: "absolute inset-0 bg-gradient-to-br from-red-900/60 via-black/70 to-black/90",
    blurred: "absolute inset-0 bg-gradient-to-br from-red-900/30 via-black/50 to-black/70",
    watermark: "absolute inset-0 bg-gradient-to-br from-red-900/40 via-black/60 to-black/80",
    gradient: "", // No overlay needed
    sidebar: "absolute inset-0 bg-gradient-to-r from-transparent via-black/80 to-black",
    solid: "absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/40 to-black/60"
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Style Selector */}
      <div className="absolute top-4 right-4 z-50 bg-black/80 rounded-lg p-4">
        <p className="text-sm text-gray-300 mb-2">Background Style:</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(backgroundStyles).map((style) => (
            <button
              key={style}
              onClick={() => setCurrentStyle(style as BackgroundStyle)}
              className={`px-3 py-1 text-xs rounded capitalize transition-colors ${
                currentStyle === style 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div 
        className={backgroundStyles[currentStyle].className}
        style={backgroundStyles[currentStyle].style}
      />
      
      {/* Overlay */}
      {overlayStyles[currentStyle] && (
        <div className={overlayStyles[currentStyle]} />
      )}
      
      {/* Special case for sidebar layout */}
      {currentStyle === 'sidebar' && (
        <div className="absolute right-0 top-0 w-2/3 h-full bg-black" />
      )}
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
      
      {/* Style Description */}
      <div className="absolute bottom-4 left-4 z-50 bg-black/80 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-gray-300">
          {currentStyle === 'repeat' && "Repeating tiles - current implementation"}
          {currentStyle === 'single' && "Large single image with dark overlay"}
          {currentStyle === 'blurred' && "Heavily blurred background for subtle texture"}
          {currentStyle === 'watermark' && "Faint watermark behind content"}
          {currentStyle === 'gradient' && "Color-inspired gradient (red theme)"}
          {currentStyle === 'sidebar' && "Album art as left sidebar"}
          {currentStyle === 'solid' && "Simple solid black background"}
        </p>
      </div>
    </div>
  );
}