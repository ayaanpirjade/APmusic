import React, { useState } from 'react';
import { X, Sparkles, Wand2, Play, Music, Flame, Coffee, Moon, Dumbbell, Compass, Loader2 } from 'lucide-react';
import { AIDJMix, Song } from '../types';
import { api } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { SongRow } from './SongRow';

interface AIDJModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDJModal: React.FC<AIDJModalProps> = ({ isOpen, onClose }) => {
  const { currentSong, playSong } = useAudio();

  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mixResult, setMixResult] = useState<AIDJMix | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const vibeChips = [
    { label: 'Late Night Lo-Fi Drive', icon: Moon },
    { label: 'Gym Energy Punjabi Beast', icon: Dumbbell },
    { label: 'Monsoon Acoustic Chai Vibes', icon: Coffee },
    { label: '90s Nostalgic Bollywood Melody', icon: Music },
    { label: 'Modern High-BPM EDM Festival', icon: Flame },
    { label: 'Deep Focus & Ambient Flow', icon: Compass },
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) return;

    setIsLoading(true);
    setError(null);
    setMixResult(null);

    try {
      const data = await api.generateAIDJMix(
        textToUse,
        currentSong ? `${currentSong.name} by ${currentSong.primaryArtists}` : undefined
      );
      setMixResult(data);
    } catch (err: any) {
      console.error('AI DJ generation error:', err);
      setError(err.message || 'Failed to craft AI DJ mix. Please try another mood.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayMix = () => {
    if (mixResult && mixResult.songs.length > 0) {
      playSong(mixResult.songs[0], mixResult.songs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-[36px] ios-glass-card border border-white/30 p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-purple-500/20 blur-[90px] pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">APMUSIC AI DJ</h2>
              <p className="text-xs text-slate-300">Powered by Gemini Intelligent Music Curation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-none">
          {/* Prompt Input Form */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300">Describe your vibe or mood:</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Melancholic rainy day indie and soulful acoustic ballads..."
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl ios-glass-card border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 text-sm font-medium shadow-inner"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !prompt.trim()}
                className="absolute right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md transition-all"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Mood Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Instant Moods</span>
            <div className="flex flex-wrap gap-2">
              {vibeChips.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    onClick={() => {
                      setPrompt(chip.label);
                      handleGenerate(chip.label);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl ios-glass-pill hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-transform hover:scale-105"
                  >
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-300">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm font-semibold">Curating lossless tracks for your vibe...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Generated DJ Mix Output */}
          {mixResult && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-300">
              {/* Mix Title & DJ Intro */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-400/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white">{mixResult.vibeTitle}</h3>
                  <button
                    onClick={handlePlayMix}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:scale-105 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Play AI Mix</span>
                  </button>
                </div>

                <p className="text-xs text-indigo-200 italic font-medium">"{mixResult.djIntro}"</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mixResult.tags?.map((t, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resolved Songs List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Curated Tracklist ({mixResult.songs.length})</h4>
                {mixResult.songs.map((song, idx) => (
                  <SongRow
                    key={`ai-song-${song.id}-${idx}`}
                    song={song}
                    index={idx}
                    playlistContext={mixResult.songs}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
