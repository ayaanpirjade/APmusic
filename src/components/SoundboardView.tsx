import React, { useState, useRef } from 'react';
import {
  Volume2,
  Search,
  Plus,
  Heart,
  MoreVertical,
  Sliders,
  Sparkles,
  Zap,
  Mic,
  Upload,
  Check,
  X,
  Play,
  Share2,
  Trash2,
  Edit2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoundPad, SoundCategory } from '../types';
import { soundEngine } from '../services/soundboardAudio';

const INITIAL_PADS: SoundPad[] = [
  {
    id: 'bruh',
    name: 'BRUH',
    category: 'memes',
    icon: '🗿',
    duration: '00:01',
    color: 'from-blue-500/30 to-indigo-600/35 border-blue-500/40 text-blue-300',
    textColor: 'text-blue-300',
    soundType: 'bruh',
    isFavorite: true,
  },
  {
    id: 'oof',
    name: 'OOF',
    category: 'memes',
    icon: '🥴',
    duration: '00:01',
    color: 'from-purple-500/30 to-pink-600/35 border-purple-500/40 text-purple-300',
    textColor: 'text-purple-300',
    soundType: 'oof',
    isFavorite: true,
  },
  {
    id: 'boom',
    name: 'BOOM',
    category: 'effects',
    icon: '💥',
    duration: '00:02',
    color: 'from-rose-500/30 to-orange-600/35 border-rose-500/40 text-rose-300',
    textColor: 'text-rose-300',
    soundType: 'boom',
    isFavorite: true,
  },
  {
    id: 'clap',
    name: 'CLAP',
    category: 'reactions',
    icon: '👏',
    duration: '00:01',
    color: 'from-sky-500/30 to-blue-600/35 border-sky-500/40 text-sky-300',
    textColor: 'text-sky-300',
    soundType: 'clap',
  },
  {
    id: 'laugh',
    name: 'LAUGH',
    category: 'reactions',
    icon: '😂',
    duration: '00:02',
    color: 'from-amber-500/30 to-yellow-600/35 border-amber-500/40 text-amber-300',
    textColor: 'text-amber-300',
    soundType: 'laugh',
    isFavorite: true,
  },
  {
    id: 'wow',
    name: 'WOW',
    category: 'reactions',
    icon: '😮',
    duration: '00:01',
    color: 'from-orange-500/30 to-red-600/35 border-orange-500/40 text-orange-300',
    textColor: 'text-orange-300',
    soundType: 'wow',
  },
  {
    id: 'sus',
    name: 'SUS',
    category: 'gaming',
    icon: 'ඞ',
    duration: '00:01',
    color: 'from-cyan-500/30 to-blue-600/35 border-cyan-500/40 text-cyan-300',
    textColor: 'text-cyan-300',
    soundType: 'sus',
    isFavorite: true,
  },
  {
    id: 'hey',
    name: 'HEY!',
    category: 'voices',
    icon: '🙋',
    duration: '00:01',
    color: 'from-violet-500/30 to-purple-600/35 border-violet-500/40 text-violet-300',
    textColor: 'text-violet-300',
    soundType: 'hey',
  },
  {
    id: 'alert',
    name: 'ALERT',
    category: 'notifications',
    icon: '⚠️',
    duration: '00:02',
    color: 'from-red-500/30 to-rose-600/35 border-red-500/40 text-red-300',
    textColor: 'text-red-300',
    soundType: 'alert',
  },
  {
    id: 'applause',
    name: 'APPLAUSE',
    category: 'reactions',
    icon: '🎉',
    duration: '00:03',
    color: 'from-fuchsia-500/30 to-pink-600/35 border-fuchsia-500/40 text-fuchsia-300',
    textColor: 'text-fuchsia-300',
    soundType: 'applause',
  },
  {
    id: 'drumroll',
    name: 'DRUM ROLL',
    category: 'instruments',
    icon: '🥁',
    duration: '00:03',
    color: 'from-indigo-500/30 to-blue-600/35 border-indigo-500/40 text-indigo-300',
    textColor: 'text-indigo-300',
    soundType: 'drumroll',
  },
  {
    id: 'cash',
    name: 'CASH',
    category: 'effects',
    icon: '🤑',
    duration: '00:02',
    color: 'from-emerald-500/30 to-green-600/35 border-emerald-500/40 text-emerald-300',
    textColor: 'text-emerald-300',
    soundType: 'cash',
  },
];

const CATEGORIES: Array<{ id: SoundCategory; label: string; icon: string }> = [
  { id: 'all', label: 'All Sounds', icon: '🔥' },
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
  { id: 'memes', label: 'Memes', icon: '🗿' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'effects', label: 'FX & Beats', icon: '💥' },
  { id: 'reactions', label: 'Reactions', icon: '👏' },
  { id: 'voices', label: 'Voices', icon: '🗣️' },
  { id: 'instruments', label: 'Instruments', icon: '🥁' },
];

export const SoundboardView: React.FC = () => {
  const [pads, setPads] = useState<SoundPad[]>(() => {
    try {
      const saved = localStorage.getItem('apmusic_soundpads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PADS;
  });

  const [activeCategory, setActiveCategory] = useState<SoundCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingPads, setPlayingPads] = useState<Record<string, boolean>>({});
  const [actionMenuPad, setActionMenuPad] = useState<SoundPad | null>(null);
  const [editingPad, setEditingPad] = useState<SoundPad | null>(null);
  const [editName, setEditName] = useState('');

  const savePads = (newPads: SoundPad[]) => {
    setPads(newPads);
    try {
      localStorage.setItem('apmusic_soundpads', JSON.stringify(newPads));
    } catch {}
  };

  const handlePlaySound = (pad: SoundPad) => {
    // Trigger visual state
    setPlayingPads((prev) => ({ ...prev, [pad.id]: true }));
    soundEngine.playSound(pad.soundType || 'bruh');

    setTimeout(() => {
      setPlayingPads((prev) => ({ ...prev, [pad.id]: false }));
    }, 1300);
  };

  const toggleFavorite = (padId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = pads.map((p) =>
      p.id === padId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    savePads(updated);
  };

  const handleShareSound = (pad: SoundPad, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(`APmusic Soundboard: ${pad.name} ${pad.icon}`);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#06b6d4', '#ec4899'],
    });
    setActionMenuPad(null);
  };

  const handleSaveEdit = () => {
    if (!editingPad || !editName.trim()) return;
    const updated = pads.map((p) =>
      p.id === editingPad.id ? { ...p, name: editName.trim().toUpperCase() } : p
    );
    savePads(updated);
    setEditingPad(null);
  };

  const filteredPads = pads.filter((pad) => {
    const matchesSearch = pad.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'favorites') return pad.isFavorite;
    return pad.category === activeCategory;
  });

  const favoritesCount = pads.filter((p) => p.isFavorite).length;

  return (
    <div className="space-y-6 pb-36 pt-1 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              Live Soundboard & FX
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Instant sample pads, meme sound effects, and spatial audio triggers
          </p>
        </div>

        {/* Search bar inside soundboard */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sound pads..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-card border border-white/15 text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/50 scale-105'
                  : 'glass-pill text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {cat.id === 'favorites' && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                  {favoritesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Soundboard Grid (Optimized for Android Touch & Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredPads.map((pad) => {
          const isPlaying = !!playingPads[pad.id];
          return (
            <div
              key={pad.id}
              onClick={() => handlePlaySound(pad)}
              className={`group relative flex flex-col items-center justify-between p-4 rounded-[26px] glass-card border cursor-pointer transition-all duration-200 active:scale-95 text-center overflow-hidden min-h-[160px] ${
                isPlaying
                  ? 'bg-gradient-to-tr from-purple-600/50 via-indigo-600/40 to-cyan-500/30 border-purple-400/90 shadow-2xl shadow-purple-950/80 ring-2 ring-purple-400/50 scale-[1.04]'
                  : 'border-white/10 hover:border-white/25 hover:scale-[1.02]'
              }`}
            >
              {/* Dynamic Glow Overlay when active */}
              {isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-cyan-400/10 to-transparent pointer-events-none animate-pulse" />
              )}

              {/* Top Row: Favorite Icon & Actions Menu */}
              <div className="relative z-10 w-full flex items-center justify-between">
                <button
                  onClick={(e) => toggleFavorite(pad.id, e)}
                  className={`p-1.5 rounded-lg hover:bg-white/10 transition-all ${
                    pad.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-white'
                  }`}
                  title={pad.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Heart className={`w-3.5 h-3.5 ${pad.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionMenuPad(pad);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Large Glowing Icon */}
              <div className="relative z-10 my-1">
                <span className="text-4xl sm:text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform block">
                  {pad.icon}
                </span>
              </div>

              {/* Sound Name & Duration: 🔊 BRUH / 00:01 */}
              <div className="relative z-10 w-full">
                <div className="flex items-center justify-center gap-1">
                  <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-300 animate-bounce' : 'text-purple-400'}`} />
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider truncate">
                    {pad.name}
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 block">
                  {pad.duration}
                </span>

                {/* Animated Waveform: ╱╲╱╲╱╲ */}
                <div className="flex items-center justify-center gap-1 mt-2 h-3">
                  {[4, 10, 16, 8, 14, 6].map((h, idx) => (
                    <span
                      key={idx}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? 'bg-gradient-to-t from-purple-400 via-indigo-400 to-cyan-300 animate-pulse'
                          : 'bg-white/15'
                      }`}
                      style={{ height: isPlaying ? `${h}px` : '4px' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Drawer Modal */}
      {actionMenuPad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl glass-floating border border-white/20 p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{actionMenuPad.icon}</span>
                <h3 className="text-sm font-black text-white">{actionMenuPad.name}</h3>
              </div>
              <button onClick={() => setActionMenuPad(null)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                toggleFavorite(actionMenuPad.id);
                setActionMenuPad(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              <Heart className={`w-4 h-4 ${actionMenuPad.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              <span>{actionMenuPad.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>

            <button
              onClick={() => {
                setEditingPad(actionMenuPad);
                setEditName(actionMenuPad.name);
                setActionMenuPad(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              <Edit2 className="w-4 h-4 text-indigo-400" />
              <span>Rename Pad</span>
            </button>

            <button
              onClick={(e) => handleShareSound(actionMenuPad, e)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span>Share Sound</span>
            </button>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {editingPad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xs rounded-3xl glass-floating border border-white/20 p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-white">Rename Sound Pad</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setEditingPad(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
