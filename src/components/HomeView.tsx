import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Flame,
  Music,
  Disc3,
  Mic2,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Bell,
  Heart,
  ChevronRight,
  Headphones,
  Zap,
  Volume2,
  TrendingUp,
  Clock,
  Radio,
} from 'lucide-react';
import { Song, Playlist, Album, Artist } from '../types';
import { api } from '../services/api';
import { SongCard } from './SongCard';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../services/soundboardAudio';
import { getAccentForTrack } from '../utils/accentColor';

interface HomeViewProps {
  onOpenAIDJ: () => void;
  onOpenSpotifyModal: () => void;
  onOpenPlaylist: (playlist: Playlist) => void;
  onOpenArtist: (artist: Artist) => void;
  onOpenAlbum: (album: Album) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
  onOpenSoundboard?: () => void;
}

const HERO_SLIDES = [
  {
    id: 'made-for-you-1',
    title: 'Midnight Lo-Fi & Ambient Drive',
    subtitle: 'Curated mix tailored to your late night aesthetic and focus rhythm',
    bgGradient: 'from-indigo-600/40 via-purple-600/30 to-cyan-500/20',
    coverImg: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&auto=format&fit=crop&q=80',
    tag: 'Made For You',
    badge: 'Daily Mix 1',
    searchQuery: 'Midnight Lofi Chill Beats Ambient',
  },
  {
    id: 'made-for-you-2',
    title: 'High-Energy Phonk & Bass',
    subtitle: 'Adrenaline boosted tracks for workouts, gaming, and speed',
    bgGradient: 'from-rose-600/40 via-pink-600/30 to-amber-500/20',
    coverImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    tag: 'Made For You',
    badge: 'Heavy Bass',
    searchQuery: 'Phonk drift bass boosted gym workout',
  },
  {
    id: 'made-for-you-3',
    title: 'Bollywood & Acoustic Romance',
    subtitle: 'Heart-touching melodies, soulful vocals, and warm acoustic chords',
    bgGradient: 'from-purple-600/40 via-indigo-600/30 to-emerald-500/20',
    coverImg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    tag: 'Made For You',
    badge: 'Soulful Melodies',
    searchQuery: 'Arijit Singh Shreya Ghoshal Romantic Hits',
  },
];

const QUICK_MIXES = [
  {
    id: 'qm-chill',
    title: 'Chill Chill',
    subtitle: 'Lo-Fi & Study',
    query: 'Lofi chill beats relax study',
    color: 'from-blue-600/40 to-indigo-800/60',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'qm-punjabi',
    title: 'Punjabi Fire',
    subtitle: 'Diljit & Karan Aujla',
    query: 'Punjabi Hits Karan Aujla Diljit Dosanjh',
    color: 'from-amber-600/40 to-orange-800/60',
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'qm-edm',
    title: 'EDM Pulse',
    subtitle: 'Festival & Club',
    query: 'EDM Dance Festival Hits 2025',
    color: 'from-purple-600/40 to-pink-800/60',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'qm-pop',
    title: 'Global Pop',
    subtitle: 'Top 50 Worldwide',
    query: 'Global Top Pop Chart Hits 2025',
    color: 'from-emerald-600/40 to-teal-800/60',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'qm-acoustic',
    title: 'Acoustic Soul',
    subtitle: 'Coffee & Sunsets',
    query: 'Acoustic Guitar Indie Soul',
    color: 'from-rose-600/40 to-red-800/60',
    img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80',
  },
];

const HOME_SOUNDPADS = [
  { id: 'bruh', name: 'Bruh', icon: '🗿', soundType: 'bruh', duration: '00:01', color: 'from-blue-500/30 to-indigo-600/30 border-blue-500/30 text-blue-300' },
  { id: 'boom', name: 'Boom', icon: '💥', soundType: 'boom', duration: '00:02', color: 'from-rose-500/30 to-orange-600/30 border-rose-500/30 text-rose-300' },
  { id: 'laugh', name: 'Laugh', icon: '😂', soundType: 'laugh', duration: '00:02', color: 'from-amber-500/30 to-yellow-600/30 border-amber-500/30 text-amber-300' },
  { id: 'sus', name: 'Sus', icon: 'ඞ', soundType: 'sus', duration: '00:01', color: 'from-cyan-500/30 to-blue-600/30 border-cyan-500/30 text-cyan-300' },
];

const LANGUAGES = [
  { id: 'hindi,english,punjabi', label: 'All Global' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'punjabi', label: 'Punjabi' },
  { id: 'english', label: 'English' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'telugu', label: 'Telugu' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAIDJ,
  onOpenSpotifyModal,
  onOpenPlaylist,
  onOpenArtist,
  onOpenAlbum,
  onOpenSearch,
  onOpenProfile,
  onOpenSoundboard,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, playHistory } = useAuth();

  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi,english,punjabi');
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [activeSoundPlaying, setActiveSoundPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic greeting: Good evening, Ayaan 👋
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Ayaan';

  const loadData = async (lang: string) => {
    setIsLoading(true);
    try {
      const data = await api.getHomeModules(lang);
      setTrendingSongs(data.trending || []);

      if (playHistory && playHistory.length > 0) {
        setRecentSongs(playHistory.slice(0, 5));
      } else if (data.trending && data.trending.length > 0) {
        setRecentSongs(data.trending.slice(0, 5));
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedLanguage);
  }, [selectedLanguage]);

  // Rotate hero carousel smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const activeHero = HERO_SLIDES[heroIndex];

  const handleHeroPlay = async () => {
    try {
      const results = await api.searchSongs(activeHero.searchQuery);
      if (results && results.length > 0) {
        playSong(results[0], results);
      } else if (trendingSongs.length > 0) {
        playSong(trendingSongs[0], trendingSongs);
      }
    } catch {
      if (trendingSongs.length > 0) playSong(trendingSongs[0], trendingSongs);
    }
  };

  const handleQuickMixPlay = async (query: string) => {
    try {
      const results = await api.searchSongs(query, 1, 25);
      if (results && results.length > 0) {
        playSong(results[0], results);
      }
    } catch (err) {
      console.error('Quick mix error:', err);
    }
  };

  const triggerHomeSound = (sound: typeof HOME_SOUNDPADS[0]) => {
    setActiveSoundPlaying(sound.id);
    soundEngine.playSound(sound.soundType);
    setTimeout(() => {
      setActiveSoundPlaying((curr) => (curr === sound.id ? null : curr));
    }, 1200);
  };

  return (
    <div className="space-y-7 pb-36 pt-1 select-none max-w-7xl mx-auto">
      {/* 1. Header Greeting: Good evening, Ayaan 👋 */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Outfit'] flex items-center gap-2">
            <span>{getGreeting()}, {userName}</span>
            <span className="inline-block hover:rotate-12 transition-transform cursor-default">👋</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
            Ready to dive into high-fidelity music & sounds?
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAIDJ}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl glass-pill hover:bg-white/15 text-indigo-300 text-xs font-bold border border-indigo-500/30 hover:scale-105 transition-all shadow-md shadow-indigo-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>AI DJ</span>
          </button>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20 hover:scale-105 transition-transform shadow-md ring-2 ring-indigo-500/20"
              title="Open Profile"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </button>
          )}
        </div>
      </div>

      {/* 2. Big Search Bar: [ 🔍 What do you want to listen to? ] */}
      <div
        onClick={onOpenSearch}
        className="relative flex items-center justify-between p-3.5 sm:p-4 rounded-[26px] glass-card border border-white/15 cursor-pointer hover:border-white/30 transition-all group shadow-xl shadow-black/25"
      >
        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
          <Search className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base font-semibold text-slate-300 group-hover:text-white">
            What do you want to listen to?
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Explore</span>
        </div>
      </div>

      {/* 3. Made for you (Large Horizontal Glass Hero Card) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Made For You
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  heroIndex === idx ? 'w-6 bg-indigo-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-9 border border-white/20 shadow-2xl glass-card group">
          {/* Cover Art Background */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeHero.coverImg}
              alt={activeHero.title}
              className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${activeHero.bgGradient} mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090c16] via-[#090c16]/50 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-black uppercase tracking-wider text-indigo-200">
                {activeHero.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                320kbps Master
              </span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight font-['Outfit'] leading-snug">
              {activeHero.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed line-clamp-2">
              {activeHero.subtitle}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleHeroPlay}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all hover:bg-slate-100"
              >
                <Play className="w-4 h-4 fill-black ml-0.5" />
                <span>Play Now</span>
              </button>

              <button
                onClick={onOpenAIDJ}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl glass-pill hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Remix</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Mixes (4–5 Square Cards) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Quick Mixes
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">1-Tap Start</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {QUICK_MIXES.map((mix) => (
            <div
              key={mix.id}
              onClick={() => handleQuickMixPlay(mix.query)}
              className="group relative rounded-[24px] overflow-hidden p-3.5 glass-card border border-white/10 cursor-pointer hover:border-white/30 transition-all hover:scale-[1.03] shadow-lg flex flex-col justify-between aspect-square"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={mix.img}
                  alt={mix.title}
                  className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${mix.color} mix-blend-multiply`} />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              <div className="relative z-10">
                <span className="px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-slate-200 border border-white/10">
                  Mix
                </span>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                    {mix.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                    {mix.subtitle}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recently Played (Compact Horizontal Rows) */}
      {recentSongs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Recently Played
              </h2>
            </div>
            <button
              onClick={() => playSong(recentSongs[0], recentSongs)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Play All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {recentSongs.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              const isCurrentlyPlaying = isCurrent && isPlaying;
              const coverUrl =
                song.image?.[1]?.url ||
                song.image?.[0]?.url ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80';

              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, recentSongs)}
                  className={`group relative flex items-center justify-between p-2 rounded-2xl glass-card cursor-pointer transition-all hover:scale-[1.01] border ${
                    isCurrent ? 'bg-indigo-950/40 border-indigo-400/50 shadow-md shadow-indigo-950/40' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10">
                      <img
                        src={coverUrl}
                        alt={song.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isCurrentlyPlaying && (
                        <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex items-end gap-[2px] h-3.5">
                            <span className="w-[2px] bg-white rounded-full animate-pulse" style={{ height: '60%' }} />
                            <span className="w-[2px] bg-indigo-300 rounded-full animate-pulse" style={{ height: '100%' }} />
                            <span className="w-[2px] bg-cyan-300 rounded-full animate-pulse" style={{ height: '80%' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isCurrent ? 'text-indigo-300' : 'text-white group-hover:text-indigo-200'
                        }`}
                      >
                        {song.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                        {song.primaryArtists}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) togglePlay();
                      else playSong(song, recentSongs);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-2 transition-all ${
                      isCurrentlyPlaying
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/10 hover:bg-white text-white hover:text-black'
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Your Soundboard (3–4 Quick Sound Pads) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-purple-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Your Soundboard
            </h2>
          </div>
          {onOpenSoundboard && (
            <button
              onClick={onOpenSoundboard}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All FX</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HOME_SOUNDPADS.map((pad) => {
            const isPlayingSound = activeSoundPlaying === pad.id;
            return (
              <button
                key={pad.id}
                onClick={() => triggerHomeSound(pad)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl glass-card border transition-all duration-200 active:scale-95 text-center overflow-hidden ${
                  isPlayingSound
                    ? 'border-purple-400/80 bg-purple-600/30 shadow-lg shadow-purple-950/60 scale-105 ring-2 ring-purple-400/40'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-3xl mb-1.5 drop-shadow-md">{pad.icon}</div>
                <div className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-black uppercase text-white tracking-wider">
                    {pad.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">{pad.duration}</span>

                {/* Animated live waveform preview indicator */}
                <div className="flex items-center justify-center gap-1 mt-2 h-2.5">
                  {[4, 8, 12, 6, 10].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all ${
                        isPlayingSound
                          ? 'bg-gradient-to-t from-purple-400 to-cyan-400 animate-pulse'
                          : 'bg-white/20'
                      }`}
                      style={{ height: isPlayingSound ? `${h + 4}px` : '4px' }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. Recommended (Music Grid) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Recommended Hits
            </h2>
          </div>
          <button
            onClick={() => {
              if (trendingSongs.length > 0) playSong(trendingSongs[0], trendingSongs);
            }}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Play All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language selector chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedLanguage === lang.id
                  ? 'bg-white/25 text-white border border-white/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-[24px] glass-card space-y-3 animate-pulse">
                <div className="aspect-square w-full rounded-[18px] bg-white/10" />
                <div className="h-4 bg-white/10 rounded-md w-3/4" />
                <div className="h-3 bg-white/5 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {trendingSongs.slice(0, 12).map((song) => (
              <SongCard key={song.id} song={song} playlistContext={trendingSongs} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
