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
  const [projectsPanelOpen, setProjectsPanelOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showSecretKeyInput, setShowSecretKeyInput] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');
  const [secretKeyLoading, setSecretKeyLoading] = useState(false);
  const [secretKeySuccess, setSecretKeySuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('User');
  const [theme, setTheme] = useState<ThemeChoice>(() => (typeof window === 'undefined' ? 'system' : readThemeChoice()));

  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const projectsPanelRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const creditDisplayValue = hasUnlimitedCredits ? '∞' : typeof credits === 'number' ? String(credits) : null;
  const billingAttentionNeeded = typeof credits === 'number' && credits < 3 && !hasUnlimitedCredits;

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!userDropdownRef.current?.contains(t)) setUserDropdownOpen(false);
      if (!projectsPanelRef.current?.contains(t)) setProjectsPanelOpen(false);
      if (!notifRef.current?.contains(t)) setNotificationsOpen(false);
    };
    window.addEventListener('pointerdown', handler, true);
    return () => window.removeEventListener('pointerdown', handler, true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserDropdownOpen(false);
        setProjectsPanelOpen(false);
        setNotificationsOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '🔆' : '🖥';

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
    } catch { /* show nothing */ }
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

  const pushNotification = (message: string, type: NotificationItem['type'] = 'info') => {
    setNotifications(prev => [{ id: Math.random().toString(36).slice(2), message, type, ts: Date.now() }, ...prev.slice(0, 24)]);
  };

  useEffect(() => { pushNotification('Welcome back!'); }, []);

  return (
    <>
      {/* ── Top Navbar ───────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-navbar">
        <div className="max-w-screen-2xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Logo size={36} withText textSizeClass="text-xl font-bold" />
            <button
              onClick={() => { onCreateNew(); setProjectsPanelOpen(false); }}
              className="hidden sm:flex items-center gap-1.5 btn-gradient text-sm font-semibold px-4 py-2 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              New Project
            </button>
          </div>

          {/* Center: Projects (desktop) */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setProjectsPanelOpen(o => !o)}
              className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ' +
                (projectsPanelOpen
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
              Projects
              {projects.length > 0 && (
                <span className="text-[11px] bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded-full font-semibold">
                  {projects.length}
                </span>
              )}
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Credits */}
            {creditDisplayValue && (
              <button
                onClick={() => onOpenBilling?.()}
                className={'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ' +
                  (billingAttentionNeeded
                    ? 'bg-red-500/15 border-red-400/40 text-red-300 hover:bg-red-500/25'
                    : 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary hover:bg-accent-primary/20')}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                {creditDisplayValue} credits
              </button>
            )}

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(o => !o)}
                className={'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ' +
                  (notificationsOpen ? 'bg-accent-primary/15 text-accent-primary' : 'text-white/60 hover:text-white hover:bg-white/8')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-secondary text-[9px] font-bold text-white flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 glass-card shadow-glass-lg rounded-xl overflow-hidden animate-fade-in z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <button onClick={() => { setNotifications([]); setNotificationsOpen(false); }} className="text-xs text-white/50 hover:text-white transition-colors">Clear all</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                    {notifications.length === 0 && <p className="px-4 py-6 text-sm text-center text-white/40">No notifications</p>}
                    {notifications.map(n => (
                      <div key={n.id} className={'px-4 py-3 text-sm ' + (n.type === 'error' ? 'border-l-2 border-red-500' : n.type === 'success' ? 'border-l-2 border-green-500' : n.type === 'warning' ? 'border-l-2 border-yellow-500' : 'border-l-2 border-accent-primary/50')}>
                        <p className="text-white/90 text-xs leading-snug">{n.message}</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{new Date(n.ts).toLocaleTimeString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(o => !o)}
                className={'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ' + (userDropdownOpen ? 'bg-white/8' : 'hover:bg-white/5')}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-medium text-white/90 max-w-[110px] truncate">{username}</span>
                  {creditDisplayValue && (
                    <span className={'text-[10px] ' + (billingAttentionNeeded ? 'text-red-400' : 'text-accent-primary/70')}>
                      {billingAttentionNeeded ? '⚠ Low credits' : '⚡ ' + creditDisplayValue}
                    </span>
                  )}
                </div>
                <svg className={'w-4 h-4 text-white/40 transition-transform duration-200 ' + (userDropdownOpen ? 'rotate-180' : '')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-12 w-64 glass-card shadow-glass-lg rounded-xl overflow-hidden animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-white/6">
                    <p className="text-sm font-semibold text-white truncate">{username}</p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{userEmail || '—'}</p>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { onOpenSettings?.(); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
                      <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                      Settings
                    </button>
                    {onOpenBilling && (
                      <button onClick={() => { onOpenBilling(); setUserDropdownOpen(false); }} className={'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ' + (billingAttentionNeeded ? 'text-red-300 hover:text-red-200 hover:bg-red-500/10' : 'text-white/80 hover:text-white hover:bg-white/5')}>
                        <svg className={'w-4 h-4 ' + (billingAttentionNeeded ? 'text-red-400' : 'text-white/50')} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        {billingAttentionNeeded ? '⚠ Billing (Low)' : 'Billing & Credits'}
                      </button>
                    )}
                    <button onClick={cycleTheme} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left">
                      <span className="text-base">{themeIcon}</span>
                      Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                    <div className="my-1 border-t border-white/6" />
                    {!secretKeySuccess && (
                      <button onClick={() => setShowSecretKeyInput(o => !o)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-accent-primary hover:bg-accent-primary/5 transition-colors text-left">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        Unlock Unlimited Access
                      </button>
                    )}
                    {secretKeySuccess && (
                      <div className="px-4 py-2.5 flex items-center gap-2 text-green-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Unlimited Access Active
                      </div>
                    )}
                    {showSecretKeyInput && !secretKeySuccess && (
                      <div className="px-4 py-3 space-y-2 border-t border-white/6 animate-fade-in">
                        <input
                          type="text"
                          value={secretKey}
                          onChange={e => setSecretKey(e.target.value)}
                          placeholder="Enter secret key..."
                          className="w-full px-3 py-2 text-xs bg-[#0f0f1a] rounded-lg border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-accent-primary/50 transition-colors"
                          onKeyPress={e => e.key === 'Enter' && handleSecretKeySubmit()}
                          disabled={secretKeyLoading}
                        />
                        {secretKeyError && <p className="text-xs text-red-400">{secretKeyError}</p>}
                        <button onClick={handleSecretKeySubmit} disabled={secretKeyLoading || !secretKey.trim()} className="w-full py-1.5 px-3 btn-gradient text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                          {secretKeyLoading ? 'Verifying…' : 'Activate'}
                        </button>
                      </div>
                    )}
                    <div className="my-1 border-t border-white/6" />
                    <button onClick={() => { onLogout(); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Projects Panel ──────────────────────────────────────── */}
      {projectsPanelOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={() => setProjectsPanelOpen(false)} />
          <div ref={projectsPanelRef} className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 z-50 glass-card rounded-none rounded-r-2xl shadow-glass-lg flex flex-col animate-fade-in overflow-hidden">
            <div className="p-4 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Projects</h3>
              <button onClick={loadProjects} className="text-white/40 hover:text-accent-primary transition-colors" title="Reload">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
            <div className="px-4 py-3 border-b border-white/5">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full px-3 py-2 text-sm bg-[#0f0f1a] rounded-lg border border-white/8 text-white placeholder:text-white/40 focus:outline-none focus:border-accent-primary/50 transition-colors" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {loadingProjects && [1,2,3].map(i => <div key={i} className="h-10 rounded-lg skeleton-loader" />)}
              {projectError && <p className="text-xs text-red-400 px-2">{projectError}</p>}
              {!loadingProjects && filteredProjects.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-white/40">No projects yet</p>
                  <button onClick={() => { onCreateNew(); setProjectsPanelOpen(false); }} className="mt-3 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors">Create your first project →</button>
                </div>
              )}
              {filteredProjects.map(p => (
                <div key={p.id} className="group flex items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-accent-primary/15 transition-all cursor-pointer" onClick={() => { onOpenProject(p); setProjectsPanelOpen(false); }}>
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-primary/30 to-accent-secondary/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 group-hover:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-white/40">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={e => deleteProject(p, e)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-1 rounded" title="Delete">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Mobile Menu ─────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden fixed top-16 left-0 right-0 z-50 glass-card border-t border-white/8 shadow-glass-lg animate-fade-in">
            <div className="p-4 space-y-3">
              {creditDisplayValue && (
                <div className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm ' + (billingAttentionNeeded ? 'bg-red-500/10 text-red-300 border border-red-400/20' : 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20')}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                  {billingAttentionNeeded ? 'Only ' + creditDisplayValue + ' credits left' : creditDisplayValue + ' credits remaining'}
                </div>
              )}
              <button onClick={() => { onCreateNew(); setMobileMenuOpen(false); }} className="w-full btn-gradient py-3 rounded-xl text-sm font-semibold">+ New Project</button>
              <button onClick={() => { setProjectsPanelOpen(o => !o); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 bg-white/4 rounded-xl border border-white/8 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
                My Projects ({projects.length})
              </button>
              {onOpenSettings && (
                <button onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 bg-white/4 rounded-xl border border-white/8 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
                  Settings
                </button>
              )}
              {onOpenBilling && (
                <button onClick={() => { onOpenBilling(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 bg-white/4 rounded-xl border border-white/8 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  Billing
                </button>
              )}
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 bg-red-500/8 rounded-xl border border-red-500/15 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
