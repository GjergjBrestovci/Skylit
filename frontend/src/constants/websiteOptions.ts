// Shared constants for website generation options

export interface WebsiteType {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export interface ThemeOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export interface ColorPalette {
  name: string;
  primary: string;
  accent: string;
}

export interface DesignStyle {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export interface LayoutOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

export interface PageOption {
  value: string;
  label: string;
  emoji: string;
}

export interface FeatureOption {
  value: string;
  label: string;
  emoji: string;
}

export interface TechStackOption {
  value: string;
  label: string;
  name: string;
  icon: string;
  description: string;
  frontend: string;
  backend?: string;
  database?: string;
  deployment?: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  features?: string[];
}

export const TECH_STACKS: TechStackOption[] = [
  {
    value: 'vanilla',
    label: 'Vanilla Web',
    name: 'Vanilla Web',
    icon: '🌐',
    description: 'Pure HTML, CSS, and JavaScript - simple and fast',
    frontend: 'HTML/CSS/JS',
    deployment: 'Any host',
    complexity: 'Beginner',
    features: ['Fast loading', 'No build process', 'Works everywhere']
  },
  {
    value: 'react',
    label: 'React + Node.js',
    name: 'React + Node.js',
    icon: '⚛️',
    description: 'Modern React frontend with Node.js backend',
    frontend: 'React',
    backend: 'Node.js',
    database: 'MongoDB',
    deployment: 'Vercel/Railway',
    complexity: 'Intermediate',
    features: ['Component-based', 'SPA routing', 'API integration', 'State management']
  },
  {
    value: 'vue',
    label: 'Vue.js + Express',
    name: 'Vue.js + Express',
    icon: '💚',
    description: 'Vue.js frontend with Express.js backend',
    frontend: 'Vue.js',
    backend: 'Express.js',
    database: 'PostgreSQL',
    deployment: 'Netlify/Heroku',
    complexity: 'Intermediate',
    features: ['Easy to learn', 'Reactive data', 'REST API', 'Progressive']
  },
  {
    value: 'nextjs',
    label: 'Next.js Full-Stack',
    name: 'Next.js Full-Stack',
    icon: '🚀',
    description: 'Next.js with built-in API routes and database',
    frontend: 'Next.js',
    backend: 'Next.js API',
    database: 'Prisma + PostgreSQL',
    deployment: 'Vercel',
    complexity: 'Advanced',
    features: ['SSR/SSG', 'Built-in API', 'TypeScript', 'Optimized performance']
  },
  {
    value: 'svelte',
    label: 'SvelteKit',
    name: 'SvelteKit',
    icon: '🧡',
    description: 'SvelteKit full-stack framework',
    frontend: 'Svelte',
    backend: 'SvelteKit',
    database: 'SQLite',
    deployment: 'Netlify/Vercel',
    complexity: 'Intermediate',
    features: ['No virtual DOM', 'Compiled', 'Small bundles', 'Full-stack']
  },
  {
    value: 'angular',
    label: 'Angular + NestJS',
    name: 'Angular + NestJS',
    icon: '🅰️',
    description: 'Angular frontend with NestJS backend',
    frontend: 'Angular',
    backend: 'NestJS',
    database: 'TypeORM + PostgreSQL',
    deployment: 'AWS/GCP',
    complexity: 'Advanced',
    features: ['Enterprise-ready', 'TypeScript first', 'Dependency injection', 'CLI tools']
  },
];

export const WEBSITE_TYPES: WebsiteType[] = [
  { value: 'business', label: 'Business/Corporate', emoji: '🏢', description: 'Professional websites for companies' },
  { value: 'portfolio', label: 'Portfolio/Personal', emoji: '🎨', description: 'Showcase your work and skills' },
  { value: 'ecommerce', label: 'E-commerce/Store', emoji: '🛒', description: 'Sell products online' },
  { value: 'blog', label: 'Blog/News', emoji: '📝', description: 'Share your thoughts and stories' },
  { value: 'saas', label: 'SaaS/App Landing', emoji: '🚀', description: 'Promote your software or app' },
  { value: 'restaurant', label: 'Restaurant/Food', emoji: '🍽️', description: 'Menu and dining experience' }
];

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'dark-bold', label: 'Dark & Bold', emoji: '🌑', description: 'Strong dark theme with bold elements' },
  { value: 'dark-elegant', label: 'Dark & Elegant', emoji: '🌌', description: 'Sophisticated dark theme with refined touches' },
  { value: 'modern-grey', label: 'Modern Grey', emoji: '🔘', description: 'Sleek grey theme with contemporary feel' },
  { value: 'light-airy', label: 'Light & Airy', emoji: '☁️', description: 'Clean and spacious bright theme' },
  { value: 'light-bold', label: 'Light & Bold', emoji: '☀️', description: 'Vibrant light theme with strong accents' },
  { value: 'light-minimal', label: 'Light & Minimal', emoji: '🤍', description: 'Pure and simple bright design' }
];

export const COLOR_PALETTES: ColorPalette[] = [
  { name: 'Ocean Blue', primary: '#0EA5E9', accent: '#06B6D4' },
  { name: 'Forest Green', primary: '#10B981', accent: '#059669' },
  { name: 'Sunset Orange', primary: '#F59E0B', accent: '#EF4444' },
  { name: 'Royal Purple', primary: '#8B5CF6', accent: '#A855F7' },
  { name: 'Rose Pink', primary: '#EC4899', accent: '#F43F5E' },
  { name: 'Modern Indigo', primary: '#6366F1', accent: '#8B5CF6' },
  { name: 'Emerald', primary: '#10B981', accent: '#34D399' },
  { name: 'Amber', primary: '#F59E0B', accent: '#FBBF24' },
  { name: 'Teal', primary: '#14B8A6', accent: '#5EEAD4' },
  { name: 'Crimson', primary: '#DC2626', accent: '#F87171' },
  { name: 'Slate', primary: '#64748B', accent: '#94A3B8' },
  { name: 'Violet', primary: '#7C3AED', accent: '#A78BFA' }
];

export const DESIGN_STYLES: DesignStyle[] = [
  { value: 'modern', label: 'Modern & Clean', emoji: '✨', description: 'Sleek and contemporary' },
  { value: 'minimal', label: 'Minimal & Simple', emoji: '🎯', description: 'Less is more approach' },
  { value: 'bold', label: 'Bold & Vibrant', emoji: '🔥', description: 'Eye-catching and energetic' },
  { value: 'elegant', label: 'Elegant & Sophisticated', emoji: '👑', description: 'Refined and luxurious' },
  { value: 'playful', label: 'Playful & Fun', emoji: '🎉', description: 'Creative and engaging' },
  { value: 'professional', label: 'Professional & Trust', emoji: '💼', description: 'Serious and reliable' },
  { value: 'artistic', label: 'Artistic & Creative', emoji: '🎨', description: 'Unique and expressive' },
  { value: 'vintage', label: 'Vintage & Classic', emoji: '🕰️', description: 'Timeless and nostalgic' }
];

export const LAYOUT_OPTIONS: LayoutOption[] = [
  { value: 'header-hero-features', label: 'Classic Layout', emoji: '📄', description: 'Header + Hero + Features' },
  { value: 'single-page', label: 'Single Page', emoji: '📱', description: 'Everything on one scroll' },
  { value: 'grid-layout', label: 'Grid Based', emoji: '⚡', description: 'Modern grid system' },
  { value: 'sidebar-layout', label: 'Sidebar Layout', emoji: '📋', description: 'Content with side navigation' },
  { value: 'full-screen', label: 'Full Screen', emoji: '🖥️', description: 'Immersive experience' },
  { value: 'magazine', label: 'Magazine Style', emoji: '📰', description: 'Editorial content layout' }
];

export const AVAILABLE_PAGES: PageOption[] = [
  { value: 'home', label: 'Home', emoji: '🏠' },
  { value: 'about', label: 'About Us', emoji: '👥' },
  { value: 'services', label: 'Services', emoji: '⚙️' },
  { value: 'portfolio', label: 'Portfolio', emoji: '🎨' },
  { value: 'contact', label: 'Contact', emoji: '📞' },
  { value: 'blog', label: 'Blog', emoji: '📝' },
  { value: 'team', label: 'Team', emoji: '👨‍👩‍👧‍👦' },
  { value: 'testimonials', label: 'Testimonials', emoji: '⭐' },
  { value: 'faq', label: 'FAQ', emoji: '❓' },
  { value: 'pricing', label: 'Pricing', emoji: '💰' },
  { value: 'gallery', label: 'Gallery', emoji: '🖼️' },
  { value: 'careers', label: 'Careers', emoji: '💼' }
];

export const AVAILABLE_FEATURES: FeatureOption[] = [
  { value: 'contact-form', label: 'Contact Form', emoji: '📝' },
  { value: 'newsletter', label: 'Newsletter', emoji: '📧' },
  { value: 'social-media', label: 'Social Links', emoji: '🔗' },
  { value: 'testimonials', label: 'Testimonials', emoji: '⭐' },
  { value: 'gallery', label: 'Image Gallery', emoji: '🖼️' },
  { value: 'pricing-table', label: 'Pricing Table', emoji: '💰' },
  { value: 'search', label: 'Search Function', emoji: '🔍' },
  { value: 'chat-widget', label: 'Live Chat', emoji: '💬' },
  { value: 'booking', label: 'Appointment Booking', emoji: '📅' },
  { value: 'reviews', label: 'Customer Reviews', emoji: '⭐' },
  { value: 'analytics', label: 'Analytics Tracking', emoji: '📊' },
  { value: 'multilingual', label: 'Multi-language', emoji: '🌍' }
];
