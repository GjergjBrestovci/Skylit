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
  pages: string[];
  features: string[];
  additionalDetails: string;
}

export function Dashboard({ authToken }: DashboardProps) {
  const [config, setConfig] = useState<WebsiteConfig>({
    websiteType: 'business',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    designStyle: 'modern',
    layout: 'header-hero-features',
    pages: ['home'],
    features: [],
    additionalDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ generated: string; createdAt: string } | null>(null);

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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with animation */}
        <header className="space-y-2 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            Create Your Website
          </h2>
          <p className="text-text/70 text-lg">Configure your website preferences and let AI generate it for you.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="xl:col-span-2 space-y-6">
            {/* Website Type */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
                Website Type
              </h3>
              <select
                value={config.websiteType}
                onChange={(e) => setConfig(prev => ({ ...prev, websiteType: e.target.value }))}
                className="w-full p-4 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/50 transition-all duration-200 hover:bg-[#272727]"
              >
                {websiteTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-purple rounded-full animate-pulse"></div>
                Color Scheme
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text/90">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <div className="relative group/color">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-14 h-14 rounded-xl border-2 border-accent-purple/30 cursor-pointer hover:border-accent-cyan/50 transition-all duration-200 hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/color:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 p-3 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all duration-200 hover:bg-[#272727]"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text/90">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <div className="relative group/color">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-14 h-14 rounded-xl border-2 border-accent-purple/30 cursor-pointer hover:border-accent-cyan/50 transition-all duration-200 hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/color:opacity-100 transition-opacity duration-200"></div>
                    </div>
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="flex-1 p-3 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all duration-200 hover:bg-[#272727]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design Style & Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Design Style
                </h3>
                <select
                  value={config.designStyle}
                  onChange={(e) => setConfig(prev => ({ ...prev, designStyle: e.target.value }))}
                  className="w-full p-4 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all duration-200 hover:bg-[#272727]"
                >
                  {designStyles.map(style => (
                    <option key={style.value} value={style.value}>{style.label}</option>
                  ))}
                </select>
              </div>

              <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  Layout Type
                </h3>
                <select
                  value={config.layout}
                  onChange={(e) => setConfig(prev => ({ ...prev, layout: e.target.value }))}
                  className="w-full p-4 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 transition-all duration-200 hover:bg-[#272727]"
                >
                  {layoutOptions.map(layout => (
                    <option key={layout.value} value={layout.value}>{layout.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pages */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                Pages to Include
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availablePages.map((page, index) => (
                  <label 
                    key={page.value} 
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-[#232323] transition-all duration-200 group/checkbox"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.pages.includes(page.value)}
                        onChange={() => handlePageToggle(page.value)}
                        className="w-5 h-5 text-accent-cyan bg-[#232323] border-accent-purple/30 rounded focus:ring-accent-cyan/40 transition-all duration-200"
                      />
                      {config.pages.includes(page.value) && (
                        <div className="absolute inset-0 rounded bg-accent-cyan/20 animate-ping"></div>
                      )}
                    </div>
                    <span className="text-sm group-hover/checkbox:text-accent-cyan transition-colors duration-200">{page.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                Features to Add
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableFeatures.map((feature, index) => (
                  <label 
                    key={feature.value} 
                    className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-[#232323] transition-all duration-200 group/checkbox"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={config.features.includes(feature.value)}
                        onChange={() => handleFeatureToggle(feature.value)}
                        className="w-5 h-5 text-accent-cyan bg-[#232323] border-accent-purple/30 rounded focus:ring-accent-cyan/40 transition-all duration-200"
                      />
                      {config.features.includes(feature.value) && (
                        <div className="absolute inset-0 rounded bg-accent-cyan/20 animate-ping"></div>
                      )}
                    </div>
                    <span className="text-sm group-hover/checkbox:text-accent-cyan transition-colors duration-200">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="group bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl hover:shadow-2xl hover:border-accent-cyan/30 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                Additional Details
                <span className="text-sm font-normal text-text/60">(Optional)</span>
              </h3>
              <textarea
                rows={4}
                value={config.additionalDetails}
                onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                placeholder="Describe any specific requirements, content, or features you'd like to include..."
                className="w-full p-4 bg-[#232323] border border-accent-purple/30 rounded-lg text-sm placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40 focus:border-accent-cyan/50 transition-all duration-200 hover:bg-[#272727] resize-none"
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Generate Button */}
            <div className="sticky top-6">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-background font-bold rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Website
                    </>
                  )}
                </span>
              </button>

              {/* Generated Prompt Preview */}
              <div className="mt-6 bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  Prompt Preview
                </h3>
                <div className="p-4 bg-[#232323] rounded-lg text-sm text-text/80 max-h-48 overflow-y-auto custom-scrollbar">
                  {generatePrompt()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/10 to-red-400/10 border border-red-500/20 rounded-xl p-6 shadow-xl animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-accent-purple/20 rounded-xl p-6 shadow-xl animate-slide-up">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Generated Website
            </h3>
            <div className="space-y-4">
              <div className="p-6 bg-[#232323] rounded-xl border border-accent-purple/10">
                <p className="text-sm text-accent-cyan mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generated at: {result.createdAt}
                </p>
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap text-text/90 max-h-96 overflow-y-auto custom-scrollbar">{result.generated}</pre>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-cyan text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg font-medium">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Save Project
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
