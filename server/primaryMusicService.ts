const PRIMARY_API_BASE = 'https://spotify-theta-ten.vercel.app/api/v1';
const PRIMARY_API_KEY = (process.env.MUSIC_API_KEY || 'ayaan-randi-321').trim();

export interface SpotifySong {
  id: string;
  name: string;
  type: string;
  album: { id: string; name: string; url: string };
  year: string;
  releaseDate: string;
  duration: number;
  label: string;
  primaryArtists: string;
  featuredArtists: string;
  singers: string;
  language: string;
  hasLyrics: boolean;
  lyricsId?: string;
  image: Array<{ quality: string; url: string }>;
  downloadUrl: Array<{ quality: string; url: string }>;
  playUrl: string;
  copyright: string;
  url: string;
  embedUrl?: string;
  provider: 'spotify-primary';
}

export interface PrimaryTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  coverUrl?: string;
  youtubeId?: string;
  streamUrl?: string;
  embedUrl?: string;
}

interface PrimarySearchResponse {
  success: boolean;
  total?: number;
  tracks?: PrimaryTrack[];
  error?: string;
}

interface PrimaryChartsResponse {
  success: boolean;
  category?: string;
  total?: number;
  tracks?: PrimaryTrack[];
  error?: string;
}

interface PrimaryPlaylistImportResponse {
  success: boolean;
  data?: {
    name: string;
    description?: string;
    coverUrl?: string;
    provider?: string;
    totalTracks?: number;
    tracks?: PrimaryTrack[];
  };
  error?: string;
}

export interface PrimaryTrackResponse {
  success: boolean;
  track?: {
    id: string;
    youtubeId: string;
    coverUrl?: string;
    streamUrl?: string;
    embedUrl?: string;
  };
  error?: string;
}

async function fetchPrimaryApi<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(`${PRIMARY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'x-api-key': PRIMARY_API_KEY,
        Accept: 'application/json',
        'User-Agent': 'APMUSIC-Spotify-Primary/3.0',
        ...(options.headers || {}),
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) {
      console.warn(`Spotify primary API returned ${response.status} for ${endpoint}`);
      return null;
    }
    return await response.json() as T;
  } catch (error: any) {
    console.error(`Spotify primary API error for ${endpoint}:`, error?.message || error);
    return null;
  }
}

function sanitizeHtml(value: string): string {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function imageUrls(url?: string): Array<{ quality: string; url: string }> {
  const fallback = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
  const source = (url || fallback).replace('http:', 'https:');
  return [
    { quality: '50x50', url: source },
    { quality: '150x150', url: source },
    { quality: '500x500', url: source },
  ];
}

function cleanYoutubeId(value?: string): string {
  return String(value || '').replace(/^yt[-_]/, '').trim();
}

function isDirectAudio(url?: string): boolean {
  return Boolean(url && !/youtube\.com|youtu\.be/i.test(url));
}

function youtubeEmbedUrl(youtubeId?: string, explicit?: string): string {
  if (explicit) return explicit;
  const cleanId = cleanYoutubeId(youtubeId);
  return cleanId ? `https://www.youtube.com/embed/${encodeURIComponent(cleanId)}?enablejsapi=1&playsinline=1` : '';
}

export function formatPrimaryTrackToSong(
  track: PrimaryTrack,
  resolvedAudio?: { playUrl?: string; downloadUrl?: { quality: string; url: string }[]; embedUrl?: string } | null,
): SpotifySong {
  const youtubeId = cleanYoutubeId(track.youtubeId || track.id);
  const directUrl = isDirectAudio(resolvedAudio?.playUrl)
    ? resolvedAudio?.playUrl
    : isDirectAudio(track.streamUrl)
      ? track.streamUrl
      : '';
  const embedUrl = resolvedAudio?.embedUrl || youtubeEmbedUrl(youtubeId, track.embedUrl);
  const title = sanitizeHtml(track.title || 'Untitled Track');
  const artist = sanitizeHtml(track.artist || 'Unknown Artist');

  return {
    id: youtubeId ? `yt_${youtubeId}` : String(track.id || `spotify_${Date.now()}`),
    name: title,
    type: 'song',
    album: { id: `spotify-album-${youtubeId || track.id || 'single'}`, name: sanitizeHtml(track.album || 'Single'), url: '' },
    year: String(new Date().getFullYear()),
    releaseDate: '',
    duration: Number(track.duration || 0),
    label: 'Spotify Primary Music API',
    primaryArtists: artist,
    featuredArtists: '',
    singers: artist,
    language: 'all',
    hasLyrics: false,
    image: imageUrls(track.coverUrl),
    downloadUrl: resolvedAudio?.downloadUrl || [],
    playUrl: directUrl,
    copyright: 'APMUSIC Spotify Primary Source',
    url: track.streamUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ''),
    embedUrl,
    provider: 'spotify-primary',
  };
}

export async function searchPrimarySongs(query: string, limit = 20): Promise<SpotifySong[]> {
  if (!query.trim()) return [];
  const response = await fetchPrimaryApi<PrimarySearchResponse>(`/search?q=${encodeURIComponent(query.trim())}`);
  if (!response?.success || !Array.isArray(response.tracks)) return [];
  return response.tracks.slice(0, limit).map((track) => formatPrimaryTrackToSong(track));
}

export async function getPrimaryCharts(category = 'trending'): Promise<{ category: string; total: number; songs: SpotifySong[] }> {
  const cleanCategory = category.trim().toLowerCase() || 'trending';
  const response = await fetchPrimaryApi<PrimaryChartsResponse>(`/charts?category=${encodeURIComponent(cleanCategory)}`);
  const songs = response?.success && Array.isArray(response.tracks)
    ? response.tracks.map((track) => formatPrimaryTrackToSong(track))
    : [];
  return {
    category: response?.category || cleanCategory,
    total: response?.total || songs.length,
    songs,
  };
}

export async function importPrimaryPlaylist(url: string): Promise<{
  id: string;
  title: string;
  description: string;
  owner: string;
  coverImage: string;
  totalTracks: number;
  resolvedSongs: SpotifySong[];
} | null> {
  if (!url.trim()) return null;
  const response = await fetchPrimaryApi<PrimaryPlaylistImportResponse>('/playlist/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim() }),
  });
  if (!response?.success || !response.data) return null;
  const songs = Array.isArray(response.data.tracks)
    ? response.data.tracks.map((track) => formatPrimaryTrackToSong(track))
    : [];
  return {
    id: `spotify-import-${Date.now()}`,
    title: response.data.name || 'Spotify Playlist',
    description: response.data.description || 'Imported from Spotify Primary API',
    owner: response.data.provider || 'Spotify',
    coverImage: response.data.coverUrl || songs[0]?.image?.[2]?.url || imageUrls()[2].url,
    totalTracks: response.data.totalTracks || songs.length,
    resolvedSongs: songs,
  };
}

export async function getPrimaryTrackDetails(youtubeId: string): Promise<PrimaryTrackResponse['track'] | null> {
  const cleanId = cleanYoutubeId(youtubeId);
  if (!cleanId) return null;
  const response = await fetchPrimaryApi<PrimaryTrackResponse>(`/track/${encodeURIComponent(cleanId)}`);
  return response?.success && response.track ? response.track : null;
}

/**
 * Spotify Primary API playback contract. The current endpoint exposes a
 * YouTube stream/embed identity; if it later returns a direct file, it is
 * accepted here. No legacy catalog or fallback provider is queried.
 */
export async function resolveTrackAudioStream(
  _title: string,
  _artist = '',
  youtubeId = '',
): Promise<{ playUrl: string; downloadUrl: { quality: string; url: string }[]; embedUrl?: string } | null> {
  const track = await getPrimaryTrackDetails(youtubeId);
  if (!track) return null;
  const directUrl = isDirectAudio(track.streamUrl) ? track.streamUrl || '' : '';
  return {
    playUrl: directUrl,
    downloadUrl: [],
    embedUrl: youtubeEmbedUrl(track.youtubeId || youtubeId, track.embedUrl),
  };
}
