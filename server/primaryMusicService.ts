import { SaavnSong, formatDownloadUrls, formatImageUrls, sanitizeHtml, searchSongs } from './saavnService.js';
import { resolveFallenTrack, searchFallenFallbackSongs } from './fallenService.js';

const PRIMARY_API_BASE = 'https://spotify-theta-ten.vercel.app/api/v1';
const DEFAULT_API_KEY = 'ayaan-randi-321';
const PRIMARY_API_KEY = (process.env.MUSIC_API_KEY && process.env.MUSIC_API_KEY.trim() && process.env.MUSIC_API_KEY !== 'friend_api_key_demo')
  ? process.env.MUSIC_API_KEY.trim()
  : DEFAULT_API_KEY;

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

export interface PrimarySearchResponse {
  success: boolean;
  query?: string;
  total?: number;
  tracks?: PrimaryTrack[];
  error?: string;
}

export interface PrimaryChartsResponse {
  success: boolean;
  category?: string;
  total?: number;
  tracks?: PrimaryTrack[];
  error?: string;
}

export interface PrimaryPlaylistImportResponse {
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
  const url = `${PRIMARY_API_BASE}${endpoint}`;
  const headers = {
    'x-api-key': PRIMARY_API_KEY,
    'Accept': 'application/json',
    'User-Agent': 'APMUSIC-Audio-Core/2.0',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      if ((res.status === 401 || res.status === 403) && PRIMARY_API_KEY !== DEFAULT_API_KEY) {
        const fallbackRes = await fetch(url, {
          ...options,
          headers: { ...headers, 'x-api-key': DEFAULT_API_KEY },
          signal: AbortSignal.timeout(12000),
        });
        if (fallbackRes.ok) {
          return (await fallbackRes.json()) as T;
        }
      }
      return null;
    }

    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`Primary API error for ${endpoint}:`, err.message || err);
    return null;
  }
}

/**
 * Clean track title and artist for high-precision audio matching
 */
export function cleanTitleAndArtist(rawTitle: string, rawArtist = ''): { query: string; cleanTitle: string } {
  const cleanTitle = rawTitle
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .split('|')[0]
    .replace(/feat\..*$/i, '')
    .replace(/ft\..*$/i, '')
    .replace(/official\s*(video|audio|music\s*video|lyric\s*video)/gi, '')
    .replace(/full\s*song/gi, '')
    .replace(/4k|hd|1080p|remix|mashup/gi, '')
    .replace(/[#@]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanArtist = rawArtist
    .replace(/vevo|official|channel|records|t-series|sony\s*music/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const query = `${cleanTitle} ${cleanArtist}`.trim();
  return { query: query || rawTitle, cleanTitle: cleanTitle || rawTitle };
}

/**
 * Resolve direct high-fidelity playable audio stream for a track
 */
export async function resolveTrackAudioStream(
  title: string,
  artist = '',
  youtubeId = ''
): Promise<{ playUrl: string; downloadUrl: { quality: string; url: string }[] } | null> {
  const { query, cleanTitle } = cleanTitleAndArtist(title, artist);

  // 1. Try JioSaavn / Worker lossless direct audio stream search
  try {
    const saavnMatches = await searchSongs(query, 1, 3);
    if (saavnMatches.length > 0) {
      const best = saavnMatches[0];
      if (best.playUrl || (best.downloadUrl && best.downloadUrl.length > 0)) {
        return {
          playUrl: best.playUrl || best.downloadUrl[best.downloadUrl.length - 1]?.url,
          downloadUrl: best.downloadUrl || formatDownloadUrls(best.playUrl),
        };
      }
    }
  } catch (_) {}

  // 2. Try with just the cleaned title if query was too specific
  if (cleanTitle !== query) {
    try {
      const titleMatches = await searchSongs(cleanTitle, 1, 2);
      if (titleMatches.length > 0) {
        const best = titleMatches[0];
        if (best.playUrl || (best.downloadUrl && best.downloadUrl.length > 0)) {
          return {
            playUrl: best.playUrl || best.downloadUrl[best.downloadUrl.length - 1]?.url,
            downloadUrl: best.downloadUrl || formatDownloadUrls(best.playUrl),
          };
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to Fallen stream resolution
  try {
    const fallenMatches = await searchFallenFallbackSongs(cleanTitle || title, 2);
    if (fallenMatches.length > 0) {
      const best = fallenMatches[0];
      if (best.playUrl && !best.playUrl.includes('youtube.com/watch')) {
        return {
          playUrl: best.playUrl,
          downloadUrl: best.downloadUrl || formatDownloadUrls(best.playUrl),
        };
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Format a PrimaryTrack item into the universal SaavnSong object
 */
export function formatPrimaryTrackToSong(
  track: PrimaryTrack,
  resolvedAudio?: { playUrl: string; downloadUrl: { quality: string; url: string }[] } | null
): SaavnSong {
  const cleanTitle = sanitizeHtml(track.title || 'Untitled Track');
  const cleanArtist = sanitizeHtml(track.artist || 'Unknown Artist');
  const duration = Number(track.duration || 180);
  const images = formatImageUrls(track.coverUrl);

  const isAudioFile = (u?: string) =>
    Boolean(u && !u.includes('youtube.com/watch') && !u.includes('youtu.be/'));

  const finalStreamUrl = (resolvedAudio?.playUrl && isAudioFile(resolvedAudio.playUrl))
    ? resolvedAudio.playUrl
    : (track.streamUrl && isAudioFile(track.streamUrl) ? track.streamUrl : '');

  const downloadUrls = (resolvedAudio?.downloadUrl && resolvedAudio.downloadUrl.length > 0)
    ? resolvedAudio.downloadUrl
    : (finalStreamUrl ? formatDownloadUrls(finalStreamUrl) : []);

  const ytId = track.youtubeId || (track.id && track.id.startsWith('yt_') ? track.id.replace('yt_', '') : '');

  return {
    id: ytId ? `yt_${ytId}` : track.id || `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanTitle,
    type: 'song',
    album: {
      id: `album_${ytId || track.id || 'single'}`,
      name: sanitizeHtml(track.album || 'Single'),
      url: '',
    },
    year: String(new Date().getFullYear()),
    releaseDate: '',
    duration,
    label: 'APMUSIC Primary Streaming Engine',
    primaryArtists: cleanArtist,
    featuredArtists: '',
    singers: cleanArtist,
    language: 'all',
    hasLyrics: false,
    image: images,
    downloadUrl: downloadUrls,
    playUrl: finalStreamUrl,
    copyright: 'APMUSIC Audio Engine',
    url: track.streamUrl || (ytId ? `https://www.youtube.com/watch?v=${ytId}` : ''),
  };
}

/**
 * Search Songs using the Primary Music API (Primary Source)
 */
export async function searchPrimarySongs(query: string, limit = 20): Promise<SaavnSong[]> {
  if (!query || !query.trim()) return [];

  const data = await fetchPrimaryApi<PrimarySearchResponse>(`/search?q=${encodeURIComponent(query.trim())}`);
  if (!data || !data.success || !Array.isArray(data.tracks)) {
    return [];
  }

  const rawTracks = data.tracks.slice(0, limit);

  // Map to SaavnSong models
  const songs = rawTracks.map((t) => formatPrimaryTrackToSong(t));

  // Pre-resolve direct stream for the top 2 results in background for instant 0ms playback
  if (songs.length > 0) {
    const topTracks = songs.slice(0, 2);
    await Promise.allSettled(
      topTracks.map(async (s) => {
        if (!s.playUrl) {
          const audio = await resolveTrackAudioStream(s.name, s.primaryArtists, s.id);
          if (audio) {
            s.playUrl = audio.playUrl;
            s.downloadUrl = audio.downloadUrl;
          }
        }
      })
    );
  }

  return songs;
}

/**
 * Get Top Charts & Trending Songs from Primary API
 * Categories: global, trending, hindi, punjabi, pop, lofi
 */
export async function getPrimaryCharts(category = 'trending'): Promise<{
  category: string;
  total: number;
  songs: SaavnSong[];
}> {
  const cleanCat = category.toLowerCase().trim() || 'trending';
  const data = await fetchPrimaryApi<PrimaryChartsResponse>(`/charts?category=${encodeURIComponent(cleanCat)}`);

  if (!data || !data.success || !Array.isArray(data.tracks)) {
    return { category: cleanCat, total: 0, songs: [] };
  }

  const songs = data.tracks.map((t) => formatPrimaryTrackToSong(t));

  // Pre-resolve direct stream for top chart tracks
  if (songs.length > 0) {
    const topTracks = songs.slice(0, 2);
    await Promise.allSettled(
      topTracks.map(async (s) => {
        if (!s.playUrl) {
          const audio = await resolveTrackAudioStream(s.name, s.primaryArtists, s.id);
          if (audio) {
            s.playUrl = audio.playUrl;
            s.downloadUrl = audio.downloadUrl;
          }
        }
      })
    );
  }

  return {
    category: data.category || cleanCat,
    total: data.total || songs.length,
    songs,
  };
}

/**
 * Import Spotify or YouTube Playlist using Primary API
 */
export async function importPrimaryPlaylist(url: string): Promise<{
  id: string;
  title: string;
  description: string;
  owner: string;
  coverImage: string;
  totalTracks: number;
  resolvedSongs: SaavnSong[];
} | null> {
  if (!url || !url.trim()) return null;

  const res = await fetchPrimaryApi<PrimaryPlaylistImportResponse>('/playlist/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim() }),
  });

  if (!res || !res.success || !res.data) {
    return null;
  }

  const { name, description, coverUrl, provider, totalTracks, tracks } = res.data;
  const rawTracks = Array.isArray(tracks) ? tracks : [];

  const resolvedSongs = rawTracks.map((t) => formatPrimaryTrackToSong(t));

  return {
    id: `imported-${Date.now()}`,
    title: name || 'Imported Playlist',
    description: description || `Imported from ${provider || 'Music API'}`,
    owner: provider === 'spotify' ? 'Spotify' : 'YouTube',
    coverImage: coverUrl || (resolvedSongs[0]?.image[2]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'),
    totalTracks: totalTracks || resolvedSongs.length,
    resolvedSongs,
  };
}

/**
 * Get Track Details & Playback Info from Primary API
 */
export async function getPrimaryTrackDetails(youtubeId: string): Promise<PrimaryTrackResponse['track'] | null> {
  if (!youtubeId) return null;
  const cleanId = youtubeId.replace(/^yt-|^yt_/, '');
  const res = await fetchPrimaryApi<PrimaryTrackResponse>(`/track/${encodeURIComponent(cleanId)}`);
  if (!res || !res.success || !res.track) {
    return null;
  }
  return res.track;
}

