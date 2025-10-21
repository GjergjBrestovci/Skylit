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
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent tracking-tight">
          AI Prompt Enhancer
        </h2>
        <p className="text-text/60 text-sm sm:text-base max-w-xl mx-auto">
          Refining your idea into a precise, professional build instruction.
        </p>
      </div>
      <div className="bg-[#1a1a1a] border border-accent-purple/30 rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-accent-purple/20 bg-[#232323]">
            <span className="text-sm font-semibold text-accent-cyan flex items-center gap-2">🧠 Understanding & Improving</span>
            {!enhancementComplete && <span className="text-[10px] uppercase tracking-wider bg-accent-cyan/15 text-accent-cyan px-2 py-1 rounded-full border border-accent-cyan/30 animate-pulse">Working</span>}
            {enhancementComplete && <span className="text-[10px] uppercase tracking-wider bg-green-500/15 text-green-400 px-2 py-1 rounded-full border border-green-400/30">Enhanced</span>}
        </div>
        <div className="p-5 space-y-6 font-mono text-xs sm:text-sm leading-relaxed">
          <div>
            <div className="text-text/50 mb-1">Original Prompt:</div>
            <div className="whitespace-pre-wrap text-text/80 relative">
              {displayedRaw}
              {displayedRaw.length < rawPrompt.length && <span className="animate-pulse text-accent-cyan">▍</span>}
            </div>
          </div>
          <div className="pt-2 border-t border-accent-purple/10">
            <div className="text-text/50 mb-1 flex items-center gap-2">
              Enhanced Prompt:
              {(!enhancedPrompt || displayedEnhanced.length < (enhancedPrompt?.length || 0)) && <span className="animate-pulse text-accent-purple">▍</span>}
            </div>
            <div className="whitespace-pre-wrap text-text/90 relative">
              {displayedEnhanced}
            </div>
            {enhancementComplete && enhancedPrompt && (
              <div className="mt-4 text-[11px] text-accent-cyan/70 italic">
                ✨ Enhancement complete. Generating code…
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center text-xs text-text/50">
        {!isApiDone && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-cyan animate-ping"/> Waiting for generation response…</div>}
        {isApiDone && !enhancementComplete && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse"/> Finalizing enhancement…</div>}
      </div>
    </div>
  );
};
