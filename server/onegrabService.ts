const ONEGRAB_BASE = 'https://api.onegrab.fun';
const ONEGRAB_API_KEY = process.env.ONEGRAB_API_KEY || '';

type OneGrabResult = {
  channel?: string;
  duration?: number;
  id?: string;
  platform?: string;
  thumbnail?: string;
  title?: string;
  url?: string;
  views?: string;
};

function clean(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeUrl(value: unknown): string {
  const url = clean(value);
  return url.startsWith('http://') ? url.replace(/^http:/, 'https:') : url;
}

function isUsableMediaUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) && !/youtube\.com|youtu\.be|soundcloud\.com/i.test(url);
}

async function onegrabRequest<T>(path: string, params: Record<string, string>): Promise<T | null> {
  if (!ONEGRAB_API_KEY) return null;
  const url = new URL(path, ONEGRAB_BASE);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, {
    headers: {
      'X-API-Key': ONEGRAB_API_KEY,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`OneGrab returned ${response.status}`);
  return (await response.json()) as T;
}

function toSong(item: OneGrabResult, index: number) {
  const title = clean(item.title) || 'Untitled Track';
  const artist = clean(item.channel) || 'OneGrab Music';
  const mediaUrl = normalizeUrl(item.url);
  if (!mediaUrl || !isUsableMediaUrl(mediaUrl)) return null;
  const thumbnail = normalizeUrl(item.thumbnail);
  const id = `onegrab-${clean(item.id) || `${Date.now()}-${index}`}`;
  const imageUrl = thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
  return {
    id,
    name: title,
    type: 'song',
    album: { id: `onegrab-album-${id}`, name: 'OneGrab Fallback', url: '' },
    year: String(new Date().getFullYear()),
    releaseDate: '',
    duration: Number(item.duration || 0),
    label: 'OneGrab',
    primaryArtists: artist,
    featuredArtists: '',
    singers: artist,
    language: 'unknown',
    hasLyrics: false,
    image: [
      { quality: '150x150', url: imageUrl },
      { quality: '500x500', url: imageUrl },
    ],
    downloadUrl: [{ quality: '320kbps', url: mediaUrl }],
    playUrl: mediaUrl,
    copyright: '',
    url: normalizeUrl(item.url),
    fallbackProvider: 'onegrab',
  };
}

export async function searchOneGrabSongs(query: string, limit = 10): Promise<any[]> {
  if (!ONEGRAB_API_KEY || !query.trim()) return [];
  try {
    const payload = await onegrabRequest<{ results?: OneGrabResult[] }>('/api/search', {
      query: query.trim(),
      platform: 'youtube',
      limit: String(Math.min(Math.max(limit, 1), 10)),
    });
    return (payload?.results || [])
      .map(toSong)
      .filter(Boolean);
  } catch (error) {
    console.error('OneGrab fallback search error:', error);
    return [];
  }
}

export function isOneGrabConfigured(): boolean {
  return Boolean(ONEGRAB_API_KEY);
}
