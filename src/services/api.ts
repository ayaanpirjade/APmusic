import { Song, Album, Playlist, Artist, LyricsData, SpotifyPreset } from '../types';

const configuredApiBase = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/$/, '');
const isNativeApp = typeof window !== 'undefined'
  && (window.location.protocol === 'capacitor:'
    || window.location.hostname === 'localhost'
    || Boolean((window as any).Capacitor?.isNativePlatform?.()));

// Web stays same-origin; the packaged APK must call the live API instead of
// trying to fetch `/api/*` from its local capacitor://localhost origin.
export const API_BASE_URL = configuredApiBase || (isNativeApp ? 'https://a-p-music.vercel.app' : '');
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const api = {
  async getHomeModules(language = 'hindi,english,punjabi'): Promise<{
    trending: Song[];
    charts: Playlist[];
    playlists: Playlist[];
    newAlbums: Album[];
    topArtists: Artist[];
  }> {
    const res = await fetch(apiUrl(`/api/modules?language=${encodeURIComponent(language)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch home modules');
    return data.data;
  },

  async searchSongs(query: string, page = 1, limit = 20): Promise<Song[]> {
    const res = await fetch(apiUrl(`/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Search failed');
    return data.data.results || [];
  },

  async searchAll(query: string): Promise<{
    songs: Song[];
    albums: Album[];
    playlists: Playlist[];
    artists: Artist[];
  }> {
    const res = await fetch(apiUrl(`/api/search/all?query=${encodeURIComponent(query)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Search all failed');
    return data.data;
  },

  async getSongDetails(id: string, title?: string, artist?: string): Promise<Song> {
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (artist) params.set('artist', artist);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(apiUrl(`/api/songs/${encodeURIComponent(id)}${qs}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load song');
    return data.data;
  },

  async getSongById(id: string, title?: string, artist?: string): Promise<Song> {
    return this.getSongDetails(id, title, artist);
  },

  async resolveAudioStream(id: string, title?: string, artist?: string): Promise<{
    playUrl: string;
    downloadUrl: { quality: string; url: string }[];
    embedUrl?: string;
  } | null> {
    const params = new URLSearchParams();
    if (id) params.set('id', id);
    if (title) params.set('title', title);
    if (artist) params.set('artist', artist);
    const res = await fetch(apiUrl(`/api/stream/resolve?${params.toString()}`));
    const data = await res.json();
    if (!data.success) return null;
    return data.data;
  },

  async getSongSuggestions(id: string, limit = 15): Promise<Song[]> {
    const res = await fetch(apiUrl(`/api/songs/${encodeURIComponent(id)}/suggestions?limit=${limit}`));
    const data = await res.json();
    if (!data.success) return [];
    return data.data || [];
  },

  async getPlaylistDetails(id: string): Promise<Playlist> {
    const res = await fetch(apiUrl(`/api/playlists/${encodeURIComponent(id)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load playlist');
    return data.data;
  },

  async getAlbumDetails(id: string): Promise<Album> {
    const res = await fetch(apiUrl(`/api/albums/${encodeURIComponent(id)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load album');
    return data.data;
  },

  async getArtistDetails(id: string): Promise<Artist> {
    const res = await fetch(apiUrl(`/api/artists/${encodeURIComponent(id)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load artist');
    return data.data;
  },

  async getLyrics(
    lyricsIdOrSongId: string,
    songName?: string,
    artistName?: string,
    duration?: number
  ): Promise<LyricsData> {
    const params = new URLSearchParams();
    if (songName) params.set('songName', songName);
    if (artistName) params.set('artistName', artistName);
    if (duration) params.set('duration', String(duration));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(apiUrl(`/api/lyrics/${encodeURIComponent(lyricsIdOrSongId || 'unknown')}${qs}`));
    const data = await res.json();
    if (!data.success || !data.data) return { lyrics: 'Lyrics not available for this song.' };
    return data.data;
  },

  async getSpotifyPresets(): Promise<SpotifyPreset[]> {
    const res = await fetch(apiUrl('/api/spotify/presets'));
    const data = await res.json();
    if (!data.success) return [];
    return data.data;
  },

  async getCharts(category = 'trending'): Promise<{
    category: string;
    total: number;
    tracks: Song[];
  }> {
    const res = await fetch(apiUrl(`/api/charts?category=${encodeURIComponent(category)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load charts');
    return data;
  },

  async getTrackDetails(youtubeId: string): Promise<{
    id: string;
    youtubeId: string;
    coverUrl?: string;
    streamUrl?: string;
    embedUrl?: string;
  }> {
    const res = await fetch(apiUrl(`/api/track/${encodeURIComponent(youtubeId)}`));
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to load track details');
    return data.track;
  },

  async importPlaylist(url: string): Promise<{
    id: string;
    title: string;
    description: string;
    owner: string;
    coverImage: string;
    totalTracks: number;
    resolvedSongs: Song[];
  }> {
    const res = await fetch(apiUrl('/api/playlist/import'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to import playlist');
    }
    return data.data;
  },

  async importSpotifyPlaylist(url: string): Promise<{
    id: string;
    title: string;
    description: string;
    owner: string;
    coverImage: string;
    totalTracks: number;
    resolvedSongs: Song[];
  }> {
    return this.importPlaylist(url);
  },

};
