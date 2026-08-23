import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Flame, Music, Disc3, Mic2, ArrowRight, Radio, RefreshCw } from 'lucide-react';
import { Song, Playlist, Album, Artist } from '../types';
import { api } from '../services/api';
import { SongCard } from './SongCard';
import { SongRow } from './SongRow';
import { useAudio } from '../context/AudioContext';

interface HomeViewProps {
  onOpenAIDJ: () => void;
  onOpenSpotifyModal: () => void;
  onOpenPlaylist: (playlist: Playlist) => void;
  onOpenArtist: (artist: Artist) => void;
  onOpenAlbum: (album: Album) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenAIDJ,
  onOpenSpotifyModal,
  onOpenPlaylist,
  onOpenArtist,
  onOpenAlbum,
}) => {
  const { playSong } = useAudio();

  const [language, setLanguage] = useState('hindi,english,punjabi');
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [charts, setCharts] = useState<Playlist[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const languagesList = [
    { id: 'hindi,english,punjabi', label: 'All Hits' },
    { id: 'hindi', label: 'Bollywood & Hindi' },
    { id: 'punjabi', label: 'Punjabi Beats' },
    { id: 'english', label: 'International Pop' },
    { id: 'telugu,tamil', label: 'South Superhits' },
  ];

  const loadData = async (lang: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getHomeModules(lang);
      setTrendingSongs(data.trending || []);
      setCharts(data.charts || []);
      setFeaturedPlaylists(data.playlists || []);
      setTopArtists(data.topArtists || []);
    } catch (err: any) {
      console.error('Home load error:', err);
      setError('Could not load trending feeds. Check connection or retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(language);
  }, [language]);

  const handlePlayAllTrending = () => {
    if (trendingSongs.length > 0) {
      playSong(trendingSongs[0], trendingSongs);
    }
  };

  return (
    <div className="space-y-8 pb-32 pt-2 animate-in fade-in duration-300 select-none">
      {/* Hero Banner with iOS Liquid Glass Styling */}
      <div className="relative overflow-hidden rounded-[32px] p-6 sm:p-10 border border-white/20 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/20 backdrop-blur-2xl shadow-2xl shadow-indigo-950/50 group">
        {/* Specular Light Blur */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-pink-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>320 kbps Master Lossless Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight font-['Outfit']">
            APMUSIC Lossless
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Experience uncompressed lossless audio streaming, AI-powered mood DJ mixing, Spotify playlist sync, and studio-grade 5-band equalization.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePlayAllTrending}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black ml-0.5" />
              <span>Play Top Hits</span>
            </button>

            <button
              onClick={onOpenAIDJ}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl ios-glass-pill hover:bg-white/20 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Mood DJ</span>
            </button>

            <button
              onClick={onOpenSpotifyModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 font-bold text-sm transition-all hover:scale-105 active:scale-95"
            >
              <Music className="w-4 h-4 text-emerald-400" />
              <span>Import Spotify URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* Language Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {languagesList.map((item) => (
          <button
            key={item.id}
            onClick={() => setLanguage(item.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              language === item.id
                ? 'bg-indigo-600/40 text-white border border-indigo-400/40 shadow-lg shadow-indigo-500/20 scale-105'
                : 'ios-glass-pill text-slate-300 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}

        <button
          onClick={() => loadData(language)}
          className="p-2 rounded-2xl ios-glass-pill text-slate-400 hover:text-white ml-auto"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* SECTION 1: Trending Now Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Flame className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Trending Lossless Hits</h2>
              <p className="text-xs text-slate-400">Streamed directly in 320 kbps high-fidelity</p>
            </div>
          </div>

          <button
            onClick={handlePlayAllTrending}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            <span>Play All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="p-3 rounded-[24px] ios-glass-card space-y-3 animate-pulse">
                <div className="aspect-square w-full rounded-[18px] bg-white/10" />
                <div className="h-4 bg-white/10 rounded-md w-3/4" />
                <div className="h-3 bg-white/5 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : trendingSongs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trendingSongs.map((song) => (
              <SongCard key={song.id} song={song} playlistContext={trendingSongs} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 ios-glass rounded-3xl">
            <Music className="w-8 h-8 mx-auto mb-2 text-slate-500" />
            <p className="text-sm">No trending songs found in this category.</p>
          </div>
        )}
      </section>

      {/* SECTION 2: Top Charts & Playlists */}
      {charts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Disc3 className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Top Charts & Playlists</h2>
              <p className="text-xs text-slate-400">Weekly rankings, viral hits, and editor collections</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {charts.map((chart) => {
              const coverUrl =
                chart.image?.[2]?.url ||
                chart.image?.[1]?.url ||
                chart.image?.[0]?.url ||
                'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80';
              return (
                <div
                  key={chart.id}
                  onClick={() => onOpenPlaylist(chart)}
                  className="group p-3 rounded-[24px] ios-glass-card cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-white/30 flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full rounded-[18px] overflow-hidden shadow-md bg-white/5">
                    <img
                      src={coverUrl}
                      alt={chart.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/15 pointer-events-none" />
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                      {chart.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {chart.songCount} Tracks
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: Featured Artists Showcase */}
      {topArtists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
              <Mic2 className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Popular Artists</h2>
              <p className="text-xs text-slate-400">Explore top tracks and albums from iconic singers</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
            {topArtists.map((artist) => {
              const coverUrl =
                artist.image?.[2]?.url ||
                artist.image?.[1]?.url ||
                artist.image?.[0]?.url ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';
              return (
                <div
                  key={artist.id}
                  onClick={() => onOpenArtist(artist)}
                  className="group flex flex-col items-center text-center cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-xl border-2 border-white/20 group-hover:border-indigo-400/60 group-hover:scale-105 transition-all duration-300">
                    <img
                      src={coverUrl}
                      alt={artist.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-2 truncate w-full group-hover:text-indigo-300 transition-colors">
                    {artist.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate w-full">{artist.role || 'Artist'}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 4: Quick Top Songs Feed */}
      {trendingSongs.length > 6 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Quick Stream Playlist</h2>
            <span className="text-xs text-slate-400">Click to listen instantly</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {trendingSongs.slice(0, 10).map((song, idx) => (
              <SongRow
                key={`home-row-${song.id}-${idx}`}
                song={song}
                index={idx}
                playlistContext={trendingSongs}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
