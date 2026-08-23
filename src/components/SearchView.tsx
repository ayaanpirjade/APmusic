import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Music, Disc3, Mic2, ListMusic, Loader2, Sparkles } from 'lucide-react';
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

  const trendingTags = [
    'Kesariya',
    'Arijit Singh',
    'Animal',
    'Diljit Dosanjh',
    'Sidhu Moose Wala',
    'Taylor Swift',
    'Karan Aujla',
    'Anirudh Ravichander',
    'Chuttamalle',
    'Badshah',
    'Rockstar',
    'Coke Studio',
  ];

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

  const handleTagClick = (tag: string) => {
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
    <div className="space-y-6 pb-32 pt-2 animate-in fade-in duration-300 select-none">
      {/* Search Bar Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search songs, albums, artists, or genres in 320kbps..."
            className="w-full pl-12 pr-12 py-4 rounded-3xl ios-glass-card border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400/80 focus:ring-4 focus:ring-indigo-500/20 text-base font-medium shadow-2xl transition-all"
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

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'all', label: 'All Results' },
            { id: 'songs', label: 'Songs' },
            { id: 'albums', label: 'Albums' },
            { id: 'artists', label: 'Artists' },
            { id: 'playlists', label: 'Playlists' },
          ] as Array<{ id: SearchTab; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600/40 text-white border border-indigo-400/40 shadow-lg shadow-indigo-500/20 scale-105'
                : 'ios-glass-pill text-slate-300 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggested Search Chips (When query is empty) */}
      {!hasSearched && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Trending Searches</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 rounded-2xl ios-glass-card hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-all hover:scale-105 border border-white/10"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm font-medium">Searching Lossless Database...</p>
        </div>
      )}

      {/* Search Results Display */}
      {!isLoading && hasSearched && (
        <div className="space-y-8">
          {/* Top Result / Songs Section */}
          {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Songs ({songs.length})</h3>
                </div>
              </div>

              <div className="space-y-2">
                {songs.map((song, idx) => (
                  <SongRow
                    key={`search-song-${song.id}-${idx}`}
                    song={song}
                    index={idx}
                    playlistContext={songs}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Artists Section */}
          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-pink-400" />
                <h3 className="text-lg font-bold text-white">Artists</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => onOpenArtist(artist)}
                    className="p-3 rounded-2xl ios-glass-card hover:border-pink-500/40 cursor-pointer flex flex-col items-center text-center transition-all hover:scale-105"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border border-white/20">
                      <img
                        src={artist.image?.[2]?.url || artist.image?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate w-full">{artist.name}</h4>
                    <p className="text-[10px] text-slate-400">{artist.role || 'Artist'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {(activeTab === 'all' || activeTab === 'albums') && albums.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Albums</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onOpenAlbum(album)}
                    className="p-3 rounded-2xl ios-glass-card hover:border-purple-500/40 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white/5">
                      <img
                        src={album.image?.[2]?.url || album.image?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}
                        alt={album.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{album.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{album.primaryArtists || album.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Section */}
          {(activeTab === 'all' || activeTab === 'playlists') && playlists.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Playlists</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => onOpenPlaylist(playlist)}
                    className="p-3 rounded-2xl ios-glass-card hover:border-emerald-500/40 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white/5">
                      <img
                        src={playlist.image?.[2]?.url || playlist.image?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-white truncate">{playlist.name}</h4>
                    <p className="text-[10px] text-slate-400">{playlist.songCount} Tracks</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No results message */}
          {songs.length === 0 && albums.length === 0 && artists.length === 0 && playlists.length === 0 && (
            <div className="py-20 text-center text-slate-400 ios-glass rounded-3xl">
              <Music className="w-10 h-10 mx-auto mb-2 text-slate-500" />
              <p className="text-base font-bold text-white">No matches found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try checking for typos or searching by artist name.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
