import React, { useState } from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Zap,
  Headphones,
  Sparkles,
  Volume2,
  Bookmark,
  Check,
  Radio,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { TenBandEQ } from '../types';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_10_BAND: TenBandEQ = {
  hz31: 3,
  hz62: 5,
  hz125: 2,
  hz250: -1,
  hz500: 4,
  hz1k: 7,
  hz2k: 2,
  hz4k: 6,
  hz8k: 8,
  hz16k: 4,
  preamp: 0,
  bassBoost: 40,
  virtualizer: 30,
  loudness: 20,
  reverb: 15,
  compressor: true,
  enabled: true,
  preset: 'Custom',
};

const EQ_PRESETS: Record<string, Partial<TenBandEQ>> = {
  Custom: {
    hz31: 4, hz62: 6, hz125: 2, hz250: 0, hz500: 5, hz1k: 8, hz2k: 3, hz4k: 6, hz8k: 7, hz16k: 3,
  },
  'Bass Boost': {
    hz31: 10, hz62: 9, hz125: 7, hz250: 4, hz500: 1, hz1k: 0, hz2k: 0, hz4k: 2, hz8k: 4, hz16k: 3,
    bassBoost: 85,
  },
  Classical: {
    hz31: 4, hz62: 3, hz125: 2, hz250: 1, hz500: -1, hz1k: -1, hz2k: 0, hz4k: 3, hz8k: 5, hz16k: 4,
    reverb: 40,
  },
  Pop: {
    hz31: -1, hz62: 2, hz125: 4, hz250: 5, hz500: 4, hz1k: 2, hz2k: -1, hz4k: 2, hz8k: 4, hz16k: 5,
    virtualizer: 45,
  },
  Rock: {
    hz31: 6, hz62: 4, hz125: 2, hz250: -1, hz500: -2, hz1k: 1, hz2k: 3, hz4k: 5, hz8k: 6, hz16k: 7,
    bassBoost: 50,
  },
  'Hip-Hop': {
    hz31: 9, hz62: 8, hz125: 4, hz250: 1, hz500: -1, hz1k: 2, hz2k: 2, hz4k: 4, hz8k: 6, hz16k: 4,
    bassBoost: 70,
  },
  EDM: {
    hz31: 8, hz62: 7, hz125: 5, hz250: 0, hz500: 2, hz1k: 4, hz2k: 5, hz4k: 7, hz8k: 8, hz16k: 9,
    virtualizer: 60,
  },
  Vocal: {
    hz31: -3, hz62: -2, hz125: 0, hz250: 2, hz500: 6, hz1k: 8, hz2k: 7, hz4k: 5, hz8k: 3, hz16k: 1,
  },
  Flat: {
    hz31: 0, hz62: 0, hz125: 0, hz250: 0, hz500: 0, hz1k: 0, hz2k: 0, hz4k: 0, hz8k: 0, hz16k: 0,
    bassBoost: 0, virtualizer: 0,
  },
};

const BANDS_LIST: Array<{ key: keyof TenBandEQ; label: string }> = [
  { key: 'hz31', label: '31' },
  { key: 'hz62', label: '62' },
  { key: 'hz125', label: '125' },
  { key: 'hz250', label: '250' },
  { key: 'hz500', label: '500' },
  { key: 'hz1k', label: '1k' },
  { key: 'hz2k', label: '2k' },
  { key: 'hz4k', label: '4k' },
  { key: 'hz8k', label: '8k' },
  { key: 'hz16k', label: '16k' },
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const { setEqualizerBand, setBassBoost } = useAudio();

  const [eqState, setEqState] = useState<TenBandEQ>(() => {
    try {
      const saved = localStorage.getItem('apmusic_10band_eq');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_10_BAND;
  });

  const [customPresets, setCustomPresets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apmusic_custom_presets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  if (!isOpen) return null;

  const updateEqValue = (key: keyof TenBandEQ, val: any) => {
    const updated = { ...eqState, [key]: val, preset: 'Custom' };
    setEqState(updated);
    try {
      localStorage.setItem('apmusic_10band_eq', JSON.stringify(updated));
    } catch {}

    // Map to audio context
    if (key === 'hz62' || key === 'hz31') setEqualizerBand('bass', Number(val));
    if (key === 'hz250' || key === 'hz125') setEqualizerBand('lowMid', Number(val));
    if (key === 'hz500' || key === 'hz1k') setEqualizerBand('mid', Number(val));
    if (key === 'hz4k' || key === 'hz2k') setEqualizerBand('highMid', Number(val));
    if (key === 'hz16k' || key === 'hz8k') setEqualizerBand('treble', Number(val));
    if (key === 'bassBoost') setBassBoost(Number(val));
  };

  const applyPreset = (presetName: string) => {
    const presetValues = EQ_PRESETS[presetName];
    if (presetValues) {
      const updated: TenBandEQ = {
        ...eqState,
        ...presetValues,
        preset: presetName,
      };
      setEqState(updated);
      try {
        localStorage.setItem('apmusic_10band_eq', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleSavePreset = () => {
    if (!newPresetName) return;
    EQ_PRESETS[newPresetName] = { ...eqState };
    const updatedList = [...customPresets, newPresetName];
    setCustomPresets(updatedList);
    try {
      localStorage.setItem('apmusic_custom_presets', JSON.stringify(updatedList));
    } catch {}
    setEqState((prev) => ({ ...prev, preset: newPresetName }));
    setNewPresetName('');
    setShowSaveModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl rounded-[32px] ios-glass-card border border-white/20 p-5 sm:p-7 flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Specular Neon Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-500/20 blur-[90px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none" />

        {/* 1. Header with Master ON/OFF Switch matching Mockup */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight font-['Outfit']">
                Equalizer
              </h2>
              <p className="text-xs text-indigo-300">10-Band Studio Hardware Curve</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Master Toggle Switch */}
            <button
              onClick={() => updateEqValue('enabled', !eqState.enabled)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                eqState.enabled ? 'bg-purple-600 shadow-md shadow-purple-600/50' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  eqState.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Preset Chips Row matching Mockup */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {Object.keys(EQ_PRESETS).map((pName) => {
            const isActive = eqState.preset === pName;
            return (
              <button
                key={pName}
                onClick={() => applyPreset(pName)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50 scale-105 border border-purple-400/40'
                    : 'ios-glass border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                {pName}
              </button>
            );
          })}
        </div>

        {/* 3. 10-Band EQ Vertical Sliders Matrix matching Mockup */}
        <div className="relative p-4 rounded-3xl ios-glass-card border border-white/10 my-2">
          {/* dB Scale Labels */}
          <div className="absolute left-3 top-4 bottom-8 flex flex-col justify-between text-[9px] font-mono text-slate-400 font-bold pointer-events-none">
            <span>+12db</span>
            <span>0db</span>
            <span>-12db</span>
          </div>

          <div className="grid grid-cols-10 gap-1 sm:gap-2 pl-8 sm:pl-9 pr-1">
            {BANDS_LIST.map((band) => {
              const val = (eqState as any)[band.key] ?? 0;
              // Map -12..+12 to percent
              const percent = ((val + 12) / 24) * 100;

              return (
                <div key={band.key} className="flex flex-col items-center gap-2">
                  <div className="relative h-44 sm:h-52 w-full flex items-center justify-center">
                    {/* Vertical Track Line */}
                    <div className="absolute w-[3px] h-full bg-white/15 rounded-full" />

                    {/* Active Gradient Fill from 0dB center */}
                    <div
                      className="absolute w-[3px] bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full pointer-events-none"
                      style={{
                        bottom: val >= 0 ? '50%' : `${percent}%`,
                        height: `${Math.abs(val) * (100 / 24)}%`,
                      }}
                    />

                    {/* Glowing Circular Glass Thumb dot matching mockup */}
                    <div
                      className="absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 border border-white shadow-lg shadow-purple-500/80 pointer-events-none transition-all duration-75"
                      style={{
                        bottom: `calc(${percent}% - 10px)`,
                      }}
                    />

                    {/* Hidden Range Input */}
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={val}
                      onChange={(e) => updateEqValue(band.key, Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [writing-mode:vertical-lr] [direction:rtl]"
                    />
                  </div>

                  {/* Frequency Label */}
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-white">
                    {band.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. DSP Studio Rotary/Sliders: Bass Boost, Virtualizer, Loudness, Reverb */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          {/* Preamp */}
          <div className="p-3 rounded-2xl ios-glass border border-white/10 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-300">Preamp</span>
              <span className="text-indigo-300">{eqState.preamp} dB</span>
            </div>
            <input
              type="range"
              min={-6}
              max={6}
              value={eqState.preamp}
              onChange={(e) => updateEqValue('preamp', Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Bass Boost */}
          <div className="p-3 rounded-2xl ios-glass border border-white/10 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-300">Bass Boost</span>
              <span className="text-purple-300">{eqState.bassBoost}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={eqState.bassBoost}
              onChange={(e) => updateEqValue('bassBoost', Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Virtualizer 3D */}
          <div className="p-3 rounded-2xl ios-glass border border-white/10 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-300">Virtualizer 3D</span>
              <span className="text-cyan-300">{eqState.virtualizer}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={eqState.virtualizer}
              onChange={(e) => updateEqValue('virtualizer', Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Loudness Enhancer */}
          <div className="p-3 rounded-2xl ios-glass border border-white/10 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-300">Loudness</span>
              <span className="text-pink-300">{eqState.loudness}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={eqState.loudness}
              onChange={(e) => updateEqValue('loudness', Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg accent-pink-400 cursor-pointer"
            />
          </div>
        </div>

        {/* 5. Save Custom Preset Button */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10">
          <button
            onClick={() => {
              applyPreset('Flat');
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Curve</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-bold transition-all"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save Custom Preset</span>
          </button>
        </div>

        {/* Save Preset Dialog */}
        {showSaveModal && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-20">
            <div className="w-full max-w-xs p-5 rounded-2xl ios-glass-card border border-white/20 space-y-4">
              <h4 className="font-bold text-sm">Save Current Preset</h4>
              <input
                type="text"
                placeholder="e.g. My Bass Master"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={!newPresetName}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
