import { useState } from 'react';
import { WebsitePreview } from './WebsitePreview';
import { apiClient } from '../utils/apiClient';

interface NewDashboardProps {
  onLogout: () => void;
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
  createdAt: string;
  previewUrl?: string;
  css?: string;
  notes?: string;
}

type Step = 'homepage' | 'websiteType' | 'colors' | 'style' | 'layout' | 'pages' | 'features' | 'details' | 'generating' | 'preview';

export function NewDashboard({ onLogout }: NewDashboardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('homepage');
  const [config, setConfig] = useState<WebsiteConfig>({
    websiteType: '',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    designStyle: '',
    layout: '',
    pages: [],
    features: [],
    additionalDetails: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'notes'>('html');

  // Data definitions
  const websiteTypes = [
    { value: 'business', label: 'Business/Corporate', emoji: '🏢', description: 'Professional websites for companies' },
    { value: 'portfolio', label: 'Portfolio/Personal', emoji: '🎨', description: 'Showcase your work and skills' },
    { value: 'ecommerce', label: 'E-commerce/Store', emoji: '🛒', description: 'Sell products online' },
    { value: 'blog', label: 'Blog/News', emoji: '📝', description: 'Share your thoughts and stories' },
    { value: 'saas', label: 'SaaS/App Landing', emoji: '🚀', description: 'Promote your software or app' },
    { value: 'restaurant', label: 'Restaurant/Food', emoji: '🍽️', description: 'Menu and dining experience' }
  ];

  const colorPalettes = [
    { name: 'Ocean', primary: '#0EA5E9', accent: '#06B6D4' },
    { name: 'Forest', primary: '#10B981', accent: '#059669' },
    { name: 'Sunset', primary: '#F59E0B', accent: '#EF4444' },
    { name: 'Purple', primary: '#8B5CF6', accent: '#A855F7' },
    { name: 'Rose', primary: '#EC4899', accent: '#F43F5E' },
    { name: 'Modern', primary: '#6366F1', accent: '#8B5CF6' }
  ];

  const designStyles = [
    { value: 'modern', label: 'Modern & Clean', emoji: '✨', description: 'Sleek and contemporary' },
    { value: 'minimal', label: 'Minimal & Simple', emoji: '🎯', description: 'Less is more approach' },
    { value: 'bold', label: 'Bold & Vibrant', emoji: '🔥', description: 'Eye-catching and energetic' },
    { value: 'elegant', label: 'Elegant & Sophisticated', emoji: '👑', description: 'Refined and luxurious' }
  ];

  const layoutOptions = [
    { value: 'header-hero-features', label: 'Classic Layout', emoji: '📄', description: 'Header + Hero + Features' },
    { value: 'single-page', label: 'Single Page', emoji: '📱', description: 'Everything on one scroll' },
    { value: 'grid-layout', label: 'Grid Based', emoji: '⚡', description: 'Modern grid system' }
  ];

  const availablePages = [
    { value: 'home', label: 'Home', emoji: '🏠' },
    { value: 'about', label: 'About Us', emoji: '👥' },
    { value: 'services', label: 'Services', emoji: '⚙️' },
    { value: 'portfolio', label: 'Portfolio', emoji: '🎨' },
    { value: 'contact', label: 'Contact', emoji: '📞' },
    { value: 'blog', label: 'Blog', emoji: '📝' }
  ];

  const availableFeatures = [
    { value: 'contact-form', label: 'Contact Form', emoji: '📝' },
    { value: 'newsletter', label: 'Newsletter', emoji: '📧' },
    { value: 'social-media', label: 'Social Links', emoji: '🔗' },
    { value: 'testimonials', label: 'Testimonials', emoji: '⭐' },
    { value: 'gallery', label: 'Image Gallery', emoji: '🖼️' },
    { value: 'pricing-table', label: 'Pricing Table', emoji: '💰' }
  ];

  // Navigation functions
  const nextStep = (step: Step, updates?: Partial<WebsiteConfig>) => {
    if (updates) {
      setConfig(prev => ({ ...prev, ...updates }));
    }
    setCurrentStep(step);
  };

  const handlePageToggle = (pageValue: string) => {
    setConfig(prev => ({
      ...prev,
      pages: prev.pages.includes(pageValue)
        ? prev.pages.filter(p => p !== pageValue)
        : [...prev.pages, pageValue]
    }));
  };

  const handleFeatureToggle = (featureValue: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(featureValue)
        ? prev.features.filter(f => f !== featureValue)
        : [...prev.features, featureValue]
    }));
  };

  const generateWebsite = async () => {
    setCurrentStep('generating');
    setError(null);
    
    try {
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

      const data = await apiClient.post('/api/generate-site', { prompt });
      
      setResult({
        generated: data.generated,
        createdAt: data.createdAt,
        previewUrl: data.previewUrl,
        css: data.css,
        notes: data.notes
      });
      
      setCurrentStep('preview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate website');
      setCurrentStep('details'); // Go back to last step
    }
  };

  const startOver = () => {
    setCurrentStep('homepage');
    setConfig({
      websiteType: '',
      primaryColor: '#3B82F6',
      accentColor: '#10B981',
      designStyle: '',
      layout: '',
      pages: [],
      features: [],
      additionalDetails: ''
    });
    setResult(null);
    setError(null);
    setShowCode(false);
  };

  // Step renderers
  const renderHomepage = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-[#0a0a0a] to-background">
      <div className="text-center max-w-4xl px-6 space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent animate-pulse">
              Skylit AI
            </h1>
            <p className="text-2xl md:text-3xl text-text/90 font-light">
              Dream it. Build it. Launch it.
            </p>
          </div>
          
          <p className="text-lg md:text-xl text-text/70 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into stunning websites in minutes. 
            Our AI understands your vision and crafts the perfect digital experience.
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-6">
          <button
            onClick={() => nextStep('websiteType')}
            className="group relative px-12 py-6 text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent-cyan/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-3">
              Build My Dream Website
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🚀</span>
            </span>
          </button>
          
          <p className="text-sm text-text/50">
            No coding required • Takes 2-3 minutes • Get live preview instantly
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Generate in under 60 seconds' },
            { icon: '🎨', title: 'Your Style', desc: 'Customized to your brand' },
            { icon: '📱', title: 'Mobile Ready', desc: 'Looks perfect on any device' }
          ].map((feature, i) => (
            <div key={i} className="space-y-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-text/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    const stepConfig = {
      backgroundColor: 'min-h-screen bg-gradient-to-br from-background to-[#0a0a0a]',
      containerClass: 'min-h-screen flex items-center justify-center px-6',
      contentClass: 'w-full max-w-4xl space-y-8'
    };

    const commonProps = {
      className: stepConfig.containerClass
    };

    switch (currentStep) {
      case 'websiteType':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">What are you building?</h2>
                <p className="text-xl text-text/70">Choose the type that best fits your vision</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {websiteTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => nextStep('colors', { websiteType: type.value })}
                    className="group p-8 rounded-2xl bg-[#1a1a1a] border-2 border-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent-cyan/10 text-left"
                  >
                    <div className="text-4xl mb-4">{type.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{type.label}</h3>
                    <p className="text-text/60">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'colors':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Pick your colors</h2>
                <p className="text-xl text-text/70">Choose a palette that represents your brand</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.name}
                    onClick={() => nextStep('style', { primaryColor: palette.primary, accentColor: palette.accent })}
                    className="group p-8 rounded-2xl bg-[#1a1a1a] border-2 border-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.primary }}></div>
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: palette.accent }}></div>
                    </div>
                    <h3 className="text-xl font-bold text-white">{palette.name}</h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'style':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">What's your style?</h2>
                <p className="text-xl text-text/70">Choose the design direction that speaks to you</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {designStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => nextStep('layout', { designStyle: style.value })}
                    className="group p-8 rounded-2xl bg-[#1a1a1a] border-2 border-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 text-left"
                  >
                    <div className="text-4xl mb-4">{style.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{style.label}</h3>
                    <p className="text-text/60">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Choose your layout</h2>
                <p className="text-xl text-text/70">How do you want to structure your content?</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {layoutOptions.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => nextStep('pages', { layout: layout.value })}
                    className="group p-8 rounded-2xl bg-[#1a1a1a] border-2 border-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 text-center"
                  >
                    <div className="text-4xl mb-4">{layout.emoji}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{layout.label}</h3>
                    <p className="text-text/60">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'pages':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">What pages do you need?</h2>
                <p className="text-xl text-text/70">Select all the pages you want to include</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {availablePages.map((page) => (
                  <button
                    key={page.value}
                    onClick={() => handlePageToggle(page.value)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      config.pages.includes(page.value)
                        ? 'border-accent-cyan bg-accent-cyan/20'
                        : 'border-accent-purple/30 bg-[#1a1a1a] hover:border-accent-cyan/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{page.emoji}</div>
                    <h3 className="text-white font-bold">{page.label}</h3>
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => nextStep('features')}
                  disabled={config.pages.length === 0}
                  className="px-8 py-4 bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg font-semibold"
                >
                  Continue ({config.pages.length} pages selected)
                </button>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Add some features</h2>
                <p className="text-xl text-text/70">What functionality would you like?</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {availableFeatures.map((feature) => (
                  <button
                    key={feature.value}
                    onClick={() => handleFeatureToggle(feature.value)}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      config.features.includes(feature.value)
                        ? 'border-accent-cyan bg-accent-cyan/20'
                        : 'border-accent-purple/30 bg-[#1a1a1a] hover:border-accent-cyan/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{feature.emoji}</div>
                    <h3 className="text-white font-bold text-sm">{feature.label}</h3>
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => nextStep('details')}
                  className="px-8 py-4 bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan/90 transition-all duration-300 text-lg font-semibold"
                >
                  Continue ({config.features.length} features selected)
                </button>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div {...commonProps}>
            <div className={stepConfig.contentClass}>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Any special requests?</h2>
                <p className="text-xl text-text/70">Tell us more about your vision (optional)</p>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                <textarea
                  rows={6}
                  value={config.additionalDetails}
                  onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                  placeholder="Describe any specific requirements, content ideas, or special features you'd like..."
                  className="w-full p-6 bg-[#1a1a1a] border-2 border-accent-purple/30 rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-accent-cyan/50 transition-all duration-300 text-lg"
                />
                
                <div className="text-center">
                  <button
                    onClick={generateWebsite}
                    className="px-12 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Create My Website! 🚀
                  </button>
                </div>
              </div>

              {error && (
                <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        );

      case 'generating':
        return (
          <div {...commonProps}>
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="text-6xl animate-bounce">🪄</div>
                <h2 className="text-4xl md:text-5xl font-bold text-white">Creating your masterpiece...</h2>
                <p className="text-xl text-text/70">Our AI is crafting the perfect website for you</p>
              </div>
              
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        );

      default:
        return renderHomepage();
    }
  };

  const renderPreview = () => (
    <div className="min-h-screen bg-background">
      {/* Header with toggle */}
      <div className="border-b border-accent-purple/20 bg-[#1a1a1a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Your Website is Ready! 🎉</h1>
            <p className="text-text/60">Created on {result && new Date(result.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-[#232323] rounded-lg p-1">
              <button
                onClick={() => setShowCode(false)}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  !showCode 
                    ? 'bg-accent-cyan text-white' 
                    : 'text-text/70 hover:text-white'
                }`}
              >
                🌐 Live Preview
              </button>
              <button
                onClick={() => setShowCode(true)}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  showCode 
                    ? 'bg-accent-purple text-white' 
                    : 'text-text/70 hover:text-white'
                }`}
              >
                💻 View Code
              </button>
            </div>
            
            <button
              onClick={startOver}
              className="px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg hover:scale-105 transition-all duration-300"
            >
              Create Another
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {!showCode && result?.previewUrl ? (
          /* Live Preview */
          <WebsitePreview 
            previewUrl={result.previewUrl}
            title="Your Generated Website"
            className="min-h-[80vh]"
          />
        ) : (
          /* Code View */
          <div className="space-y-6">
            {/* Code Tabs */}
            <div className="flex space-x-1 bg-[#1a1a1a] rounded-lg p-1">
              <button
                onClick={() => setActiveCodeTab('html')}
                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                  activeCodeTab === 'html' 
                    ? 'bg-accent-cyan text-white' 
                    : 'text-text/70 hover:text-white'
                }`}
              >
                📄 HTML
              </button>
              {result?.css && (
                <button
                  onClick={() => setActiveCodeTab('css')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    activeCodeTab === 'css' 
                      ? 'bg-accent-purple text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  🎨 CSS
                </button>
              )}
              {result?.notes && (
                <button
                  onClick={() => setActiveCodeTab('notes')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    activeCodeTab === 'notes' 
                      ? 'bg-pink-500 text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  📝 Notes
                </button>
              )}
            </div>

            {/* Code Content */}
            <div className="bg-[#1a1a1a] rounded-xl border border-accent-purple/20 overflow-hidden">
              <div className="p-6">
                <pre className="text-sm text-text/90 whitespace-pre-wrap font-mono overflow-x-auto">
                  {activeCodeTab === 'html' && result?.generated}
                  {activeCodeTab === 'css' && result?.css}
                  {activeCodeTab === 'notes' && result?.notes}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-all duration-300">
                💾 Save Project
              </button>
              <button className="px-6 py-3 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-all duration-300">
                📥 Download Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Main render
  if (currentStep === 'preview' && result) {
    return renderPreview();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0a0a] to-background">
      {renderStepContent()}
    </div>
  );
}
