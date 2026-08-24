import React, { useState } from 'react';
import { Play, Pause, Heart, ArrowDownToLine, MoreVertical, Plus, ListPlus, Radio } from 'lucide-react';
import { Song } from '../types';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

interface SongRowProps {
  song: Song;
  index?: number;
  playlistContext?: Song[];
  showIndex?: boolean;
  onOpenArtist?: (artistId: string) => void;
  onOpenAlbum?: (albumId: string) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  playlistContext,
  showIndex = true,
  onOpenArtist,
  onOpenAlbum,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue, playNextInQueue, downloadSongFile } =
    useAudio();
  const { isSongLiked, toggleLikeSong, customPlaylists, addSongToPlaylist } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isLiked = isSongLiked(song.id);

  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '--:--';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const coverUrl =
    song.image?.[1]?.url ||
    song.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80';

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
        isCurrent
          ? 'bg-indigo-600/30 border border-indigo-400/50 text-white shadow-lg shadow-indigo-950/40'
          : 'ios-glass-card hover:border-white/20 text-slate-300 hover:text-white'
      }`}
    >
      {/* Left: Index / Play Icon + Cover + Title & Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Index or Animated Wave indicator */}
        {showIndex && (
          <div className="w-6 text-center text-xs font-semibold text-slate-400 shrink-0">
            {isCurrentlyPlaying ? (
              <div className="flex items-end justify-center gap-[2px] h-3.5">
                <span className="w-[2px] bg-indigo-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '70%' }} />
                <span className="w-[2px] bg-purple-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                <span className="w-[2px] bg-cyan-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: '80%' }} />
              </div>
            ) : (
              <span className="group-hover:hidden">{index !== undefined ? index + 1 : ''}</span>
            )}
            {!isCurrentlyPlaying && (
              <Play className="w-3.5 h-3.5 text-white fill-white hidden group-hover:block mx-auto" />
            )}
          </div>
        )}

        {/* Artwork Thumbnail */}
        <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm shrink-0 border border-white/10 bg-white/5">
          <img
            src={coverUrl}
            alt={song.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Song Info */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <h4
              className={`text-xs sm:text-sm font-bold truncate ${
                isCurrent ? 'text-indigo-300' : 'text-white group-hover:text-indigo-200'
              }`}
            >
              {song.name}
            </h4>
            {song.hasLyrics && (
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10 hidden sm:inline">
                Lyrics
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
            {song.primaryArtists}
            {song.album?.name && ` • ${song.album.name}`}
          </p>
        </div>
      </div>

      {/* Right: Duration + Actions Menu */}
      <div
        className="flex items-center gap-2 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Like Button */}
        <button
          onClick={() => toggleLikeSong(song)}
          className={`p-2 rounded-xl hover:bg-white/10 active:scale-90 transition-all ${
            isLiked ? 'text-rose-400' : 'text-slate-400 hover:text-white'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Duration */}
        <span className="text-xs text-slate-400 font-medium hidden sm:inline w-12 text-right">
          {formatDuration(song.duration)}
        </span>

        {/* Options Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-52 rounded-2xl ios-glass-dock border border-white/20 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  addToQueue(song);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Add to Queue</span>
              </button>

              <button
                onClick={() => {
                  playNextInQueue(song);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <ListPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Play Next</span>
              </button>

              <button
                onClick={() => {
                  downloadSongFile(song);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download (320kbps)</span>
              </button>

              {customPlaylists.length > 0 && (
                <div className="relative border-t border-white/10 mt-1 pt-1">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                    Add to Playlist:
                  </div>
                  {customPlaylists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        addSongToPlaylist(pl.id, song);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10 truncate text-left"
                    >
                      <span className="truncate">{pl.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowMenu(false)}
                className="w-full text-center py-1 mt-1 text-[11px] text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
