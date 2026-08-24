import React from 'react';
import { useAudio } from '../context/AudioContext';
import { useAppTheme } from '../context/ThemeContext';

export const LiquidMeshBackground: React.FC = () => {
  const { isPlaying } = useAudio();
  const { resolvedTheme } = useAppTheme();
  const isLight = resolvedTheme === 'light';

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-700 ${
        isLight ? 'bg-[#f2f5fa]' : 'bg-[#07090e]'
      }`}
    >
      {/* Dynamic Ambient Blur Blobs */}
      <div
        className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[130px] transition-all duration-1000 ${
          isLight
            ? 'bg-gradient-to-tr from-indigo-400/35 via-purple-300/30 to-pink-300/30'
            : 'bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-500/20'
        } ${isPlaying ? 'opacity-90 scale-110' : 'opacity-50 scale-100'}`}
        style={{
          animation: isPlaying ? 'float 12s ease-in-out 0s infinite alternate' : 'none',
        }}
      />
      <div
        className={`absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 ${
          isLight
            ? 'bg-gradient-to-bl from-blue-300/40 via-cyan-300/30 to-teal-200/25'
            : 'bg-gradient-to-bl from-blue-600/25 via-cyan-500/20 to-teal-500/15'
        } ${isPlaying ? 'opacity-85 scale-105' : 'opacity-45 scale-95'}`}
        style={{
          animation: isPlaying ? 'float 14s ease-in-out 2s infinite alternate-reverse' : 'none',
        }}
      />
      <div
        className={`absolute -bottom-40 left-1/4 w-[650px] h-[650px] rounded-full blur-[150px] transition-all duration-1000 ${
          isLight
            ? 'bg-gradient-to-tr from-fuchsia-300/30 via-violet-300/35 to-indigo-200/30'
            : 'bg-gradient-to-tr from-fuchsia-600/20 via-violet-600/25 to-indigo-900/30'
        } ${isPlaying ? 'opacity-85 scale-110' : 'opacity-40 scale-100'}`}
        style={{
          animation: isPlaying ? 'float 16s ease-in-out 4s infinite alternate' : 'none',
        }}
      />

      {/* Subtle Specular Depth Gradient */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-[#f2f5fa]/90'
            : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/10 via-transparent to-[#07090e]/80'
        }`}
      />
    </div>
  );
};

