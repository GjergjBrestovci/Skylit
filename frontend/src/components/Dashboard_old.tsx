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

  const handleGenerate = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
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

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-2">
          <h2 className="text-3xl font-bold">Generate Your Website</h2>
          <p className="text-text/70 text-sm">Describe what you want; AI generation coming soon.</p>
        </header>

        <section className="bg-[#1e1e1e] border border-accent-purple/20 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">Website Description</label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full p-3 bg-[#232323] border border-accent-purple/30 rounded-md text-sm placeholder-text/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/40"
              placeholder="e.g., A SaaS landing page with pricing, features grid, and a hero section..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-accent-cyan to-accent-purple text-background font-semibold text-sm px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {result && (
            <div className="mt-4 border border-accent-purple/30 rounded-md bg-[#222] p-4 space-y-2">
              <div className="text-xs text-text/50 flex justify-between"><span>Generated Preview</span><span>{new Date(result.createdAt).toLocaleTimeString()}</span></div>
              <pre className="text-xs whitespace-pre-wrap leading-relaxed text-text/80 overflow-x-auto max-h-64">{result.generated}</pre>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-accent-cyan">Recent Projects (placeholder)</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((id) => (
              <div
                key={id}
                className="p-4 rounded-lg bg-[#1e1e1e] border border-accent-purple/20 hover:border-accent-cyan/40 transition-colors"
              >
                <div className="text-sm font-medium mb-1 text-accent-cyan">Project {id}</div>
                <p className="text-xs text-text/60 line-clamp-2">Prompt preview...</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
