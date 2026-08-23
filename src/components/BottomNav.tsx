import React from 'react';
import { Home, Search, Library, ArrowDownToLine, Sliders, Settings } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  onOpenSpotifyModal: () => void;
  onOpenEQModal: () => void;
  onOpenLogin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSpotifyModal,
  onOpenEQModal,
  onOpenLogin,
}) => {
  const items = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'search' as NavigationTab, label: 'Search', icon: Search },
    { id: 'library' as NavigationTab, label: 'Library', icon: Library },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around px-2 py-2 rounded-[28px] ios-glass-dock border border-white/15 shadow-2xl backdrop-blur-3xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-indigo-400 bg-white/10 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Spotify Import Quick Tap */}
      <button
        onClick={onOpenSpotifyModal}
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <ArrowDownToLine className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">Spotify</span>
      </button>

      {/* Equalizer Quick Tap */}
      <button
        onClick={onOpenEQModal}
        className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-purple-400 hover:text-purple-300 transition-colors"
      >
        <Sliders className="w-5 h-5" />
        <span className="text-[10px] font-semibold mt-0.5">EQ FX</span>
      </button>
    </nav>
  );
};

