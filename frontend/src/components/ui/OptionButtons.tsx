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
  const baseClasses = `group p-4 sm:p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}`;
  
  const selectedClasses = isSelected 
    ? 'border-accent-cyan bg-accent-cyan/20 shadow-lg shadow-accent-cyan/25'
    : 'bg-[#1a1a1a] border-accent-purple/30 hover:border-accent-cyan/50 hover:shadow-accent-cyan/10';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${selectedClasses} ${className}`}
    >
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{emoji}</div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{label}</h3>
      <p className="text-sm sm:text-base text-text/60">{description}</p>
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
      className={`group p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#1a1a1a] border-2 border-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}`}
    >
      <div className="flex space-x-2 sm:space-x-3 mb-3 sm:mb-4 justify-center">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" style={{ backgroundColor: primary }}></div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" style={{ backgroundColor: accent }}></div>
      </div>
      <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-white text-center">{name}</h3>
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
    ? 'border-accent-cyan bg-accent-cyan/20'
    : 'border-accent-purple/30 bg-[#1a1a1a] hover:border-accent-cyan/50';

  return (
    <button
      onClick={onClick}
      className={`p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)} ${selectedClasses}`}
    >
      <div className="text-2xl sm:text-3xl mb-2">{emoji}</div>
      <h3 className="text-white font-bold text-sm sm:text-base">{label}</h3>
    </button>
  );
};
