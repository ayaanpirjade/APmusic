import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Song, RepeatMode, AudioQualitySetting, EqualizerBands, SyncedLyricLine, LyricsData } from '../types';
import { api, API_BASE_URL } from '../services/api';
import { useAuth } from './AuthContext';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  bufferedTime: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
  queueIndex: number;
  audioQuality: AudioQualitySetting;
  equalizer: EqualizerBands;
  equalizerBands: EqualizerBands;
  lyricsData: LyricsData | null;
  currentLyricIndex: number;
  isLoadingLyrics: boolean;
  isLoadingSong: boolean;
  visualizerData: Uint8Array;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  fetchLyrics: (targetSong?: Song) => Promise<void>;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  clearQueue: () => void;
  setAudioQuality: (quality: AudioQualitySetting) => void;
  setEqualizerBand: (band: keyof EqualizerBands, value: number | boolean) => void;
  setBassBoost: (boost: number) => void;
  toggleSpatialAudio: () => void;
  resetEqualizer: () => void;
  applyEQPreset: (presetName: string) => void;
  setSleepTimer: (minutes: number | null) => void;
  downloadSongFile: (song: Song) => Promise<void>;
}

const DEFAULT_EQUALIZER: EqualizerBands = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0,
  bassBoost: 15,
  spatialAudio: true,
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { recordPlayHistory, addOfflineSong } = useAuth();

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [audioQuality, setAudioQualityState] = useState<AudioQualitySetting>('320kbps');
  const [equalizer, setEqualizer] = useState<EqualizerBands>(() => {
    try {
      const saved = localStorage.getItem('soundbound_equalizer');
      if (!saved) return DEFAULT_EQUALIZER;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_EQUALIZER,
        ...(typeof parsed === 'object' && parsed !== null ? parsed : {}),
      };
    } catch {
      return DEFAULT_EQUALIZER;
    }
  });

  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(-1);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [visualizerData, setVisualizerData] = useState<Uint8Array>(new Uint8Array(64));

  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRequestIdRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqFiltersRef = useRef<{ [key: string]: BiquadFilterNode }>({});
  const bassBoostFilterRef = useRef<BiquadFilterNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sleepTimerIntervalRef = useRef<any>(null);

  // Initialize HTML Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.buffered.length > 0) {
        setBufferedTime(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingSong(false);
    };

    const handleWaiting = () => setIsLoadingSong(true);
    const handlePlaying = () => {
      setIsLoadingSong(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = (e: any) => {
      console.warn('Audio playback error encountered:', e);
      setIsLoadingSong(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Initialize Web Audio API graph
  const initWebAudio = () => {
    if (audioCtxRef.current || !audioRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;

      // 5-Band Equalizer filters
      const frequencies = [
        { name: 'bass', freq: 60, type: 'lowshelf' as BiquadFilterType },
        { name: 'lowMid', freq: 230, type: 'peaking' as BiquadFilterType },
        { name: 'mid', freq: 910, type: 'peaking' as BiquadFilterType },
        { name: 'highMid', freq: 4000, type: 'peaking' as BiquadFilterType },
        { name: 'treble', freq: 14000, type: 'highshelf' as BiquadFilterType },
      ];

      const filters: { [key: string]: BiquadFilterNode } = {};
      let lastNode: AudioNode = source;

      frequencies.forEach(({ name, freq, type }) => {
        const filter = ctx.createBiquadFilter();
        filter.type = type;
        filter.frequency.value = freq;
        filter.gain.value = (equalizer as any)[name] || 0;
        filter.Q.value = 1.0;
        filters[name] = filter;
        lastNode.connect(filter);
        lastNode = filter;
      });
      eqFiltersRef.current = filters;

      // Bass Booster (sub-bass 80Hz)
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 80;
      bassBoost.gain.value = (equalizer.bassBoost / 100) * 12;
      bassBoostFilterRef.current = bassBoost;
      lastNode.connect(bassBoost);
      lastNode = bassBoost;

      // Analyser Node for Visualizer spectrum
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserNodeRef.current = analyser;
      lastNode.connect(analyser);
      lastNode = analyser;

      // Master Gain Node
      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gain;
      lastNode.connect(gain);
      gain.connect(ctx.destination);
    } catch (err) {
      console.warn('Web Audio API could not be initialized:', err);
    }
  };

  // Visualizer Animation Loop
  useEffect(() => {
    const updateVisualizer = () => {
      if (analyserNodeRef.current && isPlaying) {
        const bufferLength = analyserNodeRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNodeRef.current.getByteFrequencyData(dataArray);
        setVisualizerData(dataArray);
      }
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Update EQ bands dynamically
  useEffect(() => {
    localStorage.setItem('soundbound_equalizer', JSON.stringify(equalizer));
    const filters = eqFiltersRef.current;
    if (filters.bass) filters.bass.gain.value = equalizer.bass;
    if (filters.lowMid) filters.lowMid.gain.value = equalizer.lowMid;
    if (filters.mid) filters.mid.gain.value = equalizer.mid;
    if (filters.highMid) filters.highMid.gain.value = equalizer.highMid;
    if (filters.treble) filters.treble.gain.value = equalizer.treble;

    if (bassBoostFilterRef.current) {
      bassBoostFilterRef.current.gain.value = (equalizer.bassBoost / 100) * 12;
    }
  }, [equalizer]);

  // Update Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Check if string is a direct audio stream URL and not a webpage
  const isDirectAudio = (url?: string): boolean =>
    Boolean(url && typeof url === 'string' && !url.includes('youtube.com/watch') && !url.includes('youtu.be/'));

  // Resolve best play URL based on quality preference
  const resolvePlayUrl = (song: Song, quality: AudioQualitySetting): string => {
    if (!song) return '';
    if (song.downloadUrl && song.downloadUrl.length > 0) {
      const validDownloads = song.downloadUrl.filter((d) => isDirectAudio(d.url));
      if (validDownloads.length > 0) {
        const qTarget = quality.replace('kbps', '');
        const match = validDownloads.find((d) => d.quality && d.quality.includes(qTarget));
        if (match && match.url) return match.url;

        // Quality priority: 320 -> 160 -> 96 -> 48 -> 12
        const preferred =
          validDownloads.find((d) => d.quality?.includes('320'))?.url ||
          validDownloads.find((d) => d.quality?.includes('160'))?.url ||
          validDownloads.find((d) => d.quality?.includes('96'))?.url ||
          validDownloads[validDownloads.length - 1]?.url ||
          validDownloads[0]?.url;
        if (preferred) return preferred;
      }
    }
    if (song.playUrl && isDirectAudio(song.playUrl)) {
      if (quality === '320kbps') return song.playUrl.replace(/_(96|160|48)\./, '_320.');
      if (quality === '160kbps') return song.playUrl.replace(/_(96|320|48)\./, '_160.');
      if (quality === '96kbps') return song.playUrl.replace(/_(160|320|48)\./, '_96.');
      return song.playUrl;
    }
    return '';
  };

  // Route third-party media through our same-origin proxy so browsers can
  // play it with Web Audio and Vercel can add the required CORS/range headers.
  const toStreamProxyUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('/api/stream-proxy?')) {
      return `${API_BASE_URL}${url}`;
    }
    return `${API_BASE_URL}/api/stream-proxy?url=${encodeURIComponent(url)}`;
  };

  // Fetch Lyrics for a target song
  const fetchLyrics = useCallback(async (targetSong?: Song) => {
    const song = targetSong || currentSong;
    if (!song) return;

    setIsLoadingLyrics(true);
    setCurrentLyricIndex(-1);

    try {
      const lyricRes = await api.getLyrics(
        song.lyricsId || song.id,
        song.name,
        song.primaryArtists,
        song.duration
      );
      setLyricsData(lyricRes);
    } catch (err) {
      console.warn('Failed to load lyrics:', err);
      setLyricsData({ lyrics: 'Lyrics not available for this song.' });
    } finally {
      setIsLoadingLyrics(false);
    }
  }, [currentSong]);

  // Play Song Function with automatic dynamic URL hydration and fallback
  const playSong = useCallback(
    async (song: Song, newQueue?: Song[]) => {
      if (!song) return;

      const requestId = ++playRequestIdRef.current;
      const isLatestRequest = () => playRequestIdRef.current === requestId;

      initWebAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      setIsLoadingSong(true);
      setCurrentSong(song);

      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((s) => s.id === song.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else if (queue.length === 0) {
        setQueue([song]);
        setQueueIndex(0);
      }

      let activeSong = { ...song };
      let playUrl = resolvePlayUrl(activeSong, audioQuality);

      // If URL is missing or not a direct audio file, hydrate via backend audio stream resolver.
      // Ignore late responses when the user has already selected another song.
      if (!playUrl || !isDirectAudio(playUrl)) {
        try {
          if (song.id) {
            const details = await api.getSongDetails(song.id, song.name, song.primaryArtists);
            if (details && (details.playUrl || (details.downloadUrl && details.downloadUrl.length > 0))) {
              activeSong = { ...details };
              playUrl = resolvePlayUrl(activeSong, audioQuality);
            }
          }

          if (!playUrl || !isDirectAudio(playUrl)) {
            const streamRes = await api.resolveAudioStream(song.id, song.name, song.primaryArtists);
            if (streamRes && streamRes.playUrl) {
              activeSong = {
                ...activeSong,
                playUrl: streamRes.playUrl,
                downloadUrl: streamRes.downloadUrl,
              };
              playUrl = streamRes.playUrl;
            }
          }

          if ((!playUrl || !isDirectAudio(playUrl)) && song.name) {
            const searchResults = await api.searchSongs(`${song.name} ${song.primaryArtists || ''}`.trim(), 1, 3);
            if (searchResults && searchResults.length > 0) {
              activeSong = { ...searchResults[0] };
              playUrl = resolvePlayUrl(activeSong, audioQuality);
            }
          }
        } catch (fetchErr) {
          console.warn('Failed to dynamically hydrate song stream:', fetchErr);
        }
      }

      if (!isLatestRequest()) return;

      playUrl = toStreamProxyUrl(playUrl);
      if (!playUrl) {
        console.error('No playable URL for song:', song.name);
        setIsLoadingSong(false);
        return;
      }

      const proxiedUrl = toStreamProxyUrl(playUrl);

      // Update current state with resolved active song only if this is still the latest click.
      if (!isLatestRequest()) return;
      setCurrentSong(activeSong);
      recordPlayHistory(activeSong);

      // Update queue item with resolved track
      setQueue((prevQueue) =>
        prevQueue.map((item) =>
          item.id === song.id || item.id === activeSong.id ? { ...item, ...activeSong } : item
        )
      );

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = proxiedUrl;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Proxy audio play failed, trying direct stream URL:', err);
            if (audioRef.current && playUrl) {
              audioRef.current.src = playUrl;
              audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((directErr) => {
                  console.warn('Direct stream also blocked or interrupted:', directErr);
                  setIsPlaying(false);
                });
            } else {
              setIsPlaying(false);
            }
          });
      }

      // Update MediaSession (iOS / Car / Lock screen info)
      if ('mediaSession' in navigator) {
        const cover = activeSong.image?.[activeSong.image.length - 1]?.url || '';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: activeSong.name,
          artist: activeSong.primaryArtists,
          album: activeSong.album?.name || 'APMUSIC Lossless',
          artwork: [
            { src: cover, sizes: '96x96', type: 'image/jpeg' },
            { src: cover, sizes: '256x256', type: 'image/jpeg' },
            { src: cover, sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play();
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
          }
        });
      }

      // Fetch Lyrics with song metadata
      setIsLoadingLyrics(true);
      setLyricsData(null);
      setCurrentLyricIndex(-1);

      try {
        const lyricRes = await api.getLyrics(
          activeSong.lyricsId || activeSong.id,
          activeSong.name,
          activeSong.primaryArtists,
          activeSong.duration
        );
        setLyricsData(lyricRes);
      } catch (err) {
        console.warn('Failed to load lyrics:', err);
        setLyricsData({ lyrics: 'Lyrics not available for this song.' });
      } finally {
        setIsLoadingLyrics(false);
      }
    },
    [audioQuality, queue, recordPlayHistory]
  );

  // Sync lyrics position with currentTime
  useEffect(() => {
    if (!lyricsData?.syncedLyrics || lyricsData.syncedLyrics.length === 0) {
      setCurrentLyricIndex(-1);
      return;
    }

    const lines = lyricsData.syncedLyrics;
    let foundIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        foundIdx = i;
      } else {
        break;
      }
    }
    setCurrentLyricIndex(foundIdx);
  }, [currentTime, lyricsData]);

  // Track Ended Handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [repeatMode, queue, queueIndex]);

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      initWebAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current && currentSong) {
      initWebAudio();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIdx);
    const nextSong = queue[nextIdx];
    if (nextSong) {
      playSong(nextSong);
    }
  }, [queue, queueIndex, isShuffle, repeatMode, playSong]);

  const prevTrack = useCallback(() => {
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    setQueueIndex(prevIdx);
    const prevSong = queue[prevIdx];
    if (prevSong) {
      playSong(prevSong);
    }
  }, [currentTime, queue, queueIndex, repeatMode, playSong]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);

  const addToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  const playNextInQueue = (song: Song) => {
    setQueue((prev) => {
      const next = [...prev];
      next.splice(queueIndex + 1, 0, song);
      return next;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < queueIndex) {
      setQueueIndex((prev) => prev - 1);
    }
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    setQueue((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const clearQueue = () => {
    if (currentSong) {
      setQueue([currentSong]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  };

  const setAudioQuality = (quality: AudioQualitySetting) => {
    setAudioQualityState(quality);
    if (currentSong && audioRef.current) {
      const curTime = audioRef.current.currentTime;
      const wasPlaying = isPlaying;
      const newUrl = toStreamProxyUrl(resolvePlayUrl(currentSong, quality));
      audioRef.current.src = newUrl;
      audioRef.current.currentTime = curTime;
      if (wasPlaying) {
        audioRef.current.play().catch(console.warn);
      }
    }
  };

  const setEqualizerBand = (band: keyof EqualizerBands, value: number | boolean) => {
    setEqualizer((prev) => ({ ...prev, [band]: value }));
  };

  const setBassBoost = (boost: number) => {
    const valid = Math.max(0, Math.min(100, Number(boost) || 0));
    setEqualizer((prev) => ({ ...prev, bassBoost: valid }));
  };

  const toggleSpatialAudio = () => {
    setEqualizer((prev) => ({ ...prev, spatialAudio: !prev.spatialAudio }));
  };

  const resetEqualizer = () => {
    setEqualizer(DEFAULT_EQUALIZER);
  };

  const applyEQPreset = (presetName: string) => {
    switch (presetName.toLowerCase()) {
      case 'bass boost':
        setEqualizer({ bass: 7, lowMid: 4, mid: 0, highMid: 1, treble: 2, bassBoost: 75, spatialAudio: true });
        break;
      case 'vocal clarity':
        setEqualizer({ bass: -2, lowMid: 1, mid: 6, highMid: 5, treble: 3, bassBoost: 10, spatialAudio: true });
        break;
      case 'pop':
        setEqualizer({ bass: 3, lowMid: 2, mid: 4, highMid: 3, treble: 4, bassBoost: 30, spatialAudio: true });
        break;
      case 'rock':
        setEqualizer({ bass: 5, lowMid: 3, mid: -1, highMid: 4, treble: 6, bassBoost: 40, spatialAudio: true });
        break;
      case 'electronic / edm':
        setEqualizer({ bass: 8, lowMid: 5, mid: 0, highMid: 4, treble: 7, bassBoost: 80, spatialAudio: true });
        break;
      case 'acoustic':
        setEqualizer({ bass: 2, lowMid: 3, mid: 3, highMid: 5, treble: 5, bassBoost: 15, spatialAudio: false });
        break;
      case 'night drive':
        setEqualizer({ bass: 6, lowMid: 3, mid: 1, highMid: 2, treble: 4, bassBoost: 50, spatialAudio: true });
        break;
      default:
        resetEqualizer();
    }
  };

  // Sleep Timer Countdown
  const setSleepTimer = (minutes: number | null) => {
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }

    if (minutes === null || minutes <= 0) {
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }

    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);

    let remainingSeconds = minutes * 60;
    sleepTimerIntervalRef.current = setInterval(() => {
      remainingSeconds -= 1;
      setSleepTimerRemaining(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
        pause();
      }
    }, 1000);
  };

  // Real Audio File Downloader
  const downloadSongFile = async (song: Song) => {
    try {
      const url = resolvePlayUrl(song, '320kbps') || song.playUrl;
      if (!url) return;
      const proxyUrl = toStreamProxyUrl(url);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanFileName = `${song.name} - ${song.primaryArtists}`.replace(/[/\\?%*:|"<>]/g, '');
      a.download = `${cleanFileName}.m4a`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Also add to local offline library!
      addOfflineSong({
        ...song,
        isDownloaded: true,
        localCachedBlob: blobUrl,
      });
    } catch (err) {
      console.error('Download song error:', err);
      // Fallback direct window download
      const directUrl = resolvePlayUrl(song, '320kbps') || song.playUrl;
      window.open(directUrl, '_blank');
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        duration,
        currentTime,
        bufferedTime,
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        queue,
        queueIndex,
        audioQuality,
        equalizer,
        equalizerBands: equalizer,
        lyricsData,
        currentLyricIndex,
        isLoadingLyrics,
        isLoadingSong,
        visualizerData,
        sleepTimerMinutes,
        sleepTimerRemaining,
        fetchLyrics,
        playSong,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setAudioQuality,
        setEqualizerBand,
        setBassBoost,
        toggleSpatialAudio,
        resetEqualizer,
        applyEQPreset,
        setSleepTimer,
        downloadSongFile,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
};
