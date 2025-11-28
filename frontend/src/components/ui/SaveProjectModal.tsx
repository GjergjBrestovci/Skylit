import { useState, useEffect, useRef } from 'react';

interface SaveProjectModalProps {
  open: boolean;
  defaultTitle?: string;
  saving: boolean;
  onSave: (title: string) => void;
  onClose: () => void;
}

export function SaveProjectModal({ 
  open, 
  defaultTitle = '', 
  saving, 
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
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultTitle]);

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
    if (e.key === 'Enter' && !saving) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 theme-surface-overlay backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl theme-surface-card theme-border-subtle border p-6 shadow-2xl space-y-5 animate-fade-in">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <span className="text-xl">💾</span>
            </div>
            <h3 className="text-xl font-semibold theme-text-primary">Save Project</h3>
          </div>
          <p className="text-sm theme-text-secondary">
            Give your project a name so you can find it later.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label htmlFor="project-name" className="block text-sm font-medium theme-text-secondary">
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
            className="w-full px-4 py-3 rounded-xl theme-input text-base focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all disabled:opacity-50"
          />
          {error && (
            <p className="text-sm text-red-400 animate-fade-in">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl theme-border-subtle border theme-text-secondary hover:theme-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Project'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
