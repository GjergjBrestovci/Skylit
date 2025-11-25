// Shared TypeScript interfaces and types for the application

export interface WebsiteConfig {
  websiteType: string;
  theme: string;
  primaryColor: string;
  accentColor: string;
  designStyle: string;
  layout: string;
  pages: string[];
  features: string[];
  additionalDetails: string;
  techStack?: string;
}

export interface GenerationResult {
  generated: string;
  html: string;
  css?: string;
  javascript?: string;
  notes?: string;
  analysis?: string;
  requirements?: string[];
  enhancedPrompt?: string;
  createdAt: string;
  previewUrl?: string;
  model?: string;
  enhancementUsedAI?: boolean;
}

export type Step = 'homepage' | 'websiteType' | 'theme' | 'colors' | 'style' | 'layout' | 'pages' | 'features' | 'details' | 'techStack' | 'generating' | 'preview';

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

export type ThemeChoice = ThemePreference;
