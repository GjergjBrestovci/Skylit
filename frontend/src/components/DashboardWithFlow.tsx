import { useState } from 'react';
import OnboardingFlow from './OnboardingFlow.tsx';

interface DashboardWithFlowProps {
  authToken: string;
}

interface WebsiteConfig {
  websiteType: string;
  primaryColor: string;
  accentColor: string;
  designStyle: string;
  layout: string;
  pages: string[];
  features: string[];
  additionalDetails: string;
}

interface GenerationResult {
  generated: string;
  css?: string;
  notes?: string;
  model?: string;
  createdAt: string;
}

export function DashboardWithFlow({ authToken }: DashboardWithFlowProps) {
  // Replace previous showOnboarding state with intro + onboarding flags
  const [showIntro, setShowIntro] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [introFading, setIntroFading] = useState(false);

  const generatePrompt = (config: WebsiteConfig) => {
    const websiteTypes = [
      { value: 'business', label: 'Business/Corporate' },
      { value: 'portfolio', label: 'Portfolio/Personal' },
      { value: 'ecommerce', label: 'E-commerce/Store' },
      { value: 'blog', label: 'Blog/News' },
      { value: 'saas', label: 'SaaS/App Landing' },
      { value: 'restaurant', label: 'Restaurant/Food' }
    ];

    const designStyles = [
      { value: 'modern', label: 'Modern & Clean' },
      { value: 'minimal', label: 'Minimal & Simple' },
      { value: 'bold', label: 'Bold & Vibrant' },
      { value: 'elegant', label: 'Elegant & Sophisticated' }
    ];

    const layoutOptions = [
      { value: 'header-hero-features', label: 'Header + Hero + Features' },
      { value: 'single-page', label: 'Single Page Scroll' },
      { value: 'grid-layout', label: 'Grid-based Layout' }
    ];

    const availablePages = [
      { value: 'home', label: 'Home' },
      { value: 'about', label: 'About Us' },
      { value: 'services', label: 'Services' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'contact', label: 'Contact' },
      { value: 'blog', label: 'Blog' }
    ];

    const availableFeatures = [
      { value: 'contact-form', label: 'Contact Form' },
      { value: 'newsletter', label: 'Newsletter Signup' },
      { value: 'social-media', label: 'Social Media Links' },
      { value: 'testimonials', label: 'Customer Testimonials' },
      { value: 'gallery', label: 'Image Gallery' },
      { value: 'pricing-table', label: 'Pricing Table' }
    ];

    const selectedType = websiteTypes.find(t => t.value === config.websiteType)?.label;
    const selectedStyle = designStyles.find(s => s.value === config.designStyle)?.label;
    const selectedLayout = layoutOptions.find(l => l.value === config.layout)?.label;
    const selectedPages = config.pages.map(p => availablePages.find(page => page.value === p)?.label).join(', ');
    const selectedFeatures = config.features.map(f => availableFeatures.find(feat => feat.value === f)?.label).join(', ');

    let prompt = `Create a ${selectedType} website with ${selectedStyle} design style using a ${selectedLayout} layout. `;
    prompt += `Primary color: ${config.primaryColor}, Accent color: ${config.accentColor}. `;
    prompt += `Include these pages: ${selectedPages}. `;
    
    if (selectedFeatures) {
      prompt += `Add these features: ${selectedFeatures}. `;
    }
    
    if (config.additionalDetails.trim()) {
      prompt += `Additional requirements: ${config.additionalDetails}`;
    }

    return prompt;
  };

  const handleOnboardingComplete = async (config: WebsiteConfig) => {
    setShowOnboarding(false);
    setError(null);
    setResult(null);
    setLoading(true);
    
    try {
      const prompt = generatePrompt(config);
      const response = await fetch('http://localhost:5000/api/generate-site', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate');
      }
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setShowIntro(true);
    setShowOnboarding(false);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const startOnboarding = () => {
    // trigger fade out then show onboarding
    setIntroFading(true);
    setTimeout(() => {
      setShowIntro(false);
      setShowOnboarding(true);
    }, 400);
  };

  if (showIntro) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className={`text-center max-w-2xl space-y-8 transition-all duration-500 ${introFading ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent animate-fade-in">
              Welcome Back ✨
            </h1>
            <p className="text-lg md:text-xl text-text/80 animate-slide-up animation-delay-200">
              Ready to make your website dreams a reality?
            </p>
          </div>
          <div className="animate-slide-up animation-delay-400">
            <button
              onClick={startOnboarding}
              className="group relative px-10 py-4 rounded-full text-lg font-semibold overflow-hidden bg-gradient-to-r from-accent-cyan to-accent-purple text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Let's Begin <span className="text-2xl">🚀</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
          <div className="animate-slide-up animation-delay-600 text-sm text-text/60">
            You'll pick type, colors, style, layout, pages & features step-by-step.
          </div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow authToken={authToken} onComplete={handleOnboardingComplete} />;
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent">
            Your Website is Being Created!
          </h1>
          <button
            onClick={handleStartOver}
            className="text-accent-cyan hover:text-accent-cyan/80 transition-colors underline"
          >
            Start over with different options
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-accent-purple/30 border-t-accent-cyan rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Creating your masterpiece...</h2>
              <p className="text-text/70">Our AI is crafting your website with care ✨</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 animate-slide-up">
            <h3 className="text-red-400 font-semibold mb-2">Something went wrong</h3>
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={handleStartOver}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Website is Ready! 🎉</h2>
                <div className="text-sm text-text/70">
                  Generated on {new Date(result.createdAt).toLocaleDateString()}
                  {result.model && ` • ${result.model}`}
                </div>
              </div>

              {/* Tabs for HTML, CSS, and Notes */}
              <div className="space-y-4">
                <div className="flex space-x-2 border-b border-accent-purple/20">
                  <button className="px-4 py-2 text-accent-cyan border-b-2 border-accent-cyan font-semibold">
                    HTML Code
                  </button>
                  {result.css && (
                    <button className="px-4 py-2 text-text/70 hover:text-white transition-colors">
                      CSS Styles
                    </button>
                  )}
                  {result.notes && (
                    <button className="px-4 py-2 text-text/70 hover:text-white transition-colors">
                      Enhancement Notes
                    </button>
                  )}
                </div>

                <div className="bg-[#232323] rounded-lg p-4 max-h-96 overflow-auto custom-scrollbar">
                  <pre className="text-sm text-text/90 whitespace-pre-wrap font-mono">
                    {result.generated}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-accent-purple/20">
                <div className="flex space-x-3">
                  <button className="px-6 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-all duration-300 hover:scale-105">
                    Save Project
                  </button>
                  <button className="px-6 py-3 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-all duration-300">
                    Download Code
                  </button>
                </div>
                <button
                  onClick={handleStartOver}
                  className="px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg hover:scale-105 transition-all duration-300"
                >
                  Create Another Website
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
