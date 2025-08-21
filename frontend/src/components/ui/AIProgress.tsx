        import { useEffect, useRef } from 'react';

interface AIProgressProps {
  rawPrompt: string;
  enhancedPrompt?: string;
  phase: number; // external phase index 0..n
  displayedRaw: string;
  displayedEnhanced: string;
  codeLines: string[];
  cssLines: string[];
  jsLines: string[];
  isApiDone: boolean;
  onSkip: () => void;
}

// Pure presentational component (logic/intervals handled by parent NewDashboard)
export function AIProgress({
  rawPrompt,
  enhancedPrompt,
  phase,
  displayedRaw,
  displayedEnhanced,
  codeLines,
  cssLines,
  jsLines,
  isApiDone,
  onSkip
}: AIProgressProps) {
  const phaseTitles = [
    'Understanding your idea',
    'Enhancing the prompt',
    'Drafting HTML structure',
    'Designing styles',
    'Adding interactivity'
  ];

  const phaseDescriptions = [
    'AI is parsing context, goals, and tone…',
    'Refining wording for clarity & completeness…',
    'Generating semantic layout and content scaffolding…',
    'Applying design language and responsive rules…',
    'Injecting behaviors and dynamic logic…'
  ];

  const progressPercent = ((phase + (isApiDone ? 1 : 0)) / (phaseTitles.length + 1)) * 100;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [codeLines, cssLines, jsLines, displayedEnhanced]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
          {phaseTitles[phase] || 'Finishing up'}
        </h2>
        <p className="text-text/60 text-sm sm:text-base min-h-[1.5rem]">
          {phaseDescriptions[phase] || (isApiDone ? 'Finalizing output…' : 'Waiting for AI response…')}
        </p>
        <div className="w-full h-2 bg-[#232323] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 transition-all duration-700"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="text-xs text-text/40">{Math.round(progressPercent)}% complete</div>
      </div>

      {/* Live panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prompt evolution */}
        <div className="relative bg-[#1a1a1a] border border-accent-purple/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-accent-purple/20 bg-[#232323]">
            <span className="text-sm font-semibold text-accent-cyan flex items-center gap-2">🧠 Prompt Intelligence</span>
            {enhancedPrompt && isApiDone && (
              <span className="text-[10px] uppercase tracking-wider bg-accent-cyan/15 text-accent-cyan px-2 py-1 rounded-full border border-accent-cyan/30">Enhanced</span>
            )}
          </div>
          <div className="p-4 space-y-4 text-xs sm:text-sm font-mono leading-relaxed max-h-[300px] overflow-y-auto" ref={containerRef}>
            <div>
              <div className="text-text/50 mb-1">Original Prompt:</div>
              <div className="whitespace-pre-wrap text-text/80">
                {displayedRaw}{displayedRaw.length < rawPrompt.length && <span className="animate-pulse text-accent-cyan">▍</span>}
              </div>
            </div>
            {(phase >= 1 || displayedEnhanced.length > 0) && (
              <div className="pt-2 border-t border-accent-purple/10">
                <div className="text-text/50 mb-1 flex items-center gap-2">
                  Refined Prompt:
                  {(!enhancedPrompt || displayedEnhanced.length < (enhancedPrompt?.length || 0)) && (
                    <span className="animate-pulse text-accent-purple">▍</span>
                  )}
                </div>
                <div className="whitespace-pre-wrap text-text/90">
                  {displayedEnhanced}
                </div>
                {enhancedPrompt && isApiDone && (
                  <div className="mt-3 text-[11px] text-accent-cyan/70 italic">
                    ✨ AI produced an improved prompt used for generation.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Code synthesis */}
        <div className="relative bg-[#1a1a1a] border border-accent-purple/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-accent-purple/20 bg-[#232323]">
            <span className="text-sm font-semibold text-accent-purple flex items-center gap-2">💻 Code Synthesis</span>
            <span className="text-[10px] uppercase tracking-wider bg-accent-purple/15 text-accent-purple px-2 py-1 rounded-full border border-accent-purple/30">Live</span>
          </div>
          <div className="p-4 space-y-4 text-[11px] sm:text-xs font-mono leading-relaxed max-h-[300px] overflow-y-auto">
            <div className="space-y-1">
              {codeLines.map((l, i) => (
                <div key={i} className="text-text/70"><span className="text-accent-cyan/40">{String(i + 1).padStart(2, '0')} </span>{l}</div>
              ))}
              {phase < 2 && <div className="animate-pulse text-accent-cyan/60">…</div>}
            </div>
            {phase >= 3 && (
              <div className="border-t border-accent-purple/10 pt-2 space-y-1">
                {cssLines.map((l, i) => (
                  <div key={i} className="text-text/70"><span className="text-pink-400/40">S{String(i + 1).padStart(2, '0')} </span>{l}</div>
                ))}
                {phase < 3 && <div className="animate-pulse text-accent-purple/60">…</div>}
              </div>
            )}
            {phase >= 4 && (
              <div className="border-t border-accent-purple/10 pt-2 space-y-1">
                {jsLines.map((l, i) => (
                  <div key={i} className="text-text/70"><span className="text-yellow-400/40">J{String(i + 1).padStart(2, '0')} </span>{l}</div>
                ))}
                {phase < 4 && <div className="animate-pulse text-yellow-400/60">…</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onSkip}
          disabled={!isApiDone}
          className="px-5 py-3 rounded-lg text-sm font-semibold bg-accent-purple/20 text-accent-purple border border-accent-purple/40 hover:bg-accent-purple/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isApiDone ? 'Skip to Preview' : 'AI Working…'}
        </button>
      </div>
    </div>
  );
}
