// Dynamic Accent Color Extractor & Theme Mapping
export interface DynamicAccent {
  primary: string;
  glow: string;
  gradient: string;
  badge: string;
  border: string;
  text: string;
}

const ACCENT_PRESETS: DynamicAccent[] = [
  {
    primary: '#6366f1', // Indigo
    glow: 'rgba(99, 102, 241, 0.4)',
    gradient: 'from-indigo-600/35 via-purple-600/20 to-slate-950/90',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    border: 'border-indigo-500/40',
    text: 'text-indigo-400',
  },
  {
    primary: '#a855f7', // Purple
    glow: 'rgba(168, 85, 247, 0.4)',
    gradient: 'from-purple-600/35 via-pink-600/20 to-slate-950/90',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
  },
  {
    primary: '#ec4899', // Pink / Rose
    glow: 'rgba(236, 72, 153, 0.4)',
    gradient: 'from-pink-600/35 via-rose-600/20 to-slate-950/90',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    border: 'border-pink-500/40',
    text: 'text-pink-400',
  },
  {
    primary: '#06b6d4', // Cyan
    glow: 'rgba(6, 182, 212, 0.4)',
    gradient: 'from-cyan-600/35 via-blue-600/20 to-slate-950/90',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    border: 'border-cyan-500/40',
    text: 'text-cyan-400',
  },
  {
    primary: '#10b981', // Emerald
    glow: 'rgba(16, 185, 129, 0.4)',
    gradient: 'from-emerald-600/35 via-teal-600/20 to-slate-950/90',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
  },
  {
    primary: '#f59e0b', // Amber / Orange
    glow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'from-amber-600/35 via-orange-600/20 to-slate-950/90',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
  },
];

export function getAccentForTrack(title?: string, artist?: string): DynamicAccent {
  const seed = `${title || 'music'}_${artist || 'ap'}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % ACCENT_PRESETS.length;
  return ACCENT_PRESETS[index];
}
