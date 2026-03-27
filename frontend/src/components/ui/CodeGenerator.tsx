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
    html: 'Building structure...',
    css: 'Applying styles...',
    js: 'Adding interactivity...',
    done: 'Complete'
  }[stage];

  // Progress percentage
  const progress = stage === 'html' ? 25 : stage === 'css' ? 55 : stage === 'js' ? 80 : 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-text">Generating Code</h2>
        <p className="text-sm text-muted">Building your website from the specification.</p>
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted">{stageLabel}</span>
          <span className="text-xs text-muted">{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-overlay rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {enhancedPrompt && (
        <div className="card p-3 text-[11px] sm:text-xs text-muted font-mono">
          <span className="text-muted block mb-1 font-sans text-xs">Spec:</span>
          <div className="max-h-20 overflow-y-auto whitespace-pre-wrap custom-scrollbar">{enhancedPrompt}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: 'HTML', lines: codeLines, active: stage === 'html', prefix: '' },
          { title: 'CSS', lines: cssLines, active: stage === 'css', prefix: 'S' },
          { title: 'JavaScript', lines: jsLines, active: stage === 'js', prefix: 'J' }
        ].map(({ title, lines, active, prefix }) => (
          <div key={title} className="card overflow-hidden flex flex-col">
            <div className={`px-4 py-2 text-xs font-medium border-b border-border flex items-center gap-2 ${
              active ? 'text-accent-primary bg-accent-primary/5' : 'text-muted bg-surface'
            }`}>
              {title}
              {active && (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
            <div className="p-3 font-mono text-[10px] sm:text-xs space-y-0.5 overflow-y-auto max-h-56 custom-scrollbar">
              {lines.map((l, i) => (
                <div key={i} className="text-text">
                  <span className="text-muted/50">{prefix}{String(i + 1).padStart(2, '0')} </span>{l}
                </div>
              ))}
              {active && <div className="animate-pulse text-accent-primary">|</div>}
              {lines.length === 0 && !active && (
                <div className="text-muted/40 text-center py-4">Waiting...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onSkip}
          disabled={!isApiDone}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-border text-muted hover:text-text hover:bg-surface-overlay disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isApiDone ? 'Skip to Preview' : 'Generating...'}
        </button>
      </div>
    </div>
  );
};
