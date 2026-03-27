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
import { SaveProjectModal } from './ui/SaveProjectModal';
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
  
  // Save project modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [projectSaved, setProjectSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [, setCurrentProjectId] = useState<string | null>(null);
  
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
        // Reset save state for new generation
        setProjectSaved(false);
        setCurrentProjectId(null);
      }, 400);
    }
    return () => { if (codeTimerRef.current) window.clearTimeout(codeTimerRef.current); };
  }, [currentStep, generationStage, codeStage, codeLines.length, cssLines.length, jsLines.length, isApiDone, pendingResult]);

  // Function to save project to database
  const saveProjectToDatabase = async (title: string, resultData?: GenerationResult, prompt?: string) => {
    const projectResult = resultData || result;
    const projectPrompt = prompt || rawPrompt;
    
    if (!projectResult) {
      console.warn('No result to save');
      setSaveError('No project data to save');
      return;
    }

    setSavingProject(true);
    setSaveError(null);
    
    try {
      // Extract preview ID from previewUrl
      const previewId = projectResult.previewUrl 
        ? projectResult.previewUrl.split('/').pop()?.split('?')[0] 
        : undefined;

      const response = await apiClient.post('/api/save-project', {
        title,
        prompt: projectPrompt,
        enhanced_prompt: projectResult.enhancedPrompt,
        preview_url: projectResult.previewUrl,
        preview_id: previewId,
        tech_stack: config.techStack || 'vanilla',
        website_type: config.websiteType || null,
        model: projectResult.model,
        generated_code: JSON.stringify({
          html: projectResult.html,
          css: projectResult.css,
          javascript: projectResult.javascript,
          config: config,
          enhancedPrompt: projectResult.enhancedPrompt,
          analysis: projectResult.analysis,
          requirements: projectResult.requirements,
          notes: projectResult.notes,
          model: projectResult.model,
          previewUrl: projectResult.previewUrl,
          enhancementUsedAI: projectResult.enhancementUsedAI
        })
      });
      
      setProjectSaved(true);
      setCurrentProjectId(response.project?.id || null);
      setSaveModalOpen(false);
      setSaveError(null);
      
      // Refresh the projects list in the sidebar
      window.dispatchEvent(new Event('projects:refresh'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save project';
      console.error('Failed to save project:', errorMessage, error);
      setSaveError(errorMessage);
    } finally {
      setSavingProject(false);
    }
  };

  // Handler for save modal
  const handleSaveProject = async (title: string) => {
    setSaveError(null);
    await saveProjectToDatabase(title);
  };

  // Generate a default title suggestion
  const getDefaultProjectTitle = () => {
    if (config.websiteType) {
      const typeLabel = WEBSITE_TYPES.find(t => t.value === config.websiteType)?.label;
      return typeLabel ? `${typeLabel} Website` : 'My Website';
    }
    if (rawPrompt) {
      // Extract first meaningful words from prompt
      const words = rawPrompt.replace(/^(create|build|make|generate)\s+(a|an|the)?\s*/i, '').split(/\s+/);
      const title = words.slice(0, 4).join(' ');
      return title.charAt(0).toUpperCase() + title.slice(1);
    }
    return 'My Website';
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
        } catch {
          // ignore error refreshing credits
        }
        
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
          } catch {
            // ignore
          }
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
    // Reset save state
    setProjectSaved(false);
    setCurrentProjectId(null);
    setSaveModalOpen(false);
    setSaveError(null);
  };

  const manualPromptProps = {
    onCustomPromptClick: openManualPromptModal,
    customPromptActive: manualPromptActive,
    onCustomPromptReset: manualPromptActive ? handleManualPromptReset : undefined,
    customPromptSnippet: manualPromptActive ? manualPromptSnippet : undefined
  };

  // Step renderers
  const renderHomepage = () => (
    <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-8 animate-page-fade-in">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text">
            What do you want to <span className="gradient-text">build</span>?
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-lg mx-auto">
            Describe your website idea or use our guided builder to create something incredible.
          </p>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <div className="card p-1.5 shadow-lg">
            <textarea
              rows={3}
              value={manualPrompt}
              onChange={e => setManualPrompt(e.target.value)}
              placeholder="e.g. A modern landing page for a coffee shop with online ordering..."
              className="w-full p-4 bg-transparent text-text placeholder:text-muted/60 resize-none focus:outline-none text-base"
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-2">
                <select
                  value={config.techStack}
                  onChange={e => setConfig(prev => ({ ...prev, techStack: e.target.value }))}
                  className="text-xs bg-surface-overlay border border-border rounded-md px-2 py-1 text-muted focus:outline-none"
                >
                  {TECH_STACKS.map(t => (
                    <option key={t.value} value={t.value}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  if (manualPrompt.trim()) {
                    generateWebsite(manualPrompt.trim());
                  }
                }}
                disabled={!manualPrompt.trim()}
                className="btn-primary px-5 py-2 text-sm font-medium disabled:opacity-40"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">or use the guided builder</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center">
            <GlassButton
              variant="secondary"
              size="lg"
              onClick={() => nextStep('websiteType')}
              className="font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Step-by-Step Builder
            </GlassButton>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
          {[
            'AI-Powered', 'Responsive', 'Live Preview', 'Download Code', 'Multiple Frameworks'
          ].map(tag => (
            <span key={tag} className="px-3 py-1 rounded-full bg-surface border border-border">
              {tag}
            </span>
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
                  className="btn-primary px-6 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="btn-primary px-6 py-2.5 text-sm font-medium"
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
                className="input-base w-full p-4 text-base"
              />
              
              <div className="text-center space-y-4">
                <button
                  onClick={() => nextStep('techStack')}
                  className="btn-primary px-8 py-3 text-sm font-medium"
                >
                  Next: Advanced Options
                </button>
                <p className="text-sm text-text/50">
                  Choose your tech stack for development-ready code
                </p>
              </div>
            </div>

            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
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
                  className="btn-primary px-8 py-3 text-sm font-medium"
                >
                  Create My Website!
                </button>
                <p className="text-sm text-text/50">
                  Ready to generate with {TECH_STACKS.find(t => t.value === config.techStack)?.name || 'Vanilla Web'}
                </p>
              </div>
            </div>

            {error && (
              <div className="max-w-6xl mx-auto p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </StepContainer>
        );

      case 'generating':
        return (
          <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-[70vh] flex items-start pt-8 px-4 sm:px-6">
            <div className="w-full max-w-5xl mx-auto transition-all duration-300">
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
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold text-text">Your Website is Ready</h1>
                <span className="px-1.5 py-0.5 bg-accent-primary/10 rounded text-[10px] text-accent-primary font-medium">BETA</span>
              </div>
              <p className="text-xs text-muted truncate">
                Created {result && new Date(result.createdAt).toLocaleDateString()}
                {result?.model && ` · ${result.model}`}
                {result?.enhancementUsedAI && ' · AI-Enhanced'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* View Toggle */}
              <div className="flex bg-surface rounded-lg p-0.5 border border-border">
                <button
                  onClick={() => setShowCode(false)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    !showCode
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setShowCode(true)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    showCode
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-muted hover:text-text'
                  }`}
                >
                  Code
                </button>
              </div>

              <button
                onClick={startOver}
                className="btn-primary px-3 py-1.5 text-sm"
              >
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        {!showCode && result?.previewUrl ? (
          <WebsitePreview
            previewUrl={result.previewUrl}
            title="Your Generated Website"
            className="min-h-[70vh] sm:min-h-[80vh]"
          />
        ) : (
          <div className="space-y-4">
            {/* Code Tabs */}
            <div className="flex flex-wrap gap-1 bg-surface rounded-lg p-1 border border-border">
              {(['html', 'css', 'javascript', 'notes', 'analysis'] as const).map(tab => {
                if (tab === 'css' && !result?.css) return null;
                if (tab === 'javascript' && !result?.javascript) return null;
                if (tab === 'notes' && !result?.notes) return null;
                if (tab === 'analysis' && !result?.analysis) return null;
                const labels: Record<string, string> = { html: 'HTML', css: 'CSS', javascript: 'JavaScript', notes: 'Notes', analysis: 'Analysis' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeCodeTab === tab
                        ? 'bg-accent-primary text-white shadow-sm'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Code Content */}
            <div className="card overflow-hidden">
              <div className="p-4 sm:p-6">
                {activeCodeTab === 'analysis' && result?.analysis ? (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-text">AI Analysis</h3>
                    <p className="text-sm text-muted">{result.analysis}</p>
                    {result.requirements && result.requirements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-text mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {result.requirements.map((req, i) => (
                            <li key={i} className="text-sm text-muted">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.enhancementUsedAI && (
                      <div className="p-3 bg-accent-primary/5 border border-accent-primary/10 rounded-lg">
                        <p className="text-accent-primary text-xs">Enhanced by AI prompt refinement</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="text-xs sm:text-sm text-text whitespace-pre-wrap font-mono overflow-x-auto">
                    {activeCodeTab === 'html' && (result?.html || result?.generated)}
                    {activeCodeTab === 'css' && result?.css}
                    {activeCodeTab === 'javascript' && result?.javascript}
                    {activeCodeTab === 'notes' && result?.notes}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => setSaveModalOpen(true)}
            disabled={projectSaved}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              projectSaved
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default'
                : 'btn-primary'
            }`}
          >
            {projectSaved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            ) : 'Save Project'}
          </button>
          <button
            onClick={() => { if (result) downloadCombinedHtml(result); }}
            className="px-5 py-2.5 border border-border text-text hover:bg-surface-overlay rounded-lg transition-all text-sm font-medium"
          >
            Download Code
          </button>
        </div>
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

      // Mark as saved since it was loaded from database
      setProjectSaved(true);
      setCurrentProjectId(project.id);

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
      setProjectSaved(false);
      setCurrentProjectId(null);
      setCurrentStep('preview');
    }
  };

  const sidebarProps = {
    onLogout,
    onCreateNew: startOver,
    onOpenProject: openProjectFromSidebar,
    onCreditsUpdate: fetchUserCredits,
    credits: userCredits,
    hasUnlimitedCredits: userHasUnlimited,
    onOpenBilling: () => setBillingOpen(true),
    onOpenSettings: handleOpenSettings,
  };

  const previewLayout = (
    <>
      <Sidebar {...sidebarProps} />
      <main className="pt-14 lg:pt-0 lg:ml-64 min-h-screen overflow-x-hidden bg-background">
        {renderPreview()}
      </main>
    </>
  );

  const builderLayout = (
    <>
      <Sidebar {...sidebarProps} />
      <main className="pt-14 lg:pt-0 lg:ml-64 min-h-screen page-transition-container overflow-x-hidden bg-background">
        <div className={`page-content ${isTransitioning ? 'page-transitioning-out' : 'page-transitioning-in'}`}>
          {renderStepContent()}
        </div>
      </main>
      <BillingPage open={billingOpen} onClose={() => setBillingOpen(false)} />
    </>
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
      <SaveProjectModal
        open={saveModalOpen}
        defaultTitle={getDefaultProjectTitle()}
        saving={savingProject}
        saveError={saveError}
        onSave={handleSaveProject}
        onClose={() => {
          setSaveModalOpen(false);
          setSaveError(null);
        }}
      />
      {manualPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={closeManualPromptModal} />
          <div className="relative w-full max-w-2xl card p-6 shadow-xl space-y-4 animate-scale-in">
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-text">Write your own prompt</h3>
              <p className="text-sm text-muted">
                Type the exact instructions you want the AI to follow.
              </p>
            </div>
            <textarea
              value={manualPromptDraft}
              onChange={e => {
                setManualPromptDraft(e.target.value);
                if (manualPromptError) setManualPromptError('');
              }}
              rows={6}
              className="input-base w-full p-4 resize-none"
              placeholder="Describe the website you want..."
            />
            {manualPromptError && (
              <p className="text-sm text-red-500">{manualPromptError}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {manualPromptActive && (
                <button
                  type="button"
                  onClick={() => { handleManualPromptReset(); closeManualPromptModal(); }}
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Use guided selections instead
                </button>
              )}
              <div className="flex-1" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeManualPromptModal}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleManualPromptSave}
                  className="btn-primary px-4 py-2 text-sm font-medium"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
