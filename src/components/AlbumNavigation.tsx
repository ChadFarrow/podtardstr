import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAlbumColors } from '@/hooks/useAlbumColors';
import { LoginArea } from '@/components/auth/LoginArea';

interface AlbumNavigationProps {
  onMenuToggle?: () => void;
  showMenu?: boolean;
}

export function AlbumNavigation({ onMenuToggle, showMenu }: AlbumNavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const albumColors = useAlbumColors();

  return (
    <div 
      className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2 backdrop-blur-lg transition-all duration-300 ${
        albumColors.isActive 
          ? 'bg-gradient-to-b to-transparent shadow-lg' 
          : theme === 'dark' 
            ? 'bg-gradient-to-b from-black/80 to-transparent' 
            : 'bg-gradient-to-b from-white/95 to-white/60 backdrop-blur-sm shadow-sm'
      }`}
      style={albumColors.isActive ? {
        background: `linear-gradient(to bottom, ${albumColors.primary}CC 0%, ${albumColors.secondary}80 50%, transparent 100%)`
      } : {}}
    >
      <div className="flex items-center space-x-4">
        <button 
          onClick={onMenuToggle}
          className={`p-2 rounded-full backdrop-blur-sm transition-all ${
            albumColors.isActive
              ? 'bg-black/30 hover:bg-black/50 border border-white/20'
              : theme === 'dark'
                ? 'bg-black/50 hover:bg-black/70'
                : 'bg-white/80 hover:bg-white/95 shadow-sm border border-gray-200'
          }`}
        >
          {showMenu ? (
            <X size={20} className={albumColors.isActive || theme === 'dark' ? 'text-white' : 'text-gray-700'} />
          ) : (
            <Menu size={20} className={albumColors.isActive || theme === 'dark' ? 'text-white' : 'text-gray-700'} />
          )}
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full backdrop-blur-sm transition-all ${
            albumColors.isActive
              ? 'bg-black/30 hover:bg-black/50 border border-white/20'
              : theme === 'dark'
                ? 'bg-black/50 hover:bg-black/70'
                : 'bg-white/80 hover:bg-white/95 shadow-sm border border-gray-200'
          }`}
        >
          {theme === 'dark' ? (
            <Sun size={20} className={albumColors.isActive || theme === 'dark' ? 'text-white' : 'text-gray-700'} />
          ) : (
            <Moon size={20} className={albumColors.isActive || theme === 'dark' ? 'text-white' : 'text-gray-700'} />
          )}
        </button>
        <LoginArea className="max-w-60" />
      </div>
    </div>
  );
}