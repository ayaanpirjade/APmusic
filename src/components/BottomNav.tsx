import React from 'react';
import { Home, Search, Library, Volume2, User } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  onOpenSpotifyModal?: () => void;
  onOpenEQModal?: () => void;
  onOpenLogin?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const items: Array<{ id: NavigationTab; label: string; icon: any }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'soundboard', label: 'Soundboard', icon: Volume2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:min-w-[440px] z-40 flex items-center justify-between px-3 py-2 rounded-[28px] ios-glass-dock border border-white/20 shadow-2xl backdrop-blur-3xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id || (item.id === 'profile' && currentTab === 'settings');
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-2 px-3.5 sm:px-5 rounded-2xl transition-all duration-300 ${
              isActive
                ? 'text-white bg-gradient-to-tr from-purple-600/50 to-indigo-600/50 border border-purple-400/40 shadow-lg shadow-purple-950/50 scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-200 animate-in zoom-in-95' : ''}`} />
            <span className={`text-[10px] font-semibold mt-0.5 tracking-tight ${isActive ? 'text-white font-bold' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};


