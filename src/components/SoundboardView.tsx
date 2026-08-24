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
} from 'lucide-react';
import { SoundPad, SoundCategory } from '../types';
import { soundEngine } from '../services/soundboardAudio';

const INITIAL_PADS: SoundPad[] = [
  {
    id: 'bruh',
    name: 'Bruh',
    category: 'memes',
    icon: '🗿',
    duration: '00:01',
    color: 'from-blue-500/25 to-indigo-600/30 border-blue-500/30 text-blue-300',
    textColor: 'text-blue-300',
    soundType: 'bruh',
  },
  {
    id: 'oof',
    name: 'Oof',
    category: 'memes',
    icon: '🥴',
    duration: '00:01',
    color: 'from-purple-500/25 to-pink-600/30 border-purple-500/30 text-purple-300',
    textColor: 'text-purple-300',
    soundType: 'oof',
  },
  {
    id: 'boom',
    name: 'Boom',
    category: 'effects',
    icon: '💥',
    duration: '00:02',
    color: 'from-rose-500/25 to-orange-600/30 border-rose-500/30 text-rose-300',
    textColor: 'text-rose-300',
    soundType: 'boom',
  },
  {
    id: 'clap',
    name: 'Clap',
    category: 'reactions',
    icon: '👏',
    duration: '00:01',
    color: 'from-sky-500/25 to-blue-600/30 border-sky-500/30 text-sky-300',
    textColor: 'text-sky-300',
    soundType: 'clap',
  },
  {
    id: 'laugh',
    name: 'Laugh',
    category: 'reactions',
    icon: '😂',
    duration: '00:02',
    color: 'from-amber-500/25 to-yellow-600/30 border-amber-500/30 text-amber-300',
    textColor: 'text-amber-300',
    soundType: 'laugh',
  },
  {
    id: 'wow',
    name: 'Wow',
    category: 'reactions',
    icon: '😮',
    duration: '00:01',
    color: 'from-orange-500/25 to-red-600/30 border-orange-500/30 text-orange-300',
    textColor: 'text-orange-300',
    soundType: 'wow',
  },
  {
    id: 'sus',
    name: 'Sus',
    category: 'gaming',
    icon: 'ඞ',
    duration: '00:01',
    color: 'from-cyan-500/25 to-blue-600/30 border-cyan-500/30 text-cyan-300',
    textColor: 'text-cyan-300',
    soundType: 'sus',
  },
  {
    id: 'hey',
    name: 'Hey!',
    category: 'voices',
    icon: '🙋',
    duration: '00:01',
    color: 'from-violet-500/25 to-purple-600/30 border-violet-500/30 text-violet-300',
    textColor: 'text-violet-300',
    soundType: 'hey',
  },
  {
    id: 'alert',
    name: 'Alert',
    category: 'notifications',
    icon: '⚠️',
    duration: '00:02',
    color: 'from-red-500/25 to-rose-600/30 border-red-500/30 text-red-300',
    textColor: 'text-red-300',
    soundType: 'alert',
  },
  {
    id: 'applause',
    name: 'Applause',
    category: 'reactions',
    icon: '🎉',
    duration: '00:03',
    color: 'from-fuchsia-500/25 to-pink-600/30 border-fuchsia-500/30 text-fuchsia-300',
    textColor: 'text-fuchsia-300',
    soundType: 'applause',
  },
  {
    id: 'drumroll',
    name: 'Drum Roll',
    category: 'instruments',
    icon: '🥁',
    duration: '00:03',
    color: 'from-indigo-500/25 to-blue-600/30 border-indigo-500/30 text-indigo-300',
    textColor: 'text-indigo-300',
    soundType: 'drumroll',
  },
  {
    id: 'cash',
    name: 'Cash',
    category: 'effects',
    icon: '🤑',
    duration: '00:02',
    color: 'from-emerald-500/25 to-green-600/30 border-emerald-500/30 text-emerald-300',
    textColor: 'text-emerald-300',
    soundType: 'cash',
  },
  {
    id: 'airhorn',
    name: 'Airhorn',
    category: 'memes',
    icon: '📢',
    duration: '00:01',
    color: 'from-yellow-500/25 to-amber-600/30 border-yellow-500/30 text-yellow-300',
    textColor: 'text-yellow-300',
    soundType: 'airhorn',
  },
  {
    id: 'vineboom',
    name: 'Vine Boom',
    category: 'memes',
    icon: '🗿',
    duration: '00:01',
    color: 'from-slate-500/25 to-stone-600/30 border-slate-500/30 text-slate-300',
    textColor: 'text-slate-300',
    soundType: 'vineboom',
  },
  {
    id: 'levelup',
    name: 'Level Up',
    category: 'gaming',
    icon: '⭐',
    duration: '00:02',
    color: 'from-teal-500/25 to-emerald-600/30 border-teal-500/30 text-teal-300',
    textColor: 'text-teal-300',
    soundType: 'levelup',
  },
  {
    id: 'laser',
    name: 'Laser',
    category: 'gaming',
    icon: '🔫',
    duration: '00:01',
    color: 'from-lime-500/25 to-green-600/30 border-lime-500/30 text-lime-300',
    textColor: 'text-lime-300',
    soundType: 'laser',
  },
  {
    id: 'tada',
    name: 'Ta-Da!',
    category: 'notifications',
    icon: '🎺',
    duration: '00:02',
    color: 'from-amber-500/25 to-orange-600/30 border-amber-500/30 text-amber-300',
    textColor: 'text-amber-300',
    soundType: 'tada',
  },
];

const CATEGORIES: Array<{ id: SoundCategory; label: string; icon?: string }> = [
  { id: 'all', label: 'All' },
  { id: 'memes', label: 'Memes', icon: '😂' },
  { id: 'reactions', label: 'Reactions', icon: '🎭' },
  { id: 'effects', label: 'Effects', icon: '💥' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'instruments', label: 'Instruments', icon: '🥁' },
  { id: 'voices', label: 'Voices', icon: '🗣️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'favorites', label: 'Favorites', icon: '❤️' },
];

export const SoundboardView: React.FC = () => {
  const [pads, setPads] = useState<SoundPad[]>(() => {
    try {
      const saved = localStorage.getItem('apmusic_soundboard_pads');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PADS;
  });

  const [selectedCategory, setSelectedCategory] = useState<SoundCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customSoundName, setCustomSoundName] = useState('');
  const [customSoundEmoji, setCustomSoundEmoji] = useState('🔊');
  const [customSoundCategory, setCustomSoundCategory] = useState<SoundPad['category']>('memes');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Trigger sound effect
  const handlePlayPad = (pad: SoundPad) => {
    setActivePlayingId(pad.id);
    soundEngine.playSound(pad.soundType, pad.customAudioUrl);

    setTimeout(() => {
      setActivePlayingId((curr) => (curr === pad.id ? null : curr));
    }, 1200);
  };

  // Toggle favorite
  const toggleFavorite = (padId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPads((prev) => {
      const updated = prev.map((p) =>
        p.id === padId ? { ...p, isFavorite: !p.isFavorite } : p
      );
      try {
        localStorage.setItem('apmusic_soundboard_pads', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Handle Custom Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedAudioUrl(url);
      if (!customSoundName) {
        setCustomSoundName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Handle Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert('Microphone permission required for sound recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Save new sound pad
  const handleSaveCustomSound = () => {
    if (!customSoundName) return;

    const newPad: SoundPad = {
      id: `custom_${Date.now()}`,
      name: customSoundName,
      category: customSoundCategory,
      icon: customSoundEmoji || '🔊',
      duration: '00:02',
      color: 'from-purple-500/25 to-pink-600/30 border-purple-500/30 text-purple-300',
      textColor: 'text-purple-300',
      soundType: 'custom',
      customAudioUrl: recordedAudioUrl || undefined,
    };

    const updated = [newPad, ...pads];
    setPads(updated);
    try {
      localStorage.setItem('apmusic_soundboard_pads', JSON.stringify(updated));
    } catch {}

    setIsAddModalOpen(false);
    setCustomSoundName('');
    setRecordedAudioUrl(null);
  };

  // Filter pads
  const filteredPads = pads.filter((pad) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? pad.isFavorite
        : pad.category === selectedCategory;

    const matchesSearch =
      pad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pad.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Soundboard Header Matching Mockup */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
              Soundboard
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              DSP FX
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Instant punchy sound effects, memes, reactions, and custom audio pads
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add custom sound button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/40 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Sound</span>
          </button>
        </div>
      </div>

      {/* Glass Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sound effects, memes, reactions..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl ios-glass border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Categories Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-950/40 scale-105 border border-indigo-400/40'
                : 'ios-glass border-white/10 text-slate-300 hover:text-white hover:border-white/20'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Responsive Soundboard Pads Grid Matching Mockup */}
      {filteredPads.length === 0 ? (
        <div className="p-12 text-center ios-glass-card rounded-3xl border border-white/10 text-slate-400 space-y-3">
          <Volume2 className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
          <p className="text-sm font-semibold">No sounds found for "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-bold hover:bg-indigo-600/50"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredPads.map((pad) => {
            const isPlaying = activePlayingId === pad.id;
            return (
              <div
                key={pad.id}
                onClick={() => handlePlayPad(pad)}
                className={`relative group p-4 sm:p-5 rounded-3xl ios-glass-card border flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 select-none overflow-hidden ${
                  isPlaying
                    ? 'scale-95 border-indigo-400 shadow-xl shadow-indigo-500/30 ring-2 ring-indigo-400/50 bg-gradient-to-b from-indigo-500/30 to-purple-600/30'
                    : 'hover:border-white/25 hover:scale-[1.02] active:scale-95'
                }`}
                style={{
                  minHeight: '140px',
                }}
              >
                {/* Active Playing Waveform Overlay */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-indigo-500/15 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-7 bg-white rounded-full animate-bounce [animation-delay:0s]" />
                      <span className="w-1.5 h-4 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                    </div>
                  </div>
                )}

                {/* Top Favorite Toggle */}
                <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-[10px] opacity-70">{pad.duration}</span>
                  <button
                    onClick={(e) => toggleFavorite(pad.id, e)}
                    className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-pink-400 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        pad.isFavorite ? 'fill-pink-500 text-pink-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Pad Icon */}
                <div className="w-12 h-12 my-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                  <span>{pad.icon}</span>
                </div>

                {/* Pad Label */}
                <div className="w-full truncate">
                  <h3 className="font-bold text-sm text-white tracking-tight truncate">
                    {pad.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Sound Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] ios-glass-card border border-white/20 p-6 sm:p-8 space-y-5 text-white">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Add Custom Sound Pad</h3>
                <p className="text-xs text-slate-400">Record from mic or upload audio file</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Sound Name</label>
                <input
                  type="text"
                  value={customSoundName}
                  onChange={(e) => setCustomSoundName(e.target.value)}
                  placeholder="e.g. My Anime Voice, Victory Horn"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Emoji Icon</label>
                  <input
                    type="text"
                    value={customSoundEmoji}
                    onChange={(e) => setCustomSoundEmoji(e.target.value)}
                    maxLength={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-center text-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Category</label>
                  <select
                    value={customSoundCategory}
                    onChange={(e) => setCustomSoundCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white"
                  >
                    <option value="memes">Memes</option>
                    <option value="reactions">Reactions</option>
                    <option value="effects">Effects</option>
                    <option value="gaming">Gaming</option>
                    <option value="instruments">Instruments</option>
                    <option value="voices">Voices</option>
                    <option value="notifications">Notifications</option>
                  </select>
                </div>
              </div>

              {/* Audio Source: File Upload or Mic Recording */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-slate-300 font-semibold block">Audio Source</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 font-semibold"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Upload Audio</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="audio/*"
                    className="hidden"
                  />

                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="py-3 px-3 rounded-xl bg-red-500 text-white flex items-center justify-center gap-2 font-semibold animate-pulse"
                    >
                      <X className="w-4 h-4" />
                      <span>Stop Rec</span>
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 font-semibold"
                    >
                      <Mic className="w-4 h-4 text-pink-400" />
                      <span>Record Mic</span>
                    </button>
                  )}
                </div>

                {recordedAudioUrl && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Audio Ready
                    </span>
                    <button
                      onClick={() => {
                        const a = new Audio(recordedAudioUrl);
                        a.play();
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[10px] font-bold"
                    >
                      Preview
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomSound}
                disabled={!customSoundName}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-950/40"
              >
                Create Pad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
