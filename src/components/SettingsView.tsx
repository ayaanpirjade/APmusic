import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  Moon,
  Clock,
  Sparkles,
  ShieldCheck,
  HardDrive,
  Trash2,
  LogOut,
  LogIn,
  CheckCircle2,
  Radio,
  Headphones,
  Zap,
} from 'lucide-react';
import { AudioQualitySetting } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  onOpenEQ?: () => void;
  onOpenEqualizer?: () => void;
  onOpenLogin?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenEQ,
  onOpenEqualizer,
  onOpenLogin,
}) => {
  const triggerEQ = onOpenEQ || onOpenEqualizer || (() => {});
  const {
    audioQuality,
    setAudioQuality,
    equalizerBands,
    setBassBoost,
    toggleSpatialAudio,
    sleepTimerMinutes,
    setSleepTimer,
  } = useAudio();

  const currentBands = equalizerBands || {
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    treble: 0,
    bassBoost: 15,
    spatialAudio: true,
  };

  const { user, loginWithGoogle, logout, downloadedSongs } = useAuth();
  const [clearCacheMessage, setClearCacheMessage] = useState<string | null>(null);

  const qualities: Array<{ id: AudioQualitySetting; title: string; desc: string; badge: string }> = [
    {
      id: '320kbps',
      title: 'Lossless Master (320 kbps AAC/MP4)',
      desc: 'Crystal-clear studio audio fidelity with uncompressed dynamics.',
      badge: 'HI-RES',
    },
    {
      id: '160kbps',
      title: 'High Quality (160 kbps)',
      desc: 'Optimal balance between audio quality and network bandwidth.',
      badge: 'HQ',
    },
    {
      id: '96kbps',
      title: 'Data Saver (96 kbps)',
      desc: 'Lightweight streaming for slower or limited cellular connections.',
      badge: 'SAVER',
    },
  ];

  const sleepOptions = [
    { label: 'Off', minutes: null },
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
  ];

  const handleClearCache = () => {
    localStorage.removeItem('apmusic_history');
    setClearCacheMessage('Temporary cache and history cleared successfully.');
    setTimeout(() => setClearCacheMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-2 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Settings & Studio Controls</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize playback fidelity, Web Audio DSP equalization, spatial sound, and profile
        </p>
      </div>

      {/* Account Section */}
      <section className="p-6 rounded-[28px] ios-glass-card border border-white/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{user.name}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  {user.isGoogleAuth ? 'Google Verified' : 'Local Profile'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          <div>
            {user.isAuthenticated ? (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-bold transition-colors border border-white/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin || loginWithGoogle}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-black font-bold text-xs shadow-lg hover:scale-105 transition-transform"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login / Account Profile</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Audio Streaming Quality */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Streaming Audio Quality</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {qualities.map((q) => {
            const isSelected = audioQuality === q.id;
            return (
              <div
                key={q.id}
                onClick={() => setAudioQuality(q.id)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600/30 border border-indigo-400/50 text-white shadow-lg'
                    : 'ios-glass-card hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{q.title}</span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-400 text-black'
                          : 'bg-white/10 text-slate-400 border border-white/10'
                      }`}
                    >
                      {q.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{q.desc}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/20'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 fill-white text-indigo-600" />}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DSP Equalizer & Spatial Audio */}
      <section className="p-6 rounded-[28px] ios-glass-card border border-white/20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Sliders className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Studio 5-Band Equalizer</h3>
              <p className="text-xs text-slate-400">Web Audio API Hardware DSP Filter Curve</p>
            </div>
          </div>

          <button
            onClick={onOpenEqualizer}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all hover:scale-105"
          >
            Open Studio Equalizer
          </button>
        </div>

        {/* Spatial Audio & Bass Boost Quick Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Spatial 3D Audio */}
          <div className="p-4 rounded-2xl ios-glass border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Spatial 3D Audio</h4>
                <p className="text-[11px] text-slate-400">Immersive wide soundstage</p>
              </div>
            </div>

            <button
              onClick={toggleSpatialAudio}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                currentBands.spatialAudio ? 'bg-indigo-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  currentBands.spatialAudio ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Bass Boost Quick Slider */}
          <div className="p-4 rounded-2xl ios-glass border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Bass Boost Engine</span>
              </div>
              <span className="text-xs font-bold text-amber-400">{currentBands.bassBoost}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={currentBands.bassBoost}
              onChange={(e) => setBassBoost(Number(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>
      </section>

      {/* Sleep Timer */}
      <section className="p-6 rounded-[28px] ios-glass-card border border-white/20 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Moon className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sleep Timer</h3>
            <p className="text-xs text-slate-400">Auto-pause playback when falling asleep</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sleepOptions.map((opt) => {
            const isSelected = sleepTimerMinutes === opt.minutes;
            return (
              <button
                key={opt.label}
                onClick={() => setSleepTimer(opt.minutes)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-amber-500/40 text-amber-300 border border-amber-400/50 shadow-md scale-105'
                    : 'ios-glass-pill text-slate-300 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Storage & Cache */}
      <section className="p-6 rounded-[28px] ios-glass-card border border-white/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Offline Downloads & Storage</h3>
              <p className="text-xs text-slate-400">{downloadedSongs.length} songs cached offline in browser memory</p>
            </div>
          </div>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear App Cache</span>
          </button>
        </div>

        {clearCacheMessage && (
          <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 animate-in fade-in">
            {clearCacheMessage}
          </p>
        )}
      </section>
    </div>
  );
};
