import React, { useState, useEffect } from 'react';
import { X, Play, Music, Mic2, Heart, Disc3, Loader2 } from 'lucide-react';
import { Artist, Song } from '../types';
import { api } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { SongRow } from './SongRow';

interface ArtistModalProps {
  artist: Artist | null;
  onClose: () => void;
}

export const ArtistModal: React.FC<ArtistModalProps> = ({ artist, onClose }) => {
  const { playSong } = useAudio();
  const [details, setDetails] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (artist?.id) {
      setIsLoading(true);
      api
        .getArtistDetails(artist.id)
        .then((res) => setDetails(res))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setDetails(null);
    }
  }, [artist?.id]);

  if (!artist) return null;

  const currentArtist = details || artist;
  const songs = currentArtist.topSongs || [];

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const coverUrl =
    currentArtist.image?.[2]?.url ||
    currentArtist.image?.[1]?.url ||
    currentArtist.image?.[0]?.url ||
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-[36px] ios-glass-card border border-white/20 flex flex-col shadow-2xl overflow-hidden">
        {/* Top Banner with cover backdrop */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden shrink-0">
          <img
            src={coverUrl}
            alt={currentArtist.name}
            className="w-full h-full object-cover blur-sm scale-105 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B14] via-[#0B0B14]/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-md transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Artist identity header */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 z-10">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-2xl shrink-0">
                <img
                  src={coverUrl}
                  alt={currentArtist.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  Verified Artist
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1 truncate">
                  {currentArtist.name}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">{currentArtist.role || 'Singer & Musician'}</p>
              </div>
            </div>

            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
              <span>Play Top Tracks</span>
            </button>
          </div>
        </div>

        {/* Scrollable song list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
          {currentArtist.bio && (
            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
              {currentArtist.bio}
            </p>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Top Songs ({songs.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : songs.length > 0 ? (
            <div className="space-y-2">
              {songs.map((song, idx) => (
                <SongRow
                  key={`artist-song-${song.id}-${idx}`}
                  song={song}
                  index={idx}
                  playlistContext={songs}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No top tracks found for this artist.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
