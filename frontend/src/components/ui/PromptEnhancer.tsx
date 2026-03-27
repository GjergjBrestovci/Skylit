interface PromptEnhancerProps {
  rawPrompt: string;
  displayedRaw: string;
  displayedEnhanced: string;
  enhancedPrompt?: string;
  isApiDone: boolean;
  enhancementComplete: boolean;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  rawPrompt,
  displayedRaw,
  displayedEnhanced,
  enhancedPrompt,
  isApiDone,
  enhancementComplete
}) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-text">Enhancing Your Prompt</h2>
        <p className="text-sm text-muted">Refining your idea into a precise build specification.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-border bg-surface">
          {!enhancementComplete && (
            <span className="flex items-center gap-2 text-xs text-accent-primary font-medium">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing
            </span>
          )}
          {enhancementComplete && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Enhanced
            </span>
          )}
        </div>

        <div className="p-5 space-y-5 font-mono text-xs sm:text-sm leading-relaxed">
          <div>
            <div className="text-muted mb-1 text-xs font-sans">Original:</div>
            <div className="whitespace-pre-wrap text-text">
              {displayedRaw}
              {displayedRaw.length < rawPrompt.length && <span className="animate-pulse text-accent-primary">|</span>}
            </div>
          </div>
          <div className="pt-3 border-t border-border">
            <div className="text-muted mb-1 text-xs font-sans flex items-center gap-1.5">
              Enhanced:
              {(!enhancedPrompt || displayedEnhanced.length < (enhancedPrompt?.length || 0)) && (
                <span className="animate-pulse text-accent-primary">|</span>
              )}
            </div>
            <div className="whitespace-pre-wrap text-text">
              {displayedEnhanced}
            </div>
            {enhancementComplete && enhancedPrompt && (
              <div className="mt-3 text-xs text-muted font-sans">
                Enhancement complete. Generating code...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center text-xs text-muted">
        {!isApiDone && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
            Waiting for response...
          </div>
        )}
        {isApiDone && !enhancementComplete && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse" />
            Finalizing...
          </div>
        )}
      </div>
    </div>
  );
};
