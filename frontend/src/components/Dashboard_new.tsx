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
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2 text-center">
          <h2 className="text-3xl font-bold">Create Your Website</h2>
          <p className="text-text/70 text-sm">Configure your website preferences and let AI generate it for you.</p>
        </header>

        {/* Configuration Panel */}
        <div className="space-y-6">
            {/* Website Type */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Website Type</h3>
              <select
                value={config.websiteType}
                onChange={(e) => setConfig(prev => ({ ...prev, websiteType: e.target.value }))}
                className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              >
                {websiteTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-12 rounded-md border border-accent-purple/30"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 p-2 bg-[#232323] border border-accent-purple/30 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-12 h-12 rounded-md border border-accent-purple/30"
                    />
                    <input
                      type="text"
                      value={config.accentColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="flex-1 p-2 bg-[#232323] border border-accent-purple/30 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design Style */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Design Style</h3>
              <select
                value={config.designStyle}
                onChange={(e) => setConfig(prev => ({ ...prev, designStyle: e.target.value }))}
                className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              >
                {designStyles.map(style => (
                  <option key={style.value} value={style.value}>{style.label}</option>
                ))}
              </select>
            </div>

            {/* Layout */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Layout Type</h3>
              <select
                value={config.layout}
                onChange={(e) => setConfig(prev => ({ ...prev, layout: e.target.value }))}
                className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              >
                {layoutOptions.map(layout => (
                  <option key={layout.value} value={layout.value}>{layout.label}</option>
                ))}
              </select>
            </div>

            {/* Pages */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Pages to Include</h3>
              <div className="grid grid-cols-2 gap-3">
                {availablePages.map(page => (
                  <label key={page.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.pages.includes(page.value)}
                      onChange={() => handlePageToggle(page.value)}
                      className="w-4 h-4 text-accent-cyan bg-[#232323] border-accent-purple/30 rounded focus:ring-accent-cyan/40"
                    />
                    <span className="text-sm">{page.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Features to Add</h3>
              <div className="grid grid-cols-1 gap-3">
                {availableFeatures.map(feature => (
                  <label key={feature.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.features.includes(feature.value)}
                      onChange={() => handleFeatureToggle(feature.value)}
                      className="w-4 h-4 text-accent-cyan bg-[#232323] border-accent-purple/30 rounded focus:ring-accent-cyan/40"
                    />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Additional Details (Optional)</h3>
              <textarea
                rows={4}
                value={config.additionalDetails}
                onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                placeholder="Describe any specific requirements, content, or features you'd like to include..."
                className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-md text-sm placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              />
            </div>
          </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 py-3 bg-accent-cyan text-background font-semibold rounded-md hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Website'}
          </button>
        </div>

        {/* Generated Prompt Preview */}
        <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Prompt Preview</h3>
          <div className="p-4 bg-[#232323] rounded-md text-sm text-text/80">
            {generatePrompt()}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Website</h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#232323] rounded-md">
                <p className="text-sm text-text/70 mb-2">Generated at: {result.createdAt}</p>
                <pre className="text-sm overflow-x-auto whitespace-pre-wrap">{result.generated}</pre>
              </div>
              <button className="px-6 py-2 bg-accent-purple text-white rounded-md hover:bg-accent-purple/90 transition-colors">
                Save Project
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
