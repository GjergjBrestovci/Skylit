import { useState } from 'react';
import { WebsitePreview } from './WebsitePreview';
import { apiClient } from '../utils/apiClient';
import { StepContainer } from './ui/StepContainer';
import { OptionButton, ColorPaletteButton, ToggleButton } from './ui/OptionButtons';
import {
  WEBSITE_TYPES,
  THEME_OPTIONS,
  COLOR_PALETTES,
  DESIGN_STYLES,
  LAYOUT_OPTIONS,
  AVAILABLE_PAGES,
  AVAILABLE_FEATURES
} from '../constants/websiteOptions';

interface NewDashboardProps {
  onLogout: () => void;
}

interface WebsiteConfig {
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

interface GenerationResult {
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

type Step = 'homepage' | 'websiteType' | 'theme' | 'colors' | 'style' | 'layout' | 'pages' | 'features' | 'details' | 'generating' | 'preview';

export function NewDashboard({ onLogout }: NewDashboardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('homepage');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [config, setConfig] = useState<WebsiteConfig>({
    websiteType: '',
    theme: '',
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
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'javascript' | 'notes' | 'analysis'>('html');

  // Navigation functions
  const nextStep = (step: Step, updates?: Partial<WebsiteConfig>) => {
    setIsTransitioning(true);
    
    // Add a slight delay for visual feedback
    setTimeout(() => {
      if (updates) {
        setConfig(prev => ({ ...prev, ...updates }));
      }
      setCurrentStep(step);
    }, 150);
    
    // Reset transition state
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
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
      const selectedType = WEBSITE_TYPES.find(t => t.value === config.websiteType)?.label;
      const selectedTheme = THEME_OPTIONS.find(t => t.value === config.theme)?.label;
      const selectedStyle = DESIGN_STYLES.find(s => s.value === config.designStyle)?.label;
      const selectedLayout = LAYOUT_OPTIONS.find(l => l.value === config.layout)?.label;
      const selectedPages = config.pages.map(p => AVAILABLE_PAGES.find(page => page.value === p)?.label).join(', ');
      const selectedFeatures = config.features.map(f => AVAILABLE_FEATURES.find(feat => feat.value === f)?.label).join(', ');

      let prompt = `Create a ${selectedType} website with ${selectedTheme} theme and ${selectedStyle} design style using a ${selectedLayout} layout. `;
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
        html: data.html || data.generated,
        css: data.css,
        javascript: data.javascript,
        notes: data.notes,
        analysis: data.analysis,
        requirements: data.requirements,
        enhancedPrompt: data.enhancedPrompt,
        createdAt: data.createdAt,
        previewUrl: data.previewUrl,
        model: data.model,
        enhancementUsedAI: data.enhancementUsedAI
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
      theme: '',
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
      <div className="text-center max-w-4xl px-4 sm:px-6 space-y-8 sm:space-y-12 animate-page-fade-in">
        {/* Hero Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent animate-pulse">
              Skylit AI
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl text-text/90 font-light">
              Dream it. Build it. Launch it.
            </p>
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-text/70 max-w-2xl mx-auto leading-relaxed px-2">
            Transform your ideas into stunning websites in minutes. 
            Our AI understands your vision and crafts the perfect digital experience.
          </p>
        </div>

        {/* CTA Button */}
        <div className="space-y-4 sm:space-y-6 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <button
            onClick={() => nextStep('websiteType')}
            className="group relative px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent-cyan/25 w-full sm:w-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center justify-center gap-3">
              Build My Dream Website
              <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">🚀</span>
            </span>
          </button>
          
          <p className="text-xs sm:text-sm text-text/50 px-4">
            No coding required • Takes 2-3 minutes • Get live preview instantly
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Generate in under 60 seconds' },
            { icon: '🎨', title: 'Your Style', desc: 'Customized to your brand' },
            { icon: '📱', title: 'Mobile Ready', desc: 'Looks perfect on any device' }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="space-y-3 opacity-80 hover:opacity-100 transition-all duration-500 p-4 animate-slide-up" 
              style={{ 
                animationDelay: `${0.6 + (i * 0.2)}s`, 
                animationFillMode: 'both',
                transform: 'translateY(20px)',
                opacity: '0'
              }}
            >
              <div className="text-2xl sm:text-3xl">{feature.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-text/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'websiteType':
        return (
          <StepContainer 
            title="What are you building?" 
            subtitle="Choose the type that best fits your vision"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {WEBSITE_TYPES.map((type, index) => (
                <OptionButton
                  key={type.value}
                  value={type.value}
                  label={type.label}
                  emoji={type.emoji}
                  description={type.description}
                  onClick={() => nextStep('theme', { websiteType: type.value })}
                  animationIndex={index}
                />
              ))}
            </div>
          </StepContainer>
        );

      case 'theme':
        return (
          <StepContainer 
            title="Choose your theme" 
            subtitle="Pick the overall mood and brightness for your website"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {THEME_OPTIONS.map((theme, index) => (
                <OptionButton
                  key={theme.value}
                  value={theme.value}
                  label={theme.label}
                  emoji={theme.emoji}
                  description={theme.description}
                  onClick={() => nextStep('colors', { theme: theme.value })}
                  animationIndex={index}
                />
              ))}
            </div>
          </StepContainer>
        );

      case 'colors':
        return (
          <StepContainer 
            title="Pick your colors" 
            subtitle="Choose a palette that represents your brand"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {COLOR_PALETTES.map((palette, index) => (
                <ColorPaletteButton
                  key={palette.name}
                  name={palette.name}
                  primary={palette.primary}
                  accent={palette.accent}
                  onClick={() => nextStep('style', { primaryColor: palette.primary, accentColor: palette.accent })}
                  animationIndex={index}
                />
              ))}
            </div>
          </StepContainer>
        );

      case 'style':
        return (
          <StepContainer 
            title="What's your style?" 
            subtitle="Choose the design direction that speaks to you"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {DESIGN_STYLES.map((style, index) => (
                <OptionButton
                  key={style.value}
                  value={style.value}
                  label={style.label}
                  emoji={style.emoji}
                  description={style.description}
                  onClick={() => nextStep('layout', { designStyle: style.value })}
                  animationIndex={index}
                />
              ))}
            </div>
          </StepContainer>
        );

      case 'layout':
        return (
          <StepContainer 
            title="Choose your layout" 
            subtitle="How do you want to structure your content?"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {LAYOUT_OPTIONS.map((layout, index) => (
                <OptionButton
                  key={layout.value}
                  value={layout.value}
                  label={layout.label}
                  emoji={layout.emoji}
                  description={layout.description}
                  onClick={() => nextStep('pages', { layout: layout.value })}
                  animationIndex={index}
                  className="text-center"
                />
              ))}
            </div>
          </StepContainer>
        );

      case 'pages':
        return (
          <StepContainer 
            title="What pages do you need?" 
            subtitle="Select all the pages you want to include"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {AVAILABLE_PAGES.map((page, index) => (
                  <ToggleButton
                    key={page.value}
                    value={page.value}
                    label={page.label}
                    emoji={page.emoji}
                    isSelected={config.pages.includes(page.value)}
                    onClick={() => handlePageToggle(page.value)}
                    animationIndex={index}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => nextStep('features')}
                  disabled={config.pages.length === 0}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-base sm:text-lg font-semibold"
                >
                  Continue ({config.pages.length} pages selected)
                </button>
              </div>
            </div>
          </StepContainer>
        );

      case 'features':
        return (
          <StepContainer 
            title="Add some features" 
            subtitle="What functionality would you like?"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                {AVAILABLE_FEATURES.map((feature, index) => (
                  <ToggleButton
                    key={feature.value}
                    value={feature.value}
                    label={feature.label}
                    emoji={feature.emoji}
                    isSelected={config.features.includes(feature.value)}
                    onClick={() => handleFeatureToggle(feature.value)}
                    animationIndex={index}
                  />
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => nextStep('details')}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-accent-cyan text-white rounded-xl hover:bg-accent-cyan/90 transition-all duration-300 text-base sm:text-lg font-semibold"
                >
                  Continue ({config.features.length} features selected)
                </button>
              </div>
            </div>
          </StepContainer>
        );

      case 'details':
        return (
          <StepContainer 
            title="Any special requests?" 
            subtitle="Tell us more about your vision (optional)"
          >
            <div className="max-w-2xl mx-auto space-y-6">
              <textarea
                rows={6}
                value={config.additionalDetails}
                onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                placeholder="Describe any specific requirements, content ideas, or special features you'd like..."
                className="w-full p-4 sm:p-6 bg-[#1a1a1a] border-2 border-accent-purple/30 rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-accent-cyan/50 transition-all duration-300 text-base sm:text-lg"
              />
              
              <div className="text-center">
                <button
                  onClick={generateWebsite}
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl font-bold text-lg sm:text-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
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
          </StepContainer>
        );

      case 'generating':
        return (
          <StepContainer 
            title="Creating your masterpiece..." 
            subtitle="Our AI is crafting the perfect website for you"
          >
            <div className="text-center space-y-6">
              <div className="text-5xl sm:text-6xl animate-bounce">🪄</div>
              <div className="flex justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin"></div>
              </div>
            </div>
          </StepContainer>
        );

      default:
        return renderHomepage();
    }
  };

  const renderPreview = () => (
    <div className="min-h-screen bg-background">
      {/* Header with toggle */}
      <div className="border-b border-accent-purple/20 bg-[#1a1a1a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Your Website is Ready! 🎉</h1>
                <span className="px-2 py-1 bg-accent-cyan/20 border border-accent-cyan/30 rounded-full text-xs text-accent-cyan font-semibold">
                  BETA
                </span>
              </div>
              <p className="text-sm sm:text-base text-text/60">
                Created on {result && new Date(result.createdAt).toLocaleDateString()}
                {result?.model && ` • Generated by ${result.model}`}
                {result?.enhancementUsedAI && ' • AI-Enhanced Prompt'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* View Toggle */}
              <div className="flex bg-[#232323] rounded-lg p-1">
                <button
                  onClick={() => setShowCode(false)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    !showCode 
                      ? 'bg-accent-cyan text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  🌐 Live Preview
                </button>
                <button
                  onClick={() => setShowCode(true)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    showCode 
                      ? 'bg-accent-purple text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  💻 View Code
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={startOver}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                >
                  Create Another
                </button>

                <button
                  onClick={onLogout}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {!showCode && result?.previewUrl ? (
          /* Live Preview */
          <WebsitePreview 
            previewUrl={result.previewUrl}
            title="Your Generated Website"
            className="min-h-[70vh] sm:min-h-[80vh]"
          />
        ) : (
          /* Code View */
          <div className="space-y-4 sm:space-y-6">
            {/* Code Tabs */}
            <div className="flex flex-wrap sm:space-x-1 bg-[#1a1a1a] rounded-lg p-1 gap-1 sm:gap-0">
              <button
                onClick={() => setActiveCodeTab('html')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
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
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    activeCodeTab === 'css' 
                      ? 'bg-accent-purple text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  🎨 CSS
                </button>
              )}
              {result?.javascript && (
                <button
                  onClick={() => setActiveCodeTab('javascript')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    activeCodeTab === 'javascript' 
                      ? 'bg-yellow-500 text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  ⚡ JavaScript
                </button>
              )}
              {result?.notes && (
                <button
                  onClick={() => setActiveCodeTab('notes')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    activeCodeTab === 'notes' 
                      ? 'bg-pink-500 text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  📝 Notes
                </button>
              )}
              {result?.analysis && (
                <button
                  onClick={() => setActiveCodeTab('analysis')}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                    activeCodeTab === 'analysis' 
                      ? 'bg-green-500 text-white' 
                      : 'text-text/70 hover:text-white'
                  }`}
                >
                  🔍 Analysis
                </button>
              )}
            </div>

            {/* Code Content */}
            <div className="bg-[#1a1a1a] rounded-xl border border-accent-purple/20 overflow-hidden">
              <div className="p-4 sm:p-6">
                {activeCodeTab === 'analysis' && result?.analysis ? (
                  <div className="space-y-4">
                    <div className="text-text/90">
                      <h3 className="text-lg font-semibold text-green-400 mb-3">AI Analysis</h3>
                      <p className="mb-4">{result.analysis}</p>
                      
                      {result.requirements && result.requirements.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-accent-cyan mb-2">Requirements Identified:</h4>
                          <ul className="list-disc pl-6 space-y-1">
                            {result.requirements.map((req, i) => (
                              <li key={i} className="text-text/80">{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.enhancementUsedAI && (
                        <div className="mt-4 p-3 bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg">
                          <p className="text-accent-cyan text-sm">✨ Enhanced by AI prompt refinement</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs sm:text-sm text-text/90 whitespace-pre-wrap font-mono overflow-x-auto">
                    {activeCodeTab === 'html' && (result?.html || result?.generated)}
                    {activeCodeTab === 'css' && result?.css}
                    {activeCodeTab === 'javascript' && result?.javascript}
                    {activeCodeTab === 'notes' && result?.notes}
                  </pre>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button className="px-4 sm:px-6 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-all duration-300 text-sm sm:text-base">
                💾 Save Project
              </button>
              <button className="px-4 sm:px-6 py-3 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-all duration-300 text-sm sm:text-base">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0a0a] to-background page-transition-container">
      <div className={`page-content ${isTransitioning ? 'page-transitioning-out' : 'page-transitioning-in'}`}>
        {renderStepContent()}
      </div>
    </div>
  );
}
