import { type ReactNode } from 'react';

interface StepContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  onCustomPromptClick?: () => void;
  customPromptActive?: boolean;
  onCustomPromptReset?: () => void;
  customPromptSnippet?: string;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
  subtitle,
  children,
  className = '',
  onCustomPromptClick,
  customPromptActive = false,
  onCustomPromptReset,
  customPromptSnippet
}) => {
  return (
    <div className={`min-h-screen text-text flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4 animate-header-in header-first">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text">{title}</h2>
          <p className="text-lg sm:text-xl text-text/70">{subtitle}</p>
          {onCustomPromptClick && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={onCustomPromptClick}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold bg-white/5 border border-white/15 text-white hover:bg-white/10 transition-colors"
              >
                ✍️ Prefer to write your own prompt?
              </button>
              {customPromptActive && onCustomPromptReset && (
                <button
                  type="button"
                  onClick={onCustomPromptReset}
                  className="text-sm text-accent-cyan hover:text-white transition-colors"
                >
                  Return to guided selections
                </button>
              )}
            </div>
          )}
          {customPromptActive && customPromptSnippet && (
            <p className="text-sm text-accent-cyan/80 max-w-2xl mx-auto">
              Using custom prompt: “{customPromptSnippet}...”
            </p>
          )}
        </div>
        
        <div className="animate-content-in content-flow-1">
          {children}
        </div>
      </div>
    </div>
  );
};
