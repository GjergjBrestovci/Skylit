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
    <div className={`min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 animate-header-in header-first">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text">{title}</h2>
          <p className="text-base sm:text-lg text-muted">{subtitle}</p>
          {onCustomPromptClick && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={onCustomPromptClick}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted hover:text-text hover:bg-surface-overlay transition-colors"
              >
                Write your own prompt
              </button>
              {customPromptActive && onCustomPromptReset && (
                <button
                  type="button"
                  onClick={onCustomPromptReset}
                  className="text-sm text-accent-primary hover:underline transition-colors"
                >
                  Return to guided selections
                </button>
              )}
            </div>
          )}
          {customPromptActive && customPromptSnippet && (
            <p className="text-sm text-accent-primary max-w-2xl mx-auto">
              Using custom prompt: &ldquo;{customPromptSnippet}...&rdquo;
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
