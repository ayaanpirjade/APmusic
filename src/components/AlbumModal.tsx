import React, { useState, useEffect } from 'react';
import { X, Play, Disc3, Calendar, Music, Loader2 } from 'lucide-react';
import { Album, Song } from '../types';
import { api } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { SongRow } from './SongRow';

interface AlbumModalProps {
  album: Album | null;
  onClose: () => void;
}

export const AlbumModal: React.FC<AlbumModalProps> = ({ album, onClose }) => {
  const { playSong } = useAudio();
  const [details, setDetails] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (album?.id) {
      setIsLoading(true);
      api
        .getAlbumDetails(album.id)
        .then((res) => setDetails(res))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
    }
  }, [album?.id]);

  if (!album) return null;

  const currentAlbum = details || album;
  const songs = currentAlbum.songs || [];

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const coverUrl =
    currentAlbum.image?.[2]?.url ||
    currentAlbum.image?.[1]?.url ||
    currentAlbum.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-[36px] ios-glass-card border border-white/20 flex flex-col shadow-2xl overflow-hidden">
        {/* Header with Album Artwork & Meta */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-b from-indigo-950/60 to-transparent border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
              <img
                src={coverUrl}
                alt={currentAlbum.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/40">
                Album
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 truncate">
                {currentAlbum.name}
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                {currentAlbum.primaryArtists}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span>{currentAlbum.year || '2024'}</span>
                <span>•</span>
                <span>{songs.length} Tracks</span>
                <span>•</span>
                <span className="text-indigo-300 font-bold">320 kbps Lossless</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayAll}
            disabled={songs.length === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Play className="w-4 h-4 fill-black ml-0.5" />
            <span>Play Album</span>
          </button>
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
                key={`album-song-${song.id}-${idx}`}
                song={song}
                index={idx}
                playlistContext={songs}
              />
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No tracks found for this album.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
