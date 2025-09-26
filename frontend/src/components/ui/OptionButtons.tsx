import React from 'react';

interface OptionButtonProps {
  value: string;
  label: string;
  emoji: string;
  description: string;
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
  animationIndex?: number;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  emoji,
  description,
  isSelected = false,
  onClick,
  className = '',
  animationIndex = 0
}) => {
  const baseClasses = `
    group p-4 sm:p-6 lg:p-8 rounded-3xl border transition-all duration-300 
    text-left animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}
    backdrop-blur-xl transform-gpu hover:scale-[1.02] active:scale-[0.98]
    shadow-glass hover:shadow-glass-lg
    ease-bounce-light
  `;
  
  const selectedClasses = isSelected 
    ? `
        border-cyan-400/40 bg-gradient-to-br from-cyan-500/15 to-purple-600/15
        shadow-cyan-500/20 shadow-glass-lg
        before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br 
        before:from-cyan-400/10 before:to-purple-500/10 before:opacity-100
        relative before:pointer-events-none
      `
    : `
        border-white/10 bg-gradient-to-br from-white/5 to-white/2
        hover:border-white/20 hover:from-white/10 hover:to-white/5
        hover:shadow-white/10
        relative before:absolute before:inset-0 before:rounded-3xl 
        before:bg-gradient-to-br before:from-white/5 before:to-transparent 
        before:opacity-0 hover:before:opacity-100 before:transition-opacity 
        before:duration-300 before:pointer-events-none
      `;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${selectedClasses} ${className}`}
    >
      {/* Glass highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-3xl" />
      
      <div className="relative z-10">
        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 transition-transform group-hover:scale-110 duration-300">
          {emoji}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">
          {label}
        </h3>
        <p className="text-sm sm:text-base text-white/60 group-hover:text-white/80 transition-colors">
          {description}
        </p>
      </div>
    </button>
  );
};

interface ColorPaletteButtonProps {
  name: string;
  primary: string;
  accent: string;
  onClick: () => void;
  animationIndex?: number;
}

export const ColorPaletteButton: React.FC<ColorPaletteButtonProps> = ({
  name,
  primary,
  accent,
  onClick,
  animationIndex = 0
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        group p-4 sm:p-6 lg:p-8 rounded-3xl transition-all duration-300 
        animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}
        backdrop-blur-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2
        hover:border-white/20 hover:from-white/10 hover:to-white/5
        transform-gpu hover:scale-[1.02] active:scale-[0.98] shadow-glass hover:shadow-glass-lg
        ease-bounce-light relative
        before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br 
        before:from-white/5 before:to-transparent before:opacity-0 
        hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none
      `}
    >
      {/* Glass highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-3xl" />
      
      <div className="relative z-10">
        <div className="flex space-x-2 sm:space-x-3 mb-3 sm:mb-4 justify-center">
          <div 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg border border-white/20 transition-transform group-hover:scale-110" 
            style={{ backgroundColor: primary }}
          ></div>
          <div 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg border border-white/20 transition-transform group-hover:scale-110" 
            style={{ backgroundColor: accent }}
          ></div>
        </div>
        <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white text-center group-hover:text-white/90 transition-colors">
          {name}
        </h3>
      </div>
    </button>
  );
};

interface ToggleButtonProps {
  value: string;
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
  animationIndex?: number;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  emoji,
  isSelected,
  onClick,
  animationIndex = 0
}) => {
  const selectedClasses = isSelected
    ? `
        border-cyan-400/40 bg-gradient-to-br from-cyan-500/15 to-purple-600/15
        shadow-cyan-500/20 shadow-glass-lg
        before:opacity-100 before:from-cyan-400/10 before:to-purple-500/10
      `
    : `
        border-white/10 bg-gradient-to-br from-white/5 to-white/2
        hover:border-white/20 hover:from-white/10 hover:to-white/5
        before:opacity-0 hover:before:opacity-100 before:from-white/5 before:to-transparent
      `;

  return (
    <button
      onClick={onClick}
      className={`
        group p-4 sm:p-6 rounded-2xl transition-all duration-300 
        animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}
        backdrop-blur-xl border transform-gpu hover:scale-[1.02] active:scale-[0.98] 
        shadow-glass hover:shadow-glass-lg ease-bounce-light relative
        before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br 
        before:transition-all before:duration-300 before:pointer-events-none
        ${selectedClasses}
      `}
    >
      {/* Glass highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-2xl" />
      
      <div className="relative z-10">
        <div className="text-2xl sm:text-3xl mb-2 transition-transform group-hover:scale-110 duration-300">
          {emoji}
        </div>
        <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-cyan-200 transition-colors">
          {label}
        </h3>
      </div>
    </button>
  );
};
