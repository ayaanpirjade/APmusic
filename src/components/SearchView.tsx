import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon,
  X,
  Music,
  Disc3,
  Mic2,
  ListMusic,
  Loader2,
  Sparkles,
  TrendingUp,
  Volume2,
  Flame,
  Clock,
  Radio,
} from 'lucide-react';
import { Song, Album, Artist, Playlist } from '../types';
import { api } from '../services/api';
import { SongRow } from './SongRow';
import { SongCard } from './SongCard';

interface SearchViewProps {
  onOpenPlaylist: (playlist: Playlist) => void;
  onOpenArtist: (artist: Artist) => void;
  onOpenAlbum: (album: Album) => void;
}

type SearchTab = 'all' | 'songs' | 'albums' | 'artists' | 'playlists';

const GENRE_DISCOVERY = [
  { id: 'pop', name: 'Pop Hits', query: 'Pop Hits 2025', icon: '🎧', color: 'from-pink-500/30 to-purple-600/40 border-pink-500/30 text-pink-200' },
  { id: 'hiphop', name: 'Hip-Hop', query: 'Hip Hop Rap Beats', icon: '🔥', color: 'from-amber-500/30 to-orange-600/40 border-amber-500/30 text-amber-200' },
  { id: 'chill', name: 'Lo-Fi Chill', query: 'Lofi Chill Study Beats', icon: '🌙', color: 'from-indigo-500/30 to-blue-600/40 border-indigo-500/30 text-indigo-200' },
  { id: 'edm', name: 'EDM & Dance', query: 'EDM Electro House Party', icon: '⚡', color: 'from-cyan-500/30 to-teal-600/40 border-cyan-500/30 text-cyan-200' },
  { id: 'bollywood', name: 'Bollywood', query: 'Bollywood Romantic Hits', icon: '✨', color: 'from-rose-500/30 to-red-600/40 border-rose-500/30 text-rose-200' },
  { id: 'punjabi', name: 'Punjabi Fire', query: 'Punjabi Hits 2025', icon: '⚡', color: 'from-yellow-500/30 to-amber-600/40 border-yellow-500/30 text-yellow-200' },
  { id: 'phonk', name: 'Phonk & Bass', query: 'Drift Phonk Gym Workout', icon: '🏎️', color: 'from-red-500/30 to-purple-600/40 border-red-500/30 text-red-200' },
  { id: 'rock', name: 'Rock & Indie', query: 'Alternative Rock Indie', icon: '🎸', color: 'from-emerald-500/30 to-green-600/40 border-emerald-500/30 text-emerald-200' },
];

const SFX_DISCOVERY = [
  { id: 'memes', name: 'Memes', query: 'Meme sound effect', icon: '😂', color: 'from-blue-500/25 to-indigo-600/30' },
  { id: 'gaming', name: 'Gaming', query: 'Gaming 8-bit sound', icon: '🎮', color: 'from-purple-500/25 to-pink-600/30' },
  { id: 'fx', name: '💥 FX Beats', query: 'Bass drop drum impact', icon: '💥', color: 'from-rose-500/25 to-orange-600/30' },
  { id: 'cinematic', name: 'Cinematic', query: 'Cinematic trailer brass', icon: '🎬', color: 'from-amber-500/25 to-yellow-600/30' },
];

const RECENT_SEARCHES = ['Arijit Singh', 'Kesariya', 'Diljit Dosanjh', 'The Weeknd', 'Phonk Drift', 'Coke Studio'];

export const SearchView: React.FC<SearchViewProps> = ({
  onOpenPlaylist,
  onOpenArtist,
  onOpenAlbum,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const debounceTimer = useRef<any>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      setPlaylists([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      if (activeTab === 'songs') {
        const results = await api.searchSongs(searchTerm, 1, 30);
        setSongs(results);
      } else {
        const data = await api.searchAll(searchTerm);
        setSongs(data.songs || []);
        setAlbums(data.albums || []);
        setArtists(data.artists || []);
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performSearch(val);
    }, 350);
  };

  const handleQuickTagClick = (tag: string) => {
    setQuery(tag);
    performSearch(tag);
  };

  const handleClear = () => {
    setQuery('');
    setSongs([]);
    setAlbums([]);
    setArtists([]);
    setPlaylists([]);
    setHasSearched(false);
  };

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6 pb-36 pt-1 select-none max-w-7xl mx-auto">
      {/* Header: Search APmusic */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
          Search APmusic
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Discover millions of songs, artists, albums & sound effects in 320kbps
        </p>
      </div>

      {/* Big Search Input: [ 🔍 Search songs, artists & albums ] */}
      <div className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search songs, artists & albums..."
            className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-[26px] glass-card border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400/80 focus:ring-4 focus:ring-indigo-500/20 text-sm sm:text-base font-semibold shadow-2xl transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs when search active */}
      {hasSearched && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Results', count: songs.length + albums.length },
            { id: 'songs', label: 'Songs', count: songs.length },
            { id: 'albums', label: 'Albums', count: albums.length },
            { id: 'artists', label: 'Artists', count: artists.length },
            { id: 'playlists', label: 'Playlists', count: playlists.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SearchTab)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/40 scale-105 border border-indigo-400/50'
                  : 'glass-pill text-slate-300 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="ml-1.5 opacity-60">({tab.count})</span>}
            </button>
          ))}
        </div>
      )}

      {/* Default Discovery View when no query is typed */}
      {!hasSearched && !isLoading && (
        <div className="space-y-7 animate-in fade-in duration-300">
          {/* Recently Searched Tags */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recently Searched</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {RECENT_SEARCHES.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-3.5 py-1.5 rounded-xl glass-pill hover:bg-white/20 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all hover:scale-105"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Genres Discovery Grid: 🎧 Pop 🔥 Hip-Hop 🌙 Chill ⚡ EDM ... */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Explore Genres
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GENRE_DISCOVERY.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleQuickTagClick(g.query)}
                  className={`group p-4 rounded-2xl glass-card border cursor-pointer transition-all hover:scale-[1.03] shadow-md flex items-center justify-between ${g.color}`}
                >
                  <div>
                    <span className="text-2xl block mb-1">{g.icon}</span>
                    <h4 className="text-xs sm:text-sm font-black text-white">{g.name}</h4>
                  </div>
                  <Sparkles className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Sound Effects Discovery: 😂 Memes 🎮 Gaming 💥 FX 🎬 Cinematic */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Sound Effects & Samples
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SFX_DISCOVERY.map((sfx) => (
                <div
                  key={sfx.id}
                  onClick={() => handleQuickTagClick(sfx.query)}
                  className={`p-3.5 rounded-2xl glass-card border border-white/10 cursor-pointer transition-all hover:scale-[1.03] shadow-md flex items-center gap-3 bg-gradient-to-br ${sfx.color}`}
                >
                  <span className="text-2xl">{sfx.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{sfx.name}</h4>
                    <p className="text-[10px] text-slate-300 font-semibold">Sound Clips</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs font-bold text-slate-400">Searching 320kbps High-Fidelity Catalog...</p>
        </div>
      )}

      {/* Results View */}
      {hasSearched && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Songs List */}
          {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Tracks</h3>
              <div className="space-y-2">
                {songs.slice(0, activeTab === 'all' ? 8 : 40).map((song, i) => (
                  <SongRow key={song.id} song={song} index={i} playlistContext={songs} />
                ))}
              </div>
            </div>
          )}

          {/* Albums Grid */}
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {albums.slice(0, 12).map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onOpenAlbum(album)}
                    className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:scale-105"
                  >
                    <img
                      src={album.image?.[1]?.url || album.image?.[0]?.url}
                      alt={album.name}
                      className="w-full aspect-square rounded-xl object-cover mb-2"
                    />
                    <h4 className="text-xs font-bold text-white truncate">{album.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{album.artist || 'Album'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
