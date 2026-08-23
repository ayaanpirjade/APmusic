import React, { useState } from 'react';
import { X, Sliders, RotateCcw, Zap, Headphones, Sparkles, Volume2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { EqualizerBands } from '../types';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const {
    equalizerBands,
    setEqualizerBand,
    setBassBoost,
    toggleSpatialAudio,
    resetEqualizer,
  } = useAudio();

  const [activePreset, setActivePreset] = useState<string>('Flat');

  if (!isOpen) return null;

  const presets: Array<{ name: string; bands: EqualizerBands }> = [
    {
      name: 'Flat',
      bands: { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, bassBoost: 0, spatialAudio: false },
    },
    {
      name: 'Bass Boost',
      bands: { bass: 8, lowMid: 5, mid: 0, highMid: -2, treble: 1, bassBoost: 75, spatialAudio: true },
    },
    {
      name: 'Vocal Clarity',
      bands: { bass: -2, lowMid: 1, mid: 6, highMid: 5, treble: 3, bassBoost: 0, spatialAudio: false },
    },
    {
      name: 'Pop',
      bands: { bass: 4, lowMid: 2, mid: 0, highMid: 3, treble: 5, bassBoost: 30, spatialAudio: true },
    },
    {
      name: 'Rock / Metal',
      bands: { bass: 6, lowMid: 3, mid: -2, highMid: 4, treble: 6, bassBoost: 40, spatialAudio: false },
    },
    {
      name: 'EDM / Club',
      bands: { bass: 9, lowMid: 6, mid: -1, highMid: 3, treble: 7, bassBoost: 85, spatialAudio: true },
    },
    {
      name: 'Acoustic / Indie',
      bands: { bass: 3, lowMid: 2, mid: 4, highMid: 2, treble: 3, bassBoost: 10, spatialAudio: true },
    },
    {
      name: 'Night Drive',
      bands: { bass: 7, lowMid: 4, mid: -2, highMid: 1, treble: 4, bassBoost: 60, spatialAudio: true },
    },
  ];

  const handleApplyPreset = (preset: { name: string; bands: EqualizerBands }) => {
    setActivePreset(preset.name);
    setEqualizerBand('bass', preset.bands.bass);
    setEqualizerBand('lowMid', preset.bands.lowMid);
    setEqualizerBand('mid', preset.bands.mid);
    setEqualizerBand('highMid', preset.bands.highMid);
    setEqualizerBand('treble', preset.bands.treble);
    setBassBoost(preset.bands.bassBoost);
    if (preset.bands.spatialAudio !== (equalizerBands?.spatialAudio ?? true)) {
      toggleSpatialAudio();
    }
  };

  const handleReset = () => {
    resetEqualizer();
    setActivePreset('Flat');
  };

  const bandsConfig: Array<{ key: keyof EqualizerBands; label: string; freq: string }> = [
    { key: 'bass', label: 'Bass', freq: '60 Hz' },
    { key: 'lowMid', label: 'Low-Mid', freq: '230 Hz' },
    { key: 'mid', label: 'Midrange', freq: '910 Hz' },
    { key: 'highMid', label: 'High-Mid', freq: '4 kHz' },
    { key: 'treble', label: 'Treble', freq: '14 kHz' },
  ];

  const currentBands = equalizerBands || {
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    treble: 0,
    bassBoost: 15,
    spatialAudio: true,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl rounded-[36px] ios-glass-card border border-purple-500/30 p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-purple-500/20 blur-[90px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Studio 5-Band Equalizer</h2>
              <p className="text-xs text-purple-300">Web Audio API Hardware DSP Curve</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Reset Flat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-6">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Acoustic Presets</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activePreset === p.name
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                      : 'ios-glass-pill text-slate-300 hover:text-white'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Band Vertical Sliders */}
          <div className="p-6 rounded-3xl ios-glass-card border border-white/10 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 px-2">
              <span>+12 dB</span>
              <span className="text-indigo-400 font-black">FREQUENCY RESPONSE CURVE</span>
              <span>-12 dB</span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center justify-items-center py-2">
              {bandsConfig.map((band) => {
                const value = (currentBands[band.key] as number) || 0;
                return (
                  <div key={band.key} className="flex flex-col items-center gap-3 w-full">
                    <span className="text-xs font-bold text-indigo-300">
                      {value > 0 ? `+${value}` : value} dB
                    </span>

                    <div className="h-40 flex items-center justify-center">
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={value}
                        onChange={(e) => {
                          setActivePreset('Custom');
                          setEqualizerBand(band.key, Number(e.target.value));
                        }}
                        className="w-36 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400 -rotate-90 origin-center"
                      />
                    </div>

                    <div className="text-center mt-1">
                      <div className="text-xs font-bold text-white">{band.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{band.freq}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spatial 3D & Bass Boost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bass Boost */}
            <div className="p-4 rounded-2xl ios-glass border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Dynamic Bass Boost</span>
                </div>
                <span className="text-xs font-bold text-amber-400">{currentBands.bassBoost}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={currentBands.bassBoost}
                onChange={(e) => {
                  setActivePreset('Custom');
                  setBassBoost(Number(e.target.value));
                }}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Spatial Audio Toggle */}
            <div className="p-4 rounded-2xl ios-glass border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Spatial 3D Sound</h4>
                  <p className="text-[11px] text-slate-400">Headphone virtual surround</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePreset('Custom');
                  toggleSpatialAudio();
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  currentBands.spatialAudio ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    currentBands.spatialAudio ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
