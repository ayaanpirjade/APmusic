import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  ArrowDownToLine,
  Sliders,
  Clock,
  Radio,
  ListMusic,
  Mic2,
  Disc3,
  Share2,
  Trash2,
  Sparkles,
  Zap,
  Maximize2,
  Flame,
  Layers,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { getAccentForTrack } from '../utils/accentColor';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEQ: () => void;
  initialTab?: 'cover' | 'lyrics' | 'queue' | 'studio';
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({
  isOpen,
  onClose,
  onOpenEQ,
  initialTab = 'cover',
}) => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    currentTime,
    duration,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    repeatMode,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
    queue,
    queueIndex,
    removeFromQueue,
    clearQueue,
    audioQuality,
    setAudioQuality,
    lyricsData,
    currentLyricIndex,
    isLoadingLyrics,
    visualizerData,
    sleepTimerMinutes,
    sleepTimerRemaining,
    setSleepTimer,
    downloadSongFile,
    playSong,
    fetchLyrics,
    equalizerBands,
    setEqualizerBand,
    setBassBoost,
    toggleSpatialAudio,
  } = useAudio();

  const { isSongLiked, toggleLikeSong } = useAuth();

  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics' | 'queue' | 'studio'>(initialTab);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'wave' | 'particles'>('bars');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const renderedLyricLines = lyricsData?.syncedLyrics?.length
    ? lyricsData.syncedLyrics
    : lyricsData?.lyrics
      ? lyricsData.lyrics.split(/\r?\n/).map((text) => ({ text, time: undefined }))
      : [];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync tab on open
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      if (initialTab === 'lyrics' && !lyricsData && !isLoadingLyrics && currentSong) {
        fetchLyrics(currentSong);
      }
    }
  }, [isOpen, initialTab, currentSong]);

  // Fetch lyrics whenever the user opens the Lyrics tab, including when the
  // modal was opened on the Cover tab first.
  useEffect(() => {
    if (isOpen && activeTab === 'lyrics' && currentSong && !lyricsData && !isLoadingLyrics) {
      fetchLyrics(currentSong);
    }
  }, [isOpen, activeTab, currentSong, lyricsData, isLoadingLyrics, fetchLyrics]);

  // Auto-scroll lyrics to active line
  useEffect(() => {
    if (activeTab === 'lyrics' && currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = document.getElementById(`lyric-line-${currentLyricIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex, activeTab]);

  // Real-time Canvas Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'cover') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 36;
      const barWidth = canvas.width / barCount - 2.5;

      for (let i = 0; i < barCount; i++) {
        const val = visualizerData[i * 2] || (isPlaying ? 20 + Math.sin(i + Date.now() / 200) * 15 : 4);
        const barHeight = Math.max(4, (val / 255) * (canvas.height - 8));
        const x = i * (barWidth + 2.5);
        const y = canvas.height - barHeight;

        const grad = ctx.createLinearGradient(0, canvas.height, 0, y);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.7)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.95)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();
      }

      if (isPlaying) {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [visualizerData, isPlaying, activeTab]);

  if (!isOpen || !currentSong) return null;

  const accent = getAccentForTrack(currentSong.name, currentSong.primaryArtists);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const coverUrl =
    currentSong.image?.[2]?.url ||
    currentSong.image?.[1]?.url ||
    currentSong.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

  const isLiked = isSongLiked(currentSong.id);
  const displayCurrentTime = isScrubbing ? scrubValue : currentTime;
  const progressPercent = duration > 0 ? (displayCurrentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubValue(Number(e.target.value));
  };

  const handleSeekStart = () => {
    setIsScrubbing(true);
    setScrubValue(currentTime);
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsScrubbing(false);
    seek(scrubValue);
  };

  const handleRewind10 = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const handleForward10 = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#06b6d4'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080a14] overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Dynamic Specular Blurred Backdrop derived from Album Art */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={coverUrl}
          alt={currentSong.name}
          className="w-full h-full object-cover blur-[80px] opacity-30 scale-125"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${accent.gradient}`} />
        <div className="absolute inset-0 bg-[#080a14]/60 backdrop-blur-2xl" />
      </div>

      {/* 2. Top Header Navigation (Close, Now Playing title, Sleep Timer, More) */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-safe pb-2 border-b border-white/10 glass-surface">
        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl glass-pill hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
          title="Minimize"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0 flex-1 px-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-indigo-300">
              Now Playing
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
            {currentSong.album?.name || 'APmusic High-Fidelity'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSleepTimerModal(true)}
            className={`p-2.5 rounded-2xl glass-pill hover:bg-white/20 transition-all ${
              sleepTimerRemaining ? 'text-indigo-300 border-indigo-400/40 bg-indigo-500/20' : 'text-slate-300 hover:text-white'
            }`}
            title="Sleep Timer"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl glass-pill hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Main Center Body (Artwork / Lyrics / Queue / Studio) */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 max-w-lg w-full mx-auto flex flex-col justify-between">
        {/* Cover Tab (Hero Artwork 75–82% width) */}
        {activeTab === 'cover' && (
          <div className="flex-1 flex flex-col items-center justify-center py-2 space-y-5 animate-in fade-in duration-200">
            {/* Artwork Container with 78% Width, Huge 36px Rounded Corners, Glass Reflection, and Ambient Glow */}
            <div className="relative w-[80%] max-w-[340px] aspect-square rounded-[36px] p-2 glass-floating border border-white/25 shadow-2xl group">
              {/* Dynamic glowing ambient halo behind cover */}
              <div
                className="absolute -inset-4 rounded-[42px] blur-2xl opacity-60 pointer-events-none transition-all duration-700"
                style={{
                  background: isPlaying
                    ? `radial-gradient(circle, ${accent.glow} 0%, rgba(0,0,0,0) 70%)`
                    : 'transparent',
                }}
              />

              <div className="relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl bg-black/40">
                <img
                  src={coverUrl}
                  alt={currentSong.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                {/* Subtle glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Live Waveform Spectrum Canvas */}
            <div className="w-full max-w-[340px] h-10 px-2 flex items-center justify-center">
              <canvas ref={canvasRef} width={320} height={36} className="w-full h-full opacity-80" />
            </div>

            {/* Song Name & Artist info */}
            <div className="w-full text-center px-4 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate font-['Outfit']">
                  {currentSong.name}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-extrabold uppercase">
                  320k Lossless
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-300 truncate">
                {currentSong.primaryArtists}
              </p>
            </div>
          </div>
        )}

        {/* Lyrics Tab */}
        {activeTab === 'lyrics' && (
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto py-6 px-4 space-y-6 text-center scrollbar-none animate-in fade-in duration-200"
          >
            {isLoadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-semibold">Synchronizing Studio Lyrics...</p>
              </div>
            ) : renderedLyricLines.length > 0 ? (
              renderedLyricLines.map((line, idx) => {
                const isActive = currentLyricIndex === idx;
                return (
                  <p
                    key={idx}
                    id={`lyric-line-${idx}`}
                    onClick={() => line.time !== undefined && seek(line.time)}
                    className={`cursor-pointer transition-all duration-300 font-bold leading-relaxed ${
                      isActive
                        ? 'text-2xl sm:text-3xl text-white font-black scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                        : 'text-base sm:text-lg text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {line.text || '...'}
                  </p>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-2">
                <Mic2 className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm font-bold text-slate-300">Instrumental or Lyrics Unavailable</p>
                <p className="text-xs text-slate-500">Enjoy the pure lossless acoustics</p>
              </div>
            )}
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Up Next ({queue.length} Tracks)
              </span>
              <button
                onClick={clearQueue}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
            {queue.map((song, idx) => {
              const isCurrent = currentSong.id === song.id;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => playSong(song, queue)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl glass-card cursor-pointer border ${
                    isCurrent ? 'bg-indigo-900/40 border-indigo-400/50' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={song.image?.[0]?.url || coverUrl}
                      alt={song.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-300' : 'text-white'}`}>
                        {song.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{song.primaryArtists}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(song.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Audio Studio Tab (Swipe up / Studio view) */}
        {activeTab === 'studio' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-3xl glass-card border border-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-black text-white">Audio Studio & Hardware DSP</h3>
                </div>
                <button
                  onClick={onOpenEQ}
                  className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30"
                >
                  Full 10-Band EQ
                </button>
              </div>

              {/* Bass Boost Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Bass Boost
                  </span>
                  <span className="text-amber-300 font-mono">{equalizerBands.bassBoost || 0}%</span>
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

              {/* Spatial Audio 3D Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <Disc3 className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <div>
                    <h4 className="text-xs font-bold text-white">3D Spatial Audio</h4>
                    <p className="text-[10px] text-slate-400">Head-tracking binaural surround</p>
                  </div>
                </div>
                <button
                  onClick={toggleSpatialAudio}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                    equalizerBands.spatialAudio
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {equalizerBands.spatialAudio ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Waveform / Smooth Interactive Progress Bar */}
        <div className="w-full space-y-1.5 pt-2">
          <div className="relative flex items-center group cursor-pointer">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={displayCurrentTime}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              className="w-full h-1.5 bg-white/15 rounded-full cursor-pointer appearance-none group-hover:h-2 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 px-0.5">
            <span>{formatTime(displayCurrentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 5. Main Controls Bar: ↶ 10s | ◀ Prev | ⏸/▶ Play/Pause | ▶ Next | ↷ 10s */}
        <div className="flex items-center justify-between pt-2 px-2">
          {/* Shuffle Toggle */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-2xl hover:bg-white/10 transition-all ${
              isShuffle ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Rewind 10s (↶) */}
          <button
            onClick={handleRewind10}
            className="p-2.5 rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-90"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Previous Track (◀) */}
          <button
            onClick={prevTrack}
            className="p-3 rounded-2xl hover:bg-white/10 text-white transition-all active:scale-90"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6 fill-white" />
          </button>

          {/* Main Play / Pause Button (⏸ / ▶) */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-2xl shadow-purple-950/80 hover:scale-105 active:scale-95 transition-all border border-white/30"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          {/* Next Track (▶) */}
          <button
            onClick={nextTrack}
            className="p-3 rounded-2xl hover:bg-white/10 text-white transition-all active:scale-90"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6 fill-white" />
          </button>

          {/* Forward 10s (↷) */}
          <button
            onClick={handleForward10}
            className="p-2.5 rounded-2xl hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-90"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Repeat Mode Toggle */}
          <button
            onClick={toggleRepeat}
            className={`p-2.5 rounded-2xl hover:bg-white/10 transition-all ${
              repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* 6. Bottom Action Bar: ♡ Like | 🎤 Lyrics | 🎛️ Studio EQ | 📋 Queue */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 px-2 pb-safe">
          {/* Like Heart */}
          <button
            onClick={() => toggleLikeSong(currentSong)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${
              isLiked ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-white glass-pill'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="text-xs font-bold hidden sm:inline">{isLiked ? 'Liked' : 'Like'}</span>
          </button>

          {/* Lyrics Toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'cover' : 'lyrics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${
              activeTab === 'lyrics' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40' : 'text-slate-400 hover:text-white glass-pill'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span className="text-xs font-bold">Lyrics</span>
          </button>

          {/* Studio Audio / EQ */}
          <button
            onClick={() => setActiveTab(activeTab === 'studio' ? 'cover' : 'studio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${
              activeTab === 'studio' ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-slate-400 hover:text-white glass-pill'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="text-xs font-bold">Studio</span>
          </button>

          {/* Queue Drawer */}
          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'cover' : 'queue')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${
              activeTab === 'queue' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40' : 'text-slate-400 hover:text-white glass-pill'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span className="text-xs font-bold">Queue</span>
          </button>

          {/* Download (320k) */}
          <button
            onClick={() => downloadSongFile(currentSong)}
            className="p-2 rounded-2xl text-slate-400 hover:text-emerald-400 glass-pill transition-all"
            title="Download 320kbps Master"
          >
            <ArrowDownToLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleep Timer Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl glass-floating border border-white/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">Sleep Timer</h3>
              <button onClick={() => setShowSleepTimerModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                Done
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Off', mins: null },
                { label: '15 mins', mins: 15 },
                { label: '30 mins', mins: 30 },
                { label: '45 mins', mins: 45 },
                { label: '60 mins', mins: 60 },
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSleepTimer(opt.mins);
                    setShowSleepTimerModal(false);
                  }}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                    sleepTimerMinutes === opt.mins
                      ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-950/60'
                      : 'glass-card border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
