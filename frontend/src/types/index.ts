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

export type Step = 'homepage' | 'websiteType' | 'theme' | 'colors' | 'style' | 'layout' | 'pages' | 'features' | 'details' | 'generating' | 'preview';
