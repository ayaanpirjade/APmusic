import { SaavnSong, formatDownloadUrls, formatImageUrls, sanitizeHtml } from './saavnService.js';

const FALLEN_API_KEY = process.env.FALLEN_API_KEY || '973f0a_tVVZ2B-VEM9S_Nj51YbMtBtPalBVcv4Q';
const FALLEN_BASE_URL = process.env.FALLEN_API_BASE || 'https://api.onegrab.fun';

export interface FallenTrackResponse {
  id?: string;
  title?: string;
  url?: string;
  cdnurl?: string;
  download_url?: string;
  stream_url?: string;
  platform?: string;
  duration?: number;
  thumbnail?: string;
  artist?: string;
}

export interface FallenSearchItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration?: number;
  channel?: string;
  views?: string;
  platform?: string;
}

/**
 * Fetch detailed track audio stream URL from Fallen API (/api/track)
 */
export async function getFallenTrackDetails(trackUrl: string): Promise<FallenTrackResponse | null> {
  if (!trackUrl) return null;
  try {
    const url = `${FALLEN_BASE_URL}/api/track?url=${encodeURIComponent(trackUrl)}`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': FALLEN_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'APmusic/1.0',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`Fallen API /api/track returned status ${res.status} for ${trackUrl}`);
      return null;
    }

    const data: FallenTrackResponse = await res.json();
    return data;
  } catch (err: any) {
    console.warn(`Fallen API getFallenTrackDetails error for ${trackUrl}:`, err.message || err);
    return null;
  }
}

/**
 * Search songs on Fallen API for a given platform (jiosaavn, spotify, ytmusic, youtube, soundcloud, deezer)
 */
export async function searchFallenByPlatform(
  query: string,
  platform: 'jiosaavn' | 'spotify' | 'ytmusic' | 'youtube' | 'soundcloud' | 'deezer' = 'jiosaavn',
  limit = 10
): Promise<FallenSearchItem[]> {
  if (!query || !query.trim()) return [];
  try {
    const url = `${FALLEN_BASE_URL}/api/search?query=${encodeURIComponent(query.trim())}&platform=${platform}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': FALLEN_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'APmusic/1.0',
      },
      signal: AbortSignal.timeout(9000),
    });

    if (!res.ok) {
      console.warn(`Fallen API /api/search (${platform}) returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  } catch (err: any) {
    console.warn(`Fallen API search error (${platform}):`, err.message || err);
    return [];
  }
}

/**
 * Transform a Fallen API item into a standard SaavnSong format
 */
export function formatFallenSong(item: FallenSearchItem, cdnAudioUrl?: string): SaavnSong {
  const images = formatImageUrls(item.thumbnail);
  const streamUrl = cdnAudioUrl || '';
  const downloadUrls = streamUrl ? formatDownloadUrls(streamUrl) : [];

  return {
    id: `fallen_${item.platform || 'track'}_${item.id || encodeURIComponent(item.title).slice(0, 20)}`,
    name: sanitizeHtml(item.title || 'Untitled Track'),
    type: 'song',
    album: {
      id: `fallen_album_${item.id || 'single'}`,
      name: sanitizeHtml(item.title || 'Single'),
      url: item.url || '',
    },
    year: String(new Date().getFullYear()),
    releaseDate: '',
    duration: Number(item.duration || 0),
    label: 'Fallen Music Network',
    primaryArtists: sanitizeHtml(item.channel || 'Various Artists'),
    featuredArtists: '',
    singers: sanitizeHtml(item.channel || 'Various Artists'),
    language: 'all',
    hasLyrics: false,
    image: images,
    downloadUrl: downloadUrls.length > 0 ? downloadUrls : [{ quality: '320kbps', url: streamUrl }],
    playUrl: streamUrl,
    copyright: 'APmusic Fallen Fallback Service',
    url: item.url || '',
  };
}

/**
 * Perform comprehensive fallback search across JioSaavn, Spotify, YTMusic, SoundCloud on Fallen API
 */
export async function searchFallenFallbackSongs(query: string, limit = 15): Promise<SaavnSong[]> {
  if (!query || !query.trim()) return [];

  // Try JioSaavn first on Fallen API (most direct CDN links)
  try {
    const jioResults = await searchFallenByPlatform(query, 'jiosaavn', limit);
    if (jioResults.length > 0) {
      // Resolve audio links for top results asynchronously in parallel
      const resolvedSongs = await Promise.all(
        jioResults.slice(0, 8).map(async (item) => {
          let cdnUrl = '';
          if (item.url) {
            const trackDetails = await getFallenTrackDetails(item.url);
            if (trackDetails) {
              cdnUrl = trackDetails.cdnurl || trackDetails.download_url || trackDetails.stream_url || '';
            }
          }
          return formatFallenSong(item, cdnUrl);
        })
      );
      return resolvedSongs;
    }
  } catch (err) {
    console.warn('Fallen JioSaavn search error:', err);
  }

  // Fallback to Spotify / YTMusic on Fallen API
  try {
    const [spotifyResults, ytResults] = await Promise.all([
      searchFallenByPlatform(query, 'spotify', limit),
      searchFallenByPlatform(query, 'ytmusic', limit),
    ]);

    const combined = [...spotifyResults, ...ytResults];
    if (combined.length > 0) {
      const resolvedSongs = await Promise.all(
        combined.slice(0, 8).map(async (item) => {
          let cdnUrl = '';
          if (item.url) {
            const trackDetails = await getFallenTrackDetails(item.url);
            if (trackDetails) {
              cdnUrl = trackDetails.cdnurl || trackDetails.download_url || trackDetails.stream_url || '';
            }
          }
          return formatFallenSong(item, cdnUrl);
        })
      );
      return resolvedSongs;
    }
  } catch (err) {
    console.warn('Fallen Spotify/YTMusic search error:', err);
  }

  return [];
}

/**
 * Resolve a single missing track with guaranteed direct streaming link
 */
export async function resolveFallenTrack(
  titleOrQuery: string,
  artist?: string
): Promise<SaavnSong | null> {
  const fullQuery = `${titleOrQuery} ${artist || ''}`.trim();
  if (!fullQuery) return null;

  const platforms: Array<'jiosaavn' | 'spotify' | 'ytmusic' | 'deezer'> = [
    'jiosaavn',
    'spotify',
    'ytmusic',
    'deezer',
  ];

  for (const platform of platforms) {
    try {
      const items = await searchFallenByPlatform(fullQuery, platform, 2);
      if (items.length > 0) {
        const bestItem = items[0];
        const trackDetails = await getFallenTrackDetails(bestItem.url);
        const cdnUrl = trackDetails?.cdnurl || trackDetails?.download_url || trackDetails?.stream_url;
        if (cdnUrl) {
          return formatFallenSong(bestItem, cdnUrl);
        }
      }
    } catch (err) {
      console.warn(`Fallen resolve error on ${platform}:`, err);
    }
  }

  return null;
}
