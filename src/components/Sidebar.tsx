import React from 'react';
import {
  Home,
  Search,
  Library,
  Heart,
  ArrowDownToLine,
  Sliders,
  Sparkles,
  Settings,
  PlusCircle,
  FolderPlus,
  Music,
  LogIn,
  User,
  HardDrive,
  Smartphone,
  Volume2,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  onOpenCreatePlaylist: () => void;
  onOpenSpotifyModal: () => void;
  onOpenAIDJ: () => void;
  onOpenEQ: () => void;
  onOpenLogin: () => void;
  onOpenOfflineModal?: () => void;
  onOpenInstall?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreatePlaylist,
  onOpenSpotifyModal,
  onOpenAIDJ,
  onOpenEQ,
  onOpenLogin,
  onOpenOfflineModal,
  onOpenInstall,
}) => {
  const { user, likedSongs, customPlaylists, offlineDownloadedSongs } = useAuth();

  const mainNavItems: Array<{ id: NavigationTab; label: string; icon: any }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'soundboard', label: 'Soundboard', icon: Volume2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-65px)] sticky top-[65px] p-4 gap-4 overflow-y-auto select-none">
      {/* Main Navigation Glass Card */}
      <div className="rounded-3xl ios-glass p-3 flex flex-col gap-1 border border-white/10">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'ios-glass-active text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Tools & Import */}
      <div className="rounded-3xl ios-glass p-3 flex flex-col gap-1 border border-white/10">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Experience Tools
        </div>

        <button
          onClick={onOpenAIDJ}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span>AI DJ & Mood Mix</span>
        </button>

        <button
          onClick={onOpenSpotifyModal}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
          </div>
          <span>Spotify Importer</span>
        </button>

        <button
          onClick={onOpenEQ}
          className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
            <Sliders className="w-4 h-4 text-purple-400" />
          </div>
          <span>5-Band Equalizer</span>
        </button>
      </div>

      {/* Library Collections & Playlists */}
      <div className="rounded-3xl ios-glass p-3 flex-1 flex flex-col gap-2 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Your Playlists
          </span>
          <button
            onClick={onOpenCreatePlaylist}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Create Playlist"
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
          </button>
        </div>

        {/* Liked Songs Shortcut */}
        <div
          onClick={() => setCurrentTab('library')}
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="truncate flex-1">
            <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
              Liked Songs
            </div>
            <div className="text-xs text-slate-400">{likedSongs.length} tracks</div>
          </div>
        </div>

        {/* Offline Downloads Shortcut */}
        {offlineDownloadedSongs.length > 0 && (
          <div
            onClick={() => setCurrentTab('library')}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <ArrowDownToLine className="w-4 h-4 text-white" />
            </div>
            <div className="truncate flex-1">
              <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                Downloaded Offline
              </div>
              <div className="text-xs text-slate-400">{offlineDownloadedSongs.length} tracks</div>
            </div>
          </div>
        )}

        {/* Custom / Imported Playlists List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 mt-1">
          {customPlaylists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => setCurrentTab('library')}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer text-slate-300 hover:text-white transition-colors group"
            >
              <Music className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
              <span className="text-xs font-medium truncate">{pl.name}</span>
              {pl.isSpotifyImport && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Spotify
                </span>
              )}
            </div>
          ))}

          {customPlaylists.length === 0 && (
            <div
              onClick={onOpenCreatePlaylist}
              className="px-3 py-4 text-center border border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-indigo-400/40 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <FolderPlus className="w-6 h-6 mx-auto mb-1 text-slate-500" />
              <span className="text-xs">Create your first playlist</span>
            </div>
          )}
        </div>
      </div>

      {/* User Profile / Login Card */}
      <div
        onClick={onOpenLogin}
        className="rounded-3xl ios-glass p-3 flex items-center gap-3 border border-white/10 hover:border-indigo-400/30 cursor-pointer transition-all group"
      >
        <img
          src={user.avatar}
          alt={user.name}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-2xl object-cover ring-1 ring-white/20 group-hover:ring-indigo-400"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
            {user.name}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {user.isAuthenticated ? (user.isGoogleAuth ? 'Google Account' : 'Local Profile') : 'Tap to Login'}
          </div>
        </div>
        {user.isAuthenticated ? (
          <User className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <LogIn className="w-4 h-4 text-indigo-400 shrink-0" />
        )}
      </div>

      {/* Install Android APK / PWA */}
      {onOpenInstall && (
        <button
          onClick={onOpenInstall}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/30 text-pink-300 shadow-md shadow-pink-950/30"
        >
          <Smartphone className="w-4 h-4 text-pink-400" />
          <span>Install Android APK</span>
        </button>
      )}

      {/* Offline Mode Manager */}
      {onOpenOfflineModal && (
        <button
          onClick={onOpenOfflineModal}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 shadow-md shadow-emerald-950/30"
        >
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Offline Mode ({offlineDownloadedSongs.length})</span>
        </button>
      )}

      {/* Settings Tab */}
      <button
        onClick={() => setCurrentTab('settings')}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all border border-white/10 ${
          currentTab === 'settings'
            ? 'ios-glass-active text-white'
            : 'ios-glass text-slate-400 hover:text-white'
        }`}
      >
        <Settings className="w-4 h-4" />
        <span>Settings & Audio FX</span>
      </button>
    </aside>
  );
};
