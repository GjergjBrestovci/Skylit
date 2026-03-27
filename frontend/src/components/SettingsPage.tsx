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

  const sectionClass = 'card rounded-xl p-4 sm:p-6 space-y-4';
  const labelClass = 'text-xs uppercase tracking-widest text-muted';

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 dark:bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl bg-background border border-border shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Control center</p>
            <h2 className="text-xl font-semibold text-text">Workspace Settings</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            {saving && <span className="text-accent-primary animate-pulse">Saving...</span>}
            <button onClick={onClose} className="btn-ghost text-xs">Close</button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 max-h-[calc(92vh-72px)]">
          {localError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-300">
              {localError}
            </div>
          )}

          {statusMessage && !localError && (
            <div className="p-3 rounded-lg bg-surface-elevated border border-border text-sm text-text">
              {statusMessage}
            </div>
          )}

          <section className={sectionClass}>
            <div>
              <p className={labelClass}>Profile</p>
              <h3 className="text-lg font-semibold text-text">Account identity</h3>
              <p className="text-sm text-muted">These details are shared with collaborators and in exported projects.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs text-muted">Display name</span>
                <input
                  value={draft.displayName ?? ''}
                  onChange={e => updateDraft({ displayName: e.target.value })}
                  placeholder="Add a friendly name"
                  className="input-base w-full"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs text-muted">Email</span>
                <input
                  value={userEmail || '—'}
                  disabled
                  className="input-base w-full opacity-60 cursor-not-allowed"
                />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex flex-col gap-2">
              <p className={labelClass}>Appearance</p>
              <h3 className="text-lg font-semibold text-text">Theme preference</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {themeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`text-left rounded-xl border p-4 transition ${
                    draft.themePreference === option.value
                      ? 'border-accent-primary bg-accent-primary/10 text-text'
                      : 'border-border bg-surface text-muted hover:border-accent-primary/50'
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-xs text-muted mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className={`${sectionClass} grid gap-6 md:grid-cols-2`}>
            <div className="space-y-4">
              <div>
                <p className={labelClass}>Workspace</p>
                <h3 className="text-lg font-semibold text-text">Automation</h3>
                <p className="text-sm text-muted">Control autosave cadence and experimental betas.</p>
              </div>
              <label className="space-y-2 block">
                <span className="text-xs text-muted">Autosave interval (minutes)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={draft.workspace.autosaveInterval}
                  onChange={e => updateDraft({ workspace: { autosaveInterval: Number(e.target.value) } })}
                  className="input-base w-full"
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
                  <p className="text-sm text-text font-medium">Enable beta experiments</p>
                  <p className="text-xs text-muted">Access upcoming AI agents and UI changes before the general release.</p>
                </div>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <p className={labelClass}>Notifications</p>
                <h3 className="text-lg font-semibold text-text">Stay informed</h3>
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
                    <p className="text-sm text-text font-medium">{item.label}</p>
                    <p className="text-xs text-muted">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <div>
              <p className={labelClass}>Generation defaults</p>
              <h3 className="text-lg font-semibold text-text">Starting preferences</h3>
              <p className="text-sm text-muted">Configure how new projects should initialize on this device.</p>
            </div>
            <label className="space-y-2 block">
              <span className="text-xs text-muted">Preferred tech stack</span>
              <select
                value={defaultTechStack}
                onChange={e => handleTechStackChange(e.target.value)}
                className="input-base w-full"
              >
                {TECH_STACKS.map(stack => (
                  <option key={stack.value} value={stack.value}>{stack.name}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleNotificationsToggle}
                className={`rounded-xl border px-4 py-3 text-left transition ${notificationsEnabled ? 'border-accent-primary bg-accent-primary/10 text-text' : 'border-border text-muted hover:border-accent-primary/50'}`}
              >
                <p className="font-semibold">Notifications</p>
                <p className="text-xs text-muted">{notificationsEnabled ? 'Enabled for new builds' : 'Muted for now'}</p>
              </button>
              <button
                onClick={handleAutoSaveToggle}
                className={`rounded-xl border px-4 py-3 text-left transition ${autoSaveProjects ? 'border-accent-primary bg-accent-primary/10 text-text' : 'border-border text-muted hover:border-accent-primary/50'}`}
              >
                <p className="font-semibold">Auto-save projects</p>
                <p className="text-xs text-muted">{autoSaveProjects ? 'Saves every generation' : 'Manual save only'}</p>
              </button>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex flex-col gap-2">
              <p className={labelClass}>API Mirroring</p>
              <h3 className="text-lg font-semibold text-text">Keep your API in sync</h3>
              <p className="text-sm text-muted">Enable Skylit to mirror successful generations back to your private API consumer.</p>
            </div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={draft.integrations.apiMirroringEnabled}
                onChange={e => updateDraft({ integrations: { apiMirroringEnabled: e.target.checked } })}
                className="mt-1 accent-accent-primary"
              />
              <div>
                <p className="text-sm text-text font-medium">Turn on mirroring</p>
                <p className="text-xs text-muted">When enabled, Skylit will push the latest HTML/CSS payloads to your API endpoint after each generation.</p>
              </div>
            </label>
            {draft.integrations.apiMirroringEnabled && (
              <label className="space-y-2 block">
                <span className="text-xs text-muted">Webhook URL</span>
                <input
                  type="url"
                  value={draft.integrations.webhookUrl ?? ''}
                  onChange={e => updateDraft({ integrations: { webhookUrl: e.target.value } })}
                  placeholder="https://api.yourdomain.com/skylit/mirror"
                  className="input-base w-full"
                />
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 rounded-lg bg-surface-elevated border border-border text-xs text-muted">
                <p className="text-[10px] uppercase tracking-widest text-muted">API base</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <span className="text-text text-sm break-all">{apiBaseUrl}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(apiBaseUrl)}
                    className="btn-ghost text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated border border-border text-xs text-muted">
                <p className="text-[10px] uppercase tracking-widest text-muted">Mirror status</p>
                <p className={`text-sm mt-2 ${draft.integrations.apiMirroringEnabled ? 'text-accent-primary' : 'text-muted'}`}>
                  {draft.integrations.apiMirroringEnabled ? 'Enabled — Skylit will POST to your webhook after each build.' : 'Disabled — API stays untouched.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface">
          <div className="text-xs text-muted">
            {settings?.updatedAt ? `Last updated ${new Date(settings.updatedAt).toLocaleString()}` : 'Default settings applied'}
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="btn-secondary text-xs disabled:opacity-50"
              >
                Refresh
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
