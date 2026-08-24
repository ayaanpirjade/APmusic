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
    { id: 'soundboard', label: 'Sound', icon: Volume2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-2.5 sm:bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:min-w-[420px] z-40 flex items-center justify-between px-2 sm:px-3 py-1.5 rounded-[26px] glass-floating border border-white/20 shadow-2xl backdrop-blur-3xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id || (item.id === 'profile' && currentTab === 'settings');
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 sm:px-4 rounded-2xl transition-all duration-200 active:scale-95 ${
              isActive
                ? 'text-white bg-gradient-to-r from-indigo-600/70 to-purple-600/70 border border-indigo-400/40 shadow-lg shadow-indigo-950/60 scale-[1.03]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
            <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
