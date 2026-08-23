export interface SongImage {
  quality: string;
  url: string;
}

export interface DownloadUrl {
  quality: '320kbps' | '160kbps' | '96kbps' | '48kbps' | string;
  url: string;
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  album: {
    id: string;
    name: string;
    url?: string;
  };
  year?: string;
  releaseDate?: string;
  duration: number; // in seconds
  label?: string;
  primaryArtists: string;
  featuredArtists?: string;
  singers?: string;
  language?: string;
  hasLyrics: boolean;
  lyricsId?: string;
  image: SongImage[];
  downloadUrl: DownloadUrl[];
  playUrl: string;
  copyright?: string;
  url?: string;
  isDownloaded?: boolean;
  localCachedBlob?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songCount: number;
  image: SongImage[];
  url?: string;
  type?: string;
  songs?: Song[];
  isCustom?: boolean;
  isSpotifyImport?: boolean;
  createdAt?: string;
  owner?: string;
}

export interface Album {
  id: string;
  name: string;
  year?: string;
  releaseDate?: string;
  primaryArtists: string;
  songCount: number;
  image: SongImage[];
  url?: string;
  type?: string;
  songs?: Song[];
}

export interface Artist {
  id: string;
  name: string;
  role?: string;
  image: SongImage[];
  url?: string;
  bio?: string;
  topSongs?: Song[];
  topAlbums?: Album[];
}

export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export interface LyricsData {
  lyrics: string;
  syncedLyrics?: SyncedLyricLine[];
  snippet?: string;
  copyright?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type AudioQualitySetting = '320kbps' | '160kbps' | '96kbps';

export interface EqualizerBands {
  bass: number;     // 60Hz (-12 to +12 dB)
  lowMid: number;   // 230Hz (-12 to +12 dB)
  mid: number;      // 910Hz (-12 to +12 dB)
  highMid: number;  // 4000Hz (-12 to +12 dB)
  treble: number;   // 14000Hz (-12 to +12 dB)
  bassBoost: number;// 0 to 100%
  spatialAudio: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGoogleAuth: boolean;
  plan: 'APMUSIC Hi-Res Lossless' | 'Premium Glass';
}

export interface SpotifyPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  coverImage: string;
}

export interface AIDJMix {
  vibeTitle: string;
  vibeDescription: string;
  tags: string[];
  djIntro: string;
  songs: Song[];
}

export type NavigationTab = 'home' | 'search' | 'library' | 'spotify' | 'equalizer' | 'settings';
