import { useState, useEffect, useRef, useCallback } from 'react';
import { WebsitePreview } from './WebsitePreview';
import { Sidebar } from '../components/Sidebar';
import { BillingPage } from '../components/BillingPage';
import { TechStackSelector } from './TechStackSelector';
import { apiClient } from '../utils/apiClient';
import { StepContainer } from './ui/StepContainer';
import { OptionButton, ColorPaletteButton, ToggleButton } from './ui/OptionButtons';
import { PromptEnhancer } from './ui/PromptEnhancer';
import { CodeGenerator } from './ui/CodeGenerator';
import { GlassButton } from './ui/GlassButton';
import { SettingsPage } from './SettingsPage';
import {
  WEBSITE_TYPES,
  THEME_OPTIONS,
  COLOR_PALETTES,
  DESIGN_STYLES,
  LAYOUT_OPTIONS,
  AVAILABLE_PAGES,
  AVAILABLE_FEATURES,
  TECH_STACKS
} from '../constants/websiteOptions';
import type { WebsiteConfig, GenerationResult, Step, UserSettings } from '../types';

const getStoredDefaultTechStack = () => {
  if (typeof window === 'undefined') return 'vanilla';
  return window.localStorage.getItem('defaultTechStack') || 'vanilla';
};

interface NewDashboardProps {
  onLogout: () => void;
}

export function NewDashboard({ onLogout }: NewDashboardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('homepage');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [config, setConfig] = useState<WebsiteConfig>(() => ({
    websiteType: '',
    theme: '',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    designStyle: '',
    layout: '',
    pages: [],
    features: [],
    additionalDetails: '',
    techStack: getStoredDefaultTechStack()
  }));
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'javascript' | 'notes' | 'analysis'>('html');
  
  // Credit tracking state
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [userHasUnlimited, setUserHasUnlimited] = useState(false);
  
  // New staged generation state
  const [rawPrompt, setRawPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | undefined>();
  const [displayedRawPrompt, setDisplayedRawPrompt] = useState('');
  const [displayedEnhancedPrompt, setDisplayedEnhancedPrompt] = useState('');
  const [enhancementComplete, setEnhancementComplete] = useState(false);
  const [generationStage, setGenerationStage] = useState<'enhancing' | 'coding'>('enhancing');
  const [pendingResult, setPendingResult] = useState<GenerationResult | null>(null);
  const [isApiDone, setIsApiDone] = useState(false);
  const [codeStage, setCodeStage] = useState<'html' | 'css' | 'js' | 'done'>('html');
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [cssLines, setCssLines] = useState<string[]>([]);
  const [jsLines, setJsLines] = useState<string[]>([]);
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualPromptModalOpen, setManualPromptModalOpen] = useState(false);
  const [manualPromptDraft, setManualPromptDraft] = useState('');
  const [manualPromptError, setManualPromptError] = useState('');
  const [billingOpen, setBillingOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const typingTimerRef = useRef<number | null>(null);
  const codeTimerRef = useRef<number | null>(null);
  const placeholderEnhancedRef = useRef('');
  const trimmedManualPrompt = manualPrompt.trim();
  const manualPromptActive = trimmedManualPrompt.length > 0;
  const manualPromptSnippet = manualPromptActive ? trimmedManualPrompt.slice(0, 140) : '';

  // Fetch user credits on mount
  const fetchUserCredits = async () => {
    try {
      const data = await apiClient.get('/api/user-credits');
      if (data) {
        setUserCredits(data.credits);
        setUserHasUnlimited(data.hasUnlimitedCredits || false);
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    }
  };

  useEffect(() => {
    fetchUserCredits();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      if (payload?.email) {
        setUserEmail(payload.email);
      }
    } catch {
      // ignore decode errors
    }
  }, []);

  const loadUserSettings = useCallback(async () => {
    if (settingsLoading) return;
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const data = await apiClient.get('/api/user-settings');
      setUserSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load settings';
      setSettingsError(message);
    } finally {
      setSettingsLoading(false);
    }
  }, [settingsLoading]);

  const persistUserSettings = useCallback(async (next: UserSettings) => {
    setSettingsSaving(true);
    setSettingsError(null);
    try {
      const payload = {
        displayName: next.displayName,
        themePreference: next.themePreference,
        notifications: next.notifications,
        workspace: next.workspace,
        integrations: next.integrations
      };
      const data = await apiClient.put('/api/user-settings', payload);
      setUserSettings(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      setSettingsError(message);
      throw error;
    } finally {
      setSettingsSaving(false);
    }
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
    loadUserSettings();
  }, [loadUserSettings]);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
    setSettingsError(null);
  }, []);

  const handleSettingsSave = useCallback(async (next: UserSettings) => {
    await persistUserSettings(next);
    setSettingsOpen(false);
  }, [persistUserSettings]);

  useEffect(() => {
    const handleDefaultStackUpdate = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (!detail) return;
      setConfig(prev => ({ ...prev, techStack: detail }));
    };
    window.addEventListener('settings:defaultTechStack', handleDefaultStackUpdate as EventListener);
    return () => window.removeEventListener('settings:defaultTechStack', handleDefaultStackUpdate as EventListener);
  }, []);
  // Enhancement typing
  useEffect(() => {
    if (currentStep !== 'generating' || generationStage !== 'enhancing') return;
    if (displayedRawPrompt.length < rawPrompt.length) {
      typingTimerRef.current = window.setTimeout(() => {
        setDisplayedRawPrompt(rawPrompt.slice(0, displayedRawPrompt.length + 3));
      }, 18);
      return () => { if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current); };
    }
    const target = enhancedPrompt || (placeholderEnhancedRef.current || (placeholderEnhancedRef.current = rawPrompt.replace(/Create a/i, 'Generate a fully responsive').concat('\n\nOptimizing requirements…')));
    if (displayedEnhancedPrompt.length < target.length) {
      typingTimerRef.current = window.setTimeout(() => {
        setDisplayedEnhancedPrompt(target.slice(0, displayedEnhancedPrompt.length + 4));
      }, 20);
    } else if (!enhancementComplete) {
      if (enhancedPrompt && enhancedPrompt !== target) {
        setDisplayedEnhancedPrompt('');
        placeholderEnhancedRef.current = enhancedPrompt;
      } else {
        setEnhancementComplete(true);
        setTimeout(() => { if (isApiDone) setGenerationStage('coding'); }, 600);
      }
    }
    return () => { if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current); };
  }, [currentStep, generationStage, rawPrompt, displayedRawPrompt, displayedEnhancedPrompt, enhancedPrompt, enhancementComplete, isApiDone]);

  // If API completes after enhancement done, move on
  useEffect(() => {
    if (generationStage === 'enhancing' && enhancementComplete && isApiDone) {
      setGenerationStage('coding');
    }
  }, [generationStage, enhancementComplete, isApiDone]);

  // Code streaming
  useEffect(() => {
    if (currentStep !== 'generating' || generationStage !== 'coding') return;
    const htmlMax = 24, cssMax = 16, jsMax = 12;
    if (codeStage === 'html') {
      if (codeLines.length < htmlMax) {
        codeTimerRef.current = window.setTimeout(() => setCodeLines(p => [...p, sampleHtmlLines[p.length % sampleHtmlLines.length]]), 110);
      } else setCodeStage('css');
    } else if (codeStage === 'css') {
      if (cssLines.length < cssMax) {
        codeTimerRef.current = window.setTimeout(() => setCssLines(p => [...p, sampleCssLines[p.length % sampleCssLines.length]]), 140);
      } else setCodeStage('js');
    } else if (codeStage === 'js') {
      if (jsLines.length < jsMax) {
        codeTimerRef.current = window.setTimeout(() => setJsLines(p => [...p, sampleJsLines[p.length % sampleJsLines.length]]), 170);
      } else setCodeStage('done');
    } else if (codeStage === 'done' && isApiDone && pendingResult) {
      setTimeout(() => { 
        setResult(pendingResult); 
        setCurrentStep('preview');
        // Save the project to database for future access
        if (rawPrompt) {
          saveProjectToDatabase(pendingResult, rawPrompt);
        }
      }, 400);
    }
    return () => { if (codeTimerRef.current) window.clearTimeout(codeTimerRef.current); };
  }, [currentStep, generationStage, codeStage, codeLines.length, cssLines.length, jsLines.length, isApiDone, pendingResult]);

  // Function to save project to database
  const saveProjectToDatabase = async (result: GenerationResult, prompt: string) => {
    try {
      // Generate a meaningful title from the prompt or config
      const title = config.websiteType 
        ? `${config.websiteType} Website`
        : prompt.length > 50 
          ? prompt.substring(0, 50) + '...'
          : prompt || 'Generated Website';

      await apiClient.post('/api/save-project', {
        title,
        prompt: prompt,
        generated_code: JSON.stringify({
          html: result.html,
          css: result.css,
          javascript: result.javascript,
          config: config,
          enhancedPrompt: result.enhancedPrompt,
          analysis: result.analysis,
          requirements: result.requirements,
          notes: result.notes,
          model: result.model,
          previewUrl: result.previewUrl,
          enhancementUsedAI: result.enhancementUsedAI
        })
      });
      
      console.log('Project saved successfully');
      // Refresh the projects list in the sidebar
      window.dispatchEvent(new Event('projects:refresh'));
    } catch (error) {
      console.warn('Failed to save project:', error);
      // Don't show error to user as this is not critical to the main flow
    }
  };

  const sampleHtmlLines = [
    '<header class="site-header">',
    '  <nav class="nav flex">',
    '    <a class="logo">Brand</a>',
    '    <ul class="menu">',
    '      <li><a>Home</a></li>',
    '      <li><a>Features</a></li>',
    '    </ul>',
    '  </nav>',
    '</header>',
    '<main class="hero">'
  ];
  const sampleCssLines = [
    '.site-header { backdrop-filter: blur(8px); }',
    '.hero { display:grid; place-items:center; }',
    '.btn-primary { background:linear-gradient(var(--c1), var(--c2)); }',
    'h1 { font-size:clamp(2.5rem,6vw,4rem); }',
    '@media (max-width:640px){ .menu{display:none;} }',
    '.card { box-shadow:0 8px 30px -10px #000; }',
    '.accent { color: var(--accent); }',
    'footer { opacity:.85; }'
  ];
  const sampleJsLines = [
    'document.querySelectorAll("[data-toggle]")',
    '  .forEach(btn=>btn.addEventListener("click",()=>{',
    '    document.body.classList.toggle("menu-open")',
    '  }))',
    'const observer = new IntersectionObserver(() => {})',
    'observer.observe(document.querySelector(".hero"))',
    'window.addEventListener("load", () => console.debug("Site ready"));',
    '/* end */'
  ];

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

  const openManualPromptModal = () => {
    setManualPromptDraft(manualPrompt || config.additionalDetails || '');
    setManualPromptError('');
    setManualPromptModalOpen(true);
  };

  const handleManualPromptSave = () => {
    const trimmed = manualPromptDraft.trim();
    if (!trimmed) {
      setManualPromptError('Please describe the website you want to build.');
      return;
    }
    setManualPrompt(trimmed);
    setManualPromptModalOpen(false);
    setManualPromptError('');
    generateWebsite(trimmed);
  };

  const handleManualPromptReset = () => {
    setManualPrompt('');
    setManualPromptDraft('');
    setManualPromptError('');
  };

  const closeManualPromptModal = () => {
    setManualPromptModalOpen(false);
    setManualPromptError('');
  };

  const generateWebsite = async (overridePrompt?: string) => {
    // Immediately update credits display if user doesn't have unlimited
    if (!userHasUnlimited && userCredits !== null && userCredits > 0) {
      setUserCredits(prev => (prev !== null ? prev - 1 : prev));
    }

    setCurrentStep('generating');
    setError(null);
    setGenerationStage('enhancing');
    setDisplayedRawPrompt('');
    setDisplayedEnhancedPrompt('');
    setEnhancedPrompt(undefined);
    setEnhancementComplete(false);
    setIsApiDone(false);
    setPendingResult(null);
    setCodeStage('html');
    setCodeLines([]); setCssLines([]); setJsLines([]);
    placeholderEnhancedRef.current = '';

    const normalizedOverride = overridePrompt?.trim();
    let prompt: string;
    if (normalizedOverride) {
      prompt = normalizedOverride;
    } else if (manualPromptActive) {
      prompt = trimmedManualPrompt;
    } else {
      const selectedType = WEBSITE_TYPES.find(t => t.value === config.websiteType)?.label || 'modern';
      const selectedTheme = THEME_OPTIONS.find(t => t.value === config.theme)?.label || 'versatile';
      const selectedStyle = DESIGN_STYLES.find(s => s.value === config.designStyle)?.label || 'clean';
      const selectedLayout = LAYOUT_OPTIONS.find(l => l.value === config.layout)?.label || 'responsive';
      const selectedPages = config.pages.map(p => AVAILABLE_PAGES.find(page => page.value === p)?.label).filter(Boolean).join(', ');
      const selectedFeatures = config.features.map(f => AVAILABLE_FEATURES.find(feat => feat.value === f)?.label).filter(Boolean).join(', ');
      const techStackInfo = TECH_STACKS.find(t => t.value === config.techStack);

      prompt = `Create a ${selectedType} website with ${selectedTheme} theme and ${selectedStyle} design style using a ${selectedLayout} layout. `;
      prompt += `Primary color: ${config.primaryColor}, Accent color: ${config.accentColor}. `;
      if (selectedPages) prompt += `Include these pages: ${selectedPages}. `;
      if (selectedFeatures) prompt += `Add these features: ${selectedFeatures}. `;
      if (techStackInfo && techStackInfo.name !== 'Vanilla Web') {
        prompt += `Generate using ${techStackInfo.name} tech stack (Frontend: ${techStackInfo.frontend}${techStackInfo.backend ? `, Backend: ${techStackInfo.backend}` : ''}${techStackInfo.database ? `, Database: ${techStackInfo.database}` : ''}). `;
      }
      const details = config.additionalDetails.trim();
      if (details) prompt += `Additional requirements: ${details}`;
    }
    setRawPrompt(prompt);

  // Enhancement starts automatically

    // Fire API call without blocking animation progression
    (async () => {
      try {
        const data = await apiClient.post('/api/generate-site', { 
          prompt,
          techStack: config.techStack 
        });
        
        // Refresh credits after successful generation
        try {
          const creditsData = await apiClient.get('/api/user-credits');
          if (creditsData) {
            setUserCredits(creditsData.credits);
            setUserHasUnlimited(creditsData.hasUnlimitedCredits || false);
          }
        } catch {}
        
        const pending: GenerationResult = {
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
        };
        setPendingResult(pending);
  if (data.enhancedPrompt) setEnhancedPrompt(data.enhancedPrompt);
        setIsApiDone(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate website';
        setError(message);
        
        // Restore credit on error if it was deducted
        if (!userHasUnlimited && userCredits !== null) {
          try {
            const creditsData = await apiClient.get('/api/user-credits');
            if (creditsData) {
              setUserCredits(creditsData.credits);
              setUserHasUnlimited(creditsData.hasUnlimitedCredits || false);
            }
          } catch {}
        }
        
        // If insufficient credits, surface billing
        if (/credit/i.test(message)) {
          setBillingOpen(true);
        }
        setCurrentStep('details');
      }
    })();
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
      additionalDetails: '',
      techStack: getStoredDefaultTechStack()
    });
    setResult(null);
    setError(null);
    setShowCode(false);
    setManualPrompt('');
    setManualPromptDraft('');
    setManualPromptError('');
    setManualPromptModalOpen(false);
  };

  const manualPromptProps = {
    onCustomPromptClick: openManualPromptModal,
    customPromptActive: manualPromptActive,
    onCustomPromptReset: manualPromptActive ? handleManualPromptReset : undefined,
    customPromptSnippet: manualPromptActive ? manualPromptSnippet : undefined
  };

  // Step renderers
  const renderHomepage = () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-4xl px-4 sm:px-6 space-y-8 sm:space-y-12 animate-page-fade-in">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <h1
              className="text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent animate-pulse"
              style={{ padding: '15px' }}
            >
              Skylit AI
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl text-text/90 font-light">Dream it. Build it. Launch it.</p>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-text/70 max-w-2xl mx-auto leading-relaxed px-2">Transform your ideas into stunning websites in minutes. Our AI understands your vision and crafts the perfect digital experience.</p>
        </div>
        <div className="space-y-4 sm:space-y-6 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="flex justify-center">
            <GlassButton
              variant="accent"
              size="xl"
              glow={true}
              onClick={() => nextStep('websiteType')}
              className="font-bold shadow-glass-lg hover:shadow-glass-xl transform-gpu px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl"
            >
              <span className="flex items-center justify-center gap-3">Build My Dream Website</span>
            </GlassButton>
          </div>
          <p className="text-xs sm:text-sm text-text/50 px-4">No coding required • Takes 2-3 minutes • Get live preview instantly</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {[
            { icon: '', title: 'Lightning Fast', desc: 'Generate in under 60 seconds' },
            { icon: '', title: 'Your Style', desc: 'Customized to your brand' },
            { icon: '', title: 'Mobile Ready', desc: 'Looks perfect on any device' }
          ].map((feature, i) => (
            <div key={i} className="space-y-3 opacity-80 hover:opacity-100 transition-all duration-500 p-4 animate-slide-up" style={{ animationDelay: `${0.6 + (i * 0.2)}s`, animationFillMode: 'both', transform: 'translateY(20px)', opacity: '0' }}>
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
            {...manualPromptProps}
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
            {...manualPromptProps}
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
            {...manualPromptProps}
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
            {...manualPromptProps}
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
            {...manualPromptProps}
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
            {...manualPromptProps}
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
            {...manualPromptProps}
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
            {...manualPromptProps}
          >
            <div className="max-w-2xl mx-auto space-y-6">
              <textarea
                rows={6}
                value={config.additionalDetails}
                onChange={(e) => setConfig(prev => ({ ...prev, additionalDetails: e.target.value }))}
                placeholder="Describe any specific requirements, content ideas, or special features you'd like..."
                className="w-full p-4 sm:p-6 bg-[#1a1a1a] border-2 border-accent-purple/30 rounded-xl text-white placeholder-text/50 focus:outline-none focus:border-accent-cyan/50 transition-all duration-300 text-base sm:text-lg"
              />
              
              <div className="text-center space-y-4">
                <button
                  onClick={() => nextStep('techStack')}
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl font-bold text-lg sm:text-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Next: Advanced Options
                </button>
                <p className="text-sm text-text/50">
                  Choose your tech stack for development-ready code
                </p>
              </div>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                {error}
              </div>
            )}
          </StepContainer>
        );

      case 'techStack':
        return (
          <StepContainer 
            title="Choose Your Tech Stack" 
            subtitle="Select the technologies you want for your website"
            {...manualPromptProps}
          >
            <div className="max-w-6xl mx-auto space-y-8">
              <TechStackSelector 
                selectedStack={config.techStack || 'vanilla'}
                onSelect={(stackValue) => setConfig(prev => ({ ...prev, techStack: stackValue }))}
              />
              
              <div className="text-center space-y-4">
                <button
                  onClick={() => generateWebsite()}
                  className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-xl font-bold text-lg sm:text-xl hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Create My Website!
                </button>
                <p className="text-sm text-text/50">
                  Ready to generate with {TECH_STACKS.find(t => t.value === config.techStack)?.name || 'Vanilla Web'}
                </p>
              </div>
            </div>

            {error && (
              <div className="max-w-6xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                {error}
              </div>
            )}
          </StepContainer>
        );

      case 'generating':
        return (
          <div className="min-h-[70vh] flex items-start pt-8">
            <div className="w-full transition-all duration-700">
              {generationStage === 'enhancing' && (
                <div className="animate-fade-in">
                  <PromptEnhancer
                    rawPrompt={rawPrompt}
                    displayedRaw={displayedRawPrompt}
                    displayedEnhanced={displayedEnhancedPrompt}
                    enhancedPrompt={enhancedPrompt}
                    isApiDone={isApiDone}
                    enhancementComplete={enhancementComplete}
                  />
                </div>
              )}
              {generationStage === 'coding' && (
                <div className="animate-fade-in">
                  <CodeGenerator
                    enhancedPrompt={enhancedPrompt || displayedEnhancedPrompt}
                    codeLines={codeLines}
                    cssLines={cssLines}
                    jsLines={jsLines}
                    stage={codeStage}
                    isApiDone={isApiDone}
                    onSkip={() => { if (isApiDone && pendingResult) { setResult(pendingResult); setCurrentStep('preview'); } }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return renderHomepage();
    }
  };

  const renderPreview = () => (
    <div className="min-h-screen">
      {/* Header with toggle */}
      <div className="sticky top-0 z-50 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:flex-1 sm:min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text">Your Website is Ready!</h1>
                <span className="px-2 py-1 bg-accent-cyan/20 border border-accent-cyan/30 rounded-full text-xs text-accent-cyan font-semibold">BETA</span>
              </div>
              <p className="text-sm sm:text-base text-text/60 truncate">
                Created on {result && new Date(result.createdAt).toLocaleDateString()}
                {result?.model && ` • Generated by ${result.model}`}
                {result?.enhancementUsedAI && ' • AI-Enhanced Prompt'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-none">
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
                  View Code
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
                HTML
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
                  CSS
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
                   JavaScript
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
                  Notes
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
                          <p className="text-accent-cyan text-sm">Enhanced by AI prompt refinement</p>
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
              <button
                onClick={() => { if (result) saveProjectToDatabase(result, rawPrompt); }}
                className="px-4 sm:px-6 py-3 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Save Project
              </button>
              <button
                onClick={() => { if (result) downloadCombinedHtml(result); }}
                className="px-4 sm:px-6 py-3 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan/10 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Download Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function downloadCombinedHtml(r: GenerationResult) {
    const doc = buildCombinedHtml(r);
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const title = (config.websiteType ? `${config.websiteType}-site` : 'website').replace(/\s+/g, '-');
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildCombinedHtml(r: GenerationResult) {
    const cssTag = r.css ? `<style>\n${r.css}\n</style>` : '';
    const jsTag = r.javascript ? `<script>\n${r.javascript}\n</script>` : '';
    const hasHead = /<head[>\s]/i.test(r.html);
    const hasBodyClose = /<\/body>/i.test(r.html);
    let out = r.html || r.generated || '';
    if (cssTag) {
      out = hasHead ? out.replace(/<\/head>/i, `${cssTag}\n</head>`) : out.replace(/<html[^>]*>/i, '$&\n<head>\n' + cssTag + '\n</head>');
    }
    if (jsTag) {
      out = hasBodyClose ? out.replace(/<\/body>/i, `${jsTag}\n</body>`) : out + jsTag;
    }
    return out;
  }

  // Main render
  const openProjectFromSidebar = async (p: { id: string; name: string; createdAt: string; previewUrl?: string }) => {
    try {
      // Fetch the full project data from the database
      const response = await apiClient.get(`/api/get-project/${p.id}`) as { project: any };
      const project = response.project;

      // Restore the project state
      setResult({
        generated: project.html || '<!-- No HTML content available -->',
        html: project.html || '<!-- No HTML content available -->',
        css: project.css,
        javascript: project.javascript,
        notes: project.notes || `Loaded project: ${p.name}`,
        analysis: project.analysis,
        requirements: project.requirements || [],
        enhancedPrompt: project.enhancedPrompt,
        createdAt: project.createdAt || p.createdAt,
        previewUrl: project.previewUrl || p.previewUrl,
        model: project.model,
        enhancementUsedAI: project.enhancementUsedAI || false
      });

      // If the project has a config, restore it too
      if (project.config) {
        setConfig(project.config);
      }

      // Set the prompts if available
      if (project.prompt) {
        setRawPrompt(project.prompt);
        setDisplayedRawPrompt(project.prompt);
      }
      if (project.enhancedPrompt) {
        setEnhancedPrompt(project.enhancedPrompt);
        setDisplayedEnhancedPrompt(project.enhancedPrompt);
        setEnhancementComplete(true);
      }

      setCurrentStep('preview');
    } catch (error) {
      console.error('Failed to load project:', error);
      // Fallback to showing a placeholder with available info
      setResult({
        generated: '<!-- Failed to load project data -->',
        html: '<!-- Failed to load project data -->',
        css: undefined,
        javascript: undefined,
        notes: `Failed to load project: ${p.name}`,
        analysis: undefined,
        requirements: [],
        enhancedPrompt: undefined,
        createdAt: p.createdAt,
        previewUrl: p.previewUrl,
        model: undefined,
        enhancementUsedAI: false
      });
      setCurrentStep('preview');
    }
  };

  const previewLayout = (
    <div className="flex w-full min-h-screen">
            <Sidebar 
        onLogout={onLogout} 
        onCreateNew={startOver} 
        onOpenProject={openProjectFromSidebar}
        onCreditsUpdate={fetchUserCredits}
        credits={userCredits}
        hasUnlimitedCredits={userHasUnlimited}
        onOpenBilling={() => setBillingOpen(true)}
        onOpenSettings={handleOpenSettings}
            />
      <main className="flex-1 overflow-x-hidden">
        {renderPreview()}
      </main>
    </div>
  );

  const builderLayout = (
    <div className="flex w-full min-h-screen">
            <Sidebar 
        onLogout={onLogout} 
        onCreateNew={startOver} 
        onOpenProject={openProjectFromSidebar}
        onCreditsUpdate={fetchUserCredits}
        credits={userCredits}
        hasUnlimitedCredits={userHasUnlimited}
        onOpenBilling={() => setBillingOpen(true)}
        onOpenSettings={handleOpenSettings}
            />
      <main className="flex-1 page-transition-container overflow-x-hidden">
        <div className={`page-content ${isTransitioning ? 'page-transitioning-out' : 'page-transitioning-in'}`}>
          {renderStepContent()}
        </div>
      </main>
      <BillingPage open={billingOpen} onClose={() => setBillingOpen(false)} />
    </div>
  );

  return (
    <>
      {(currentStep === 'preview' && result) ? previewLayout : builderLayout}
      <SettingsPage
        open={settingsOpen}
        settings={userSettings}
        loading={settingsLoading}
        saving={settingsSaving}
        error={settingsError}
        userEmail={userEmail}
        onClose={handleCloseSettings}
        onSave={handleSettingsSave}
        onRefresh={loadUserSettings}
      />
      {manualPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeManualPromptModal} />
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f1117] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-text/50">Advanced control</p>
              <h3 className="text-2xl font-semibold text-white">Write your own prompt</h3>
              <p className="text-sm text-text/70">
                Paste or type the exact instructions you want the AI to follow. This will override the guided selections until you switch back.
              </p>
            </div>
            <textarea
              value={manualPromptDraft}
              onChange={e => {
                setManualPromptDraft(e.target.value);
                if (manualPromptError) setManualPromptError('');
              }}
              rows={8}
              className="w-full rounded-2xl bg-white/5 border border-white/10 text-sm sm:text-base text-white p-4 focus:outline-none focus:border-accent-cyan/60 resize-none"
              placeholder="Describe the website you want..."
            />
            {manualPromptError && (
              <p className="text-sm text-red-400">{manualPromptError}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {manualPromptActive && (
                <button
                  type="button"
                  onClick={() => { handleManualPromptReset(); closeManualPromptModal(); }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/15 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Use guided selections instead
                </button>
              )}
              <div className="flex-1" />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeManualPromptModal}
                  className="px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleManualPromptSave}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Use this prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
