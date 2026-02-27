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
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent tracking-tight">
          AI Prompt Enhancer
        </h2>
        <p className="text-text/60 text-sm sm:text-base max-w-xl mx-auto">
          Refining your idea into a precise, professional build instruction.
        </p>
      </div>
      <div className="bg-surface border border-accent-secondary/30 rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-accent-secondary/20 bg-surface-elevated">
            <span className="text-sm font-semibold text-accent-primary flex items-center gap-2">🧠 Understanding & Improving</span>
            {!enhancementComplete && <span className="text-[10px] uppercase tracking-wider bg-accent-primary/15 text-accent-primary px-2 py-1 rounded-full border border-accent-primary/30 animate-pulse">Working</span>}
            {enhancementComplete && <span className="text-[10px] uppercase tracking-wider bg-green-500/15 text-green-400 px-2 py-1 rounded-full border border-green-400/30">Enhanced</span>}
        </div>
        <div className="p-5 space-y-6 font-mono text-xs sm:text-sm leading-relaxed">
          <div>
            <div className="text-text/50 mb-1">Original Prompt:</div>
            <div className="whitespace-pre-wrap text-text/80 relative">
              {displayedRaw}
              {displayedRaw.length < rawPrompt.length && <span className="animate-pulse text-accent-primary">▍</span>}
            </div>
          </div>
          <div className="pt-2 border-t border-accent-secondary/10">
            <div className="text-text/50 mb-1 flex items-center gap-2">
              Enhanced Prompt:
              {(!enhancedPrompt || displayedEnhanced.length < (enhancedPrompt?.length || 0)) && <span className="animate-pulse text-accent-secondary">▍</span>}
            </div>
            <div className="whitespace-pre-wrap text-text/90 relative">
              {displayedEnhanced}
            </div>
            {enhancementComplete && enhancedPrompt && (
              <div className="mt-4 text-[11px] text-accent-primary/70 italic">
                ✨ Enhancement complete. Generating code…
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center text-xs text-text/50">
        {!isApiDone && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-primary animate-ping"/> Waiting for generation response…</div>}
        {isApiDone && !enhancementComplete && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse"/> Finalizing enhancement…</div>}
      </div>
    </div>
  );
};
