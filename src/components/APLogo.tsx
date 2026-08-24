import React from 'react';

interface APLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const APLogo: React.FC<APLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Liquid Glass Squircle with Neon Waveform & AP Lettering */}
      <div
        className={`relative ${sizeMap[size]} rounded-[22%] p-[1.5px] bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_25px_rgba(99,102,241,0.5)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
      >
        <div className="w-full h-full rounded-[20%] bg-[#0c1020]/90 backdrop-blur-md flex items-center justify-center overflow-hidden relative">
          {/* Ambient inner glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/30 to-pink-500/20" />

          {/* SVG AP Waveform Logo matching user mockup */}
          <svg
            viewBox="0 0 100 100"
            className="w-[78%] h-[78%] relative z-10 filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.7)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Waveform Pulse */}
            <path
              d="M12 50 H24 L29 32 L36 68 L44 24 L52 76 L59 40 L65 58 L72 48 H88"
              stroke="url(#ap-wave-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Stylized AP Text overlapping */}
            <text
              x="52"
              y="68"
              fontFamily="'Outfit', sans-serif"
              fontWeight="900"
              fontSize="44"
              letterSpacing="-2"
              fill="url(#ap-text-grad)"
              className="font-black"
            >
              AP
            </text>

            <defs>
              <linearGradient id="ap-wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <linearGradient id="ap-text-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.95" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight font-['Outfit'] text-white">
              AP<span className="text-indigo-400">music</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Music • Soundboard • Beyond
          </span>
        </div>
      )}
    </div>
  );
};
