import React from 'react';

interface CodeGeneratorProps {
  enhancedPrompt?: string;
  codeLines: string[];
  cssLines: string[];
  jsLines: string[];
  stage: 'html' | 'css' | 'js' | 'done';
  isApiDone: boolean;
  onSkip: () => void;
}

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  enhancedPrompt,
  codeLines,
  cssLines,
  jsLines,
  stage,
  isApiDone,
  onSkip
}) => {
  const stageLabel = {
    html: 'Generating structure',
    css: 'Styling & layout',
    js: 'Adding interactivity',
    done: 'Complete'
  }[stage];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-purple to-pink-500 bg-clip-text text-transparent tracking-tight">
          Code Generator AI
        </h2>
        <p className="text-text/60 text-sm sm:text-base max-w-2xl mx-auto">
          Building your website from the enhanced specification.
        </p>
      </div>
      {enhancedPrompt && (
        <div className="bg-[#1a1a1a] border border-accent-purple/20 rounded-lg p-4 text-[11px] sm:text-xs text-text/70 font-mono">
          <span className="text-text/40 block mb-1">Enhanced Spec:</span>
            <div className="max-h-24 overflow-y-auto whitespace-pre-wrap">{enhancedPrompt}</div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1a1a1a] border border-accent-cyan/30 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 text-xs font-semibold tracking-wide bg-[#232323] border-b border-accent-cyan/30 text-accent-cyan flex items-center gap-2">
            📄 HTML Structure {stage === 'html' && <span className="animate-pulse">…</span>}
          </div>
          <div className="p-3 font-mono text-[10px] sm:text-xs space-y-1 overflow-y-auto max-h-64">
            {codeLines.map((l, i) => <div key={i} className="text-text/70"><span className="text-accent-cyan/40">{String(i+1).padStart(2,'0')} </span>{l}</div>)}
            {stage === 'html' && <div className="animate-pulse text-accent-cyan/60">…</div>}
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-pink-400/30 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 text-xs font-semibold tracking-wide bg-[#232323] border-b border-pink-400/30 text-pink-300 flex items-center gap-2">
            🎨 CSS Styling {stage === 'css' && <span className="animate-pulse">…</span>}
          </div>
          <div className="p-3 font-mono text-[10px] sm:text-xs space-y-1 overflow-y-auto max-h-64">
            {cssLines.map((l, i) => <div key={i} className="text-text/70"><span className="text-pink-300/40">S{String(i+1).padStart(2,'0')} </span>{l}</div>)}
            {(stage === 'css' || stage === 'html') && <div className="animate-pulse text-pink-300/60">…</div>}
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-yellow-400/30 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-2 text-xs font-semibold tracking-wide bg-[#232323] border-b border-yellow-400/30 text-yellow-300 flex items-center gap-2">
             JS Logic {stage === 'js' && <span className="animate-pulse">…</span>}
          </div>
          <div className="p-3 font-mono text-[10px] sm:text-xs space-y-1 overflow-y-auto max-h-64">
            {jsLines.map((l, i) => <div key={i} className="text-text/70"><span className="text-yellow-300/40">J{String(i+1).padStart(2,'0')} </span>{l}</div>)}
            {(stage === 'js' || stage === 'css' || stage === 'html') && <div className="animate-pulse text-yellow-300/60">…</div>}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={onSkip}
          disabled={!isApiDone}
          className="px-6 py-3 rounded-lg text-sm font-semibold bg-accent-purple/20 text-accent-purple border border-accent-purple/40 hover:bg-accent-purple/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isApiDone ? 'Skip to Preview' : 'Finishing…'}
        </button>
      </div>
      <div className="text-center text-xs text-text/50">
        {stageLabel}
      </div>
    </div>
  );
};
