import { useEffect, useState, useRef } from 'react';
import { Logo } from './ui/Logo';
import { apiClient } from '../utils/apiClient';
import type { ThemeChoice } from '../types';
import { readThemeChoice, persistThemeChoice, initializeThemeFromStorage, applyThemeChoice } from '../utils/theme';

interface ProjectItem {
  id: string;
  name: string;
  createdAt: string;
  previewUrl?: string;
  previewId?: string;
}

interface NotificationItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  ts: number;
}

interface SidebarProps {
  onLogout: () => void;
  onCreateNew: () => void;
  onOpenProject: (project: ProjectItem) => void;
  onCreditsUpdate?: () => void;
  credits?: number | null;
  hasUnlimitedCredits?: boolean;
  onOpenBilling?: () => void;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onLogout,
  onCreateNew,
  onOpenProject,
  onCreditsUpdate,
  credits,
  hasUnlimitedCredits,
  onOpenBilling,
  onOpenSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSecretKeyInput, setShowSecretKeyInput] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');
  const [secretKeyLoading, setSecretKeyLoading] = useState(false);
  const [secretKeySuccess, setSecretKeySuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [notifications] = useState<NotificationItem[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('User');
  const [theme, setTheme] = useState<ThemeChoice>(() => (typeof window === 'undefined' ? 'system' : readThemeChoice()));
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const creditDisplayValue = hasUnlimitedCredits ? '∞' : typeof credits === 'number' ? String(credits) : null;
  const billingAttentionNeeded = typeof credits === 'number' && credits < 3 && !hasUnlimitedCredits;

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!userMenuRef.current?.contains(t)) setUserMenuOpen(false);
    };
    window.addEventListener('pointerdown', handler, true);
    return () => window.removeEventListener('pointerdown', handler, true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Extract user info from token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    let derivedName = 'User';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        if (payload?.email) { setUserEmail(payload.email); derivedName = payload.email.split('@')[0]; }
      } catch { /* ignore */ }
    }
    const stored = localStorage.getItem('profileDisplayName');
    setUsername(stored || derivedName);
  }, []);

  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent<string>).detail; if (d) setUsername(d); };
    window.addEventListener('profile:displayName', h as EventListener);
    return () => window.removeEventListener('profile:displayName', h as EventListener);
  }, []);

  // Theme management
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cur = initializeThemeFromStorage();
    setTheme(cur);
    const h = (e: Event) => setTheme((e as CustomEvent<ThemeChoice>).detail);
    window.addEventListener('theme:change', h as EventListener);
    return () => window.removeEventListener('theme:change', h as EventListener);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const l = () => applyThemeChoice('system');
    mq.addEventListener('change', l);
    return () => mq.removeEventListener('change', l);
  }, [theme]);

  const cycleTheme = () => {
    const order: ThemeChoice[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    persistThemeChoice(next);
  };

  const themeIcon = theme === 'dark' ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
  ) : theme === 'light' ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  );

  // Load projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    setProjectError(null);
    try {
      const data = await apiClient.get('/api/get-projects');
      const list: ProjectItem[] = (Array.isArray(data) ? data : (data?.projects || []))
        .map((p: any) => ({
          id: p.id || p._id || p.projectId || Math.random().toString(36).slice(2),
          name: p.name || p.title || 'Untitled Project',
          createdAt: p.createdAt || p.date || new Date().toISOString(),
          previewUrl: p.previewUrl || p.url || p.preview,
          previewId: p.previewId || (() => {
            const url: string | undefined = p.previewUrl || p.url || p.preview;
            if (!url || typeof url !== 'string') return undefined;
            try { const parts = url.split('?')[0].split('/').filter(Boolean); return parts[parts.length - 1]; }
            catch { return undefined; }
          })()
        }));
      setProjects(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setProjectError(err.message || 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => {
    const h = () => loadProjects();
    window.addEventListener('projects:refresh', h);
    return () => window.removeEventListener('projects:refresh', h);
  }, []);

  const deleteProject = async (project: ProjectItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    try {
      if (project.previewId) await apiClient.delete('/api/preview/' + project.previewId);
      setProjects(p => p.filter(pr => pr.id !== project.id));
    } catch { /* ignore */ }
  };

  const filteredProjects = projects.filter(p => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
  });

  const handleSecretKeySubmit = async () => {
    if (!secretKey.trim()) { setSecretKeyError('Please enter a secret key'); return; }
    setSecretKeyLoading(true);
    setSecretKeyError('');
    try {
      const response = await apiClient.post('/api/set-secret-key', { secretKey: secretKey.trim() });
      if (response.success) {
        setSecretKeySuccess(true);
        setSecretKey('');
        setShowSecretKeyInput(false);
        if (onCreditsUpdate) onCreditsUpdate();
        loadProjects();
      }
    } catch (err: any) {
      setSecretKeyError(err?.message || 'Invalid secret key');
    } finally {
      setSecretKeyLoading(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Logo size={28} withText textSizeClass="text-lg" />
      </div>

      {/* New Project Button */}
      <div className="p-3">
        <button
          onClick={() => { onCreateNew(); setMobileMenuOpen(false); }}
          className="w-full flex items-center justify-center gap-2 btn-primary py-2.5 rounded-lg text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="input-base w-full text-xs py-1.5"
        />
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1">
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Projects</span>
          <button onClick={loadProjects} className="text-muted hover:text-text transition-colors p-0.5" title="Reload">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loadingProjects && [1, 2, 3].map(i => (
          <div key={i} className="h-9 rounded-lg skeleton-loader mx-1 mb-1" />
        ))}

        {projectError && <p className="text-xs text-red-500 px-2 py-1">{projectError}</p>}

        {!loadingProjects && filteredProjects.length === 0 && (
          <div className="text-center py-6 px-2">
            <p className="text-xs text-muted">No projects yet</p>
            <button
              onClick={() => { onCreateNew(); setMobileMenuOpen(false); }}
              className="mt-2 text-xs text-accent-primary hover:underline"
            >
              Create your first project
            </button>
          </div>
        )}

        {filteredProjects.map(p => (
          <div
            key={p.id}
            className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-overlay cursor-pointer transition-colors mx-1 mb-0.5"
            onClick={() => { onOpenProject(p); setMobileMenuOpen(false); }}
          >
            <div className="w-7 h-7 rounded-md bg-accent-primary/10 text-accent-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text truncate">{p.name}</p>
              <p className="text-[10px] text-muted">{new Date(p.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              onClick={e => deleteProject(p, e)}
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all p-1 rounded"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-2">
        {/* Credits */}
        {creditDisplayValue && (
          <button
            onClick={() => onOpenBilling?.()}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              billingAttentionNeeded
                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                : 'bg-accent-primary/5 text-accent-primary border border-accent-primary/10'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            {billingAttentionNeeded ? `${creditDisplayValue} credits left` : `${creditDisplayValue} credits`}
          </button>
        )}

        {/* Nav buttons row */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenSettings?.()}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted hover:text-text hover:bg-surface-overlay transition-colors"
            title="Settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            onClick={cycleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted hover:text-text hover:bg-surface-overlay transition-colors"
            title={`Theme: ${theme}`}
          >
            {themeIcon}
          </button>
          {!secretKeySuccess && (
            <button
              onClick={() => setShowSecretKeyInput(o => !o)}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted hover:text-text hover:bg-surface-overlay transition-colors"
              title="Secret Key"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </button>
          )}
        </div>

        {/* Secret Key Input */}
        {showSecretKeyInput && !secretKeySuccess && (
          <div className="space-y-2 animate-fade-in">
            <input
              type="text"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              placeholder="Enter secret key..."
              className="input-base w-full text-xs"
              onKeyPress={e => e.key === 'Enter' && handleSecretKeySubmit()}
              disabled={secretKeyLoading}
            />
            {secretKeyError && <p className="text-xs text-red-500">{secretKeyError}</p>}
            <button
              onClick={handleSecretKeySubmit}
              disabled={secretKeyLoading || !secretKey.trim()}
              className="w-full btn-primary py-1.5 text-xs rounded-lg disabled:opacity-50"
            >
              {secretKeyLoading ? 'Verifying...' : 'Activate'}
            </button>
          </div>
        )}

        {secretKeySuccess && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs px-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Unlimited Access
          </div>
        )}

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-overlay transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-text truncate">{username}</p>
              <p className="text-[10px] text-muted truncate">{userEmail || ''}</p>
            </div>
            <svg className={`w-4 h-4 text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 card shadow-lg rounded-lg overflow-hidden animate-scale-in z-50">
              <div className="py-1">
                <button
                  onClick={() => { onOpenBilling?.(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:bg-surface-overlay transition-colors text-left"
                >
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Billing
                </button>
                <div className="my-0.5 mx-3 border-t border-border" />
                <button
                  onClick={() => { onLogout(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4">
        <Logo size={24} withText textSizeClass="text-base" />
        <div className="flex items-center gap-2">
          {creditDisplayValue && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              billingAttentionNeeded ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-accent-primary/10 text-accent-primary'
            }`}>
              {creditDisplayValue}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface-overlay transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <aside className="lg:hidden fixed left-0 top-14 bottom-0 w-72 bg-surface border-r border-border z-50 animate-slide-down">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};
