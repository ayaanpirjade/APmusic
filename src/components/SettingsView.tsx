import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  Moon,
  Sparkles,
  Clock,
  ShieldCheck,
  HardDrive,
  Trash2,
  LogOut,
  LogIn,
  CheckCircle2,
  Radio,
  Headphones,
  Zap,
  Disc3,
  Layers,
  Activity,
  Palette,
  ArrowDownToLine,
  User,
} from 'lucide-react';
import { AudioQualitySetting } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

interface SettingsViewProps {
  onOpenEQ?: () => void;
  onOpenEqualizer?: () => void;
  onOpenLogin?: () => void;
  onOpenOfflineModal?: () => void;
  onOpenInstall?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenEQ,
  onOpenEqualizer,
  onOpenLogin,
  onOpenOfflineModal,
  onOpenInstall,
}) => {
  const triggerEQ = onOpenEQ || onOpenEqualizer || (() => {});
  const {
    audioQuality,
    setAudioQuality,
    equalizerBands,
    setBassBoost,
    toggleSpatialAudio,
  } = useAudio();

  const { user, loginWithGoogle, logout, downloadedSongs } = useAuth();
  const { theme, setTheme } = useAppTheme();
  const isNativeApp = typeof document !== 'undefined'
    && document.documentElement.classList.contains('capacitor-native');

  const [gapless, setGapless] = useState(true);
  const [crossfade, setCrossfade] = useState<'off' | '3s' | '5s'>('3s');
  const [autoplay, setAutoplay] = useState(true);
  const [clearCacheMessage, setClearCacheMessage] = useState<string | null>(null);

  const qualities: Array<{ id: AudioQualitySetting; title: string; desc: string; badge: string }> = [
    {
      id: '320kbps',
      title: 'Lossless Master (320 kbps AAC)',
      desc: 'Crystal-clear studio audio fidelity with full dynamic acoustic range.',
      badge: 'HI-RES MASTER',
    },
    {
      id: '160kbps',
      title: 'High Quality (160 kbps)',
      desc: 'Optimal balance between audio quality and mobile data bandwidth.',
      badge: 'HQ',
    },
    {
      id: '96kbps',
      title: 'Data Saver (96 kbps)',
      desc: 'Lightweight streaming for slower or limited cellular connections.',
      badge: 'SAVER',
    },
  ];

  const handleClearCache = () => {
    localStorage.removeItem('apmusic_history');
    setClearCacheMessage('Temporary cache and history cleared successfully.');
    setTimeout(() => setClearCacheMessage(null), 3000);
  };

  return (
    <div className="apmusic-settings-page relative z-10 block w-full min-w-0 max-w-3xl mx-auto space-y-7 pb-40 pt-1 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Customize playback fidelity, studio audio DSP, offline storage, and appearance
        </p>
      </div>

      {/* 1. Account Section */}
      <section className="p-5 sm:p-6 rounded-[28px] glass-card border border-white/20 space-y-4">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md ring-2 ring-indigo-500/20"
            />
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="min-w-0 truncate text-base font-bold text-white">{user.name}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  {user.isGoogleAuth ? 'Google Verified' : 'Local User'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {user.isGoogleAuth ? (
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-1.5 px-4 py-2 rounded-2xl glass-pill hover:bg-rose-500/20 hover:border-rose-500/30 text-rose-300 text-xs font-bold transition-all sm:w-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin || loginWithGoogle}
                className="flex w-full items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 transition-all hover:scale-105 sm:w-auto"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connect Google</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Playback Settings */}
      <section className="p-5 sm:p-6 rounded-[28px] glass-card border border-white/20 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Volume2 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Playback</h3>
        </div>

        {/* Audio Quality Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Streaming Audio Quality
          </label>
          <div className="grid grid-cols-1 gap-2">
            {qualities.map((q) => {
              const isSelected = audioQuality === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setAudioQuality(q.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400/60 shadow-md shadow-indigo-950/50'
                      : 'glass-card border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4 className="min-w-0 break-words text-xs sm:text-sm font-bold text-white">{q.title}</h4>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {q.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{q.desc}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Crossfade, Gapless & Autoplay */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Gapless Playback</h4>
              <p className="text-[10px] text-slate-400">Zero silence between songs</p>
            </div>
            <button
              onClick={() => setGapless(!gapless)}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${gapless ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}
            >
              {gapless ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Crossfade</h4>
              <p className="text-[10px] text-slate-400">Smooth transition blend</p>
            </div>
            <button
              onClick={() => setCrossfade(crossfade === 'off' ? '3s' : crossfade === '3s' ? '5s' : 'off')}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 text-indigo-300 border border-white/10"
            >
              {crossfade}
            </button>
          </div>

          <div className="p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Autoplay</h4>
              <p className="text-[10px] text-slate-400">Continue similar tracks</p>
            </div>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={`px-3 py-1 rounded-xl text-xs font-bold ${autoplay ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}
            >
              {autoplay ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Audio Studio Settings */}
      <section className="p-5 sm:p-6 rounded-[28px] glass-card border border-white/20 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">Audio Studio</h3>
          </div>
          <button
            onClick={triggerEQ}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all hover:scale-105"
          >
            Open Studio EQ
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Bass Boost */}
          <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Bass Boost Intensity
              </span>
              <span className="text-amber-400 font-mono">{equalizerBands.bassBoost || 0}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={equalizerBands.bassBoost || 0}
              onChange={(e) => setBassBoost(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 3D Spatial Audio */}
          <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Disc3 className="w-5 h-5 text-cyan-400" />
              <div>
                <h4 className="text-xs font-bold text-white">3D Spatial Audio</h4>
                <p className="text-[10px] text-slate-400">Head-tracking binaural surround</p>
              </div>
            </div>
            <button
              onClick={toggleSpatialAudio}
              className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                equalizerBands.spatialAudio ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'
              }`}
            >
              {equalizerBands.spatialAudio ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </section>

      {/* 4. Downloads & Storage */}
      <section className="p-5 sm:p-6 rounded-[28px] glass-card border border-white/20 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Downloads & Offline Music</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl glass-card border border-white/10">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">
              Downloaded Tracks: {downloadedSongs.length}
            </h4>
            <p className="text-[11px] text-slate-400">Stored locally in high-bitrate offline cache</p>
          </div>
          {onOpenOfflineModal && (
            <button
              onClick={onOpenOfflineModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 self-start sm:self-auto"
            >
              View Downloads
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Temporary History & Cache</span>
          </button>
          {clearCacheMessage && (
            <span className="text-[11px] text-emerald-400 font-semibold">{clearCacheMessage}</span>
          )}
        </div>
      </section>

      {/* Website keeps its theme controls; the native APK is dark-only. */}
      {!isNativeApp && (
        <section className="p-5 sm:p-6 rounded-[28px] glass-card border border-white/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Palette className="w-4 h-4 text-pink-400" />
            <h3 className="text-base font-bold text-white">Appearance & Theme</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-950/60'
                  : 'glass-card border-white/10 text-slate-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Deep Night</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                theme === 'light'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : 'glass-card border-white/10 text-slate-300'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Liquid Light</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                theme === 'system'
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : 'glass-card border-white/10 text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>System Match</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
