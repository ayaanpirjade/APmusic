import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronUp, Mic2, Radio } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

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

  if (!currentSong) return null;

  const handleOpen = onOpenFullPlayer || onExpand || (() => {});
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = isSongLiked(currentSong.id);
  const coverUrl =
    currentSong.image?.[2]?.url ||
    currentSong.image?.[1]?.url ||
    currentSong.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';

  return (
    <div className="fixed bottom-[72px] sm:bottom-20 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40">
      <div
        onClick={handleOpen}
        className="relative overflow-hidden rounded-[28px] ios-glass-dock border border-white/20 p-2 sm:p-2.5 cursor-pointer group shadow-2xl backdrop-blur-3xl transition-all duration-300 hover:border-white/40 hover:shadow-indigo-950/50"
      >
        {/* Dynamic Glowing Ambient Shadow beneath cover */}
        <div
          className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-indigo-500/30 blur-2xl pointer-events-none transition-opacity duration-700"
          style={{ opacity: isPlaying ? 0.8 : 0.2 }}
        />

        {/* Top Mini Progress Bar with subtle glow */}
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
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-lg border border-white/20 shrink-0 group-hover:scale-105 transition-transform bg-white/5">
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

          {/* Center-Right: Prev / Play / Next Controls */}
          <div
            className="flex items-center gap-1 sm:gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Like Toggle */}
            <button
              onClick={() => toggleLikeSong(currentSong)}
              className={`p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-all ${
                isLiked ? 'text-rose-400' : 'text-slate-400 hover:text-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Prev Track */}
            <button
              onClick={prevTrack}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:scale-90 transition-all hidden xs:flex items-center justify-center"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-950/50 hover:scale-105 active:scale-95 transition-all border border-purple-400/40"
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
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 active:scale-90 transition-all flex items-center justify-center"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Dynamic Waveform Visualizer Bar */}
            <div
              onClick={handleOpen}
              className="hidden md:flex items-end gap-[3px] h-7 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0 cursor-pointer hover:bg-white/10 transition-colors"
              title="Expand Player & Visualizer"
            >
              {[12, 24, 18, 28, 14, 22, 16, 26, 10, 20].map((baseH, idx) => {
                const liveH = isPlaying
                  ? Math.max(4, Math.min(24, (visualizerData[idx * 3] || baseH) / 10))
                  : 4;
                return (
                  <span
                    key={idx}
                    className="w-[2.5px] bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full transition-all duration-100"
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
