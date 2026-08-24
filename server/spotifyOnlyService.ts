import {
  getPrimaryCharts,
  getPrimaryTrackDetails,
  searchPrimarySongs,
  formatPrimaryTrackToSong,
  findPrimaryTrackByYoutubeId,
  type SpotifySong,
} from './primaryMusicService.js';

export type MusicSong = SpotifySong;

export async function searchSongs(query: string, page = 1, limit = 20): Promise<MusicSong[]> {
  void page;
  return searchPrimarySongs(query, limit);
}

export async function searchAll(query: string): Promise<{
  songs: MusicSong[];
  albums: any[];
  playlists: any[];
  artists: any[];
}> {
  return {
    songs: await searchPrimarySongs(query, 30),
    albums: [],
    playlists: [],
    artists: [],
  };
}

export async function getSongById(id: string, title = '', artist = ''): Promise<MusicSong | null> {
  const cleanId = id.replace(/^yt[_-]/, '').trim();
  const [track, metadata] = await Promise.all([
    getPrimaryTrackDetails(cleanId),
    findPrimaryTrackByYoutubeId(cleanId),
  ]);
  if (!track && !metadata) return null;

  const safeTitle = title.trim() && !/^yt[_-][\w-]{6,}$/i.test(title.trim())
    ? title.trim()
    : metadata?.title?.trim() || '';
  const safeArtist = artist.trim() && !/^yt[_-][\w-]{6,}$/i.test(artist.trim())
    ? artist.trim()
    : metadata?.artist?.trim() || '';
  if (!safeTitle || !safeArtist) return null;

  return formatPrimaryTrackToSong({
    id: `yt_${cleanId}`,
    title: safeTitle,
    artist: safeArtist,
    album: metadata?.album,
    duration: metadata?.duration,
    youtubeId: cleanId,
    coverUrl: track?.coverUrl || metadata?.coverUrl,
    streamUrl: track?.streamUrl || metadata?.streamUrl,
    embedUrl: track?.embedUrl || metadata?.embedUrl,
  });
}

export async function getSongSuggestions(_id: string, _limit = 15): Promise<MusicSong[]> {
  return [];
}

export async function getHomeModules(_language = 'hindi,english,punjabi'): Promise<{
  trending: MusicSong[];
  charts: any[];
  playlists: any[];
  newAlbums: any[];
  topArtists: any[];
}> {
  const trending = await getPrimaryCharts('trending');
  return {
    trending: trending.songs,
    charts: [],
    playlists: [],
    newAlbums: [],
    topArtists: [],
  };
}

export async function getPlaylistDetails(_id: string): Promise<any | null> {
  return null;
}

export async function getAlbumDetails(_id: string): Promise<any | null> {
  return null;
}

export async function getArtistDetails(_id: string): Promise<any | null> {
  return null;
}

