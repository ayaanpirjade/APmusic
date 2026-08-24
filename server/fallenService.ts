import { SaavnSong, formatDownloadUrls, formatImageUrls, sanitizeHtml } from './saavnService.js';

const FALLEN_API_KEY = (process.env.FALLEN_API_KEY || process.env.ONEGRAB_API_KEY || '').trim();
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

const trackCache = new Map<string, { data: FallenTrackResponse | null; time: number }>();
const searchCache = new Map<string, { data: FallenSearchItem[]; time: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 mins

/**
 * Fetch detailed track audio stream URL from Fallen API (/api/track)
 */
export async function getFallenTrackDetails(trackUrl: string): Promise<FallenTrackResponse | null> {
  if (!trackUrl) return null;

  // Spotify web URLs are not directly streamable via OneGrab /api/track and cause timeouts
  if (trackUrl.includes('spotify.com')) {
    return null;
  }

  const cached = trackCache.get(trackUrl);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `${FALLEN_BASE_URL}/api/track?url=${encodeURIComponent(trackUrl)}`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': FALLEN_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'APmusic/1.0',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      trackCache.set(trackUrl, { data: null, time: Date.now() });
      return null;
    }

    const data: FallenTrackResponse = await res.json();
    trackCache.set(trackUrl, { data, time: Date.now() });
    return data;
  } catch (err: any) {
    trackCache.set(trackUrl, { data: null, time: Date.now() });
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
  const cacheKey = `${platform}:${query.trim()}:${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data;
  }

  try {
    const url = `${FALLEN_BASE_URL}/api/search?query=${encodeURIComponent(query.trim())}&platform=${platform}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': FALLEN_API_KEY,
        'Accept': 'application/json',
        'User-Agent': 'APmusic/1.0',
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) {
      searchCache.set(cacheKey, { data: [], time: Date.now() });
      return [];
    }

    const data = await res.json();
    if (data && Array.isArray(data.results)) {
      searchCache.set(cacheKey, { data: data.results, time: Date.now() });
      return data.results;
    }
    return [];
  } catch (err: any) {
    searchCache.set(cacheKey, { data: [], time: Date.now() });
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

  // Fallback to YTMusic / YouTube on Fallen API
  try {
    const [ytMusicResults, ytResults] = await Promise.all([
      searchFallenByPlatform(query, 'ytmusic', limit),
      searchFallenByPlatform(query, 'youtube', limit),
    ]);

    const combined = [...ytMusicResults, ...ytResults];
    if (combined.length > 0) {
      const resolvedSongs = await Promise.all(
        combined.slice(0, 4).map(async (item) => {
          let cdnUrl = '';
          if (item.url && !item.url.includes('spotify.com')) {
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
  } catch (_) {
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

  const platforms: Array<'jiosaavn' | 'ytmusic' | 'youtube' | 'deezer'> = [
    'jiosaavn',
    'ytmusic',
    'youtube',
    'deezer',
  ];

  for (const platform of platforms) {
    try {
      const items = await searchFallenByPlatform(fullQuery, platform, 2);
      if (items.length > 0) {
        const bestItem = items[0];
        if (bestItem.url && !bestItem.url.includes('spotify.com')) {
          const trackDetails = await getFallenTrackDetails(bestItem.url);
          const cdnUrl = trackDetails?.cdnurl || trackDetails?.download_url || trackDetails?.stream_url;
          if (cdnUrl) {
            return formatFallenSong(bestItem, cdnUrl);
          }
        }
      }
    } catch (_) {
    }
  }

  return null;
}
