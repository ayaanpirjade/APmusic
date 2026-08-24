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
  Radio,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Bell,
  Heart,
  ChevronRight,
  Headphones,
  Zap,
  Moon,
  Compass,
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
    title: 'Midnight Lo-Fi & Chill',
    subtitle: 'Melt into calming ambient melodies and smooth midnight beats',
    bgGradient: 'from-indigo-900/70 via-purple-900/50 to-cyan-900/40',
    coverImg: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&auto=format&fit=crop&q=80',
    tag: 'Featured Atmosphere',
    searchQuery: 'Chill Vibes lo-fi ambient relax',
  },
  {
    id: 'top-hits',
    title: 'Global Top Hits 2025',
    subtitle: 'The hottest trending chart-toppers & viral anthems streaming now',
    bgGradient: 'from-purple-900/70 via-pink-900/50 to-rose-900/40',
    coverImg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    tag: 'Global Charts',
    searchQuery: 'Top Hits 2025 trending pop',
  },
  {
    id: 'workout-beast',
    title: 'High-Octane Workout',
    subtitle: 'Heavy bass EDM, hard phonk, and hip-hop to push your endurance',
    bgGradient: 'from-blue-900/70 via-indigo-900/50 to-teal-900/40',
    coverImg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    tag: 'High Energy',
    searchQuery: 'Workout gym phonk edm motivational',
  },
];

const MOOD_FILTERS = [
  { id: 'all', label: '🔥 All Hits', query: '' },
  { id: 'punjabi', label: '⚡ Punjabi', query: 'Punjabi Top Hits Diljit Karan Aujla' },
  { id: 'bollywood', label: '✨ Bollywood', query: 'Bollywood Romance Arijit Shreya' },
  { id: 'lofi', label: '🌙 Lo-Fi Chill', query: 'Lofi chill beats study sleep' },
  { id: 'party', label: '🎉 Party & Dance', query: 'EDM Party Club Dance' },
  { id: 'phonk', label: '🏎️ Phonk & Bass', query: 'Phonk drift bass boosted' },
  { id: 'acoustic', label: '🎸 Acoustic & Pop', query: 'Acoustic Guitar Indie Pop' },
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
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, playHistory } = useAuth();

  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi,english,punjabi');
  const [selectedMood, setSelectedMood] = useState('all');
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [charts, setCharts] = useState<Playlist[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Music Lover';

  const loadData = async (lang: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHomeModules(lang);
      setTrendingSongs(data.trending || []);
      setCharts(data.charts || []);
      setFeaturedPlaylists(data.playlists || []);
      setTopArtists(data.topArtists || []);

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
    loadData(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
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

  const handleMoodSelect = async (moodId: string, query: string) => {
    setSelectedMood(moodId);
    if (!query) {
      loadData(selectedLanguage);
      return;
    }
    setIsLoading(true);
    try {
      const songs = await api.searchSongs(query, 1, 20);
      setTrendingSongs(songs);
    } catch (err) {
      console.error('Mood filter error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-36 pt-1 animate-in fade-in duration-300 select-none max-w-7xl mx-auto">
      {/* 1. Header Greeting & Top Search Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold text-slate-400">
              {getGreeting()}, <span className="text-white font-bold">{userName}</span>
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-['Outfit'] mt-1">
            Discover & Listen
          </h1>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* AI DJ Quick Action */}
          <button
            onClick={onOpenAIDJ}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 hover:from-indigo-500/30 hover:to-pink-500/30 border border-indigo-400/30 text-indigo-200 text-xs sm:text-sm font-bold shadow-lg shadow-indigo-950/40 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI DJ Radio</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenAIDJ}
            className="relative p-2.5 rounded-2xl ios-glass-pill hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="AI DJ & Recommendations"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
          </button>

          {/* Profile Avatar */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20 hover:scale-105 transition-transform shadow-md ring-2 ring-indigo-500/30"
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

      {/* 2. Search Bar for Mobile / Tablet */}
      <div
        onClick={onOpenSearch}
        className="relative flex items-center justify-between p-3.5 sm:p-4 rounded-[24px] ios-glass-card border border-white/15 cursor-pointer hover:border-white/30 transition-all group shadow-xl shadow-black/20"
      >
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-200">
          <Search className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span className="text-xs sm:text-sm font-medium">Search millions of songs, artists, playlists, high-res audio...</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 group-hover:text-white flex items-center gap-1.5 text-xs font-semibold">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Explore</span>
        </div>
      </div>

      {/* 3. Mood & Genre Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MOOD_FILTERS.map((mood) => {
          const isActive = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id, mood.query)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30 scale-105 border border-indigo-400/40'
                  : 'ios-glass-pill text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* 4. Hero Carousel Banner */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-10 border border-white/20 shadow-2xl backdrop-blur-3xl group">
        {/* Background Image with Ambient Glow */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeHero.coverImg}
            alt={activeHero.title}
            className="w-full h-full object-cover opacity-35 scale-105 group-hover:scale-110 transition-transform duration-1000"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${activeHero.bgGradient} mix-blend-multiply`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-transparent" />
        </div>

        {/* Specular Ambient Blur */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/25 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-extrabold uppercase tracking-wider text-indigo-200">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" />
              {activeHero.tag}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              320kbps Lossless
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-['Outfit'] leading-tight">
            {activeHero.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
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
              className="flex items-center gap-2 px-4 py-3 rounded-2xl ios-glass-pill hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Generate AI Mix</span>
            </button>
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                heroIndex === idx ? 'w-7 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 5. "Jump Back In" 2x3 Quick Play Grid (Spotify / Apple Music style) */}
      {recentSongs.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Jump Back In
              </h2>
            </div>
            <button
              onClick={() => {
                if (recentSongs.length > 0) playSong(recentSongs[0], recentSongs);
              }}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Play All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSongs.slice(0, 6).map((song) => {
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
                  className={`group relative flex items-center justify-between p-2 rounded-2xl ios-glass-card cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/30 ${
                    isCurrent ? 'bg-indigo-950/30 border-indigo-400/50 shadow-lg shadow-indigo-950/50' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md shrink-0 bg-white/5">
                      <img
                        src={coverUrl}
                        alt={song.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isCurrentlyPlaying && (
                        <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="flex items-end gap-[2px] h-3.5">
                            <span className="w-[2px] bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" style={{ height: '70%' }} />
                            <span className="w-[2px] bg-indigo-300 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" style={{ height: '100%' }} />
                            <span className="w-[2px] bg-cyan-300 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" style={{ height: '80%' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                          isCurrent ? 'text-indigo-300' : 'text-white group-hover:text-indigo-200'
                        }`}
                      >
                        {song.name}
                      </h3>
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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-2 transition-all shadow-md ${
                      isCurrentlyPlaying
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/10 hover:bg-white text-white hover:text-black group-hover:scale-105'
                    }`}
                    title={isCurrentlyPlaying ? 'Pause' : 'Play'}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Featured Playlists Tray */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Featured Playlists
            </h2>
          </div>
          <button
            onClick={onOpenSearch}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Explore All</span>
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
                  <div className="absolute bottom-2 right-2 w-9 h-9 rounded-xl bg-white text-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
                <div className="mt-2.5">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {playlist.songCount ? `${playlist.songCount} Tracks` : 'Curated Mix'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Trending Songs Grid */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Trending Chart-Toppers
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
                  ? 'bg-white/20 text-white border border-white/30'
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
              <div key={i} className="p-3 rounded-[24px] ios-glass-card space-y-3 animate-pulse">
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

      {/* 8. Top Artists Tray */}
      {topArtists.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-purple-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Top Artists
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {topArtists.slice(0, 6).map((artist) => {
              const artistImg =
                artist.image?.[2]?.url ||
                artist.image?.[1]?.url ||
                artist.image?.[0]?.url ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';

              return (
                <div
                  key={artist.id}
                  onClick={() => onOpenArtist(artist)}
                  className="group flex flex-col items-center text-center p-3 rounded-[24px] ios-glass-card border border-white/10 cursor-pointer hover:border-indigo-400/40 transition-all hover:scale-105"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg border-2 border-white/20 group-hover:border-indigo-400 transition-colors">
                    <img
                      src={artistImg}
                      alt={artist.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate w-full mt-2 group-hover:text-indigo-300">
                    {artist.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                    Artist
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
