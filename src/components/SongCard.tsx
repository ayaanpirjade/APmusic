import React from 'react';
import { Play, Pause, Heart, ArrowDownToLine, MoreVertical } from 'lucide-react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

interface SongCardProps {
  song: Song;
  playlistContext?: Song[];
  onOpenArtist?: (artistId: string) => void;
  onOpenAlbum?: (albumId: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  playlistContext,
  onOpenArtist,
  onOpenAlbum,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, downloadSongFile } = useAudio();
  const { isSongLiked, toggleLikeSong } = useAuth();

  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isLiked = isSongLiked(song.id);

  const coverUrl =
    song.image?.[2]?.url ||
    song.image?.[1]?.url ||
    song.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80';

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative p-3 rounded-[24px] ios-glass-card cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-white/30 flex flex-col justify-between select-none ${
        isCurrent ? 'border-indigo-400/50 bg-indigo-950/20 shadow-lg shadow-indigo-950/40' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-[18px] overflow-hidden shadow-md bg-white/5">
        <img
          src={coverUrl}
          alt={song.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Glossy overlay rim */}
        <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/15 pointer-events-none" />

        {/* Floating Play Button Overlay */}
        <div
          className={`absolute bottom-2.5 right-2.5 transition-all duration-300 ${
            isCurrentlyPlaying
              ? 'opacity-100 scale-100'
              : 'opacity-100 scale-100 sm:opacity-0 sm:scale-75 sm:group-hover:opacity-100 sm:group-hover:scale-100'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform">
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </div>
        </div>

        {/* Top Badges (Lossless / Liked) */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-indigo-300 border border-white/10">
            320k
          </span>
          {isLiked && (
            <span className="p-1 rounded-md bg-black/50 backdrop-blur-md text-rose-400">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
            </span>
          )}
        </div>
      </div>

      {/* Title & Artist metadata */}
      <div className="mt-3 min-w-0">
        <h3
          className={`text-sm font-bold truncate transition-colors ${
            isCurrent ? 'text-indigo-300 font-extrabold' : 'text-white group-hover:text-indigo-200'
          }`}
        >
          {song.name}
        </h3>
        <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
          {song.primaryArtists}
        </p>
      </div>

      {/* Quick Action Footer */}
      <div
        className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => toggleLikeSong(song)}
          className={`p-1.5 rounded-xl hover:bg-white/10 transition-colors ${
            isLiked ? 'text-rose-400' : 'text-slate-400 hover:text-white'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <button
          onClick={() => downloadSongFile(song)}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-indigo-300 transition-colors"
          title="Download 320kbps Audio"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
