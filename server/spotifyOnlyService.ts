import {
  getPrimaryCharts,
  getPrimaryTrackDetails,
  searchPrimarySongs,
  formatPrimaryTrackToSong,
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

export async function getSongById(id: string): Promise<MusicSong | null> {
  const track = await getPrimaryTrackDetails(id);
  if (!track) return null;
  return formatPrimaryTrackToSong({
    id: track.id,
    title: id,
    artist: 'Spotify Primary Track',
    youtubeId: track.youtubeId,
    coverUrl: track.coverUrl,
    streamUrl: track.streamUrl,
    embedUrl: track.embedUrl,
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

export async function getLyrics(_id: string, _songName = '', _artistName = '', _duration = 0): Promise<null> {
  return null;
}
