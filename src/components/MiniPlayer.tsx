import React, { useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronUp, Mic2, Radio, Volume2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { getAccentForTrack } from '../utils/accentColor';

interface MiniPlayerProps {
  onExpand?: () => void;
  onOpenFullPlayer?: () => void;
  onOpenLyrics?: () => void;
  onOpenEQ?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  onExpand,
  onOpenFullPlayer,
  onOpenLyrics,
}) => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    prevTrack,
    nextTrack,
    currentTime,
    duration,
    isLoadingSong,
    visualizerData,
  } = useAudio();
  const { isSongLiked, toggleLikeSong } = useAuth();

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!currentSong) return null;

  const handleOpen = onOpenFullPlayer || onExpand || (() => {});
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = isSongLiked(currentSong.id);
  const accent = getAccentForTrack(currentSong.name, currentSong.primaryArtists);

  const coverUrl =
    currentSong.image?.[1]?.url ||
    currentSong.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';

  // Touch Swipe Left/Right Gesture to switch songs
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff > 50) {
      prevTrack(); // Swiped right -> prev
    } else if (diff < -50) {
      nextTrack(); // Swiped left -> next
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="fixed bottom-[74px] sm:bottom-20 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-40"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        onClick={handleOpen}
        className="relative overflow-hidden rounded-[26px] glass-floating border border-white/20 p-2 sm:p-2.5 cursor-pointer group shadow-2xl backdrop-blur-3xl transition-all duration-200 hover:border-white/35 active:scale-[0.99]"
      >
        {/* Dynamic Glow Ambient Shadow beneath cover */}
        <div
          className="absolute -top-8 -left-8 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
          style={{
            background: accent.glow,
            opacity: isPlaying ? 0.75 : 0.2,
          }}
        />

        {/* Top Progress Scrub Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-150 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-md border border-white/20 shrink-0 group-hover:scale-105 transition-transform bg-white/5">
              <img
                src={coverUrl}
                alt={currentSong.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              {isLoadingSong && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {currentSong.name}
                </h4>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden xs:inline">
                  320k
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                {currentSong.primaryArtists}
              </p>
            </div>
          </div>

          {/* Controls: Prev | Play/Pause | Next */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Track */}
            <button
              onClick={prevTrack}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:scale-90 transition-all hidden xs:flex items-center justify-center"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-950/60 hover:scale-105 active:scale-95 transition-all border border-indigo-400/40"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Tiny live waveform on the right */}
            <div
              onClick={handleOpen}
              className="flex items-end gap-[2px] h-6 px-2 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0 cursor-pointer hover:bg-white/10 transition-colors ml-0.5"
              title="Open Now Playing"
            >
              {[8, 16, 12, 20, 10].map((baseH, idx) => {
                const liveH = isPlaying
                  ? Math.max(3, Math.min(20, (visualizerData[idx * 4] || baseH) / 12))
                  : 3;
                return (
                  <span
                    key={idx}
                    className="w-[2px] bg-gradient-to-t from-indigo-400 to-cyan-300 rounded-full transition-all duration-100"
                    style={{ height: `${liveH}px` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
