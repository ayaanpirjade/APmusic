import CryptoJS from 'crypto-js';
import { searchFallenFallbackSongs, resolveFallenTrack, getFallenTrackDetails } from './fallenService.js';

const DEV_ANAND_KEY = process.env.DEV_ANAND_API_KEY || 'ak_live_21Iha3Klnc6nlFCqN_-XwxWt_wcYFX271YK1clZ9fmE';
const DEV_ANAND_BASE = 'https://api.dev-anand.workers.dev';

export interface SaavnSong {
  id: string;
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
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
}

export interface SaavnAlbum {
  id: string;
  name: string;
  year: string;
  releaseDate: string;
  primaryArtists: string;
  songCount: number;
  image: Array<{ quality: string; url: string }>;
  url: string;
  songs: SaavnSong[];
}

export interface SaavnPlaylist {
  id: string;
  name: string;
  description: string;
  songCount: number;
  image: Array<{ quality: string; url: string }>;
  url: string;
  songs: SaavnSong[];
}

export interface SaavnArtist {
  id: string;
  name: string;
  role: string;
  image: Array<{ quality: string; url: string }>;
  url: string;
  topSongs?: SaavnSong[];
  topAlbums?: any[];
  singles?: SaavnSong[];
  bio?: string;
}

const DEV_ANAND_API_KEY = process.env.DEV_ANAND_API_KEY || 'ak_live_21Iha3Klnc6nlFCqN_-XwxWt_wcYFX271YK1clZ9fmE';
const WORKER_BASE = 'https://api.dev-anand.workers.dev/api';
const DES_KEY = CryptoJS.enc.Utf8.parse('38346591');

export function decryptMediaUrl(encryptedUrl: string): string {
  if (!encryptedUrl) return '';
  try {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(
      cipherParams,
      DES_KEY,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('DES decryption error:', err);
    return '';
  }
}

export function formatImageUrls(url: string | undefined): Array<{ quality: string; url: string }> {
  if (!url) {
    const fallback = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
    return [
      { quality: '50x50', url: fallback },
      { quality: '150x150', url: fallback },
      { quality: '500x500', url: fallback },
    ];
  }
  const cleanUrl = url.replace('http:', 'https:');
  const base = cleanUrl.replace(/_\d+x\d+\.(jpg|png|jpeg)/i, '');
  const ext = (cleanUrl.match(/\.(jpg|png|jpeg)$/i) || ['.jpg'])[0];

  return [
    { quality: '50x50', url: cleanUrl.includes('50x50') ? cleanUrl : `${base}_50x50${ext}` },
    { quality: '150x150', url: cleanUrl.includes('150x150') ? cleanUrl : `${base}_150x150${ext}` },
    { quality: '500x500', url: cleanUrl.includes('500x500') ? cleanUrl : `${base}_500x500${ext}` },
  ];
}

export function formatDownloadUrls(decryptedUrl: string): Array<{ quality: string; url: string }> {
  if (!decryptedUrl) return [];
  const base = decryptedUrl.replace(/_(96|160|320)\.(mp4|m4a|mp3)/i, '');
  const ext = (decryptedUrl.match(/\.(mp4|m4a|mp3)$/i) || ['.mp4'])[0];

  return [
    { quality: '48kbps', url: `${base}_48${ext}` },
    { quality: '96kbps', url: `${base}_96${ext}` },
    { quality: '160kbps', url: `${base}_160${ext}` },
    { quality: '320kbps', url: `${base}_320${ext}` },
  ];
}

export function sanitizeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function formatSongPayload(item: any): SaavnSong {
  const moreInfo = item.more_info || {};
  let decryptedUrl = '';

  if (moreInfo.encrypted_media_url) {
    decryptedUrl = decryptMediaUrl(moreInfo.encrypted_media_url);
  } else if (item.downloadUrl && Array.isArray(item.downloadUrl) && item.downloadUrl.length > 0) {
    const highest = item.downloadUrl[item.downloadUrl.length - 1];
    decryptedUrl = highest.url;
  } else if (typeof item.media_preview_url === 'string') {
    decryptedUrl = item.media_preview_url.replace('_preview.mp4', '_320.mp4');
  }

  const downloadUrls = formatDownloadUrls(decryptedUrl);
  // Pick highest quality (320kbps if available, else decrypted)
  const playUrl = downloadUrls.find(d => d.quality === '320kbps')?.url || decryptedUrl || '';

  const artistMap = moreInfo.artistMap || {};
  const primaryArtists = sanitizeHtml(
    moreInfo.music ||
    (artistMap.primary_artists && artistMap.primary_artists.map((a: any) => a.name).join(', ')) ||
    item.primaryArtists ||
    moreInfo.singers ||
    item.singers ||
    'Various Artists'
  );

  return {
    id: String(item.id || item.song_id || ''),
    name: sanitizeHtml(item.title || item.name || item.song || 'Untitled Track'),
    type: item.type || 'song',
    album: {
      id: String(moreInfo.album_id || item.album_id || item.album?.id || ''),
      name: sanitizeHtml(moreInfo.album || item.album || item.album?.name || item.title || 'Single'),
      url: moreInfo.album_url || item.album?.url || '',
    },
    year: String(item.year || moreInfo.year || new Date().getFullYear()),
    releaseDate: item.release_date || moreInfo.release_date || '',
    duration: Number(item.duration || moreInfo.duration || 0),
    label: sanitizeHtml(moreInfo.label || item.label || ''),
    primaryArtists,
    featuredArtists: sanitizeHtml(moreInfo.featured_artists || item.featuredArtists || ''),
    singers: sanitizeHtml(moreInfo.singers || item.singers || primaryArtists),
    language: item.language || moreInfo.language || 'hindi',
    hasLyrics: Boolean(moreInfo.has_lyrics === 'true' || moreInfo.has_lyrics === true || item.hasLyrics),
    lyricsId: moreInfo.lyrics_id || item.lyricsId,
    image: Array.isArray(item.image) ? item.image : formatImageUrls(item.image || item.image_url),
    downloadUrl: downloadUrls,
    playUrl,
    copyright: sanitizeHtml(moreInfo.copyright_text || item.copyright || ''),
    url: item.perma_url || item.url || '',
  };
}

export function formatWorkerSongPayload(item: any): SaavnSong {
  let downloadUrls = Array.isArray(item.downloadUrl) ? item.downloadUrl : [];
  let playUrl = '';
  if (downloadUrls.length > 0) {
    const highest = downloadUrls.find((d: any) => d.quality === '320kbps') || downloadUrls[downloadUrls.length - 1];
    playUrl = highest?.url || '';
  }

  const primaryArtists = sanitizeHtml(
    item.artists?.primary?.map((a: any) => a.name).join(', ') ||
    item.primaryArtists ||
    item.singers ||
    'Various Artists'
  );

  return {
    id: String(item.id || ''),
    name: sanitizeHtml(item.name || item.title || 'Untitled Track'),
    type: item.type || 'song',
    album: {
      id: String(item.album?.id || ''),
      name: sanitizeHtml(item.album?.name || 'Single'),
      url: item.album?.url || '',
    },
    year: String(item.year || new Date().getFullYear()),
    releaseDate: item.releaseDate || '',
    duration: Number(item.duration || 0),
    label: sanitizeHtml(item.label || ''),
    primaryArtists,
    featuredArtists: sanitizeHtml(item.artists?.featured?.map((a: any) => a.name).join(', ') || ''),
    singers: sanitizeHtml(item.singers || primaryArtists),
    language: item.language || 'hindi',
    hasLyrics: Boolean(item.hasLyrics),
    lyricsId: item.lyricsId,
    image: Array.isArray(item.image) ? item.image : formatImageUrls(item.image),
    downloadUrl: downloadUrls,
    playUrl,
    copyright: sanitizeHtml(item.copyright || ''),
    url: item.url || '',
  };
}

const BASE_JIO_URL = 'https://www.jiosaavn.com/api.php';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Cookie': 'L=hindi%2Cenglish%2Cpunjabi;',
  'Accept': 'application/json, text/plain, */*',
};

async function fetchWorker(endpoint: string): Promise<any> {
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
  const url = `${WORKER_BASE}${cleanEndpoint}`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': DEV_ANAND_API_KEY,
      'Accept': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Worker fetch failed: ${res.status}`);
  }
  return await res.json();
}

async function fetchJio(params: Record<string, string | number>): Promise<any> {
  const query = new URLSearchParams({
    _format: 'json',
    _marker: '0',
    api_version: '4',
    ctx: 'web6dot0',
    ...params,
  });

  const url = `${BASE_JIO_URL}?${query.toString()}`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) {
    throw new Error(`JioSaavn fetch failed with status ${response.status}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Sometimes response contains non-json leading chars
    const jsonStart = text.indexOf('{');
    const jsonArrayStart = text.indexOf('[');
    const start = jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart) ? jsonStart : jsonArrayStart;
    if (start !== -1) {
      return JSON.parse(text.slice(start));
    }
    throw new Error('Failed to parse JioSaavn response');
  }
}

export async function searchSongs(query: string, page = 1, limit = 20): Promise<SaavnSong[]> {
  let primaryResults: SaavnSong[] = [];

  // Try Dev Anand Worker API first
  try {
    const encoded = encodeURIComponent(query);
    const workerRes = await fetchWorker(`/api/search/songs?query=${encoded}&page=${page}&limit=${limit}`);
    if (workerRes.success && workerRes.data?.results && workerRes.data.results.length > 0) {
      primaryResults = workerRes.data.results.map((r: any) => formatWorkerSongPayload(r));
    }
  } catch (err) {
    console.warn('Worker searchSongs error, falling back to JioSaavn:', err);
  }

  // Fallback to JioSaavn if worker had no results
  if (primaryResults.length === 0) {
    try {
      const data = await fetchJio({
        __call: 'search.getResults',
        q: query,
        p: page,
        n: limit,
      });

      const results = data.results || [];
      if (results.length > 0) {
        primaryResults = results.map((r: any) => formatSongPayload(r));
      }
    } catch (err) {
      console.warn('JioSaavn searchSongs error:', err);
    }
  }

  // If both primary methods returned 0 results, trigger Fallen API Fallback
  if (primaryResults.length === 0) {
    try {
      console.log(`[Fallen API Fallback] Searching fallback provider for query: "${query}"`);
      const fallenResults = await searchFallenFallbackSongs(query, limit);
      if (fallenResults.length > 0) {
        return fallenResults;
      }
    } catch (fallbackErr) {
      console.error('Fallen API searchSongs fallback error:', fallbackErr);
    }
  }

  return primaryResults;
}

export async function searchAll(query: string): Promise<{
  songs: SaavnSong[];
  albums: any[];
  playlists: any[];
  artists: any[];
}> {
  const [songResults, workerResSettled, jioAutoSettled] = await Promise.allSettled([
    searchSongs(query, 1, 15),
    (async () => {
      const encoded = encodeURIComponent(query);
      return await fetchWorker(`/api/search?query=${encoded}`);
    })(),
    fetchJio({
      __call: 'autocomplete.get',
      query: query,
    }),
  ]);

  const fullSongs: SaavnSong[] = songResults.status === 'fulfilled' ? songResults.value : [];
  const workerData = workerResSettled.status === 'fulfilled' && workerResSettled.value?.success ? workerResSettled.value.data : null;
  const jioData = jioAutoSettled.status === 'fulfilled' ? jioAutoSettled.value : {};

  // Extract albums
  let albums: any[] = [];
  if (workerData?.albums?.results) {
    albums = workerData.albums.results.map((a: any) => ({
      id: String(a.id),
      name: sanitizeHtml(a.name || a.title),
      primaryArtists: sanitizeHtml(a.artist || a.primaryArtists || ''),
      year: String(a.year || ''),
      image: Array.isArray(a.image) ? a.image : formatImageUrls(a.image),
      url: a.url || '',
      type: 'album',
    }));
  } else if (jioData.albums?.data) {
    albums = jioData.albums.data.map((a: any) => ({
      id: String(a.id),
      name: sanitizeHtml(a.title),
      primaryArtists: sanitizeHtml(a.music || a.description || ''),
      year: a.year || '',
      image: formatImageUrls(a.image),
      url: a.url || '',
      type: 'album',
    }));
  }

  // Extract playlists
  let playlists: any[] = [];
  if (workerData?.playlists?.results) {
    playlists = workerData.playlists.results.map((p: any) => ({
      id: String(p.id),
      name: sanitizeHtml(p.name || p.title),
      description: sanitizeHtml(p.description || ''),
      songCount: Number(p.songCount || 0),
      image: Array.isArray(p.image) ? p.image : formatImageUrls(p.image),
      url: p.url || '',
      type: 'playlist',
    }));
  } else if (jioData.playlists?.data) {
    playlists = jioData.playlists.data.map((p: any) => ({
      id: String(p.id),
      name: sanitizeHtml(p.title),
      description: sanitizeHtml(p.description || ''),
      songCount: Number(p.numsongs || 0),
      image: formatImageUrls(p.image),
      url: p.url || '',
      type: 'playlist',
    }));
  }

  // Extract artists
  let artists: any[] = [];
  if (workerData?.artists?.results) {
    artists = workerData.artists.results.map((art: any) => ({
      id: String(art.id),
      name: sanitizeHtml(art.name || art.title),
      role: sanitizeHtml(art.role || 'Artist'),
      image: Array.isArray(art.image) ? art.image : formatImageUrls(art.image),
      url: art.url || '',
      type: 'artist',
    }));
  } else if (jioData.artists?.data) {
    artists = jioData.artists.data.map((art: any) => ({
      id: String(art.id),
      name: sanitizeHtml(art.title),
      role: sanitizeHtml(art.description || 'Artist'),
      image: formatImageUrls(art.image),
      url: art.url || '',
      type: 'artist',
    }));
  }

  return { songs: fullSongs, albums, playlists, artists };
}

export async function getSongById(id: string): Promise<SaavnSong | null> {
  if (!id) return null;

  // If this is a YouTube track from the Primary API
  if (id.startsWith('yt_') || id.startsWith('yt-')) {
    try {
      const cleanQuery = id.replace(/^yt_|^yt-/, '');
      const resolved = await resolveFallenTrack(cleanQuery);
      if (resolved) return resolved;
    } catch (_) {}
    return null;
  }

  // If this is a fallen fallback song id
  if (id.startsWith('fallen_')) {
    try {
      const cleanQuery = id.replace(/^fallen_[a-z]+_/i, '').replace(/_/g, ' ');
      const resolved = await resolveFallenTrack(cleanQuery);
      if (resolved) return resolved;
    } catch (err) {
      console.warn('getSongById fallen prefix resolution error:', err);
    }
    return null;
  }

  // Only query worker/Jio if id looks like a standard Saavn ID (alphanumeric, e.g. 5-15 chars, not containing special URL tokens)
  const isLikelySaavnId = /^[a-zA-Z0-9_-]{5,24}$/.test(id) && !id.includes(' ');

  if (isLikelySaavnId) {
    // Try Dev Anand Worker API first
    try {
      const workerRes = await fetchWorker(`/api/songs/${id}`);
      if (workerRes.success && Array.isArray(workerRes.data) && workerRes.data.length > 0) {
        const song = formatWorkerSongPayload(workerRes.data[0]);
        if (song.playUrl || (song.downloadUrl && song.downloadUrl.length > 0)) {
          return song;
        }
      }
    } catch (_) {
      // Worker didn't have track, proceed to JioSaavn
    }

    // Fallback to JioSaavn
    try {
      const data = await fetchJio({
        __call: 'song.getDetails',
        pids: id,
      });

      const songData = data[id] || (data.songs && data.songs[0]) || Object.values(data)[0];
      if (songData) {
        const formatted = formatSongPayload(songData);
        if (formatted.playUrl || (formatted.downloadUrl && formatted.downloadUrl.length > 0)) {
          return formatted;
        }
      }
    } catch (err) {
      console.error(`getSongById(${id}) error:`, err);
    }
  }

  // Fallback to search by id/title
  try {
    const searchRes = await searchSongs(id, 1, 1);
    if (searchRes.length > 0) {
      return searchRes[0];
    }
  } catch (_) {}

  // Final fallback to Fallen API track resolver
  try {
    const fallenResolved = await resolveFallenTrack(id);
    if (fallenResolved) return fallenResolved;
  } catch (err) {
    console.error('getSongById final fallen fallback error:', err);
  }

  return null;
}

export async function getSongSuggestions(id: string, limit = 15): Promise<SaavnSong[]> {
  if (!id) return [];

  // If this is a YouTube ID or custom ID, JioSaavn recommendations won't match PID directly
  if (id.startsWith('yt_') || id.startsWith('yt-') || id.startsWith('fallen_')) {
    return [];
  }

  try {
    const data = await fetchJio({
      __call: 'reco.getrecos',
      pid: id,
      n: limit,
    });

    const items = Array.isArray(data) ? data : data.results || [];
    return items.map((r: any) => formatSongPayload(r));
  } catch (err) {
    return [];
  }
}

export async function getHomeModules(languages = 'hindi,english,punjabi'): Promise<{
  trending: SaavnSong[];
  charts: any[];
  playlists: any[];
  newAlbums: any[];
  topArtists: any[];
}> {
  try {
    const [trendingRes, chartsRes, featuredRes] = await Promise.allSettled([
      fetchJio({ __call: 'content.getTrending', languages }),
      fetchJio({ __call: 'content.getCharts', languages }),
      fetchJio({ __call: 'content.getFeaturedPlaylists', fetch_from_serialized_files: 'true', p: 1, n: 15, languages }),
    ]);

    const trendingRaw = trendingRes.status === 'fulfilled' ? trendingRes.value : [];
    const chartsRaw = chartsRes.status === 'fulfilled' ? chartsRes.value : [];
    const featuredRaw = featuredRes.status === 'fulfilled' ? featuredRes.value : [];

    // Filter trending songs
    const trendingSongs: SaavnSong[] = [];
    const rawTrendingList = Array.isArray(trendingRaw) ? trendingRaw : trendingRaw.results || [];
    for (const item of rawTrendingList) {
      if (item.type === 'song' || item.more_info?.encrypted_media_url) {
        trendingSongs.push(formatSongPayload(item));
      }
    }

    const charts = (Array.isArray(chartsRaw) ? chartsRaw : []).map((c: any) => ({
      id: String(c.id || c.listid || ''),
      name: sanitizeHtml(c.title || c.listname || 'Top Chart'),
      songCount: Number(c.count || c.numsongs || 50),
      image: formatImageUrls(c.image),
      url: c.perma_url || '',
      type: 'chart',
    }));

    const playlists = (featuredRaw.data || featuredRaw.results || (Array.isArray(featuredRaw) ? featuredRaw : [])).map((p: any) => ({
      id: String(p.id || p.listid || ''),
      name: sanitizeHtml(p.title || p.listname || 'Playlist'),
      description: sanitizeHtml(p.description || p.header_desc || ''),
      songCount: Number(p.count || p.numsongs || 0),
      image: formatImageUrls(p.image),
      url: p.perma_url || '',
      type: 'playlist',
    }));

    const curatedArtists = [
      { id: '459320', name: 'Arijit Singh', role: 'Singer & Composer', image: formatImageUrls('https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg') },
      { id: '1129408', name: 'Shreya Ghoshal', role: 'Playback Singer', image: formatImageUrls('https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg') },
      { id: '456863', name: 'Diljit Dosanjh', role: 'Artist & Actor', image: formatImageUrls('https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg') },
      { id: '485956', name: 'Sidhu Moose Wala', role: 'Legendary Artist', image: formatImageUrls('https://c.saavncdn.com/artists/Sidhu_Moose_Wala_500x500.jpg') },
      { id: '455130', name: 'A.R. Rahman', role: 'Composer & Producer', image: formatImageUrls('https://c.saavncdn.com/artists/A_R_Rahman_500x500.jpg') },
      { id: '455782', name: 'Taylor Swift', role: 'Pop Icon', image: formatImageUrls('https://c.saavncdn.com/artists/Taylor_Swift_500x500.jpg') },
      { id: '459633', name: 'The Weeknd', role: 'R&B / Pop Artist', image: formatImageUrls('https://c.saavncdn.com/artists/The_Weeknd_500x500.jpg') },
      { id: '455799', name: 'Drake', role: 'Hip-Hop Artist', image: formatImageUrls('https://c.saavncdn.com/artists/Drake_500x500.jpg') },
      { id: '456269', name: 'Badshah', role: 'Rapper & Producer', image: formatImageUrls('https://c.saavncdn.com/artists/Badshah_500x500.jpg') },
      { id: '456561', name: 'Karan Aujla', role: 'Punjabi Artist', image: formatImageUrls('https://c.saavncdn.com/artists/Karan_Aujla_500x500.jpg') },
    ];

    return {
      trending: trendingSongs.length > 0 ? trendingSongs : await searchSongs('Top Trending Bollywood Hits', 1, 15),
      charts,
      playlists,
      newAlbums: [],
      topArtists: curatedArtists,
    };
  } catch (err) {
    console.error('getHomeModules error:', err);
    const fallbackSongs = await searchSongs('Arijit Singh Hits', 1, 15);
    return {
      trending: fallbackSongs,
      charts: [],
      playlists: [],
      newAlbums: [],
      topArtists: [],
    };
  }
}

export async function getPlaylistDetails(id: string): Promise<SaavnPlaylist | null> {
  try {
    const data = await fetchJio({
      __call: 'playlist.getDetails',
      listid: id,
      p: 1,
      n: 50,
    });

    const songs = (data.songs || data.list || []).map((s: any) => formatSongPayload(s));

    return {
      id: String(data.id || data.listid || id),
      name: sanitizeHtml(data.title || data.listname || 'Featured Playlist'),
      description: sanitizeHtml(data.description || data.header_desc || ''),
      songCount: Number(data.numsongs || songs.length),
      image: formatImageUrls(data.image),
      url: data.perma_url || '',
      songs,
    };
  } catch (err) {
    console.error(`getPlaylistDetails(${id}) error:`, err);
    return null;
  }
}

export async function getAlbumDetails(id: string): Promise<SaavnAlbum | null> {
  // Try Dev Anand Worker API first
  try {
    const workerRes = await fetchWorker(`/api/albums?id=${id}`);
    if (workerRes.success && workerRes.data) {
      const d = workerRes.data;
      const songs = (d.songs || []).map((s: any) => formatWorkerSongPayload(s));
      return {
        id: String(d.id || id),
        name: sanitizeHtml(d.name || d.title || 'Album'),
        year: String(d.year || ''),
        releaseDate: d.releaseDate || '',
        primaryArtists: sanitizeHtml(
          d.artists?.primary?.map((a: any) => a.name).join(', ') ||
          d.primaryArtists ||
          ''
        ),
        songCount: Number(d.songCount || songs.length),
        image: Array.isArray(d.image) ? d.image : formatImageUrls(d.image),
        url: d.url || '',
        songs,
      };
    }
  } catch (err) {
    console.warn(`Worker getAlbumDetails(${id}) error:`, err);
  }

  // Fallback to JioSaavn
  try {
    const data = await fetchJio({
      __call: 'content.getAlbumDetails',
      albumid: id,
    });

    const songs = (data.songs || data.list || []).map((s: any) => formatSongPayload(s));

    return {
      id: String(data.id || data.albumid || id),
      name: sanitizeHtml(data.title || data.name || 'Album'),
      year: String(data.year || ''),
      releaseDate: data.release_date || '',
      primaryArtists: sanitizeHtml(data.primary_artists || data.music || ''),
      songCount: Number(data.numsongs || songs.length),
      image: formatImageUrls(data.image),
      url: data.perma_url || '',
      songs,
    };
  } catch (err) {
    console.error(`getAlbumDetails(${id}) error:`, err);
    return null;
  }
}

export async function getArtistDetails(id: string): Promise<SaavnArtist | null> {
  // Try Dev Anand Worker API first
  try {
    const workerRes = await fetchWorker(`/api/artists?id=${id}`);
    if (workerRes.success && workerRes.data) {
      const d = workerRes.data;
      const songs = (d.topSongs || []).map((s: any) => formatWorkerSongPayload(s));
      return {
        id: String(d.id || id),
        name: sanitizeHtml(d.name || 'Artist'),
        role: sanitizeHtml(d.dominantType || 'Music Artist'),
        image: Array.isArray(d.image) ? d.image : formatImageUrls(d.image),
        url: d.url || '',
        bio: sanitizeHtml(d.bio?.[0]?.text || d.bio || ''),
        topSongs: songs,
      };
    }
  } catch (err) {
    console.warn(`Worker getArtistDetails(${id}) error:`, err);
  }

  // Fallback to JioSaavn
  try {
    const [details, topSongsData] = await Promise.all([
      fetchJio({
        __call: 'artist.getArtistPageDetails',
        artistId: id,
      }),
      fetchJio({
        __call: 'artist.getArtistTopSongs',
        artist_id: id,
        p: 1,
        n: 30,
      }),
    ]);

    const songs = (topSongsData.songs || topSongsData.results || []).map((s: any) => formatSongPayload(s));

    return {
      id: String(details.artistId || id),
      name: sanitizeHtml(details.name || 'Artist'),
      role: sanitizeHtml(details.dominantType || 'Music Artist'),
      image: formatImageUrls(details.image),
      url: details.urls?.overview || '',
      bio: sanitizeHtml(details.bio || ''),
      topSongs: songs,
    };
  } catch (err) {
    console.error(`getArtistDetails(${id}) error:`, err);
    return null;
  }
}

export function parseLrcLyrics(lrcText: string): Array<{ time: number; text: string }> {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const synced: Array<{ time: number; text: string }> = [];

  for (const line of lines) {
    // Matches [mm:ss.xx] or [mm:ss:xx] or [m:ss.xxx]
    const match = line.match(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const time = mins * 60 + secs + ms / 1000;
      const text = match[4].trim();
      if (text) {
        synced.push({ time, text });
      }
    }
  }

  return synced.sort((a, b) => a.time - b.time);
}

export async function getLyrics(
  idOrLyricsId: string,
  songName?: string,
  artistName?: string,
  duration?: number
): Promise<{
  lyrics: string;
  syncedLyrics?: Array<{ time: number; text: string }>;
  snippet?: string;
  copyright?: string;
}> {
  const cleanSongName = (songName || '').replace(/\(.*?\)|\[.*?\]/g, '').trim();
  const cleanArtist = (artistName || '').split(/[,&]/)[0].trim();

  // 1. Try JioSaavn Official Lyrics (if numeric ID or lyricsId provided)
  let jioPlainLyrics: string | null = null;
  let jioSnippet: string | undefined = undefined;
  let jioCopyright: string | undefined = undefined;

  if (idOrLyricsId && idOrLyricsId !== 'unknown') {
    try {
      let targetLyricsId = idOrLyricsId;

      // If it looks like a song ID (not purely numeric lyrics ID), fetch song details to get lyrics_id
      if (!/^\d+$/.test(idOrLyricsId)) {
        try {
          const song = await getSongById(idOrLyricsId);
          if (song && song.lyricsId) {
            targetLyricsId = song.lyricsId;
          }
        } catch (_) {}
      }

      const data = await fetchJio({
        __call: 'lyrics.getLyrics',
        lyrics_id: targetLyricsId,
      });

      const rawLyrics = data.lyrics || '';
      if (rawLyrics && rawLyrics.trim().length > 0) {
        const cleanLyrics = sanitizeHtml(rawLyrics.replace(/<br\s*[\/]?>/gi, '\n'));
        const synced = parseLrcLyrics(cleanLyrics);

        // If JioSaavn already had synced timestamps, return immediately
        if (synced.length > 0) {
          return {
            lyrics: cleanLyrics.replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim(),
            syncedLyrics: synced,
            snippet: data.snippet,
            copyright: data.copyright,
          };
        }

        jioPlainLyrics = cleanLyrics;
        jioSnippet = data.snippet;
        jioCopyright = data.copyright;
      }
    } catch (jioErr) {
      console.warn(`JioSaavn lyrics error for ${idOrLyricsId}:`, jioErr);
    }
  }

  // 2. Try LRCLIB for High Quality Synced & Plain Lyrics
  if (cleanSongName || cleanArtist) {
    try {
      const searchTerms = [
        `${cleanSongName} ${cleanArtist}`.trim(),
        cleanSongName,
      ];

      for (const term of searchTerms) {
        if (!term) continue;
        const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(term)}`, {
          headers: { 'User-Agent': 'APMUSICApp/2.0 (contact: app@apmusic.lossless)' },
        });

        if (res.ok) {
          const results = await res.json();
          if (Array.isArray(results) && results.length > 0) {
            const best = results[0];
            const synced = best.syncedLyrics ? parseLrcLyrics(best.syncedLyrics) : [];
            const plain = best.plainLyrics || (best.syncedLyrics ? best.syncedLyrics.replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim() : '');

            if (synced.length > 0) {
              return {
                lyrics: plain || synced.map((s) => s.text).join('\n'),
                syncedLyrics: synced,
                snippet: jioSnippet,
                copyright: jioCopyright,
              };
            }

            if (!jioPlainLyrics && plain) {
              jioPlainLyrics = plain;
            }
          }
        }
      }
    } catch (lrcErr) {
      console.warn('LRCLIB lyrics fetch error:', lrcErr);
    }
  }

  // If we collected plain lyrics from JioSaavn or LRCLIB, return them
  if (jioPlainLyrics) {
    return {
      lyrics: jioPlainLyrics,
      snippet: jioSnippet,
      copyright: jioCopyright,
    };
  }

  // 3. Fallback to Gemini AI Synced Lyrics Generator
  if (cleanSongName) {
    try {
      const { generateAILyrics } = await import('./aiService.js');
      const aiLyrics = await generateAILyrics(cleanSongName, cleanArtist, duration);
      if (aiLyrics && aiLyrics.lyrics) {
        return {
          lyrics: aiLyrics.lyrics,
          syncedLyrics: aiLyrics.syncedLyrics,
        };
      }
    } catch (aiErr) {
      console.warn('AI lyrics generation error:', aiErr);
    }
  }

  return { lyrics: 'Lyrics not available for this song.' };
}

