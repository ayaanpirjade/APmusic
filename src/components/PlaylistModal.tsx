import React, { useState, useEffect } from 'react';
import { X, Play, ListMusic, Music, Trash2, Shuffle, Loader2 } from 'lucide-react';
import { Playlist, Song } from '../types';
import { api } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { SongRow } from './SongRow';

interface PlaylistModalProps {
  playlist: Playlist | null;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, onClose }) => {
  const { playSong } = useAudio();
  const { removeSongFromPlaylist } = useAuth();
  const [details, setDetails] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (playlist?.id && !playlist.isCustom) {
      setIsLoading(true);
      api
        .getPlaylistDetails(playlist.id)
        .then((res) => setDetails(res))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
    }
  }, [playlist?.id, playlist?.isCustom]);

  if (!playlist) return null;

  const currentPl = details || playlist;
  const songs = currentPl.songs || [];

  const handlePlayAll = (shuffle = false) => {
    if (songs.length > 0) {
      const list = shuffle ? [...songs].sort(() => Math.random() - 0.5) : songs;
      playSong(list[0], list);
    }
  };

  const coverUrl =
    currentPl.image?.[2]?.url ||
    currentPl.image?.[1]?.url ||
    currentPl.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-[36px] ios-glass-card border border-white/20 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-indigo-950/60 to-transparent border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5 min-w-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
              <img
                src={coverUrl}
                alt={currentPl.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                {currentPl.isSpotifyImport ? 'Spotify Sync' : currentPl.isCustom ? 'Custom Playlist' : 'Featured Chart'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 truncate">
                {currentPl.name}
              </h2>
              {currentPl.description && (
                <p className="text-xs text-slate-300 font-medium mt-0.5 truncate max-w-md">
                  {currentPl.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span>{songs.length} Tracks</span>
                <span>•</span>
                <span className="text-indigo-300 font-bold">320 kbps Lossless</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handlePlayAll(false)}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
              <span>Play All</span>
            </button>

            <button
              onClick={() => handlePlayAll(true)}
              disabled={songs.length === 0}
              className="p-3 rounded-2xl ios-glass-pill hover:bg-white/20 text-white transition-all hover:scale-105"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracklist */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-none">
          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : songs.length > 0 ? (
            songs.map((song, idx) => (
              <SongRow
                key={`pl-song-${song.id}-${idx}`}
                song={song}
                index={idx}
                playlistContext={songs}
              />
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No tracks found in this playlist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
