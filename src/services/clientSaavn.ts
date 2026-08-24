import CryptoJS from 'crypto-js';
import { Song, Playlist, Album, Artist, LyricsData, SpotifyPreset, AIDJMix } from '../types';

const DEV_ANAND_API_KEY = 'ak_live_21Iha3Klnc6nlFCqN_-XwxWt_wcYFX271YK1clZ9fmE';
const FALLEN_API_KEY = '973f0a_tVVZ2B-VEM9S_Nj51YbMtBtPalBVcv4Q';
const FALLEN_BASE_URL = 'https://api.onegrab.fun';
const WORKER_BASE = 'https://api.dev-anand.workers.dev/api';
const BASE_JIO_URL = 'https://www.jiosaavn.com/api.php';
const DES_KEY = CryptoJS.enc.Utf8.parse('38346591');

export function decryptMediaUrl(encryptedUrl: string): string {
  if (!encryptedUrl) return '';
  try {
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl),
    });
    const decrypted = CryptoJS.DES.decrypt(cipherParams, DES_KEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
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

export function formatSongPayload(item: any): Song {
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
  const playUrl = downloadUrls.find((d) => d.quality === '320kbps')?.url || decryptedUrl || '';

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

export function formatWorkerSongPayload(item: any): Song {
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

async function clientFetchWorker(endpoint: string): Promise<any> {
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
  const url = `${WORKER_BASE}${cleanEndpoint}`;
  const res = await fetch(url, {
    headers: {
      'x-api-key': DEV_ANAND_API_KEY,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Worker status ${res.status}`);
  return await res.json();
}

async function clientFetchJio(params: Record<string, string | number>): Promise<any> {
  const query = new URLSearchParams({
    _format: 'json',
    _marker: '0',
    api_version: '4',
    ctx: 'web6dot0',
    ...params,
  });

  const url = `${BASE_JIO_URL}?${query.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Jio status ${response.status}`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonStart = text.indexOf('{');
    const jsonArrayStart = text.indexOf('[');
    const start = jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart) ? jsonStart : jsonArrayStart;
    if (start !== -1) {
      return JSON.parse(text.slice(start));
    }
    throw new Error('Could not parse Jio response');
  }
}

export async function clientSearchFallen(query: string, limit = 15): Promise<Song[]> {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(`${FALLEN_BASE_URL}/api/search?query=${encodeURIComponent(query.trim())}&platform=jiosaavn&limit=${limit}`, {
      headers: {
        'X-API-Key': FALLEN_API_KEY,
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (json && Array.isArray(json.results)) {
      return json.results.map((item: any) => ({
        id: `fallen_jiosaavn_${item.id || encodeURIComponent(item.title).slice(0, 20)}`,
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
        label: 'Fallen Music',
        primaryArtists: sanitizeHtml(item.channel || 'Various Artists'),
        featuredArtists: '',
        singers: sanitizeHtml(item.channel || 'Various Artists'),
        language: 'all',
        hasLyrics: false,
        image: formatImageUrls(item.thumbnail),
        downloadUrl: [],
        playUrl: '',
        copyright: 'APmusic Fallen Fallback',
        url: item.url || '',
      }));
    }
    return [];
  } catch (_) {
    return [];
  }
}

export async function clientSearchSongs(query: string, page = 1, limit = 20): Promise<Song[]> {
  try {
    const workerRes = await clientFetchWorker(`/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (workerRes.success && workerRes.data?.results && workerRes.data.results.length > 0) {
      return workerRes.data.results.map((r: any) => formatWorkerSongPayload(r));
    }
  } catch (_) {}

  try {
    const data = await clientFetchJio({
      __call: 'search.getResults',
      q: query,
      p: page,
      n: limit,
    });
    const results = data.results || [];
    if (results.length > 0) {
      return results.map((r: any) => formatSongPayload(r));
    }
  } catch (_) {}

  // Fallback to Fallen API
  try {
    const fallbackResults = await clientSearchFallen(query, limit);
    if (fallbackResults.length > 0) {
      return fallbackResults;
    }
  } catch (_) {}

  return [];
}

export async function clientSearchAll(query: string): Promise<{
  songs: Song[];
  albums: Album[];
  playlists: Playlist[];
  artists: Artist[];
}> {
  const [songResults, workerResSettled, jioAutoSettled] = await Promise.allSettled([
    clientSearchSongs(query, 1, 15),
    clientFetchWorker(`/api/search?query=${encodeURIComponent(query)}`),
    clientFetchJio({ __call: 'autocomplete.get', query }),
  ]);

  const fullSongs: Song[] = songResults.status === 'fulfilled' ? songResults.value : [];
  const workerData = workerResSettled.status === 'fulfilled' && workerResSettled.value?.success ? workerResSettled.value.data : null;
  const jioData = jioAutoSettled.status === 'fulfilled' ? jioAutoSettled.value : {};

  let albums: Album[] = [];
  if (workerData?.albums?.results) {
    albums = workerData.albums.results.map((a: any) => ({
      id: String(a.id),
      name: sanitizeHtml(a.name || a.title),
      primaryArtists: sanitizeHtml(a.artist || a.primaryArtists || ''),
      year: String(a.year || ''),
      image: Array.isArray(a.image) ? a.image : formatImageUrls(a.image),
      url: a.url || '',
      type: 'album',
      songCount: Number(a.songCount || 0),
      releaseDate: '',
      songs: [],
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
      songCount: 0,
      releaseDate: '',
      songs: [],
    }));
  }

  let playlists: Playlist[] = [];
  if (workerData?.playlists?.results) {
    playlists = workerData.playlists.results.map((p: any) => ({
      id: String(p.id),
      name: sanitizeHtml(p.name || p.title),
      description: sanitizeHtml(p.description || ''),
      songCount: Number(p.songCount || 0),
      image: Array.isArray(p.image) ? p.image : formatImageUrls(p.image),
      url: p.url || '',
      type: 'playlist',
      songs: [],
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
      songs: [],
    }));
  }

  let artists: Artist[] = [];
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

export async function clientGetHomeModules(languages = 'hindi,english,punjabi'): Promise<{
  trending: Song[];
  charts: Playlist[];
  playlists: Playlist[];
  newAlbums: Album[];
  topArtists: Artist[];
}> {
  try {
    const [trendingRes, chartsRes, featuredRes] = await Promise.allSettled([
      clientFetchJio({ __call: 'content.getTrending', languages }),
      clientFetchJio({ __call: 'content.getCharts', languages }),
      clientFetchJio({ __call: 'content.getFeaturedPlaylists', fetch_from_serialized_files: 'true', p: 1, n: 15, languages }),
    ]);

    const trendingRaw = trendingRes.status === 'fulfilled' ? trendingRes.value : [];
    const chartsRaw = chartsRes.status === 'fulfilled' ? chartsRes.value : [];
    const featuredRaw = featuredRes.status === 'fulfilled' ? featuredRes.value : [];

    const trendingSongs: Song[] = [];
    const rawTrendingList = Array.isArray(trendingRaw) ? trendingRaw : trendingRaw.results || [];
    for (const item of rawTrendingList) {
      if (item.type === 'song' || item.more_info?.encrypted_media_url) {
        trendingSongs.push(formatSongPayload(item));
      }
    }

    const charts: Playlist[] = (Array.isArray(chartsRaw) ? chartsRaw : []).map((c: any) => ({
      id: String(c.id || c.listid || ''),
      name: sanitizeHtml(c.title || c.listname || 'Top Chart'),
      description: 'Official Trending Audio Charts',
      songCount: Number(c.count || c.numsongs || 50),
      image: formatImageUrls(c.image),
      url: c.perma_url || '',
      type: 'chart',
      songs: [],
    }));

    const playlists: Playlist[] = (featuredRaw.data || featuredRaw.results || (Array.isArray(featuredRaw) ? featuredRaw : [])).map((p: any) => ({
      id: String(p.id || p.listid || ''),
      name: sanitizeHtml(p.title || p.listname || 'Playlist'),
      description: sanitizeHtml(p.description || p.header_desc || ''),
      songCount: Number(p.count || p.numsongs || 0),
      image: formatImageUrls(p.image),
      url: p.perma_url || '',
      type: 'playlist',
      songs: [],
    }));

    const curatedArtists: Artist[] = [
      { id: '459320', name: 'Arijit Singh', role: 'Singer & Composer', image: formatImageUrls('https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg'), type: 'artist' },
      { id: '1129408', name: 'Shreya Ghoshal', role: 'Playback Singer', image: formatImageUrls('https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg'), type: 'artist' },
      { id: '456863', name: 'Diljit Dosanjh', role: 'Artist & Actor', image: formatImageUrls('https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg'), type: 'artist' },
      { id: '485956', name: 'Sidhu Moose Wala', role: 'Legendary Artist', image: formatImageUrls('https://c.saavncdn.com/artists/Sidhu_Moose_Wala_500x500.jpg'), type: 'artist' },
      { id: '455130', name: 'A.R. Rahman', role: 'Composer & Producer', image: formatImageUrls('https://c.saavncdn.com/artists/A_R_Rahman_500x500.jpg'), type: 'artist' },
      { id: '455782', name: 'Taylor Swift', role: 'Pop Icon', image: formatImageUrls('https://c.saavncdn.com/artists/Taylor_Swift_500x500.jpg'), type: 'artist' },
      { id: '459633', name: 'The Weeknd', role: 'R&B / Pop Artist', image: formatImageUrls('https://c.saavncdn.com/artists/The_Weeknd_500x500.jpg'), type: 'artist' },
      { id: '455799', name: 'Drake', role: 'Hip-Hop Artist', image: formatImageUrls('https://c.saavncdn.com/artists/Drake_500x500.jpg'), type: 'artist' },
      { id: '456269', name: 'Badshah', role: 'Rapper & Producer', image: formatImageUrls('https://c.saavncdn.com/artists/Badshah_500x500.jpg'), type: 'artist' },
      { id: '456561', name: 'Karan Aujla', role: 'Punjabi Artist', image: formatImageUrls('https://c.saavncdn.com/artists/Karan_Aujla_500x500.jpg'), type: 'artist' },
    ];

    return {
      trending: trendingSongs.length > 0 ? trendingSongs : await clientSearchSongs('Top Bollywood Hits', 1, 15),
      charts,
      playlists,
      newAlbums: [],
      topArtists: curatedArtists,
    };
  } catch (_) {
    const fallbackSongs = await clientSearchSongs('Arijit Singh Hits', 1, 15);
    return {
      trending: fallbackSongs,
      charts: [],
      playlists: [],
      newAlbums: [],
      topArtists: [],
    };
  }
}

export async function clientGetSongDetails(id: string): Promise<Song | null> {
  try {
    const workerRes = await clientFetchWorker(`/api/songs/${id}`);
    if (workerRes.success && Array.isArray(workerRes.data) && workerRes.data.length > 0) {
      return formatWorkerSongPayload(workerRes.data[0]);
    }
  } catch (_) {}

  try {
    const data = await clientFetchJio({
      __call: 'song.getDetails',
      pids: id,
    });
    const songData = data[id] || (data.songs && data.songs[0]) || Object.values(data)[0];
    if (songData) {
      return formatSongPayload(songData);
    }
  } catch (_) {}

  return null;
}

export async function clientGetPlaylistDetails(id: string): Promise<Playlist | null> {
  try {
    const data = await clientFetchJio({
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
      type: 'playlist',
      songs,
    };
  } catch (_) {
    return null;
  }
}

export async function clientGetAlbumDetails(id: string): Promise<Album | null> {
  try {
    const workerRes = await clientFetchWorker(`/api/albums?id=${id}`);
    if (workerRes.success && workerRes.data) {
      const d = workerRes.data;
      const songs = (d.songs || []).map((s: any) => formatWorkerSongPayload(s));
      return {
        id: String(d.id || id),
        name: sanitizeHtml(d.name || d.title || 'Album'),
        year: String(d.year || ''),
        releaseDate: d.releaseDate || '',
        primaryArtists: sanitizeHtml(d.artists?.primary?.map((a: any) => a.name).join(', ') || d.primaryArtists || ''),
        songCount: Number(d.songCount || songs.length),
        image: Array.isArray(d.image) ? d.image : formatImageUrls(d.image),
        url: d.url || '',
        type: 'album',
        songs,
      };
    }
  } catch (_) {}

  try {
    const data = await clientFetchJio({
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
      type: 'album',
      songs,
    };
  } catch (_) {
    return null;
  }
}

export async function clientGetArtistDetails(id: string): Promise<Artist | null> {
  try {
    const workerRes = await clientFetchWorker(`/api/artists?id=${id}`);
    if (workerRes.success && workerRes.data) {
      const d = workerRes.data;
      const songs = (d.topSongs || []).map((s: any) => formatWorkerSongPayload(s));
      return {
        id: String(d.id || id),
        name: sanitizeHtml(d.name || 'Artist'),
        role: sanitizeHtml(d.dominantType || 'Music Artist'),
        image: Array.isArray(d.image) ? d.image : formatImageUrls(d.image),
        url: d.url || '',
        type: 'artist',
        bio: sanitizeHtml(d.bio?.[0]?.text || d.bio || ''),
        topSongs: songs,
      };
    }
  } catch (_) {}

  try {
    const [details, topSongsData] = await Promise.all([
      clientFetchJio({ __call: 'artist.getArtistPageDetails', artistId: id }),
      clientFetchJio({ __call: 'artist.getArtistTopSongs', artist_id: id, p: 1, n: 30 }),
    ]);

    const songs = (topSongsData.songs || topSongsData.results || []).map((s: any) => formatSongPayload(s));

    return {
      id: String(details.artistId || id),
      name: sanitizeHtml(details.name || 'Artist'),
      role: sanitizeHtml(details.dominantType || 'Music Artist'),
      image: formatImageUrls(details.image),
      url: details.urls?.overview || '',
      type: 'artist',
      bio: sanitizeHtml(details.bio || ''),
      topSongs: songs,
    };
  } catch (_) {
    return null;
  }
}

export function parseClientLrcLyrics(lrcText: string): Array<{ time: number; text: string }> {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const synced: Array<{ time: number; text: string }> = [];

  for (const line of lines) {
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

export async function clientGetLyrics(
  idOrLyricsId: string,
  songName?: string,
  artistName?: string
): Promise<LyricsData> {
  const cleanSongName = (songName || '').replace(/\(.*?\)|\[.*?\]/g, '').trim();
  const cleanArtist = (artistName || '').split(/[,&]/)[0].trim();

  // Try LRCLIB direct
  if (cleanSongName || cleanArtist) {
    try {
      const q = encodeURIComponent(`${cleanSongName} ${cleanArtist}`.trim());
      const res = await fetch(`https://lrclib.net/api/search?q=${q}`);
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const best = results[0];
          const synced = best.syncedLyrics ? parseClientLrcLyrics(best.syncedLyrics) : undefined;
          const plain = best.plainLyrics || (best.syncedLyrics ? best.syncedLyrics.replace(/\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]/g, '').trim() : '');
          if (plain || synced) {
            return {
              lyrics: plain || (synced ? synced.map((s) => s.text).join('\n') : ''),
              syncedLyrics: synced,
            };
          }
        }
      }
    } catch (_) {}
  }

  return { lyrics: 'Lyrics not available for this song.' };
}
