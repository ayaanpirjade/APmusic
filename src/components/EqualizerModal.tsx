import React, { useState, useEffect } from 'react';
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
  Disc3,
  Activity,
  Save,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EQBandSetting {
  hz60: number;
  hz150: number;
  hz400: number;
  hz1k: number;
  hz2_5k: number;
  hz6k: number;
  hz15k: number;
  bassBoost: number;
  spatialAudio: boolean;
  visualizerEnabled: boolean;
  preset: string;
}

const DEFAULT_EQ_STATE: EQBandSetting = {
  hz60: 4,
  hz150: 2,
  hz400: 0,
  hz1k: 3,
  hz2_5k: 5,
  hz6k: 4,
  hz15k: 2,
  bassBoost: 35,
  spatialAudio: true,
  visualizerEnabled: true,
  preset: 'Pop',
};

const EQ_PRESETS: Record<string, Partial<EQBandSetting>> = {
  Flat: {
    hz60: 0, hz150: 0, hz400: 0, hz1k: 0, hz2_5k: 0, hz6k: 0, hz15k: 0,
    bassBoost: 0, spatialAudio: false,
  },
  Pop: {
    hz60: 3, hz150: 2, hz400: 0, hz1k: 2, hz2_5k: 4, hz6k: 3, hz15k: 2,
    bassBoost: 30, spatialAudio: true,
  },
  Rock: {
    hz60: 6, hz150: 4, hz400: -1, hz1k: 1, hz2_5k: 3, hz6k: 5, hz15k: 6,
    bassBoost: 45, spatialAudio: true,
  },
  EDM: {
    hz60: 8, hz150: 6, hz400: 1, hz1k: 3, hz2_5k: 5, hz6k: 7, hz15k: 8,
    bassBoost: 75, spatialAudio: true,
  },
  'Bass Boost': {
    hz60: 10, hz150: 8, hz400: 4, hz1k: 0, hz2_5k: 1, hz6k: 3, hz15k: 2,
    bassBoost: 90, spatialAudio: true,
  },
  Vocal: {
    hz60: -2, hz150: 0, hz400: 3, hz1k: 6, hz2_5k: 7, hz6k: 4, hz15k: 1,
    bassBoost: 15, spatialAudio: true,
  },
  Acoustic: {
    hz60: 2, hz150: 3, hz400: 2, hz1k: 1, hz2_5k: 4, hz6k: 5, hz15k: 4,
    bassBoost: 20, spatialAudio: true,
  },
  Jazz: {
    hz60: 4, hz150: 2, hz400: 1, hz1k: 2, hz2_5k: 3, hz6k: 3, hz15k: 4,
    bassBoost: 25, spatialAudio: true,
  },
};

const BANDS = [
  { key: 'hz60', label: '60' },
  { key: 'hz150', label: '150' },
  { key: 'hz400', label: '400' },
  { key: 'hz1k', label: '1k' },
  { key: 'hz2_5k', label: '2.5k' },
  { key: 'hz6k', label: '6k' },
  { key: 'hz15k', label: '15k' },
] as const;

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const { setEqualizerBand, setBassBoost, toggleSpatialAudio } = useAudio();

  const [eqState, setEqState] = useState<EQBandSetting>(() => {
    try {
      const saved = localStorage.getItem('apmusic_studio_eq');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_EQ_STATE;
  });

  const [savedPresets, setSavedPresets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apmusic_user_presets');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [newPresetName, setNewPresetName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  if (!isOpen) return null;

  const updateBand = (key: keyof EQBandSetting, val: any) => {
    const updated = { ...eqState, [key]: val, preset: 'Custom' };
    setEqState(updated);
    try {
      localStorage.setItem('apmusic_studio_eq', JSON.stringify(updated));
    } catch {}

    // Map to audio DSP
    if (key === 'hz60' || key === 'hz150') setEqualizerBand('bass', Number(val));
    if (key === 'hz400') setEqualizerBand('lowMid', Number(val));
    if (key === 'hz1k' || key === 'hz2_5k') setEqualizerBand('mid', Number(val));
    if (key === 'hz6k') setEqualizerBand('highMid', Number(val));
    if (key === 'hz15k') setEqualizerBand('treble', Number(val));
    if (key === 'bassBoost') setBassBoost(Number(val));
  };

  const applyPreset = (presetName: string) => {
    const presetValues = EQ_PRESETS[presetName];
    if (presetValues) {
      const updated = {
        ...eqState,
        ...presetValues,
        preset: presetName,
      };
      setEqState(updated);
      try {
        localStorage.setItem('apmusic_studio_eq', JSON.stringify(updated));
      } catch {}

      if (updated.hz60 !== undefined) setEqualizerBand('bass', updated.hz60);
      if (updated.hz400 !== undefined) setEqualizerBand('lowMid', updated.hz400);
      if (updated.hz1k !== undefined) setEqualizerBand('mid', updated.hz1k);
      if (updated.hz6k !== undefined) setEqualizerBand('highMid', updated.hz6k);
      if (updated.hz15k !== undefined) setEqualizerBand('treble', updated.hz15k);
      if (updated.bassBoost !== undefined) setBassBoost(updated.bassBoost);
    }
  };

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const name = newPresetName.trim();
    if (!savedPresets.includes(name)) {
      const updatedList = [...savedPresets, name];
      setSavedPresets(updatedList);
      localStorage.setItem('apmusic_user_presets', JSON.stringify(updatedList));
    }
    setEqState((prev) => ({ ...prev, preset: name }));
    setShowSaveModal(false);
    setNewPresetName('');
  };

  const resetToFlat = () => {
    applyPreset('Flat');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in select-none">
      <div className="w-full max-w-lg rounded-[32px] glass-floating border border-white/25 p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header: AP Studio EQ */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/60">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                AP Studio EQ
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Hardware 7-Band DSP Acoustic Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToFlat}
              className="p-2 rounded-xl glass-pill hover:bg-white/20 text-slate-400 hover:text-white transition-all"
              title="Reset to Flat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-pill hover:bg-white/20 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presets Bar: Flat Pop Rock EDM Bass Vocal Acoustic Jazz */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Acoustic Presets
            </span>
            <button
              onClick={() => setShowSaveModal(true)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preset</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(EQ_PRESETS).map((pName) => {
              const isActive = eqState.preset === pName;
              return (
                <button
                  key={pName}
                  onClick={() => applyPreset(pName)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/40 scale-105 border border-indigo-400/40'
                      : 'glass-pill text-slate-300 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {pName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual 7-Band Visual EQ with Decibel Scale (+12dB ... 0 ... -12dB) */}
        <div className="p-4 rounded-3xl glass-card border border-white/15 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1 border-b border-white/10 pb-2">
            <span>+12 dB</span>
            <span className="text-indigo-300 font-bold">0 dB</span>
            <span>-12 dB</span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end justify-items-center h-44 pt-2">
            {BANDS.map((band) => {
              const currentVal = Number(eqState[band.key as keyof EQBandSetting]) || 0;
              return (
                <div key={band.key} className="flex flex-col items-center justify-between h-full w-full">
                  <span className="text-[10px] font-mono font-bold text-indigo-300">
                    {currentVal > 0 ? `+${currentVal}` : currentVal}
                  </span>

                  <div className="relative h-28 flex items-center justify-center my-1">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={currentVal}
                      onChange={(e) => updateBand(band.key as keyof EQBandSetting, Number(e.target.value))}
                      className="w-28 h-2 appearance-none -rotate-90 bg-white/15 rounded-full cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <span className="text-[11px] font-bold text-slate-300 mt-1">
                    {band.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhancers: Bass Boost | Spatial Audio | Visualizer */}
        <div className="space-y-4 pt-1">
          {/* Bass Boost */}
          <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Bass Boost
              </span>
              <span className="text-amber-400 font-mono font-black">{eqState.bassBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={eqState.bassBoost}
              onChange={(e) => updateBand('bassBoost', Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Spatial Audio & Visualizer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 3D Spatial Audio */}
            <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Spatial Audio</h4>
                  <p className="text-[10px] text-slate-400">3D Soundstage</p>
                </div>
              </div>
              <button
                onClick={() => updateBand('spatialAudio', !eqState.spatialAudio)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  eqState.spatialAudio
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/40'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {eqState.spatialAudio ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Visualizer Toggle */}
            <div className="p-3.5 rounded-2xl glass-card border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Visualizer</h4>
                  <p className="text-[10px] text-slate-400">Live Spectrum</p>
                </div>
              </div>
              <button
                onClick={() => updateBand('visualizerEnabled', !eqState.visualizerEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  eqState.visualizerEnabled
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/40'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {eqState.visualizerEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Preset Dialog */}
        {showSaveModal && (
          <div className="p-4 rounded-2xl bg-black/60 border border-indigo-500/40 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300">Name Custom EQ Preset:</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="e.g. My Bass Paradise..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-400"
              />
              <button
                onClick={handleSaveCustomPreset}
                className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
