import React from 'react';
import { Play, Pause, SkipForward, Heart, Music2, Maximize2, Mic2, ChevronUp } from 'lucide-react';
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
  onOpenEQ,
}) => {
  const { currentSong, isPlaying, togglePlay, nextTrack, currentTime, duration, isLoadingSong } =
    useAudio();
  const { isSongLiked, toggleLikeSong } = useAuth();

  if (!currentSong) return null;

  const handleOpen = onOpenFullPlayer || onExpand || (() => {});
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = isSongLiked(currentSong.id);
  const coverUrl =
    currentSong.image?.[1]?.url ||
    currentSong.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-3 right-3 lg:left-68 lg:right-6 z-40 max-w-4xl lg:mx-auto">
      <div
        onClick={handleOpen}
        className="relative overflow-hidden rounded-[26px] ios-glass-dock border border-white/20 p-2.5 sm:p-3 cursor-pointer group shadow-2xl backdrop-blur-3xl transition-all duration-300 hover:border-white/40 hover:shadow-indigo-950/30"
      >
        {/* Top Mini Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Left: Artwork + Title & Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white/20 shrink-0 group-hover:scale-105 transition-transform">
              <img
                src={coverUrl}
                alt={currentSong.name}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
              {isLoadingSong && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {currentSong.name}
                </h4>
                {/* 4-bar Soundwave visualizer */}
                {isPlaying && (
                  <div className="flex items-end gap-[2px] h-3 shrink-0">
                    <span className="w-[2.5px] bg-indigo-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                    <span className="w-[2.5px] bg-purple-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                    <span className="w-[2.5px] bg-pink-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: '75%' }} />
                    <span className="w-[2.5px] bg-indigo-300 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" style={{ height: '40%' }} />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {currentSong.primaryArtists}
              </p>
            </div>
          </div>

          {/* Right: Interactive Controls */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Live Lyrics Shortcut Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenLyrics) onOpenLyrics();
                else handleOpen();
              }}
              className="p-2 text-slate-300 hover:text-white rounded-2xl hover:bg-white/10 active:scale-90 transition-all flex items-center gap-1.5 px-2.5 bg-white/5 border border-white/10"
              title="View Synced Lyrics"
            >
              <Mic2 className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-bold hidden sm:inline text-indigo-200">Lyrics</span>
            </button>

            {/* Like button */}
            <button
              onClick={() => toggleLikeSong(currentSong)}
              className={`p-2 rounded-2xl transition-transform active:scale-90 ${
                isLiked ? 'text-rose-400 hover:text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={nextTrack}
              className="p-2 text-slate-300 hover:text-white rounded-2xl hover:bg-white/10 active:scale-90 transition-all"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Expand Fullscreen Icon */}
            <button
              onClick={handleOpen}
              className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-white/10 transition-colors"
              title="Expand Full Spotify Player"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
