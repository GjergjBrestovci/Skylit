import React, { useEffect, useState, useCallback } from 'react';
import { Logo } from './ui/Logo';
import { apiClient } from '../utils/apiClient';

type ThemeChoice = 'system' | 'dark' | 'light';

interface ProjectItem {
  id: string;
  name: string;
  createdAt: string;
  previewUrl?: string;
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
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, onCreateNew, onOpenProject }) => {
  const [open, setOpen] = useState(false); // mobile toggle
  const [theme, setTheme] = useState<ThemeChoice>('system');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('User');

  // Decode token for user info
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        if (payload?.email) setUserEmail(payload.email);
        if (payload?.email) setUsername(payload.email.split('@')[0]);
      } catch {/* ignore */}
    }
  }, []);

  // Theme handling
  const applyTheme = useCallback((choice: ThemeChoice) => {
    const root = document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let finalTheme: 'dark' | 'light';
    if (choice === 'system') finalTheme = systemPrefersDark ? 'dark' : 'light'; else finalTheme = choice;
    root.classList.remove('light', 'dark');
    root.classList.add(finalTheme);
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem('themeChoice') as ThemeChoice) || 'system';
    setTheme(stored);
    applyTheme(stored);
  }, [applyTheme]);

  const handleThemeChange = (choice: ThemeChoice) => {
    setTheme(choice);
    localStorage.setItem('themeChoice', choice);
    applyTheme(choice);
  };

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system');
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme, applyTheme]);

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
            previewUrl: p.previewUrl || p.url || p.preview
        }));
      setProjects(list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setProjectError(err.message || 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project? This action cannot be undone.')) return;
    try {
      await apiClient.delete(`/api/projects/${id}`); // Assuming RESTful path
      setProjects(p => p.filter(pr => pr.id !== id));
      pushNotification('Project deleted', 'info');
    } catch (err: any) {
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
        className="lg:hidden fixed top-3 left-3 z-50 px-3 py-2 rounded-md bg-[#1f1f1f] border border-accent-purple/30 text-text hover:bg-[#242424] shadow-md"
        aria-label="Toggle navigation"
      >
        {open ? '✖' : '☰'}
      </button>
      <aside
        className={`fixed lg:static top-0 left-0 h-full lg:h-auto z-40 transform transition-transform duration-300 w-72 bg-[#161616] border-r border-accent-purple/20 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-accent-purple/20">
          <Logo size={44} withText textSizeClass="text-2xl" />
          <button onClick={() => setShowNotifications(s => !s)} className="text-text/70 hover:text-white text-lg" title="Notifications">🔔</button>
        </div>
        {/* User Info */}
        <div className="p-4 flex items-center gap-3 border-b border-accent-purple/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple grid place-items-center text-sm font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{username}</p>
              <p className="text-xs text-text/50 truncate" title={userEmail}>{userEmail || '—'}</p>
            </div>
        </div>
        {/* Theme Switcher */}
        <div className="p-4 border-b border-accent-purple/10">
          <p className="text-xs uppercase tracking-wide text-text/50 mb-2">Theme</p>
          <div className="flex gap-2">
            {(['dark','light','system'] as ThemeChoice[]).map(t => (
              <button
                key={t}
                onClick={() => handleThemeChange(t)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${theme===t ? 'bg-accent-cyan text-black border-accent-cyan' : 'border-accent-purple/30 text-text/60 hover:text-text'}`}
              >{t.charAt(0).toUpperCase()+t.slice(1)}</button>
            ))}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="p-4 border-b border-accent-purple/10 flex flex-wrap gap-2">
          <button onClick={onCreateNew} className="flex-1 px-3 py-2 rounded-md bg-accent-cyan text-black text-xs font-semibold hover:brightness-110">➕ New</button>
          <button onClick={loadProjects} className="flex-1 px-3 py-2 rounded-md bg-accent-purple/80 text-white text-xs font-semibold hover:brightness-110">⟳ Reload</button>
          <button onClick={() => pushNotification('Data refreshed')} className="flex-1 px-3 py-2 rounded-md bg-[#222] text-text text-xs font-semibold hover:bg-[#2a2a2a]">🔄 Refresh</button>
        </div>
        {/* Search */}
        <div className="p-4 border-b border-accent-purple/10">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full px-3 py-2 rounded-md bg-[#1f1f1f] border border-accent-purple/30 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
          />
        </div>
        {/* Projects List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <p className="px-4 py-2 text-xs uppercase tracking-wide text-text/50">Projects</p>
          {loadingProjects && <p className="px-4 text-xs text-text/60">Loading...</p>}
          {projectError && <p className="px-4 text-xs text-red-400">{projectError}</p>}
          {filteredProjects.length === 0 && !loadingProjects && !projectError && (
            <p className="px-4 text-xs text-text/60">No projects</p>
          )}
          <ul className="space-y-1 px-2 pb-4">
            {filteredProjects.map(p => (
              <li key={p.id} className="group rounded-md border border-transparent hover:border-accent-purple/30 hover:bg-[#1f1f1f] transition-colors">
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    onClick={() => onOpenProject(p)}
                    className="flex-1 text-left text-xs"
                  >
                    <p className="font-medium truncate text-[13px] text-white/90 group-hover:text-white">{p.name}</p>
                    <p className="text-[10px] text-text/50">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </button>
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="text-text/40 hover:text-red-400 text-xs"
                    title="Delete"
                  >🗑</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Nav Links (placeholder for future sections) */}
        <div className="p-4 border-t border-accent-purple/10 flex flex-wrap gap-2">
          <button className="flex-1 px-2 py-2 rounded-md bg-[#1f1f1f] text-xs text-text/70 hover:text-white hover:bg-[#232323]">🏠 Dashboard</button>
          <button className="flex-1 px-2 py-2 rounded-md bg-[#1f1f1f] text-xs text-text/70 hover:text-white hover:bg-[#232323]">👤 Profile</button>
          <button className="flex-1 px-2 py-2 rounded-md bg-[#1f1f1f] text-xs text-text/70 hover:text-white hover:bg-[#232323]">⚙ Settings</button>
        </div>
        <div className="p-4 pt-2 border-t border-accent-purple/20 flex items-center justify-between text-xs text-text/60">
          <button onClick={onLogout} className="px-3 py-2 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[11px] font-semibold">Logout</button>
          <span className="text-[10px]">v0.1.0</span>
        </div>
      </aside>
      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-0 left-72 hidden lg:block w-80 h-full bg-[#181818] border-l border-r border-accent-purple/20 z-30 flex flex-col">
          <div className="p-4 border-b border-accent-purple/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-text/60 hover:text-white text-xs">Close</button>
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
    </>
  );
};
