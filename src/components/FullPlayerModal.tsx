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
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { AudioQualitySetting } from '../types';

interface FullPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEQ: () => void;
  initialTab?: 'cover' | 'lyrics' | 'queue';
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
  } = useAudio();

  const { isSongLiked, toggleLikeSong } = useAuth();

  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics' | 'queue'>(initialTab);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Sync active tab if initialTab changes when opening
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
      if (initialTab === 'lyrics' && !lyricsData && !isLoadingLyrics && currentSong) {
        fetchLyrics(currentSong);
      }
    }
  }, [isOpen, initialTab, currentSong]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll lyrics to active line
  useEffect(() => {
    if (activeTab === 'lyrics' && currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = document.getElementById(`lyric-line-${currentLyricIndex}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLyricIndex, activeTab]);

  // Render Real-time Visualizer Spectrum on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeTab !== 'cover') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 32;
      const barWidth = canvas.width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const val = visualizerData[i * 2] || 0;
        const barHeight = (val / 255) * (canvas.height - 10) + 4;
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        // Gradient for spectrum
        const grad = ctx.createLinearGradient(0, canvas.height, 0, y);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.9)');

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

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#ec4899'],
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadSongFile(currentSong);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#05070c]/90 backdrop-blur-3xl flex flex-col p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* Background Ambient Glow matching Artwork */}
      <div
        className="absolute inset-0 opacity-30 blur-[160px] pointer-events-none scale-125"
        style={{
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative max-w-2xl w-full mx-auto flex-1 flex flex-col justify-between py-2">
        {/* Top Header Bar Matching Mockup */}
        <div className="flex items-center justify-between w-full px-2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl ios-glass-pill flex items-center justify-center text-slate-300 hover:text-white transition-transform active:scale-90"
            title="Minimize"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Playing From
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px]">
              {currentSong.album?.name || 'Chill Vibes'}
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowQualityModal(true)}
              className="w-10 h-10 rounded-2xl ios-glass-pill flex items-center justify-center text-slate-300 hover:text-white transition-transform active:scale-90"
              title="More Options"
            >
              <Radio className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Center Content View */}
        <div className="my-auto py-6 flex flex-col items-center justify-center">
          {/* TAB 1: COVER ARTWORK & SPECTRUM */}
          {activeTab === 'cover' && (
            <div className="flex flex-col items-center w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-200">
              {/* Artwork Squircle Container */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[36px] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/20 group">
                <img
                  src={coverUrl}
                  alt={currentSong.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                {/* Specular Inner Glass Rim */}
                <div className="absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/20 pointer-events-none" />
              </div>

              {/* Spectrum Visualizer Bar Canvas */}
              <div className="w-full h-10 mt-6 px-4 flex items-center justify-center">
                <canvas ref={canvasRef} width={280} height={40} className="w-full h-full opacity-80" />
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SYNCED KARAOKE LYRICS */}
          {activeTab === 'lyrics' && (
            <div
              ref={lyricsContainerRef}
              className="w-full max-h-[380px] overflow-y-auto px-4 py-6 text-center space-y-5 animate-in fade-in duration-200"
            >
              {isLoadingLyrics ? (
                <div className="py-20 text-slate-400 text-sm flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Loading & syncing lyrics...</span>
                </div>
              ) : lyricsData?.syncedLyrics && lyricsData.syncedLyrics.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Live Synced Karaoke
                    </span>
                  </div>
                  {lyricsData.syncedLyrics.map((line, idx) => {
                    const isActive = idx === currentLyricIndex;
                    return (
                      <p
                        id={`lyric-line-${idx}`}
                        key={idx}
                        onClick={() => seek(line.time)}
                        className={`cursor-pointer transition-all duration-300 font-bold leading-relaxed px-4 py-2.5 rounded-2xl ${
                          isActive
                            ? 'text-2xl sm:text-3xl text-white scale-105 bg-white/10 shadow-lg shadow-indigo-500/20 ring-1 ring-white/10'
                            : 'text-lg sm:text-xl text-slate-400/80 hover:text-slate-200'
                        }`}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              ) : lyricsData?.lyrics && lyricsData.lyrics !== 'Lyrics not available for this song.' ? (
                <div className="py-6 px-6 ios-glass rounded-3xl text-slate-200 text-base max-w-md mx-auto whitespace-pre-line leading-loose text-center font-medium shadow-inner">
                  {lyricsData.lyrics}
                </div>
              ) : (
                <div className="py-12 px-6 ios-glass rounded-3xl text-slate-400 text-sm max-w-md mx-auto flex flex-col items-center gap-4">
                  <Mic2 className="w-8 h-8 text-slate-500 stroke-[1.5]" />
                  <p className="text-slate-300 font-medium">No lyrics available automatically for this track.</p>
                  <button
                    onClick={() => currentSong && fetchLyrics(currentSong)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Search & Sync with AI</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UP NEXT QUEUE */}
          {activeTab === 'queue' && (
            <div className="w-full max-h-[380px] overflow-y-auto px-2 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-3 py-1 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Now Playing ({queueIndex + 1} of {queue.length})
                </span>
                <button
                  onClick={clearQueue}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Queue</span>
                </button>
              </div>

              {queue.map((song, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    onClick={() => playSong(song, queue)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-indigo-600/30 border border-indigo-400/40 text-white shadow-lg'
                        : 'ios-glass-card text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={song.image?.[0]?.url || coverUrl}
                        alt={song.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="truncate">
                        <div className="text-sm font-bold truncate">{song.name}</div>
                        <div className="text-xs text-slate-400 truncate">{song.primaryArtists}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatTime(song.duration)}</span>
                      {queue.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(idx);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Playback Engine Controls */}
        <div className="w-full space-y-4">
          {/* Song Info (Title, Artists, Like & Download) */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate tracking-tight">
                {currentSong.name}
              </h2>
              <p className="text-sm font-medium text-slate-400 truncate mt-0.5">
                {currentSong.primaryArtists} • {currentSong.album?.name || 'APMUSIC'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={() => toggleLikeSong(currentSong)}
                className={`p-2.5 rounded-2xl ios-glass-pill transition-transform active:scale-90 ${
                  isLiked ? 'text-rose-400' : 'text-slate-300 hover:text-white'
                }`}
                title={isLiked ? 'Liked' : 'Like'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Download Real Audio File Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2.5 rounded-2xl ios-glass-pill text-slate-300 hover:text-white transition-transform active:scale-90"
                title="Download 320kbps Lossless Audio"
              >
                <ArrowDownToLine className={`w-5 h-5 ${isDownloading ? 'animate-bounce text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Time Scrubber Slider */}
          <div className="space-y-1.5">
            <div className="relative flex items-center group">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-semibold px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls Row (Shuffle, Prev, Play/Pause, Next, Repeat) */}
          <div className="flex items-center justify-between px-2">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-2xl transition-colors ${
                isShuffle ? 'text-indigo-400 bg-white/10' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            {/* Seek 10s back */}
            <button
              onClick={() => seek(Math.max(0, currentTime - 10))}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="10s Back"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Previous */}
            <button
              onClick={prevTrack}
              className="p-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-90 transition-transform"
            >
              <SkipBack className="w-7 h-7 fill-slate-200" />
            </button>

            {/* Main Big Glowing Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 text-white flex items-center justify-center shadow-[0_10px_35px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-95 transition-all border border-purple-300/40"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 active:scale-90 transition-transform"
            >
              <SkipForward className="w-7 h-7 fill-slate-200" />
            </button>

            {/* Seek 10s forward */}
            <button
              onClick={() => seek(Math.min(duration, currentTime + 10))}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="10s Forward"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-2xl transition-colors ${
                repeatMode !== 'off' ? 'text-indigo-400 bg-white/10' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Bottom Utility Bar (Volume, Equalizer, Quality, Sleep Timer) */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
            {/* Volume Control */}
            <div className="flex items-center gap-2 w-32 sm:w-44">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg cursor-pointer accent-white"
              />
            </div>

            {/* Right Tools: Equalizer & Sleep Timer & Quality */}
            <div className="flex items-center gap-2">
              {/* Equalizer */}
              <button
                onClick={() => {
                  onClose();
                  onOpenEQ();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl ios-glass-pill text-slate-300 hover:text-white transition-colors"
                title="Equalizer"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">EQ</span>
              </button>

              {/* Quality Switcher */}
              <button
                onClick={() => setShowQualityModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl ios-glass-pill text-slate-300 hover:text-white transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-indigo-400" />
                <span>{audioQuality}</span>
              </button>

              {/* Sleep Timer */}
              <button
                onClick={() => setShowSleepTimerModal(true)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl ios-glass-pill transition-colors ${
                  sleepTimerMinutes ? 'text-indigo-300 border-indigo-400/40 bg-indigo-500/20' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                {sleepTimerRemaining ? (
                  <span>{formatTime(sleepTimerRemaining)}</span>
                ) : (
                  <span className="hidden sm:inline">Sleep</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Timer Modal Sub-dialog */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full ios-glass-dock rounded-3xl p-5 border border-white/20 space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-white text-base">Set Sleep Timer</h3>
            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setSleepTimer(mins);
                    setShowSleepTimerModal(false);
                  }}
                  className="p-3 rounded-2xl ios-glass-card text-center text-sm font-semibold text-white hover:bg-indigo-600/30"
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
            {sleepTimerMinutes && (
              <button
                onClick={() => {
                  setSleepTimer(null);
                  setShowSleepTimerModal(false);
                }}
                className="w-full py-2.5 rounded-2xl bg-rose-500/20 text-rose-300 text-xs font-semibold"
              >
                Cancel Timer
              </button>
            )}
            <button
              onClick={() => setShowSleepTimerModal(false)}
              className="w-full py-2 rounded-2xl ios-glass text-xs font-semibold text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quality Modal Sub-dialog */}
      {showQualityModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full ios-glass-dock rounded-3xl p-5 border border-white/20 space-y-3 animate-in zoom-in-95">
            <h3 className="font-bold text-white text-base">Streaming Bitrate</h3>
            {(['320kbps', '160kbps', '96kbps'] as AudioQualitySetting[]).map((q) => (
              <button
                key={q}
                onClick={() => {
                  setAudioQuality(q);
                  setShowQualityModal(false);
                }}
                className={`w-full p-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                  audioQuality === q
                    ? 'bg-indigo-600/40 text-white border border-indigo-400/40'
                    : 'ios-glass-card text-slate-300 hover:text-white'
                }`}
              >
                <div>{q === '320kbps' ? 'Extreme (320 kbps)' : q === '160kbps' ? 'High (160 kbps)' : 'Normal (96 kbps)'}</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  {q === '320kbps' ? 'Lossless Master Fidelity' : q === '160kbps' ? 'Balanced' : 'Data Saver'}
                </div>
              </button>
            ))}
            <button
              onClick={() => setShowQualityModal(false)}
              className="w-full py-2 rounded-2xl ios-glass text-xs font-semibold text-slate-300 mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
