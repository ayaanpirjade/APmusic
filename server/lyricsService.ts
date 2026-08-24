const LRCLIB_API = 'https://lrclib.net/api';
const LRCLIB_USER_AGENT = 'APMUSIC/1.0 (https://a-p-music.vercel.app)';

type SyncedLyricLine = { time: number; text: string };

export interface LyricsData {
  lyrics: string;
  syncedLyrics?: SyncedLyricLine[];
  snippet?: string;
  copyright?: string;
}

interface LrcLibRecord {
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeText(value).split(/\s+/).filter((token) => token.length > 1));
}

function overlap(left: string, right: string): number {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (a.size === 0 || b.size === 0) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return common / Math.max(a.size, b.size);
}

function cleanTrackTitle(title: string, artist: string): string {
  let cleaned = title.trim();
  const normalizedArtist = normalizeText(artist);
  const normalizedTitle = normalizeText(cleaned);
  if (normalizedArtist && normalizedTitle.startsWith(`${normalizedArtist} `)) {
    const separator = cleaned.search(/\s[-–—:]\s/);
    if (separator >= 0) cleaned = cleaned.slice(separator + 3).trim();
  }
  return cleaned
    .replace(/\s*\((?:official\s+)?(?:music\s+)?video\)\s*$/i, '')
    .replace(/\s*\[(?:official\s+)?(?:music\s+)?video\]\s*$/i, '')
    .replace(/\s*\((?:official\s+)?audio\)\s*$/i, '')
    .replace(/\s*\((?:lyrics?|lyric\s+video)\)\s*$/i, '')
    .trim();
}

function parseSyncedLyrics(raw?: string | null): SyncedLyricLine[] {
  if (!raw) return [];
  const parsed: SyncedLyricLine[] = [];
  for (const sourceLine of raw.split(/\r?\n/)) {
    const timestamps = [...sourceLine.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    if (timestamps.length === 0) continue;
    const text = sourceLine.replace(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g, '').trim();
    if (!text) continue;
    for (const timestamp of timestamps) {
      const minutes = Number(timestamp[1]);
      const seconds = Number(timestamp[2]);
      const fraction = timestamp[3] || '0';
      const fractionSeconds = Number(`0.${fraction.padEnd(3, '0')}`);
      parsed.push({ time: minutes * 60 + seconds + fractionSeconds, text });
    }
  }
  return parsed.sort((a, b) => a.time - b.time);
}

function recordMatches(record: LrcLibRecord, title: string, artist: string, duration: number): boolean {
  const artistScore = overlap(record.artistName || '', artist);
  const titleScore = overlap(record.trackName || '', cleanTrackTitle(title, artist));
  const durationMatches = !duration || !record.duration || Math.abs(Number(record.duration) - duration) <= 3;
  return artistScore >= 0.45 && titleScore >= 0.45 && durationMatches;
}

async function requestJson(url: URL): Promise<LrcLibRecord | LrcLibRecord[] | null> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': LRCLIB_USER_AGENT,
      'X-User-Agent': LRCLIB_USER_AGENT,
    },
    signal: AbortSignal.timeout(9000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`LRCLIB request failed with ${response.status}`);
  return await response.json() as LrcLibRecord | LrcLibRecord[];
}

async function findRecord(title: string, artist: string, duration: number): Promise<LrcLibRecord | null> {
  const titles = [...new Set([title.trim(), cleanTrackTitle(title, artist)].filter(Boolean))];
  for (const candidateTitle of titles) {
    const exactUrl = new URL(`${LRCLIB_API}/get`);
    exactUrl.searchParams.set('track_name', candidateTitle);
    exactUrl.searchParams.set('artist_name', artist.trim());
    if (duration > 0 && duration <= 3600) exactUrl.searchParams.set('duration', String(Math.round(duration)));
    try {
      const exact = await requestJson(exactUrl);
      if (exact && !Array.isArray(exact) && recordMatches(exact, title, artist, duration)) return exact;
    } catch (error: any) {
      console.warn('LRCLIB exact lookup failed:', error?.message || error);
    }
  }

  const searchUrl = new URL(`${LRCLIB_API}/search`);
  searchUrl.searchParams.set('track_name', cleanTrackTitle(title, artist));
  searchUrl.searchParams.set('artist_name', artist.trim());
  try {
    const search = await requestJson(searchUrl);
    if (!Array.isArray(search)) return null;
    return search
      .filter((record) => recordMatches(record, title, artist, duration))
      .sort((a, b) => {
        const aScore = overlap(a.trackName || '', title) + overlap(a.artistName || '', artist);
        const bScore = overlap(b.trackName || '', title) + overlap(b.artistName || '', artist);
        return bScore - aScore;
      })[0] || null;
  } catch (error: any) {
    console.warn('LRCLIB search failed:', error?.message || error);
    return null;
  }
}

export async function getLyrics(
  _id: string,
  songName = '',
  artistName = '',
  duration = 0,
): Promise<LyricsData | null> {
  const title = songName.trim();
  const artist = artistName.trim();
  if (!title || !artist) return null;

  const record = await findRecord(title, artist, Number(duration) || 0);
  if (!record || record.instrumental) return null;

  const syncedLyrics = parseSyncedLyrics(record.syncedLyrics);
  const plainLyrics = String(record.plainLyrics || '').trim();
  const lyrics = plainLyrics || syncedLyrics.map((line) => line.text).join('\n');
  if (!lyrics && syncedLyrics.length === 0) return null;

  return {
    lyrics,
    syncedLyrics: syncedLyrics.length > 0 ? syncedLyrics : undefined,
    snippet: lyrics.slice(0, 240),
    copyright: 'Lyrics provided by LRCLIB',
  };
}
