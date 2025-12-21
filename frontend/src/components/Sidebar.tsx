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
  const [open, setOpen] = useState(false); // mobile slide-in (<= lg)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored ? stored === '1' : true; // default collapsed (logo only)
    } catch { return true; }
  });
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const desktopWidthClass = collapsed ? 'lg:w-16' : 'lg:w-72';
  const mobileWidthClass = collapsed ? 'w-16' : 'w-72';
  const sidebarWidthClass = open
    ? `w-[78vw] max-w-sm sm:max-w-md ${desktopWidthClass}`
    : `${mobileWidthClass} ${desktopWidthClass}`;
  const isCollapsedView = collapsed && !open;

  // Persist collapse state
  useEffect(() => {
    try { localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [collapsed]);
  const [theme, setTheme] = useState<ThemeChoice>(() => (typeof window === 'undefined' ? 'system' : readThemeChoice()));
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('User');
  const [secretKey, setSecretKey] = useState('');
  const [secretKeyError, setSecretKeyError] = useState('');
  const [secretKeyLoading, setSecretKeyLoading] = useState(false);
  const [secretKeySuccess, setSecretKeySuccess] = useState(false);
  const [showSecretKeyInput, setShowSecretKeyInput] = useState(false);
  const creditDisplayValue = hasUnlimitedCredits ? '∞' : typeof credits === 'number' ? String(credits) : null;
  const billingAttentionNeeded = typeof credits === 'number' && credits < 3 && !hasUnlimitedCredits;
  const handleBillingOpen = () => {
    if (!onOpenBilling) return;
    onOpenBilling();
    setOpen(false);
  };

  const handleSettingsOpen = () => {
    if (!onOpenSettings) return;
    onOpenSettings();
    setOpen(false);
  };

  // Collapse on outside click (desktop) or overlay click (mobile)
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!sidebarRef.current) return;
      
      // Check if click is inside sidebar or notifications panel
      const isInsideSidebar = sidebarRef.current.contains(e.target as Node);
      const isInsideNotifications = notificationsRef.current?.contains(e.target as Node);
      
      if (isInsideSidebar || isInsideNotifications) return; // inside sidebar or notifications
      
      // If expanded (not collapsed) and pointer is outside, collapse
      if (!collapsed) setCollapsed(true);
      // If mobile menu open and click outside, close it
      if (open) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If notifications are open, close them first
        if (showNotifications) {
          setShowNotifications(false);
          return;
        }
        // Otherwise, collapse sidebar or close mobile menu
        if (!collapsed) setCollapsed(true);
        if (open) setOpen(false);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown, { capture: true });
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true } as any);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [collapsed, open, showNotifications]);

  // Decode token for user info
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    let derivedName = 'User';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        if (payload?.email) {
          setUserEmail(payload.email);
          derivedName = payload.email.split('@')[0];
        }
      } catch {/* ignore */}
    }
    const storedDisplayName = localStorage.getItem('profileDisplayName');
    setUsername(storedDisplayName || derivedName);
  }, []);

  useEffect(() => {
    const handleDisplayNameUpdate = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) setUsername(detail);
    };
    window.addEventListener('profile:displayName', handleDisplayNameUpdate as EventListener);
    return () => window.removeEventListener('profile:displayName', handleDisplayNameUpdate as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = initializeThemeFromStorage();
    setTheme(current);
    const handleThemeBroadcast = (event: Event) => {
      const detail = (event as CustomEvent<ThemeChoice>).detail;
      setTheme(detail);
    };
    window.addEventListener('theme:change', handleThemeBroadcast as EventListener);
    return () => window.removeEventListener('theme:change', handleThemeBroadcast as EventListener);
  }, []);

  const handleThemeChange = (choice: ThemeChoice) => {
    setTheme(choice);
    persistThemeChoice(choice);
  };

  // Handle secret key submission
  const handleSecretKeySubmit = async () => {
    if (!secretKey.trim()) {
      setSecretKeyError('Please enter a secret key');
      return;
    }

    setSecretKeyLoading(true);
    setSecretKeyError('');

    try {
      const response = await apiClient.post('/api/set-secret-key', { secretKey: secretKey.trim() });
      
      if (response.success) {
        setSecretKeySuccess(true);
        setSecretKey('');
        setShowSecretKeyInput(false);
        // Show success notification
        setNotifications(prev => [{ 
          id: Date.now().toString(), 
          message: 'Unlimited credits activated! 🎉', 
          type: 'success', 
          ts: Date.now() 
        }, ...prev]);
        // Refresh credits in parent component
        if (onCreditsUpdate) {
          onCreditsUpdate();
        }
        // Refresh projects or other data if needed
        loadProjects();
      }
    } catch (err: any) {
      setSecretKeyError(err?.message || 'Invalid secret key');
    } finally {
      setSecretKeyLoading(false);
    }
  };

  // Get dynamic sidebar background color based on theme - now transparent
  const getSidebarBg = () => {
    return 'transparent';
  };

  // Quick toggle cycles dark -> light -> system -> dark
  const cycleTheme = () => {
    const order: ThemeChoice[] = ['dark', 'light', 'system'];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    handleThemeChange(next);
    pushNotification(`Theme: ${next}`, 'info');
  };

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyThemeChoice('system');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);

  // Load projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    setProjectError(null);
    try {
      const data = await apiClient.get('/api/get-projects');
      // Expecting an array; map to our ProjectItem structure
      const list: ProjectItem[] = (Array.isArray(data) ? data : (data?.projects || []))
        .map((p: any) => ({
          id: p.id || p._id || p.projectId || Math.random().toString(36).slice(2),
            name: p.name || p.title || 'Untitled Project',
            createdAt: p.createdAt || p.date || new Date().toISOString(),
            previewUrl: p.previewUrl || p.url || p.preview,
            previewId: p.previewId || (() => {
              const url: string | undefined = p.previewUrl || p.url || p.preview;
              if (!url || typeof url !== 'string') return undefined;
              try {
                const parts = url.split('?')[0].split('/').filter(Boolean);
                return parts[parts.length - 1];
              } catch { return undefined; }
            })()
        }));
      setProjects(list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setProjectError(err.message || 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load projects on mount
  useEffect(() => { loadProjects(); }, []);

  // Listen for project refresh events (e.g., when a new project is saved)
  useEffect(() => {
    const handleProjectRefresh = () => loadProjects();
    window.addEventListener('projects:refresh', handleProjectRefresh);
    return () => window.removeEventListener('projects:refresh', handleProjectRefresh);
  }, []);

  const deleteProject = async (project: ProjectItem) => {
    if (!confirm('Delete this project? This action cannot be undone.')) return;
    try {
      // Align with existing backend route that deletes previews: DELETE /api/preview/:previewId
      const previewId = project.previewId;
      if (previewId) {
        await apiClient.delete(`/api/preview/${previewId}`);
      } else {
        pushNotification('No preview reference found; removed locally only', 'warning');
      }
      setProjects(p => p.filter(pr => pr.id !== project.id));
      pushNotification('Project deleted', 'info');
    } catch {
      pushNotification('Failed to delete project', 'error');
    }
  };

  // Notifications
  const pushNotification = (message: string, type: NotificationItem['type'] = 'info') => {
    setNotifications(prev => [{ id: Math.random().toString(36).slice(2), message, type, ts: Date.now() }, ...prev.slice(0, 24)]);
  };

  // Example initial notification
  useEffect(() => { pushNotification('Welcome back!'); }, []);

  const filteredProjects = projects.filter(p => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
  });

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="lg:hidden fixed top-3 left-3 z-50 px-3 py-2 rounded-md bg-black/20 backdrop-blur-sm border border-white/10 text-text hover:bg-black/30 shadow-md"
        aria-label="Toggle navigation"
      >
        {!open && '☰'}
      </button>
      <aside
        ref={sidebarRef}
        className={`group/sidebar fixed lg:static top-0 left-0 h-full lg:h-auto z-40 transform flex flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarWidthClass} transition-[width,transform] duration-500 ease-[cubic-bezier(.4,0,.2,1)]`}
        style={{ backgroundColor: getSidebarBg() }}
      >
            <div className={`${isCollapsedView ? 'p-1 justify-center gap-2' : 'p-4 gap-2'} flex items-center`}>
          <button
            onClick={() => {
              if (isCollapsedView) {
                setCollapsed(false);
                setOpen(true);
              } else {
                setCollapsed(true);
                setOpen(false);
              }
            }}
            className={`relative flex items-center justify-center rounded-xl transition-all duration-300 focus:outline-none ${isCollapsedView ? 'w-14 h-14' : 'w-14 h-14'} hover:scale-[1.02] active:scale-[0.98]`}
            aria-label={isCollapsedView ? 'Expand navigation' : 'Collapse navigation'}
          >
            <Logo size={48} withText={!isCollapsedView} textSizeClass="text-2xl" />
          </button>
          
          {!isCollapsedView && (
            <div className="ml-auto flex items-center gap-2">
              <button onClick={cycleTheme} className="text-text/60 hover:text-white text-lg transition-transform duration-300 hover:scale-110 focus:outline-none" title={`Toggle theme (${theme})`} aria-label="Toggle theme">
                {theme === 'dark' ? '🌙' : theme === 'light' ? '🔆' : '🖥'}
              </button>
              <button onClick={() => setShowNotifications(s => !s)} className="text-text/60 hover:text-white text-lg transition-transform duration-300 hover:scale-110 focus:outline-none" title="Notifications">🔔</button>
                  <button
                    onClick={() => setCollapsed(true)}
                    className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-md bg-black/20 backdrop-blur-sm text-text/60 hover:text-text hover:bg-black/30 transition-colors focus:outline-none"
                    title="Collapse sidebar"
                    aria-label="Collapse sidebar"
                  >‹</button>
            </div>
          )}
        </div>
        {/* User Info */}
        {!isCollapsedView && (
          <div className="p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple grid place-items-center text-sm font-bold shadow-lg/30" title={username}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate flex items-center gap-2">
                <span className="truncate">{username}</span>
                {creditDisplayValue && (
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${billingAttentionNeeded ? 'border-red-400/40 text-red-200 bg-red-500/10' : 'border-white/10 text-accent-cyan bg-black/30'}`}>
                    ⚡ {creditDisplayValue}
                  </span>
                )}
              </p>
              <p className="text-xs text-text/50 truncate" title={userEmail}>{userEmail || '—'}</p>
            </div>
          </div>
        )}
        {/* Theme Switcher */}
  {!isCollapsedView && (
      <div className="p-4 animate-fade-in" style={{animationDelay:'60ms'}}>
            <p className="text-xs uppercase tracking-wide text-text/50 mb-2">Theme</p>
            <div className="flex gap-2">
              {(['dark','light','system'] as ThemeChoice[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
    className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${theme===t ? 'bg-accent-cyan text-black shadow-[0_0_0_1px_rgba(0,255,255,0.35)]' : 'bg-background text-text/60 hover:text-text hover:bg-background/80'}`}
                >{t.charAt(0).toUpperCase()+t.slice(1)}</button>
              ))}
            </div>
          </div>
        )}
        {/* Quick Actions */}
        {!isCollapsedView && (
          <div className="p-4 flex flex-wrap gap-2 animate-fade-in" style={{animationDelay:'90ms'}}>
            <button onClick={onCreateNew} className="flex-1 px-3 py-2 rounded-md bg-accent-cyan text-black text-xs font-semibold hover:brightness-110 transition-all focus:outline-none">➕ New</button>
            <button onClick={loadProjects} className="flex-1 px-3 py-2 rounded-md bg-accent-purple/80 text-white text-xs font-semibold hover:brightness-110 transition-all focus:outline-none">⟳ Reload</button>
            <button onClick={() => pushNotification('Data refreshed')} className="flex-1 px-3 py-2 rounded-md bg-background text-text text-xs font-semibold hover:bg-background/80 transition-all focus:outline-none">🔄 Refresh</button>
          </div>
        )}
        {!isCollapsedView && onOpenBilling && (
          <div className="px-4 animate-fade-in" style={{animationDelay:'110ms'}}>
            <button
              onClick={handleBillingOpen}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-all focus:outline-none border ${billingAttentionNeeded ? 'bg-red-500/20 text-red-100 border-red-400/40 hover:bg-red-500/30' : 'bg-background text-text border-white/10 hover:bg-background/80'}`}
            >
              <span className="text-base">💳</span>
              <span>Manage Billing</span>
            </button>
          </div>
        )}
        {/* Search */}
        {!isCollapsedView && (
      <div className="p-4 animate-fade-in" style={{animationDelay:'120ms'}}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
        className="w-full px-3 py-2 rounded-md bg-background text-sm focus:outline-none focus:ring-0 focus:bg-background/80 transition-colors placeholder:text-text/40"
            />
          </div>
        )}
        {/* Projects List */}
        {!isCollapsedView && (
      <div className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in" style={{animationDelay:'150ms'}}>
          <p className="px-4 py-2 text-xs uppercase tracking-wide text-text/50">Projects</p>
          {loadingProjects && <p className="px-4 text-xs text-text/60">Loading...</p>}
          {projectError && <p className="px-4 text-xs text-red-400">{projectError}</p>}
          {filteredProjects.length === 0 && !loadingProjects && !projectError && (
            <p className="px-4 text-xs text-text/60">No projects</p>
          )}
          <ul className="space-y-1 px-2 pb-4">
            {filteredProjects.map(p => (
        <li key={p.id} className="group rounded-md border border-transparent hover:border-accent-purple/30 hover:bg-background transition-colors" title={isCollapsedView ? p.name : undefined}>
                <div className={`flex items-center ${isCollapsedView ? 'justify-center' : 'gap-2'} px-3 py-2`}>
                  <button
                    onClick={() => onOpenProject(p)}
                    className={`text-left text-xs ${isCollapsedView ? 'w-full flex items-center justify-center' : 'flex-1'}`}
                  >
                    {isCollapsedView ? (
                      <span className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-cyan to-accent-purple grid place-items-center text-[11px] font-bold">
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <>
                        <p className="font-medium truncate text-[13px] text-white/90 group-hover:text-white">{p.name}</p>
                        <p className="text-[10px] text-text/50">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </>
                    )}
                  </button>
            {!isCollapsedView && (
                    <button
            onClick={() => deleteProject(p)}
                      className="text-text/40 hover:text-red-400 text-xs"
                      title="Delete"
                    >🗑</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        )}
        {/* Nav Links (placeholder for future sections) */}
        {!isCollapsedView && (
          <div className="p-4 space-y-2 animate-fade-in" style={{animationDelay:'180ms'}}>
            <div className="flex flex-wrap gap-2">
              <button className="flex-1 px-2 py-2 rounded-md bg-background text-xs text-text/70 hover:text-text hover:bg-background/80 focus:outline-none">👤 Profile</button>
              <button
                onClick={handleSettingsOpen}
                className="flex-1 px-2 py-2 rounded-md bg-background text-xs text-text/70 hover:text-text hover:bg-background/80 focus:outline-none"
              >
                ⚙ Settings
              </button>
            </div>
          </div>
        )}
        {/* Secret Key Input Section */}
        {!isCollapsedView && (
          <div className="p-4 space-y-3">
            {!showSecretKeyInput && !secretKeySuccess && (
              <button
                onClick={() => setShowSecretKeyInput(true)}
                className="w-full py-2 px-3 rounded-lg bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple text-xs font-medium transition-colors border border-accent-purple/20"
              >
                🔑 Unlock Unlimited Access
              </button>
            )}

            {showSecretKeyInput && (
              <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-accent-purple/20 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text/70 font-medium">Secret Key</span>
                  <button
                    onClick={() => {
                      setShowSecretKeyInput(false);
                      setSecretKey('');
                      setSecretKeyError('');
                    }}
                    className="text-text/40 hover:text-text/70 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Enter your key..."
                  className="w-full px-3 py-2 bg-background border border-accent-purple/20 rounded-lg text-xs text-text focus:outline-none focus:border-accent-cyan transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSecretKeySubmit()}
                  disabled={secretKeyLoading}
                />
                {secretKeyError && (
                  <p className="text-xs text-red-400">{secretKeyError}</p>
                )}
                <button
                  onClick={handleSecretKeySubmit}
                  disabled={secretKeyLoading || !secretKey.trim()}
                  className="w-full py-2 px-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-black rounded-lg text-xs font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {secretKeyLoading ? 'Verifying...' : 'Activate'}
                </button>
              </div>
            )}

            {secretKeySuccess && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 animate-fade-in">
                <div className="flex items-center gap-2 text-green-400 text-xs">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Unlimited Access Active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {!isCollapsedView && (
          <div className="p-4 flex items-center justify-between text-xs text-text/60 transition-colors">          
            <button onClick={onLogout} className="px-3 py-2 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 font-semibold text-[11px] transition-colors focus:outline-none">Logout</button>
            <span className="text-[10px]">v0.1.0</span>
          </div>
        )}
      </aside>
      {/* Notifications Panel */}
      {showNotifications && !isCollapsedView && (
        <div 
          ref={notificationsRef}
          className="fixed top-0 hidden lg:flex h-full z-30 flex-col transition-all" 
          style={{ left: collapsed ? '5rem' : '18rem', width: '20rem', backgroundColor: getSidebarBg() }}
        >
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-text/60 hover:text-text text-xs">Close</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {notifications.length === 0 && <p className="text-xs text-text/50">No notifications</p>}
            {notifications.map(n => (
              <div key={n.id} className={`rounded-md p-2 text-xs border ${(n.type==='error')?'border-red-500/40 bg-red-500/10': n.type==='success'?'border-green-500/40 bg-green-500/10': n.type==='warning'?'border-yellow-500/40 bg-yellow-500/10':'border-accent-purple/30 bg-[#202020]'}`}> 
                <p className="leading-tight">{n.message}</p>
                <p className="text-[9px] mt-1 text-text/40">{new Date(n.ts).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity" onClick={() => setOpen(false)} />
      )}
    </>
  );
};
