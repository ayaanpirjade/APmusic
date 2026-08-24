import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Flame,
  Music,
  Disc3,
  Mic2,
  ArrowRight,
  Radio,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Bell,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Song, Playlist, Album, Artist } from '../types';
import { api } from '../services/api';
import { SongCard } from './SongCard';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';

interface HomeViewProps {
  onOpenAIDJ: () => void;
  onOpenSpotifyModal: () => void;
  onOpenPlaylist: (playlist: Playlist) => void;
  onOpenArtist: (artist: Artist) => void;
  onOpenAlbum: (album: Album) => void;
  onOpenSearch?: () => void;
  onOpenProfile?: () => void;
}

const HERO_SLIDES = [
  {
    id: 'chill-vibes',
    title: 'Chill Vibes',
    subtitle: 'Kick back and relax with ambient lo-fi and smooth beats',
    bgGradient: 'from-indigo-900/60 via-purple-900/40 to-cyan-900/30',
    coverImg: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
    tag: 'Featured Mood',
    searchQuery: 'Chill Vibes lo-fi ambient relax',
  },
  {
    id: 'top-hits',
    title: 'Top Hits 2024',
    subtitle: 'The hottest global and trending chart-toppers right now',
    bgGradient: 'from-purple-900/60 via-pink-900/40 to-rose-900/30',
    coverImg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    tag: 'Global Charts',
    searchQuery: 'Top Hits 2024 trending pop',
  },
  {
    id: 'workout-beast',
    title: 'Workout Beast',
    subtitle: 'High-energy EDM, phonk, and hip-hop to push your limits',
    bgGradient: 'from-blue-900/60 via-indigo-900/40 to-teal-900/30',
    coverImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    tag: 'High Energy',
    searchQuery: 'Workout gym phonk edm motivational',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAIDJ,
  onOpenSpotifyModal,
  onOpenPlaylist,
  onOpenArtist,
  onOpenAlbum,
  onOpenSearch,
  onOpenProfile,
}) => {
  const { playSong } = useAudio();
  const { user, playHistory } = useAuth();

  const [heroIndex, setHeroIndex] = useState(0);
  const [language, setLanguage] = useState('hindi,english,punjabi');
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [charts, setCharts] = useState<Playlist[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Time Greeting (Good Evening, Ayaan 👋)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Ayaan';

  const loadData = async (lang: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHomeModules(lang);
      setTrendingSongs(data.trending || []);
      setCharts(data.charts || []);
      setFeaturedPlaylists(data.playlists || []);
      setTopArtists(data.topArtists || []);

      // If user has play history use it, otherwise fall back to top trending for Recently Played
      if (playHistory && playHistory.length > 0) {
        setRecentSongs(playHistory.slice(0, 6));
      } else if (data.trending && data.trending.length > 0) {
        setRecentSongs(data.trending.slice(0, 6));
      }
    } catch (err: any) {
      console.error('Home load error:', err);
      setError('Could not load trending feeds.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(language);
  }, [language]);

  // Auto cycle hero banner
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
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

  return (
    <div className="space-y-7 pb-36 pt-1 animate-in fade-in duration-300 select-none max-w-7xl mx-auto">
      {/* 1. Header Greeting & Discover Title matching Mockup */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            {getGreeting()}, <span className="text-white font-bold">{userName}</span> 👋
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit'] mt-0.5">
            Discover
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={onOpenAIDJ}
            className="relative p-2.5 rounded-2xl ios-glass-pill hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="AI DJ & Notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {/* Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20 hover:scale-105 transition-transform shadow-md"
            title="Open Profile"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={userName}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>

      {/* 2. Large Glass Search Bar matching Mockup */}
      <div
        onClick={onOpenSearch}
        className="relative flex items-center justify-between p-3.5 sm:p-4 rounded-[22px] ios-glass-card border border-white/15 cursor-pointer hover:border-white/30 transition-all group shadow-lg shadow-black/20"
      >
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200">
          <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="text-sm font-medium">Search songs, artists, albums, sound effects...</span>
        </div>
        <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 group-hover:text-white">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Hero Carousel Banner matching Mockup ("Chill Vibes - Kick back and relax") */}
      <div className="relative overflow-hidden rounded-[30px] p-6 sm:p-9 border border-white/20 shadow-2xl backdrop-blur-3xl group">
        {/* Background Image with Dark Gradient Tint */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeHero.coverImg}
            alt={activeHero.title}
            className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-110 transition-transform duration-1000"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${activeHero.bgGradient} mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-transparent" />
        </div>

        {/* Ambient Specular Blur */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-indigo-500/30 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">
            {activeHero.tag}
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-['Outfit']">
            {activeHero.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {activeHero.subtitle}
          </p>

          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={handleHeroPlay}
              className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
              <span>Play</span>
            </button>

            <button
              onClick={onOpenAIDJ}
              className="flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl ios-glass-pill hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI DJ Mix</span>
            </button>
          </div>
        </div>

        {/* Pagination Dots matching Mockup */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                heroIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 4. Featured Playlists matching Mockup */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Featured Playlists
          </h2>
          <button
            onClick={onOpenSearch}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {(featuredPlaylists.length > 0
            ? featuredPlaylists.slice(0, 6)
            : charts.slice(0, 6)
          ).map((playlist) => {
            const coverUrl =
              playlist.image?.[2]?.url ||
              playlist.image?.[1]?.url ||
              playlist.image?.[0]?.url ||
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80';

            return (
              <div
                key={playlist.id}
                onClick={() => onOpenPlaylist(playlist)}
                className="group p-3 rounded-[24px] ios-glass-card border border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:shadow-xl flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full rounded-[18px] overflow-hidden shadow-md bg-white/5">
                  <img
                    src={coverUrl}
                    alt={playlist.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/15 pointer-events-none" />
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {playlist.songCount || '25'} Tracks
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Recently Played List matching Mockup */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Recently Played
          </h2>
          <button
            onClick={onOpenSearch}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentSongs.slice(0, 4).map((song) => {
            const coverUrl =
              song.image?.[1]?.url ||
              song.image?.[0]?.url ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80';

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, recentSongs)}
                className="group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl ios-glass-card border border-white/10 hover:border-white/25 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0">
                    <img
                      src={coverUrl}
                      alt={song.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {song.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {song.primaryArtists}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSong(song, recentSongs);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white shrink-0 ml-2 group-hover:bg-white group-hover:text-black transition-all"
                  title="Play"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Trending Songs Grid */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Trending for You
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

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-[24px] ios-glass-card space-y-3 animate-pulse">
                <div className="aspect-square w-full rounded-[18px] bg-white/10" />
                <div className="h-4 bg-white/10 rounded-md w-3/4" />
                <div className="h-3 bg-white/5 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {trendingSongs.slice(0, 6).map((song) => (
              <SongCard key={song.id} song={song} playlistContext={trendingSongs} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
