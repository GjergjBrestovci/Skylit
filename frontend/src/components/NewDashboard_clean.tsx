import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { BillingPage } from '../components/BillingPage';
import { apiClient } from '../utils/apiClient';
import type { WebsiteConfig, GenerationResult, Step } from '../types';
     
interface NewDashboardProps {
  onLogout: () => void;
}

export function NewDashboard({ onLogout }: NewDashboardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('homepage');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, setConfig] = useState<WebsiteConfig>({
    websiteType: '',
    theme: '',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    designStyle: '',
    layout: '',
    pages: [],
    features: [],
    additionalDetails: '',
    techStack: 'vanilla'
  });

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  // Homepage render
  const renderHomepage = () => (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-5xl w-full space-y-8 sm:space-y-12 animate-page-fade-in">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4 sm:space-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent animate-pulse leading-tight">
              Skylit AI
            </h1>
            <p className="text-lg sm:text-2xl md:text-3xl text-text/90 font-light">
              Dream it. Build it. Launch it.
            </p>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-text/70 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into stunning websites in minutes. Our AI understands your vision and crafts the perfect digital experience.
          </p>
        </div>
        
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <button 
            onClick={() => nextStep('websiteType')} 
            className="group relative px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-accent-cyan/25 w-full sm:w-auto mx-auto block"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto pt-8">
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Generate in under 60 seconds' },
            { icon: '🎨', title: 'Your Style', desc: 'Customized to your brand' },
            { icon: '📱', title: 'Mobile Ready', desc: 'Looks perfect on any device' }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="space-y-3 opacity-80 hover:opacity-100 transition-all duration-500 p-6 rounded-xl bg-accent-purple/5 border border-accent-purple/10 hover:border-accent-purple/20 animate-slide-up" 
              style={{ 
                animationDelay: `${0.6 + (i * 0.2)}s`, 
                animationFillMode: 'both', 
                transform: 'translateY(20px)', 
                opacity: '0' 
              }}
            >
              <div className="text-2xl sm:text-3xl">{feature.icon}</div>
              <h3 className="text-base sm:text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-text/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
      techStack: 'vanilla'
    });
    setResult(null);
  };

  const nextStep = (step: Step) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 300);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'homepage':
        return renderHomepage();
      default:
        return renderHomepage();
    }
  };

  if (currentStep === 'preview' && result) {
    return (
      <div className="flex w-full min-h-screen">
        <Sidebar onLogout={onLogout} onCreateNew={startOver} onOpenProject={(_) => {}} />
        <main className="flex-1 overflow-x-hidden">
          <div>Preview would go here</div>
        </main>
        <TokensFab />
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-background">
      <Sidebar onLogout={onLogout} onCreateNew={startOver} onOpenProject={(_) => {}} />
      <main className="flex-1 bg-background page-transition-container overflow-x-hidden">
        <div className={`page-content ${isTransitioning ? 'page-transitioning-out' : 'page-transitioning-in'}`}>
          {renderStepContent()}
        </div>
      </main>
      <TokensFab />
      <BillingPage open={billingOpen} onClose={() => setBillingOpen(false)} />
    </div>
  );
}

function TokensFab() {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const data = await apiClient.get('/api/user-credits');
        if (data && typeof data.credits === 'number') setCredits(data.credits);
      } catch {}
    };
    fetchCredits();
  }, []);

  const handleClose = () => {
    setOpen(false);
    (async () => {
      try {
        const data = await apiClient.get('/api/user-credits');
        if (data && typeof data.credits === 'number') setCredits(data.credits);
      } catch {}
    })();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 md:bottom-10 right-4 sm:right-6 z-20 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-accent-purple text-white shadow-lg hover:brightness-110 transition-all flex items-center gap-2 border border-white/10 text-sm ${
          typeof credits === 'number' && credits < 3 ? 'ring-2 ring-red-400/60' : 'ring-1 ring-accent-cyan/30'
        }`}
        title="Open Billing / Credits"
        aria-label="Open Billing / Credits"
      >
        <span className="text-sm">💳</span>
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Billing</span>
        {typeof credits === 'number' && (
          <span className="ml-1 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-black/30 border border-white/10">
            {credits}
          </span>
        )}
      </button>
      <BillingPage open={open} onClose={handleClose} />
    </>
  );
}
