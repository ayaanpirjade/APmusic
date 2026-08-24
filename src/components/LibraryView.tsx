import React, { useState } from 'react';
import {
  Heart,
  ArrowDownToLine,
  ListMusic,
  Plus,
  Play,
  Shuffle,
  Music,
  Trash2,
  Share2,
  FolderOpen,
  Sparkles,
} from 'lucide-react';
import { Song, Playlist } from '../types';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { SongRow } from './SongRow';

interface LibraryViewProps {
  onCreatePlaylistModal: () => void;
  onOpenPlaylist: (playlist: Playlist) => void;
  onOpenSpotifyModal: () => void;
}

type LibraryTab = 'liked' | 'downloaded' | 'playlists';

export const LibraryView: React.FC<LibraryViewProps> = ({
  onCreatePlaylistModal,
  onOpenPlaylist,
  onOpenSpotifyModal,
}) => {
  const { likedSongs, downloadedSongs, customPlaylists, deletePlaylist } = useAuth();
  const { playSong } = useAudio();

  const [activeTab, setActiveTab] = useState<LibraryTab>('liked');

  const handlePlayAll = (songs: Song[], shuffle = false) => {
    if (songs.length === 0) return;
    const list = shuffle ? [...songs].sort(() => Math.random() - 0.5) : songs;
    playSong(list[0], list);
  };

  return (
    <div className="apmusic-library-page w-full min-w-0 space-y-6 pb-40 pt-2 select-none">
      {/* Top Header */}
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Your Library</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            All your favorites, offline cached files, and customized collections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onCreatePlaylistModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/40 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Playlist</span>
          </button>

          <button
            onClick={onOpenSpotifyModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Music className="w-4 h-4" />
            <span>Import Spotify</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('liked')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'liked'
              ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40 shadow-lg'
              : 'ios-glass-pill text-slate-300 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeTab === 'liked' ? 'fill-rose-400 text-rose-400' : ''}`} />
          <span>Liked Songs ({likedSongs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('downloaded')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'downloaded'
              ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-lg'
              : 'ios-glass-pill text-slate-300 hover:text-white'
          }`}
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          <span>Offline Downloads ({downloadedSongs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'playlists'
              ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-400/40 shadow-lg'
              : 'ios-glass-pill text-slate-300 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Playlists ({customPlaylists.length})</span>
        </button>
      </div>

      {/* TAB 1: Liked Songs */}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          {likedSongs.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayAll(likedSongs, false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow hover:scale-105 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play All</span>
                  </button>

                  <button
                    onClick={() => handlePlayAll(likedSongs, true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl ios-glass-pill text-white font-bold text-xs hover:bg-white/20 transition-transform"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>
                </div>

                <span className="text-xs text-slate-400">{likedSongs.length} favorites</span>
              </div>

              <div className="space-y-2">
                {likedSongs.map((song, idx) => (
                  <SongRow
                    key={`liked-${song.id}-${idx}`}
                    song={song}
                    index={idx}
                    playlistContext={likedSongs}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 ios-glass rounded-3xl space-y-3">
              <Heart className="w-12 h-12 mx-auto text-slate-500 stroke-[1.5]" />
              <h3 className="text-lg font-bold text-white">No liked songs yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tap the heart icon on any song to add it to your lossless library.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Offline Downloads */}
      {activeTab === 'downloaded' && (
        <div className="space-y-4">
          {downloadedSongs.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayAll(downloadedSongs, false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow hover:scale-105 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play Offline</span>
                  </button>

                  <button
                    onClick={() => handlePlayAll(downloadedSongs, true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl ios-glass-pill text-white font-bold text-xs hover:bg-white/20 transition-transform"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Shuffle</span>
                  </button>
                </div>

                <span className="text-xs text-emerald-400 font-semibold">
                  Saved offline in high-fidelity
                </span>
              </div>

              <div className="space-y-2">
                {downloadedSongs.map((song, idx) => (
                  <SongRow
                    key={`downloaded-${song.id}-${idx}`}
                    song={song}
                    index={idx}
                    playlistContext={downloadedSongs}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 ios-glass rounded-3xl space-y-3">
              <ArrowDownToLine className="w-12 h-12 mx-auto text-slate-500 stroke-[1.5]" />
              <h3 className="text-lg font-bold text-white">No offline songs</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click download on any song to save the uncompressed 320kbps audio file directly for instant offline playback.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          {customPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPlaylists.map((pl) => {
                const coverUrl =
                  pl.image?.[2]?.url ||
                  pl.image?.[0]?.url ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80';
                return (
                  <div
                    key={pl.id}
                    onClick={() => onOpenPlaylist(pl)}
                    className="group relative p-4 rounded-3xl ios-glass-card hover:border-indigo-400/40 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0 border border-white/10">
                        <img
                          src={coverUrl}
                          alt={pl.name}
                          className="w-full h-full object-cover"
                        />
                        {pl.isSpotifyImport && (
                          <span className="absolute bottom-1 right-1 p-1 rounded-md bg-black/70 text-emerald-400">
                            <Music className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                          {pl.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {pl.songCount || pl.songs?.length || 0} Songs
                          {pl.isSpotifyImport ? ' • Spotify Sync' : ' • Custom Playlist'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => deletePlaylist(pl.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                        title="Delete Playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 ios-glass rounded-3xl space-y-4">
              <FolderOpen className="w-12 h-12 mx-auto text-slate-500 stroke-[1.5]" />
              <h3 className="text-lg font-bold text-white">Create your first playlist</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Organize your favorite songs, moods, or import from your Spotify account.
              </p>
              <button
                onClick={onCreatePlaylistModal}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
              >
                Create New Playlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
