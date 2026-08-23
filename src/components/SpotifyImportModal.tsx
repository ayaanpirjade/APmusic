import React, { useState, useEffect } from 'react';
import { X, Music, CheckCircle, ArrowRight, Play, Loader2, BookmarkPlus, Sparkles } from 'lucide-react';
import { Song, SpotifyPreset } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { SongRow } from './SongRow';

interface SpotifyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpotifyImportModal: React.FC<SpotifyImportModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist, addSongToPlaylist } = useAuth();
  const { playSong } = useAudio();

  const [url, setUrl] = useState('');
  const [presets, setPresets] = useState<SpotifyPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    id: string;
    title: string;
    description: string;
    owner: string;
    coverImage: string;
    totalTracks: number;
    resolvedSongs: Song[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getSpotifyPresets().then(setPresets).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImport = async (urlToUse?: string) => {
    const targetUrl = urlToUse || url;
    if (!targetUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setImportResult(null);
    setSavedSuccess(false);

    try {
      const data = await api.importSpotifyPlaylist(targetUrl);
      setImportResult(data);
    } catch (err: any) {
      console.error('Spotify import error:', err);
      setError(err.message || 'Could not import Spotify URL. Please check the link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!importResult) return;
    const newPlaylist = createPlaylist(
      importResult.title,
      importResult.description || 'Imported from Spotify',
      importResult.coverImage
    );

    for (const song of importResult.resolvedSongs) {
      addSongToPlaylist(newPlaylist.id, song);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handlePlayAll = () => {
    if (importResult && importResult.resolvedSongs.length > 0) {
      playSong(importResult.resolvedSongs[0], importResult.resolvedSongs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-[36px] ios-glass-card border border-emerald-500/30 p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-[90px] pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-black">
              <Music className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Spotify Playlist Importer</h2>
              <p className="text-xs text-emerald-300">Converts Spotify links into 320kbps Master Lossless Streams</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          {/* Input URL Box */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300">Paste any Spotify Playlist or Track URL:</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl ios-glass-card border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 text-sm font-medium shadow-inner"
              />
              <button
                onClick={() => handleImport()}
                disabled={isLoading || !url.trim()}
                className="absolute right-2 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold shadow-md transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Playlists */}
          {presets.length > 0 && !importResult && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Popular Spotify Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setUrl(preset.url);
                      handleImport(preset.url);
                    }}
                    className="p-3 rounded-2xl ios-glass-card hover:border-emerald-400/40 cursor-pointer flex items-center gap-3 transition-transform hover:scale-[1.02]"
                  >
                    <img
                      src={preset.coverImage}
                      alt={preset.name}
                      className="w-12 h-12 rounded-xl object-cover shadow"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{preset.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{preset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-300">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold">Resolving Spotify tracks into 320kbps lossless streams...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Import Result Display */}
          {importResult && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-300">
              {/* Header card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-indigo-950/40 border border-emerald-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={importResult.coverImage}
                    alt={importResult.title}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/20"
                  />
                  <div>
                    <h3 className="text-lg font-black text-white">{importResult.title}</h3>
                    <p className="text-xs text-slate-300">
                      {importResult.resolvedSongs.length} tracks matched in high quality
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayAll}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:scale-105 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play Now</span>
                  </button>

                  <button
                    onClick={handleSaveToLibrary}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg hover:scale-105 transition-transform"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save to Library</span>
                  </button>
                </div>
              </div>

              {savedSuccess && (
                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-400/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Playlist successfully added to your APMUSIC Library!</span>
                </div>
              )}

              {/* Songs List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Imported Tracks</h4>
                {importResult.resolvedSongs.map((song, idx) => (
                  <SongRow
                    key={`spotify-song-${song.id}-${idx}`}
                    song={song}
                    index={idx}
                    playlistContext={importResult.resolvedSongs}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
