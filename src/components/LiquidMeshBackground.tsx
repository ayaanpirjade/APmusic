import React from 'react';
import { useAudio } from '../context/AudioContext';

export const LiquidMeshBackground: React.FC = () => {
  const { isPlaying } = useAudio();

  // Fallback pleasant neon liquid gradients
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#07090e]">
      {/* Dynamic Ambient Blur Blobs */}
      <div
        className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/20 blur-[130px] transition-all duration-1000 ${
          isPlaying ? 'opacity-80 scale-110' : 'opacity-40 scale-100'
        }`}
        style={{
          animation: isPlaying ? 'float 12s ease-in-out 0s infinite alternate' : 'none',
        }}
      />
      <div
        className={`absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-600/25 via-cyan-500/20 to-teal-500/15 blur-[140px] transition-all duration-1000 ${
          isPlaying ? 'opacity-70 scale-105' : 'opacity-35 scale-95'
        }`}
        style={{
          animation: isPlaying ? 'float 14s ease-in-out 2s infinite alternate-reverse' : 'none',
        }}
      />
      <div
        className={`absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-fuchsia-600/20 via-violet-600/25 to-indigo-900/30 blur-[150px] transition-all duration-1000 ${
          isPlaying ? 'opacity-75 scale-110' : 'opacity-30 scale-100'
        }`}
        style={{
          animation: isPlaying ? 'float 16s ease-in-out 4s infinite alternate' : 'none',
        }}
      />

      {/* Subtle Noise / Specular Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/10 via-transparent to-[#07090e]/80" />
    </div>
  );
};
