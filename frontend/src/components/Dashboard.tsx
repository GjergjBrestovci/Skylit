import { useState } from 'react';

interface DashboardProps {
  authToken: string;
}

interface WebsiteConfig {
  websiteType: string;
  primaryColor: string;
  accentColor: string;
  designStyle: string;
  layout: string;
  brightness: string;
  pages: string[];
  features: string[];
  additionalDetails: string;
}

interface ColorOption {
  name: string;
  value: string;
  gradient?: string;
}

export function Dashboard({ authToken }: DashboardProps) {
  const [config, setConfig] = useState<WebsiteConfig>({
    websiteType: 'business',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    designStyle: 'modern',
    layout: 'header-hero-features',
    brightness: 'light',
    pages: ['home'],
    features: [],
    additionalDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ generated: string; createdAt: string } | null>(null);

  // Predefined color palettes for non-technical users
  const primaryColors: ColorOption[] = [
    { name: 'Ocean Blue', value: '#3B82F6', gradient: 'from-blue-400 to-blue-600' },
    { name: 'Emerald Green', value: '#10B981', gradient: 'from-emerald-400 to-emerald-600' },
    { name: 'Royal Purple', value: '#8B5CF6', gradient: 'from-purple-400 to-purple-600' },
    { name: 'Sunset Orange', value: '#F59E0B', gradient: 'from-amber-400 to-orange-500' },
    { name: 'Rose Pink', value: '#EC4899', gradient: 'from-pink-400 to-rose-500' },
    { name: 'Sky Blue', value: '#06B6D4', gradient: 'from-cyan-400 to-blue-500' },
    { name: 'Forest Green', value: '#059669', gradient: 'from-green-400 to-emerald-600' },
    { name: 'Deep Red', value: '#DC2626', gradient: 'from-red-400 to-red-600' },
    { name: 'Lavender', value: '#A855F7', gradient: 'from-violet-400 to-purple-600' },
    { name: 'Golden Yellow', value: '#EAB308', gradient: 'from-yellow-400 to-amber-500' }
  ];

  const accentColors: ColorOption[] = [
    { name: 'Bright Cyan', value: '#00FFFF', gradient: 'from-cyan-300 to-cyan-500' },
    { name: 'Electric Purple', value: '#BB86FC', gradient: 'from-purple-300 to-purple-500' },
    { name: 'Lime Green', value: '#84CC16', gradient: 'from-lime-300 to-green-500' },
    { name: 'Hot Pink', value: '#FF69B4', gradient: 'from-pink-300 to-pink-500' },
    { name: 'Bright Orange', value: '#FF8C00', gradient: 'from-orange-300 to-orange-500' },
    { name: 'Electric Blue', value: '#0080FF', gradient: 'from-blue-300 to-blue-500' },
    { name: 'Neon Green', value: '#39FF14', gradient: 'from-green-300 to-lime-400' },
    { name: 'Magenta', value: '#FF00FF', gradient: 'from-fuchsia-300 to-pink-500' },
    { name: 'Gold', value: '#FFD700', gradient: 'from-yellow-300 to-amber-400' },
    { name: 'Turquoise', value: '#40E0D0', gradient: 'from-teal-300 to-cyan-400' }
  ];

  const websiteTypes = [
    { value: 'business', label: 'Business/Corporate' },
    { value: 'portfolio', label: 'Portfolio/Personal' },
    { value: 'ecommerce', label: 'E-commerce/Store' },
    { value: 'blog', label: 'Blog/News' },
    { value: 'saas', label: 'SaaS/App Landing' },
    { value: 'restaurant', label: 'Restaurant/Food' },
    { value: 'agency', label: 'Creative Agency' },
    { value: 'nonprofit', label: 'Non-profit/Charity' }
  ];

  const designStyles = [
    { value: 'modern', label: 'Modern & Clean' },
    { value: 'minimal', label: 'Minimal & Simple' },
    { value: 'bold', label: 'Bold & Vibrant' },
    { value: 'elegant', label: 'Elegant & Sophisticated' },
    { value: 'playful', label: 'Playful & Creative' },
    { value: 'professional', label: 'Professional & Corporate' }
  ];

  const layoutOptions = [
    { value: 'header-hero-features', label: 'Header + Hero + Features' },
    { value: 'sidebar-content', label: 'Sidebar + Main Content' },
    { value: 'grid-layout', label: 'Grid-based Layout' },
    { value: 'single-page', label: 'Single Page Scroll' },
    { value: 'multi-column', label: 'Multi-column Layout' }
  ];

  const brightnessOptions = [
    { value: 'light', label: 'Light & Airy', description: 'Clean whites and soft backgrounds' },
    { value: 'light-dark', label: 'Light Dark', description: 'Subtle grays with good contrast' },
    { value: 'dark-light', label: 'Dark Light', description: 'Darker tones with bright accents' },
    { value: 'dark', label: 'Dark & Bold', description: 'Deep blacks and dramatic contrasts' }
  ];

  const availablePages = [
    { value: 'home', label: 'Home' },
    { value: 'about', label: 'About Us' },
    { value: 'services', label: 'Services' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'contact', label: 'Contact' },
    { value: 'blog', label: 'Blog' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'testimonials', label: 'Testimonials' }
  ];

  const availableFeatures = [
    { value: 'contact-form', label: 'Contact Form' },
    { value: 'newsletter', label: 'Newsletter Signup' },
    { value: 'social-media', label: 'Social Media Links' },
    { value: 'testimonials', label: 'Customer Testimonials' },
    { value: 'gallery', label: 'Image Gallery' },
    { value: 'blog-posts', label: 'Blog/News Section' },
    { value: 'pricing-table', label: 'Pricing Table' },
    { value: 'team-section', label: 'Team Members' },
    { value: 'faq', label: 'FAQ Section' },
    { value: 'search', label: 'Search Functionality' }
  ];

  const generatePrompt = () => {
    const selectedType = websiteTypes.find(t => t.value === config.websiteType)?.label;
    const selectedStyle = designStyles.find(s => s.value === config.designStyle)?.label;
    const selectedLayout = layoutOptions.find(l => l.value === config.layout)?.label;
    const selectedBrightness = brightnessOptions.find(b => b.value === config.brightness)?.label;
    const selectedPages = config.pages.map(p => availablePages.find(page => page.value === p)?.label).join(', ');
    const selectedFeatures = config.features.map(f => availableFeatures.find(feat => feat.value === f)?.label).join(', ');

    let prompt = `Create a ${selectedType} website with ${selectedStyle} design style using a ${selectedLayout} layout. `;
    prompt += `Use a ${selectedBrightness} theme with primary color: ${config.primaryColor}, accent color: ${config.accentColor}. `;
    prompt += `Include these pages: ${selectedPages}. `;
    
    if (selectedFeatures) {
      prompt += `Add these features: ${selectedFeatures}. `;
    }
    
    if (config.additionalDetails.trim()) {
      prompt += `Additional requirements: ${config.additionalDetails}`;
    }

    return prompt;
  };

  const handleGenerate = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    
    try {
      const prompt = generatePrompt();
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
      setResult({ generated: data.generated, createdAt: data.createdAt });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
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

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with animation */}
        <header className="space-y-4 animate-fade-in">
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-400 bg-clip-text text-transparent animate-float">
              ✨ Create Your Dream Website ✨
            </h2>
            <p className="text-text/70 text-xl max-w-2xl mx-auto leading-relaxed">
              No coding needed! Just pick what you love and watch the magic happen 🪄
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-text/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Super Easy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </header>

        {/* Configuration Panel */}
        <div className="space-y-8">
          {/* Website Type */}
          <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-2xl animate-bounce">🏗️</span>
                What Kind of Website?
                <div className="text-xs bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-bold animate-pulse">
                  Pick your style!
                </div>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {websiteTypes.map((type, index) => (
                  <button
                    key={type.value}
                    onClick={() => setConfig(prev => ({ ...prev, websiteType: type.value }))}
                    className={`p-4 rounded-lg text-left transition-all duration-300 hover:scale-105 ${
                      config.websiteType === type.value
                        ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 border-2 border-accent-cyan/50 shadow-lg shadow-accent-cyan/25'
                        : 'bg-[#232323] border border-accent-purple/30 hover:border-accent-cyan/50 hover:bg-[#272727]'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type.label}</span>
                      {config.websiteType === type.value && (
                        <div className="w-3 h-3 bg-accent-cyan rounded-full animate-ping"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                🎨 Choose Your Colors
                <div className="text-xs bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent font-bold animate-bounce">
                  Make it yours!
                </div>
              </h3>
              
              <div className="space-y-8">
                {/* Primary Color Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-lg font-medium text-text/90 flex items-center gap-2">
                      <span className="text-2xl">🌟</span>
                      Main Color
                    </label>
                    <div className="flex-1 h-px bg-gradient-to-r from-accent-purple/30 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {primaryColors.map((color, index) => (
                      <button
                        key={color.value}
                        onClick={() => setConfig(prev => ({ ...prev, primaryColor: color.value }))}
                        className={`group/color relative p-1 rounded-xl transition-all duration-300 hover:scale-110 ${
                          config.primaryColor === color.value 
                            ? 'ring-3 ring-accent-cyan shadow-xl shadow-accent-cyan/25 scale-105' 
                            : 'hover:ring-2 hover:ring-white/30'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div 
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color.gradient} shadow-lg group-hover/color:shadow-xl transition-all duration-300`}
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover/color:opacity-100 transition-opacity duration-200"></div>
                        {config.primaryColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full shadow-lg animate-ping"></div>
                            <div className="absolute w-3 h-3 bg-white rounded-full shadow-lg">
                              <div className="absolute inset-0.5 bg-accent-cyan rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-lg font-medium text-text/90 flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Accent Color
                    </label>
                    <div className="flex-1 h-px bg-gradient-to-r from-accent-cyan/30 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {accentColors.map((color, index) => (
                      <button
                        key={color.value}
                        onClick={() => setConfig(prev => ({ ...prev, accentColor: color.value }))}
                        className={`group/color relative p-1 rounded-xl transition-all duration-300 hover:scale-110 ${
                          config.accentColor === color.value 
                            ? 'ring-3 ring-accent-purple shadow-xl shadow-accent-purple/25 scale-105' 
                            : 'hover:ring-2 hover:ring-white/30'
                        }`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <div 
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color.gradient} shadow-lg group-hover/color:shadow-xl transition-all duration-300`}
                          style={{ backgroundColor: color.value }}
                        />
                        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover/color:opacity-100 transition-opacity duration-200"></div>
                        {config.accentColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full shadow-lg animate-ping"></div>
                            <div className="absolute w-3 h-3 bg-white rounded-full shadow-lg">
                              <div className="absolute inset-0.5 bg-accent-purple rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Preview */}
                <div className="bg-[#232323] rounded-xl p-4 border border-accent-purple/20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-medium text-text/80">🎪 Color Preview:</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="text-xs text-text/60">Main Color</div>
                      <div 
                        className="h-8 rounded-lg shadow-inner transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: config.primaryColor }}
                      ></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs text-text/60">Accent Color</div>
                      <div 
                        className="h-8 rounded-lg shadow-inner transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: config.accentColor }}
                      ></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-xs text-text/60">Combined</div>
                      <div 
                        className="h-8 rounded-lg shadow-inner transition-all duration-300 hover:scale-105"
                        style={{ 
                          background: `linear-gradient(45deg, ${config.primaryColor}, ${config.accentColor})` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Theme/Brightness */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-2xl animate-pulse">🌓</span>
                Website Brightness
                <div className="text-xs bg-gradient-to-r from-indigo-400 to-cyan-500 bg-clip-text text-transparent font-bold animate-bounce">
                  Set the mood!
                </div>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {brightnessOptions.map((brightness, index) => (
                  <button
                    key={brightness.value}
                    onClick={() => setConfig(prev => ({ ...prev, brightness: brightness.value }))}
                    className={`p-4 rounded-lg text-left transition-all duration-300 hover:scale-105 ${
                      config.brightness === brightness.value
                        ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border-2 border-indigo-400/50 shadow-lg shadow-indigo-400/25'
                        : 'bg-[#232323] border border-accent-purple/30 hover:border-indigo-400/50 hover:bg-[#272727]'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{brightness.label}</span>
                        {config.brightness === brightness.value && (
                          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-ping"></div>
                        )}
                      </div>
                      <p className="text-xs text-text/60">{brightness.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Design Style & Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <span className="text-2xl animate-spin" style={{ animationDuration: '3s' }}>🎨</span>
                  Design Vibe
                  <div className="text-xs bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-bold animate-bounce">
                    Your mood!
                  </div>
                </h3>
                <div className="space-y-3">
                  {designStyles.map((style, index) => (
                    <button
                      key={style.value}
                      onClick={() => setConfig(prev => ({ ...prev, designStyle: style.value }))}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-300 hover:scale-105 ${
                        config.designStyle === style.value
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 shadow-lg shadow-purple-400/25'
                          : 'bg-[#232323] border border-accent-purple/30 hover:border-purple-400/50 hover:bg-[#272727]'
                      }`}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{style.label}</span>
                        {config.designStyle === style.value && (
                          <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <span className="text-2xl animate-pulse">📐</span>
                  Page Layout
                  <div className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-bold animate-bounce">
                    How it flows!
                  </div>
                </h3>
                <div className="space-y-3">
                  {layoutOptions.map((layout, index) => (
                    <button
                      key={layout.value}
                      onClick={() => setConfig(prev => ({ ...prev, layout: layout.value }))}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-300 hover:scale-105 ${
                        config.layout === layout.value
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/25'
                          : 'bg-[#232323] border border-accent-purple/30 hover:border-yellow-400/50 hover:bg-[#272727]'
                      }`}
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{layout.label}</span>
                        {config.layout === layout.value && (
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pages */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-2xl animate-bounce">📄</span>
                What Pages Do You Need?
                <div className="text-xs bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent font-bold animate-pulse">
                  Mix & match!
                </div>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availablePages.map((page, index) => (
                  <label 
                    key={page.value} 
                    className="group/page flex items-center space-x-3 cursor-pointer p-4 rounded-lg hover:bg-[#232323] transition-all duration-300 hover:scale-105 border border-transparent hover:border-accent-cyan/30"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.pages.includes(page.value)}
                        onChange={() => handlePageToggle(page.value)}
                        className="w-6 h-6 text-accent-cyan bg-[#232323] border-accent-purple/30 rounded-lg focus:ring-accent-cyan/40 transition-all duration-200"
                      />
                      {config.pages.includes(page.value) && (
                        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-400/20 to-cyan-500/20 animate-ping"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium group-hover/page:text-accent-cyan transition-colors duration-200">{page.label}</span>
                    {config.pages.includes(page.value) && (
                      <span className="text-lg animate-bounce">✨</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-2xl animate-spin" style={{ animationDuration: '4s' }}>⚡</span>
                Cool Features to Add
                <div className="text-xs bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent font-bold animate-bounce">
                  Supercharge it!
                </div>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableFeatures.map((feature, index) => (
                  <label 
                    key={feature.value} 
                    className="group/feature flex items-center space-x-3 cursor-pointer p-4 rounded-lg hover:bg-[#232323] transition-all duration-300 hover:scale-105 border border-transparent hover:border-pink-400/30"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.features.includes(feature.value)}
                        onChange={() => handleFeatureToggle(feature.value)}
                        className="w-6 h-6 text-pink-400 bg-[#232323] border-accent-purple/30 rounded-lg focus:ring-pink-400/40 transition-all duration-200"
                      />
                      {config.features.includes(feature.value) && (
                        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-pink-400/20 to-purple-500/20 animate-ping"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium group-hover/feature:text-pink-400 transition-colors duration-200">{feature.label}</span>
                    {config.features.includes(feature.value) && (
                      <span className="text-lg animate-pulse">🚀</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-2xl animate-bounce">💭</span>
                Tell Us More!
                <div className="text-xs bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent font-bold animate-pulse">
                  (Optional but awesome!)
                </div>
              </h3>
              <div className="space-y-4">
                <div className="text-sm text-text/70 bg-[#232323] p-4 rounded-lg border border-accent-purple/20">
                  <span className="text-lg mr-2">💡</span>
                  <strong>Pro tip:</strong> Tell us about your business, favorite colors, or any special requests. 
                  The more you share, the more personalized your website becomes!
                </div>
                <textarea
                  rows={5}
                  value={config.additionalDetails}
                  onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                  placeholder="✨ Share your vision! What makes your project special? Any specific content, style preferences, or cool ideas you'd love to see? We're all ears! 🎯"
                  className="w-full p-4 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400/50 transition-all duration-200 hover:bg-[#272727] resize-none"
                />
              </div>
            </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-12 py-6 bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 text-background font-bold text-xl rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group animate-pulse hover:animate-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center justify-center gap-4">
                {loading ? (
                  <>
                    <div className="w-7 h-7 border-3 border-background/30 border-t-background rounded-full animate-spin"></div>
                    <span className="animate-pulse">Creating Magic...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl animate-bounce">🪄</span>
                    <span>Generate My Website!</span>
                    <span className="text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</span>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* AI Instructions Preview */}
          {!loading && !result && (
            <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                <span className="text-xl animate-pulse">🔮</span>
                AI Instructions Preview
              </h3>
              <div className="p-4 bg-[#232323] rounded-lg text-sm text-text/80 max-h-48 overflow-y-auto custom-scrollbar">
                {generatePrompt()}
              </div>
              <div className="mt-3 text-xs text-text/60 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                This is what our AI will use to create your website
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-500/10 to-red-400/10 border border-red-500/20 rounded-xl p-6 shadow-xl animate-slide-up">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">😅</span>
                <div>
                  <p className="text-red-400 text-lg font-semibold">Oops! Something went wrong</p>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl animate-slide-up">
              <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-3xl animate-bounce">🎉</span>
                Your Website is Ready!
                <span className="text-3xl animate-spin" style={{ animationDuration: '2s' }}>✨</span>
              </h3>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-[#232323] to-[#1a1a1a] rounded-xl border border-accent-purple/10 shadow-inner">
                  <p className="text-sm text-accent-cyan mb-4 flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    <strong>Created:</strong> {result.createdAt}
                  </p>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-accent-purple/20">
                    <pre className="text-sm overflow-x-auto whitespace-pre-wrap text-text/90 max-h-96 overflow-y-auto custom-scrollbar">{result.generated}</pre>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <button className="px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-cyan text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg font-medium">
                    <span className="flex items-center gap-3">
                      <span className="text-xl">💾</span>
                      Save to My Projects
                      <span className="text-xl animate-bounce">🚀</span>
                    </span>
                  </button>
                  <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg font-medium">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      Download
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}