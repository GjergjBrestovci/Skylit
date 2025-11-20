import { supabase } from '../supabase';

export type ThemePreference = 'system' | 'dark' | 'light';

export interface NotificationPreferences {
  productUpdates: boolean;
  weeklySummary: boolean;
  aiLaunches: boolean;
}

export interface WorkspacePreferences {
  autosaveInterval: number;
  showBetaFeatures: boolean;
}

export interface IntegrationPreferences {
  apiMirroringEnabled: boolean;
  webhookUrl?: string | null;
}

export interface UserSettings {
  displayName: string | null;
  themePreference: ThemePreference;
  notifications: NotificationPreferences;
  workspace: WorkspacePreferences;
  integrations: IntegrationPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateSettingsInput {
  displayName?: string | null;
  themePreference?: ThemePreference;
  notifications?: Partial<NotificationPreferences>;
  workspace?: Partial<WorkspacePreferences>;
  integrations?: Partial<IntegrationPreferences>;
}

const DEFAULT_SETTINGS: UserSettings = {
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

const table = 'user_settings';

const mergeSettings = (base: UserSettings, updates: UpdateSettingsInput): UserSettings => ({
  displayName: updates.displayName !== undefined ? updates.displayName : base.displayName,
  themePreference: updates.themePreference ?? base.themePreference,
  notifications: {
    productUpdates: updates.notifications?.productUpdates ?? base.notifications.productUpdates,
    weeklySummary: updates.notifications?.weeklySummary ?? base.notifications.weeklySummary,
    aiLaunches: updates.notifications?.aiLaunches ?? base.notifications.aiLaunches
  },
  workspace: {
    autosaveInterval: updates.workspace?.autosaveInterval ?? base.workspace.autosaveInterval,
    showBetaFeatures: updates.workspace?.showBetaFeatures ?? base.workspace.showBetaFeatures
  },
  integrations: {
    apiMirroringEnabled: updates.integrations?.apiMirroringEnabled ?? base.integrations.apiMirroringEnabled,
    webhookUrl: updates.integrations?.webhookUrl ?? base.integrations.webhookUrl ?? null
  },
  createdAt: base.createdAt,
  updatedAt: base.updatedAt
});

const mapRecordToSettings = (record: any): UserSettings => ({
  displayName: record?.display_name ?? null,
  themePreference: (record?.theme_preference as ThemePreference) ?? 'system',
  notifications: {
    productUpdates: record?.notification_product_updates ?? true,
    weeklySummary: record?.notification_weekly_summary ?? false,
    aiLaunches: record?.notification_ai_launches ?? true
  },
  workspace: {
    autosaveInterval: record?.autosave_interval ?? 5,
    showBetaFeatures: record?.show_beta_features ?? false
  },
  integrations: {
    apiMirroringEnabled: record?.api_mirroring_enabled ?? false,
    webhookUrl: record?.webhook_url ?? null
  },
  createdAt: record?.created_at ?? undefined,
  updatedAt: record?.updated_at ?? undefined
});

const mapUpdatesToRecord = (userId: string, updates: UpdateSettingsInput) => {
  const record: Record<string, any> = { user_id: userId };

  if (updates.displayName !== undefined) {
    record.display_name = updates.displayName ?? null;
  }

  if (updates.themePreference) {
    record.theme_preference = updates.themePreference;
  }

  if (updates.notifications) {
    if (updates.notifications.productUpdates !== undefined) {
      record.notification_product_updates = updates.notifications.productUpdates;
    }
    if (updates.notifications.weeklySummary !== undefined) {
      record.notification_weekly_summary = updates.notifications.weeklySummary;
    }
    if (updates.notifications.aiLaunches !== undefined) {
      record.notification_ai_launches = updates.notifications.aiLaunches;
    }
  }

  if (updates.workspace) {
    if (updates.workspace.autosaveInterval !== undefined) {
      record.autosave_interval = updates.workspace.autosaveInterval;
    }
    if (updates.workspace.showBetaFeatures !== undefined) {
      record.show_beta_features = updates.workspace.showBetaFeatures;
    }
  }

  if (updates.integrations) {
    if (updates.integrations.apiMirroringEnabled !== undefined) {
      record.api_mirroring_enabled = updates.integrations.apiMirroringEnabled;
    }
    if (updates.integrations.webhookUrl !== undefined) {
      record.webhook_url = updates.integrations.webhookUrl;
    }
  }

  return record;
};

const supabaseReady = () => !!supabase?.from;

export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  if (!supabaseReady()) {
    return DEFAULT_SETTINGS;
  }

  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no rows, return defaults
    if ((error as any).code === 'PGRST116' || error.message?.includes('No rows')) {
      return DEFAULT_SETTINGS;
    }
    console.warn('Failed to load user settings:', error);
    return DEFAULT_SETTINGS;
  }

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  return mapRecordToSettings(data);
};

export const updateUserSettings = async (userId: string, updates: UpdateSettingsInput): Promise<UserSettings> => {
  if (!supabaseReady()) {
    return mergeSettings(DEFAULT_SETTINGS, updates);
  }

  const record = mapUpdatesToRecord(userId, updates);

  const { data, error } = await supabase
    .from(table)
    .upsert(record, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to update settings:', error);
    throw new Error('Unable to update user settings');
  }

  return mapRecordToSettings(data);
};
