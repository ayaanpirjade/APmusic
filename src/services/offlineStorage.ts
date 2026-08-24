import { Song, LyricsData } from '../types';

export interface CachedTrackRecord {
  songId: string;
  song: Song;
  audioBlob: Blob;
  artworkDataUrl?: string;
  lyrics?: LyricsData;
  downloadedAt: number;
  sizeBytes: number;
  quality: string;
}

export interface StorageStats {
  totalBytes: number;
  formattedSize: string;
  songCount: number;
}

const DB_NAME = 'APMUSIC_Offline_DB';
const DB_VERSION = 1;
const STORE_NAME = 'cached_tracks';

// Memory cache for active Blob URLs to prevent memory leaks and redundant conversions
const activeBlobUrls = new Map<string, string>();

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'songId' });
        store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open APMUSIC IndexedDB'));
    };
  });
}

export const offlineStorage = {
  /**
   * Check if a specific song is cached in IndexedDB
   */
  async isSongCached(songId: string): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(songId);

        req.onsuccess = () => {
          resolve(!!req.result);
        };
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  /**
   * Save a song, its audio binary blob, album art, and lyrics into IndexedDB
   */
  async saveSongOffline(
    song: Song,
    quality = '320kbps',
    onProgress?: (progressPercent: number) => void
  ): Promise<CachedTrackRecord> {
    if (!song || !song.id) {
      throw new Error('Invalid song object provided');
    }

    onProgress?.(10);

    // 1. Determine best play URL
    let streamUrl = '';
    if (song.downloadUrl && song.downloadUrl.length > 0) {
      const match =
        song.downloadUrl.find((d) => d.quality?.includes(quality.replace('kbps', '')))?.url ||
        song.downloadUrl.find((d) => d.quality?.includes('320'))?.url ||
        song.downloadUrl.find((d) => d.quality?.includes('160'))?.url ||
        song.downloadUrl[0]?.url;
      streamUrl = match || '';
    }

    if (!streamUrl && song.playUrl) {
      streamUrl = song.playUrl;
    }

    if (!streamUrl) {
      throw new Error(`No audio stream URL available for "${song.name}"`);
    }

    onProgress?.(25);

    // 2. Fetch the audio blob via our backend proxy to avoid CORS issues
    const proxyAudioUrl = `/api/stream-proxy?url=${encodeURIComponent(streamUrl)}`;
    const audioRes = await fetch(proxyAudioUrl);
    if (!audioRes.ok) {
      throw new Error(`Failed to download audio track: HTTP ${audioRes.status}`);
    }

    const audioBlob = await audioRes.blob();
    onProgress?.(65);

    // 3. Fetch optional lyrics in background
    let lyrics: LyricsData | undefined;
    try {
      const lyricsRes = await fetch(
        `/api/lyrics/${encodeURIComponent(song.lyricsId || song.id)}?songName=${encodeURIComponent(
          song.name
        )}&artistName=${encodeURIComponent(song.primaryArtists)}&duration=${song.duration || 0}`
      );
      if (lyricsRes.ok) {
        const lyrData = await lyricsRes.json();
        if (lyrData.success && lyrData.data) {
          lyrics = lyrData.data;
        }
      }
    } catch {
      // Lyrics fetch failure is non-fatal for offline caching
    }

    onProgress?.(80);

    // 4. Fetch and store artwork dataUrl for offline visual fidelity
    let artworkDataUrl: string | undefined;
    const coverUrl = song.image?.[song.image.length - 1]?.url || song.image?.[0]?.url;
    if (coverUrl) {
      try {
        const artRes = await fetch(`/api/stream-proxy?url=${encodeURIComponent(coverUrl)}`);
        if (artRes.ok) {
          const artBlob = await artRes.blob();
          artworkDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(artBlob);
          });
        }
      } catch {
        // Non-fatal
      }
    }

    onProgress?.(90);

    // 5. Store record into IndexedDB
    const record: CachedTrackRecord = {
      songId: song.id,
      song: {
        ...song,
        isDownloaded: true,
      },
      audioBlob,
      artworkDataUrl,
      lyrics,
      downloadedAt: Date.now(),
      sizeBytes: audioBlob.size,
      quality,
    };

    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to save track in IndexedDB'));
    });

    onProgress?.(100);
    return record;
  },

  /**
   * Retrieve a cached track and create a playable Blob URL
   */
  async getCachedSong(
    songId: string
  ): Promise<{ song: Song; audioBlob: Blob; blobUrl: string; lyrics?: LyricsData } | null> {
    try {
      const db = await openDB();
      const record = await new Promise<CachedTrackRecord | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(songId);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });

      if (!record || !record.audioBlob) return null;

      // Reuse existing active blob URL or create a fresh one
      let blobUrl = activeBlobUrls.get(songId);
      if (!blobUrl) {
        blobUrl = URL.createObjectURL(record.audioBlob);
        activeBlobUrls.set(songId, blobUrl);
      }

      const songWithOfflineImages: Song = {
        ...record.song,
        isDownloaded: true,
        localCachedBlob: blobUrl,
      };

      if (record.artworkDataUrl && songWithOfflineImages.image) {
        songWithOfflineImages.image = songWithOfflineImages.image.map((img) => ({
          ...img,
          url: record.artworkDataUrl || img.url,
        }));
      }

      return {
        song: songWithOfflineImages,
        audioBlob: record.audioBlob,
        blobUrl,
        lyrics: record.lyrics,
      };
    } catch (err) {
      console.warn('Failed to retrieve song from IndexedDB:', err);
      return null;
    }
  },

  /**
   * Get all cached songs as a Song[] array for library playback
   */
  async getAllCachedSongs(): Promise<Song[]> {
    try {
      const db = await openDB();
      return new Promise<Song[]>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const records: CachedTrackRecord[] = req.result || [];
          const songs = records
            .sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0))
            .map((rec) => {
              let blobUrl = activeBlobUrls.get(rec.songId);
              if (!blobUrl && rec.audioBlob) {
                blobUrl = URL.createObjectURL(rec.audioBlob);
                activeBlobUrls.set(rec.songId, blobUrl);
              }
              const song = {
                ...rec.song,
                isDownloaded: true,
                localCachedBlob: blobUrl,
              };
              if (rec.artworkDataUrl && song.image) {
                song.image = song.image.map((img) => ({
                  ...img,
                  url: rec.artworkDataUrl || img.url,
                }));
              }
              return song;
            });
          resolve(songs);
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  /**
   * Get full records for storage management and stats
   */
  async getAllRecords(): Promise<CachedTrackRecord[]> {
    try {
      const db = await openDB();
      return new Promise<CachedTrackRecord[]>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const records: CachedTrackRecord[] = req.result || [];
          resolve(records.sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0)));
        };

        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  /**
   * Delete a cached song from IndexedDB
   */
  async deleteCachedSong(songId: string): Promise<void> {
    try {
      const oldUrl = activeBlobUrls.get(songId);
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
        activeBlobUrls.delete(songId);
      }

      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(songId);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Failed to delete track from IndexedDB'));
      });
    } catch (err) {
      console.warn('Error deleting cached song:', err);
    }
  },

  /**
   * Clear all cached tracks in IndexedDB
   */
  async clearAllCachedSongs(): Promise<void> {
    try {
      // Revoke all active blob URLs
      activeBlobUrls.forEach((url) => URL.revokeObjectURL(url));
      activeBlobUrls.clear();

      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Failed to clear IndexedDB store'));
      });
    } catch (err) {
      console.warn('Error clearing IndexedDB:', err);
    }
  },

  /**
   * Calculate total storage metrics
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const records = await this.getAllRecords();
      const totalBytes = records.reduce((acc, r) => acc + (r.sizeBytes || 0), 0);
      const mb = totalBytes / (1024 * 1024);
      const formattedSize = mb > 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;

      return {
        totalBytes,
        formattedSize,
        songCount: records.length,
      };
    } catch {
      return {
        totalBytes: 0,
        formattedSize: '0 MB',
        songCount: 0,
      };
    }
  },
};
