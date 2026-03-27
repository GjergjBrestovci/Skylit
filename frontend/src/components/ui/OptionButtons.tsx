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
  return (
    <button
      onClick={onClick}
      className={`
        group p-4 sm:p-5 rounded-xl border transition-all duration-150
        text-left animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}
        hover:shadow-card-hover active:scale-[0.98]
        ${isSelected
          ? 'border-accent-primary bg-accent-primary/5 shadow-card-hover'
          : 'border-border bg-surface-elevated hover:border-accent-primary/30'
        }
        ${className}
      `}
    >
      <div className="text-2xl sm:text-3xl mb-2.5">{emoji}</div>
      <h3 className="text-base sm:text-lg font-semibold text-text mb-1 group-hover:text-accent-primary transition-colors">
        {label}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
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
        group p-4 sm:p-5 rounded-xl transition-all duration-150
        animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}
        border border-border bg-surface-elevated
        hover:border-accent-primary/30 hover:shadow-card-hover
        active:scale-[0.98]
      `}
    >
      <div className="flex space-x-2 mb-3 justify-center">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-sm border border-black/5 dark:border-white/10 transition-transform group-hover:scale-110"
          style={{ backgroundColor: primary }}
        />
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-sm border border-black/5 dark:border-white/10 transition-transform group-hover:scale-110"
          style={{ backgroundColor: accent }}
        />
      </div>
      <h3 className="text-sm font-medium text-text text-center">{name}</h3>
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
  return (
    <button
      onClick={onClick}
      className={`
        group p-3 sm:p-4 rounded-xl transition-all duration-150
        animate-stagger-in stagger-${Math.min(animationIndex + 1, 6)}
        border active:scale-[0.98]
        ${isSelected
          ? 'border-accent-primary bg-accent-primary/5 shadow-sm'
          : 'border-border bg-surface-elevated hover:border-accent-primary/30'
        }
      `}
    >
      <div className="text-xl sm:text-2xl mb-1.5">{emoji}</div>
      <h3 className={`font-medium text-sm ${isSelected ? 'text-accent-primary' : 'text-text'} transition-colors`}>
        {label}
      </h3>
    </button>
  );
};
