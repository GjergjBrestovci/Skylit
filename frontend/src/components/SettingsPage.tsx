import { useEffect, useMemo, useRef, useState } from 'react';
import type { UserSettings, ThemePreference } from '../types';
import { persistThemeChoice } from '../utils/theme';
import { TECH_STACKS } from '../constants/websiteOptions';

interface SettingsPageProps {
  open: boolean;
  settings: UserSettings | null;
  loading: boolean;
  saving: boolean;
  error?: string | null;
  userEmail?: string;
  onClose: () => void;
  onSave: (nextSettings: UserSettings) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

const DEFAULT_DRAFT: UserSettings = {
  displayName: null,
  themePreference: 'system',
  notifications: {
    productUpdates: true,
    weeklySummary: false,
    aiLaunches: true
  },
  workspace: {
    autosaveInterval: 5,
    showBetaFeatures: false
  },
  integrations: {
    apiMirroringEnabled: false,
    webhookUrl: null
  }
};

const themeOptions: { label: string; value: ThemePreference; description: string }[] = [
  { label: 'System', value: 'system', description: 'Match your device preferences' },
  { label: 'Dark', value: 'dark', description: 'Always use the dark UI' },
  { label: 'Light', value: 'light', description: 'Switch to lighter surfaces' }
];

const readDefault = (key: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) || fallback;
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  open,
  settings,
  loading,
  saving,
  error,
  userEmail,
  onClose,
  onSave,
  onRefresh
}) => {
  const [draft, setDraft] = useState<UserSettings>(DEFAULT_DRAFT);
  const [localError, setLocalError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimerRef = useRef<number | null>(null);
  const apiBaseUrl = useMemo(() => `${window.location.origin}/api`, []);
  const [defaultTechStack, setDefaultTechStack] = useState(() => readDefault('defaultTechStack', 'vanilla'));
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => readDefault('prefNotifications', '1') !== '0');
  const [autoSaveProjects, setAutoSaveProjects] = useState(() => readDefault('prefAutoSave', '1') !== '0');

  useEffect(() => {
    if (open && settings) {
      setDraft(settings);
    } else if (open && !settings && !loading) {
      setDraft(DEFAULT_DRAFT);
    }
  }, [open, settings, loading]);

  useEffect(() => {
    setLocalError(error ?? null);
  }, [error]);

  useEffect(() => {
    if (settings?.themePreference) {
      persistThemeChoice(settings.themePreference);
    }
  }, [settings?.themePreference]);

  useEffect(() => () => {
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
  }, []);

  const showStatus = (message: string) => {
    setStatusMessage(message);
    if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setStatusMessage(null), 2600);
  };

  const persistDisplayName = (name: string | null) => {
    if (typeof window === 'undefined') return;
    const trimmed = name?.trim() ?? '';
    if (trimmed) {
      window.localStorage.setItem('profileDisplayName', trimmed);
    } else {
      window.localStorage.removeItem('profileDisplayName');
    }
    window.dispatchEvent(new CustomEvent<string>('profile:displayName', { detail: trimmed }));
  };

  if (!open) return null;

  const updateDraft = (updates: {
    displayName?: string | null;
    themePreference?: ThemePreference;
    notifications?: Partial<UserSettings['notifications']>;
    workspace?: Partial<UserSettings['workspace']>;
    integrations?: Partial<UserSettings['integrations']>;
  }) => {
    setDraft(prev => ({
      ...prev,
      displayName: updates.displayName !== undefined ? updates.displayName : prev.displayName,
      themePreference: updates.themePreference ?? prev.themePreference,
      notifications: {
        ...prev.notifications,
        ...(updates.notifications ?? {})
      },
      workspace: {
        ...prev.workspace,
        ...(updates.workspace ?? {})
      },
      integrations: {
        ...prev.integrations,
        ...(updates.integrations ?? {})
      }
    }));
  };

  const handleThemeChange = (next: ThemePreference) => {
    updateDraft({ themePreference: next });
    persistThemeChoice(next);
    showStatus('Theme preview updated');
  };

  const handleSave = async () => {
    setLocalError(null);
    try {
      await onSave(draft);
      persistDisplayName(draft.displayName);
      persistThemeChoice(draft.themePreference);
      showStatus('Settings saved');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const handleTechStackChange = (value: string) => {
    setDefaultTechStack(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('defaultTechStack', value);
      window.dispatchEvent(new CustomEvent<string>('settings:defaultTechStack', { detail: value }));
    }
    showStatus('Default tech stack saved');
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('prefNotifications', next ? '1' : '0');
      }
      showStatus(`Notifications ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const handleAutoSaveToggle = () => {
    setAutoSaveProjects(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('prefAutoSave', next ? '1' : '0');
      }
      showStatus(`Auto-save ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const sectionClass = 'bg-[#101218] border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]';
  const labelClass = 'text-xs uppercase tracking-[0.3em] text-text/60';

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-[#0C0F17]/95 border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/10">
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase text-text/50">Control center</p>
            <h2 className="text-xl font-semibold text-white">Workspace Settings</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-text/60">
            {saving && <span className="text-accent-primary animate-pulse">Saving…</span>}
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition">Close</button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(92vh-72px)]">
          {localError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200">
              {localError}
            </div>
          )}

          {statusMessage && !localError && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white/80">
              {statusMessage}
            </div>
          )}

          <section className={sectionClass}>
            <div>
              <p className={labelClass}>Profile</p>
              <h3 className="text-lg font-semibold text-white">Account identity</h3>
              <p className="text-sm text-text/60">These details are shared with collaborators and in exported projects.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs text-text/60">Display name</span>
                <input
                  value={draft.displayName ?? ''}
                  onChange={e => updateDraft({ displayName: e.target.value })}
                  placeholder="Add a friendly name"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm focus:outline-none focus:border-accent-primary"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs text-text/60">Email</span>
                <input
                  value={userEmail || '—'}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/5 text-sm text-text/60"
                />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex flex-col gap-2">
              <p className={labelClass}>Appearance</p>
              <h3 className="text-lg font-semibold text-white">Theme preference</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`text-left rounded-2xl border p-4 transition backdrop-blur ${
                    draft.themePreference === option.value
                      ? 'border-accent-primary bg-accent-primary/10 text-white'
                      : 'border-white/5 bg-black/20 text-text/70 hover:border-white/20'
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-xs text-text/60 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className={`${sectionClass} grid gap-6 md:grid-cols-2`}>
            <div className="space-y-4">
              <div>
                <p className={labelClass}>Workspace</p>
                <h3 className="text-lg font-semibold text-white">Automation</h3>
                <p className="text-sm text-text/60">Control autosave cadence and experimental betas.</p>
              </div>
              <label className="space-y-2 block">
                <span className="text-xs text-text/60">Autosave interval (minutes)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={draft.workspace.autosaveInterval}
                  onChange={e => updateDraft({ workspace: { autosaveInterval: Number(e.target.value) } })}
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm focus:outline-none focus:border-accent-primary"
                />
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={draft.workspace.showBetaFeatures}
                  onChange={e => updateDraft({ workspace: { showBetaFeatures: e.target.checked } })}
                  className="mt-1 accent-accent-primary"
                />
                <div>
                  <p className="text-sm text-white font-medium">Enable beta experiments</p>
                  <p className="text-xs text-text/60">Access upcoming AI agents and UI changes before the general release.</p>
                </div>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <p className={labelClass}>Notifications</p>
                <h3 className="text-lg font-semibold text-white">Stay informed</h3>
              </div>
              {[
                {
                  label: 'Product updates',
                  description: 'Major launches, credits adjustments, and new templates',
                  key: 'productUpdates' as const
                },
                {
                  label: 'Weekly summary',
                  description: 'One email per week summarizing activity and insights',
                  key: 'weeklySummary' as const
                },
                {
                  label: 'AI launches',
                  description: 'Immediate alerts when new AI models land in Skylit',
                  key: 'aiLaunches' as const
                }
              ].map(item => (
                <label key={item.key} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={draft.notifications[item.key]}
                    onChange={e => updateDraft({ notifications: { [item.key]: e.target.checked } as Partial<UserSettings['notifications']> })}
                    className="mt-1 accent-accent-primary"
                  />
                  <div>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-text/60">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <div>
              <p className={labelClass}>Generation defaults</p>
              <h3 className="text-lg font-semibold text-white">Starting preferences</h3>
              <p className="text-sm text-text/60">Configure how new projects should initialize on this device.</p>
            </div>
            <label className="space-y-2 block">
              <span className="text-xs text-text/60">Preferred tech stack</span>
              <select
                value={defaultTechStack}
                onChange={e => handleTechStackChange(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-accent-primary"
              >
                {TECH_STACKS.map(stack => (
                  <option key={stack.value} value={stack.value}>{stack.name}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleNotificationsToggle}
                className={`rounded-2xl border px-4 py-3 text-left transition ${notificationsEnabled ? 'border-accent-primary bg-accent-primary/10 text-white' : 'border-white/10 text-text/70 hover:border-white/30'}`}
              >
                <p className="font-semibold">Notifications</p>
                <p className="text-xs text-text/60">{notificationsEnabled ? 'Enabled for new builds' : 'Muted for now'}</p>
              </button>
              <button
                onClick={handleAutoSaveToggle}
                className={`rounded-2xl border px-4 py-3 text-left transition ${autoSaveProjects ? 'border-accent-primary bg-accent-primary/10 text-white' : 'border-white/10 text-text/70 hover:border-white/30'}`}
              >
                <p className="font-semibold">Auto-save projects</p>
                <p className="text-xs text-text/60">{autoSaveProjects ? 'Saves every generation' : 'Manual save only'}</p>
              </button>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex flex-col gap-2">
              <p className={labelClass}>API Mirroring</p>
              <h3 className="text-lg font-semibold text-white">Keep your API in sync</h3>
              <p className="text-sm text-text/60">Enable Skylit to mirror successful generations back to your private API consumer.</p>
            </div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={draft.integrations.apiMirroringEnabled}
                onChange={e => updateDraft({ integrations: { apiMirroringEnabled: e.target.checked } })}
                className="mt-1 accent-accent-primary"
              />
              <div>
                <p className="text-sm text-white font-medium">Turn on mirroring</p>
                <p className="text-xs text-text/60">When enabled, Skylit will push the latest HTML/CSS payloads to your API endpoint after each generation.</p>
              </div>
            </label>
            {draft.integrations.apiMirroringEnabled && (
              <label className="space-y-2 block">
                <span className="text-xs text-text/60">Webhook URL</span>
                <input
                  type="url"
                  value={draft.integrations.webhookUrl ?? ''}
                  onChange={e => updateDraft({ integrations: { webhookUrl: e.target.value } })}
                  placeholder="https://api.yourdomain.com/skylit/mirror"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-sm focus:outline-none focus:border-accent-primary"
                />
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-text/60">
                <p className="text-[10px] uppercase tracking-[0.3em] text-text/40">API base</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-white/80 text-sm break-all">{apiBaseUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiBaseUrl)}
                    className="px-2 py-1 rounded-lg border border-white/10 hover:bg-white/5"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-text/60">
                <p className="text-[10px] uppercase tracking-[0.3em] text-text/40">Mirror status</p>
                <p className={`text-sm mt-2 ${draft.integrations.apiMirroringEnabled ? 'text-accent-primary' : 'text-text/60'}`}>
                  {draft.integrations.apiMirroringEnabled ? 'Enabled — Skylit will POST to your webhook after each build.' : 'Disabled — API stays untouched.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/20">
          <div className="text-xs text-text/60">
            {settings?.updatedAt ? `Last updated ${new Date(settings.updatedAt).toLocaleString()}` : 'Default settings applied'}
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-text/70 hover:text-white disabled:opacity-50"
              >
                Refresh
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-accent-primary text-black text-sm font-semibold hover:brightness-110 disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
