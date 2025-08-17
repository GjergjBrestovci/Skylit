import { useState } from 'react';

interface OnboardingFlowProps {
  authToken: string;
  onComplete: (config: WebsiteConfig) => void;
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

type Step = 'welcome' | 'websiteType' | 'colors' | 'style' | 'layout' | 'pages' | 'features' | 'details' | 'complete';

export default function     OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
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

  const [isVisible, setIsVisible] = useState(true);

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

  const transitionToNext = (nextStep: Step, updateConfig?: Partial<WebsiteConfig>) => {
    setIsVisible(false);
    setTimeout(() => {
      if (updateConfig) {
        setConfig(prev => ({ ...prev, ...updateConfig }));
      }
      setCurrentStep(nextStep);
      setIsVisible(true);
    }, 300);
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

  const handleComplete = () => {
    onComplete(config);
  };

  const renderWelcome = () => (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent animate-fade-in">
          Welcome to Skylit
        </h1>
        <p className="text-lg text-text/80 animate-slide-up animation-delay-200">
          Ready to make your website dreams a reality?
        </p>
      </div>
      
      <div className="animate-slide-up animation-delay-400">
        <button
          onClick={() => transitionToNext('websiteType')}
          className="group relative px-8 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full text-white text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
        >
          <span className="relative z-10">Let's Create Magic ✨</span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent-purple to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  );

  const renderWebsiteType = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">What kind of website do you need?</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">Choose the type that best fits your vision</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up animation-delay-400">
        {websiteTypes.map((type, index) => (
          <button
            key={type.value}
            onClick={() => transitionToNext('colors', { websiteType: type.value })}
            className={`group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slide-up ${
              config.websiteType === type.value
                ? 'border-accent-cyan bg-accent-cyan/10'
                : 'border-accent-purple/30 bg-[#1e1e1e] hover:border-accent-cyan/50'
            }`}
            style={{ animationDelay: `${index * 100 + 600}ms` }}
          >
            <div className="text-2xl mb-1">{type.emoji}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{type.label}</h3>
            <p className="text-xs text-text/70">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderColors = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">Choose your colors</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">Pick a palette that represents your brand</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-slide-up animation-delay-400">
        {colorPalettes.map((palette, index) => (
          <button
            key={palette.name}
            onClick={() => transitionToNext('style', { primaryColor: palette.primary, accentColor: palette.accent })}
            className="group p-4 rounded-xl bg-[#1e1e1e] border-2 border-accent-purple/30 hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{ animationDelay: `${index * 100 + 600}ms` }}
          >
            <div className="flex space-x-2 mb-2">
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.primary }}></div>
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.accent }}></div>
            </div>
            <h3 className="text-white font-semibold text-sm">{palette.name}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStyle = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">What's your style?</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">Choose the design direction that speaks to you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up animation-delay-400">
        {designStyles.map((style, index) => (
          <button
            key={style.value}
            onClick={() => transitionToNext('layout', { designStyle: style.value })}
            className="group p-3 rounded-xl border-2 border-accent-purple/30 bg-[#1e1e1e] hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{ animationDelay: `${index * 100 + 600}ms` }}
          >
            <div className="text-2xl mb-1">{style.emoji}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{style.label}</h3>
            <p className="text-xs text-text/70">{style.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLayout = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">Choose your layout</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">How do you want to structure your content?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-slide-up animation-delay-400">
        {layoutOptions.map((layout, index) => (
          <button
            key={layout.value}
            onClick={() => transitionToNext('pages', { layout: layout.value })}
            className="group p-3 rounded-xl border-2 border-accent-purple/30 bg-[#1e1e1e] hover:border-accent-cyan/50 transition-all duration-300 hover:scale-105 animate-slide-up"
            style={{ animationDelay: `${index * 100 + 600}ms` }}
          >
            <div className="text-2xl mb-1">{layout.emoji}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{layout.label}</h3>
            <p className="text-xs text-text/70">{layout.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPages = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">What pages do you need?</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">Select all the pages you want to include</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-slide-up animation-delay-400">
        {availablePages.map((page, index) => (
          <button
            key={page.value}
            onClick={() => handlePageToggle(page.value)}
            className={`group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 animate-slide-up ${
              config.pages.includes(page.value)
                ? 'border-accent-cyan bg-accent-cyan/20'
                : 'border-accent-purple/30 bg-[#1e1e1e] hover:border-accent-cyan/50'
            }`}
            style={{ animationDelay: `${index * 100 + 600}ms` }}
          >
            <div className="text-2xl mb-1">{page.emoji}</div>
            <h3 className="text-white font-semibold text-xs">{page.label}</h3>
          </button>
        ))}
      </div>
      
      <div className="flex justify-center animate-slide-up animation-delay-800">
        <button
          onClick={() => transitionToNext('features')}
          disabled={config.pages.length === 0}
          className="px-6 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          Continue ({config.pages.length} pages selected)
        </button>
      </div>
    </div>
  );

  const renderFeatures = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">Add some features</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">What functionality would you like?</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-slide-up animation-delay-400">
        {availableFeatures.map((feature, index) => (
          <button
            key={feature.value}
            onClick={() => handleFeatureToggle(feature.value)}
            className={`group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 animate-slide-up ${
              config.features.includes(feature.value)
                ? 'border-accent-cyan bg-accent-cyan/20'
                : 'border-accent-purple/30 bg-[#1e1e1e] hover:border-accent-cyan/50'
            }`}
            style={{ animationDelay: `${index * 100 + 600}ms` }}
          >
            <div className="text-2xl mb-1">{feature.emoji}</div>
            <h3 className="text-white font-semibold text-xs">{feature.label}</h3>
          </button>
        ))}
      </div>
      
      <div className="flex justify-center animate-slide-up animation-delay-800">
        <button
          onClick={() => transitionToNext('details')}
          className="px-6 py-2 bg-accent-cyan text-white rounded-lg hover:bg-accent-cyan/90 transition-all duration-300"
        >
          Continue ({config.features.length} features selected)
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white animate-fade-in">Any special requests?</h2>
        <p className="text-text/70 animate-slide-up animation-delay-200">Tell us more about your vision (optional)</p>
      </div>
      
      <div className="animate-slide-up animation-delay-400">
        <textarea
          rows={4}
          value={config.additionalDetails}
          onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
          placeholder="Describe any specific requirements, content ideas, or special features you'd like..."
          className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-lg text-white placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all duration-300"
        />
      </div>
      
      <div className="flex justify-center animate-slide-up animation-delay-600">
        <button
          onClick={handleComplete}
          className="px-8 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-xl"
        >
          Create My Website! 🚀
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'websiteType': return renderWebsiteType();
      case 'colors': return renderColors();
      case 'style': return renderStyle();
      case 'layout': return renderLayout();
      case 'pages': return renderPages();
      case 'features': return renderFeatures();
      case 'details': return renderDetails();
      default: return renderWelcome();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3">
      <div className={`w-full max-w-3xl transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {renderCurrentStep()}
      </div>
    </div>
  );
}
