import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Sliders,
  LogIn,
  LogOut,
  Check,
  ArrowDownToLine,
  Music2,
  Radio,
  HardDrive,
  Smartphone,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { APLogo } from './APLogo';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { useAppTheme } from '../context/ThemeContext';
import { NavigationTab, AudioQualitySetting } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  onOpenAIDJ: () => void;
  onOpenSpotifyModal: () => void;
  onOpenEQModal: () => void;
  onOpenLogin: () => void;
  onOpenOfflineModal?: () => void;
  onOpenInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAIDJ,
  onOpenSpotifyModal,
  onOpenEQModal,
  onOpenLogin,
  onOpenOfflineModal,
  onOpenInstall,
}) => {
  const { user, logout } = useAuth();
  const { audioQuality, setAudioQuality } = useAudio();
  const { theme, systemTheme, resolvedTheme, setTheme, toggleTheme } = useAppTheme();
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const isNativeApp = typeof document !== 'undefined'
    && document.documentElement.classList.contains('capacitor-native');

  const qualities: Array<{ id: AudioQualitySetting; label: string; desc: string }> = [
    { id: '320kbps', label: 'Extreme 320 kbps', desc: 'Ultra Hi-Res Lossless Audio' },
    { id: '160kbps', label: 'High 160 kbps', desc: 'Optimal Quality & Speed' },
    { id: '96kbps', label: 'Standard 96 kbps', desc: 'Data Saver Mode' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 backdrop-blur-2xl bg-inherit/60 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          onClick={() => setCurrentTab('home')}
          className="cursor-pointer group select-none"
        >
          <APLogo size="md" showText={true} />
        </div>

        {/* Center Quick Search Trigger */}
        <div
          onClick={() => setCurrentTab('search')}
          className="hidden md:flex items-center gap-3 w-72 lg:w-96 px-4 py-2 rounded-2xl ios-glass border border-white/10 hover:border-white/25 cursor-pointer text-slate-400 hover:text-slate-200 transition-all duration-200 group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="text-sm font-medium">Search songs, artists, albums...</span>
          <kbd className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
            ⌘K
          </kbd>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Install APK / App Button */}
          {onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-pink-400 text-xs font-bold transition-all hover:scale-105 shadow-md shadow-pink-950/30"
              title="Install Android App / Download APK"
            >
              <Smartphone className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Install APK</span>
            </button>
          )}

          {/* Offline Cache Button */}
          {onOpenOfflineModal && (
            <button
              onClick={onOpenOfflineModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all hover:scale-105 shadow-md shadow-emerald-950/30"
              title="IndexedDB Offline Music Manager"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Offline</span>
            </button>
          )}

          {/* AI DJ Button */}
          <button
            onClick={onOpenAIDJ}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 text-indigo-300 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 shadow-md shadow-indigo-950/40"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="hidden md:inline">AI DJ</span>
          </button>

          {/* Spotify Importer Quick Button */}
          <button
            onClick={onOpenSpotifyModal}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">Import Spotify</span>
          </button>

          {/* System OS Theme Switcher Menu — website only; APK is dark-only */}
          {!isNativeApp && <div className="relative">
            <button
              onClick={() => setShowThemeMenu((prev) => !prev)}
              className="p-2 rounded-2xl ios-glass-pill hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
              title={`Theme: ${theme === 'system' ? `Auto (OS: ${systemTheme})` : theme}`}
            >
              {theme === 'system' ? (
                <Laptop className="w-4 h-4 text-indigo-400" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl ios-glass-dock border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Theme Mode</span>
                  <span className="text-[9px] font-normal normal-case text-indigo-400">OS: {systemTheme}</span>
                </div>
                <button
                  onClick={() => {
                    setTheme('system');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    theme === 'system'
                      ? 'bg-indigo-600/30 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div>System OS (Auto)</div>
                      <div className="text-[10px] text-slate-400">Syncs with device</div>
                    </div>
                  </div>
                  {theme === 'system' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>

                <button
                  onClick={() => {
                    setTheme('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-600/30 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark Mode</span>
                  </div>
                  {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>

                <button
                  onClick={() => {
                    setTheme('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                    theme === 'light'
                      ? 'bg-indigo-600/30 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Mode</span>
                  </div>
                  {theme === 'light' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>
            )}
          </div>}

          {/* Audio Quality Badge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl ios-glass-pill hover:bg-white/15 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="hidden sm:inline">{audioQuality}</span>
            </button>

            {showQualityMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl ios-glass-dock border border-white/20 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Audio Quality
                </div>
                {qualities.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setAudioQuality(q.id);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      audioQuality === q.id
                        ? 'bg-indigo-600/30 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div>{q.label}</div>
                      <div className="text-[10px] text-slate-400">{q.desc}</div>
                    </div>
                    {audioQuality === q.id && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Equalizer Quick Button */}
          <button
            onClick={onOpenEQModal}
            className="p-2 rounded-2xl ios-glass-pill hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="5-Band Equalizer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* User Profile & Account */}
          <div className="relative">
            {user?.isAuthenticated ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 p-1 rounded-2xl ios-glass border border-indigo-400/40 hover:scale-105 transition-all"
                title="Your APMUSIC Account"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/40"
                />
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-xs font-semibold text-white transition-all hover:scale-105 shadow-md shadow-indigo-950/40"
                title="Sign In / Manage Profile"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-bold">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

