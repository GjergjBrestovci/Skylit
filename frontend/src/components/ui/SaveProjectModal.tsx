import { useState, useEffect, useRef } from 'react';

interface SaveProjectModalProps {
  open: boolean;
  defaultTitle?: string;
  saving: boolean;
  saveError?: string | null;
  onSave: (title: string) => void;
  onClose: () => void;
}

export function SaveProjectModal({
  open,
  defaultTitle = '',
  saving,
  saveError,
  onSave,
  onClose
}: SaveProjectModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultTitle]);

  useEffect(() => {
    if (saveError) setError(saveError);
  }, [saveError]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Please enter a project name');
      return;
    }
    if (trimmed.length > 100) {
      setError('Project name must be 100 characters or less');
      return;
    }
    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !saving) handleSave();
    else if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md card p-6 shadow-xl space-y-5 animate-scale-in">
        <div>
          <h3 className="text-lg font-semibold text-text">Save Project</h3>
          <p className="text-sm text-muted mt-1">Give your project a name to find it later.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-name" className="block text-sm font-medium text-text">
            Project Name
          </label>
          <input
            ref={inputRef}
            id="project-name"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="My Awesome Website"
            disabled={saving}
            className="input-base w-full py-2.5 disabled:opacity-50"
          />
          {error && (
            <p className="text-sm text-red-500 animate-fade-in">{error}</p>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm text-muted hover:text-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 btn-primary py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
