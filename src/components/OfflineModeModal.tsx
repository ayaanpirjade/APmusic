import React, { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  HardDrive,
  Trash2,
  Play,
  Shuffle,
  Music,
  CheckCircle2,
  AlertCircle,
  DownloadCloud,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  Disc,
} from 'lucide-react';
import { Song } from '../types';
import { offlineStorage, CachedTrackRecord, StorageStats } from '../services/offlineStorage';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

interface OfflineModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineModeModal: React.FC<OfflineModeModalProps> = ({ isOpen, onClose }) => {
  const { playSong, currentSong, isPlaying } = useAudio();
  const { removeOfflineSong } = useAuth();

  const [records, setRecords] = useState<CachedTrackRecord[]>([]);
  const [stats, setStats] = useState<StorageStats>({ totalBytes: 0, formattedSize: '0 MB', songCount: 0 });
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadOfflineData = async () => {
    setIsLoading(true);
    try {
      const [allRecs, currentStats] = await Promise.all([
        offlineStorage.getAllRecords(),
        offlineStorage.getStorageStats(),
      ]);
      setRecords(allRecs);
      setStats(currentStats);
    } catch (err) {
      console.warn('Failed to load offline storage records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOfflineData();
      setConfirmClear(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const handleDeleteSong = async (songId: string) => {
    await offlineStorage.deleteCachedSong(songId);
    removeOfflineSong(songId);
    await loadOfflineData();
  };

  const handleClearAll = async () => {
    await offlineStorage.clearAllCachedSongs();
    records.forEach((r) => removeOfflineSong(r.songId));
    await loadOfflineData();
    setConfirmClear(false);
  };

  const handlePlaySong = async (record: CachedTrackRecord) => {
    const cachedItem = await offlineStorage.getCachedSong(record.songId);
    if (cachedItem) {
      const allCachedSongs = records.map((r) => r.song);
      playSong(cachedItem.song, allCachedSongs);
    }
  };

  const handlePlayAllOffline = async (shuffle = false) => {
    if (records.length === 0) return;
    const songs = records.map((r) => r.song);
    const list = shuffle ? [...songs].sort(() => Math.random() - 0.5) : songs;
    const firstCached = await offlineStorage.getCachedSong(list[0].id);
    if (firstCached) {
      playSong(firstCached.song, list);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.song.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.song.primaryArtists.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl rounded-[32px] ios-glass-card border border-white/20 p-6 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full ios-glass flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-500/25 border border-white/20 text-white">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit']">
                IndexedDB Offline Manager
              </h3>
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Locally cached audio binaries, high-res artwork, and synced lyrics in IndexedDB
            </p>
          </div>
        </div>

        {/* Storage Stats Bar */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">IndexedDB Storage Allocated</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300">{stats.formattedSize}</span>
          </div>

          {/* Progress bar visual */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, (stats.totalBytes / (500 * 1024 * 1024)) * 100))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{stats.songCount} Lossless Tracks Saved</span>
            <span>Zero Data Usage When Playing</span>
          </div>
        </div>

        {/* Actions bar (Play All Offline / Shuffle / Clear Cache) */}
        {records.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlayAllOffline(false)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-xs shadow-md transition-all hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Play All Offline</span>
              </button>

              <button
                onClick={() => handlePlayAllOffline(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl ios-glass-pill hover:bg-white/20 text-white font-bold text-xs transition-all hover:scale-105"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>

            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-300 font-semibold">Delete all cached tracks?</span>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear IndexedDB Cache</span>
              </button>
            )}
          </div>
        )}

        {/* Search filter within cached songs */}
        {records.length > 3 && (
          <div className="mb-4">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search offline tracks..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        )}

        {/* Song List in IndexedDB */}
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Reading IndexedDB cache...</span>
            </div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const isCurrent = currentSong?.id === record.songId;
              const mb = ((record.sizeBytes || 0) / (1024 * 1024)).toFixed(1);
              const cover =
                record.artworkDataUrl ||
                record.song.image?.[record.song.image.length - 1]?.url ||
                record.song.image?.[0]?.url;

              return (
                <div
                  key={record.songId}
                  className={`group p-2.5 rounded-2xl flex items-center justify-between gap-3 transition-all border ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500/40'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div
                    onClick={() => handlePlaySong(record)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      {cover ? (
                        <img src={cover} alt={record.song.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <Music className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isCurrent ? 'text-emerald-300' : 'text-white group-hover:text-emerald-200'
                        }`}
                      >
                        {record.song.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {record.song.primaryArtists}
                      </p>
                    </div>
                  </div>

                  {/* Metadata pill & delete action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 border border-white/10">
                      {record.quality || '320kbps'} • {mb} MB
                    </span>

                    <button
                      onClick={() => handleDeleteSong(record.songId)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from IndexedDB cache"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-14 text-center text-slate-400 space-y-3">
              <DownloadCloud className="w-10 h-10 mx-auto text-slate-500 stroke-[1.5]" />
              <h4 className="text-sm font-bold text-white">No songs cached in IndexedDB</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tap the download button next to any song in the app to cache its full audio binary into IndexedDB for
                complete offline playback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
