import React, { useEffect } from 'react';

// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface AnalyticsProps {
  trackingId: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ trackingId }) => {
  useEffect(() => {
    if (!trackingId || typeof window === 'undefined') return;

    // Load Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        send_page_view: true,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `;
    document.head.appendChild(script2);

    window.gtag = window.gtag || function(...args: any[]) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    };

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [trackingId]);

  return null;
};

// Custom analytics tracking functions
export const analytics = {
  // Track page views
  pageView: (path: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID, {
        page_path: path,
        page_title: title
      });
    }
  },

  // Track custom events
  event: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        custom_parameter: true,
        ...parameters
      });
    }
  },

  // Track website generation
  trackGeneration: (techStack: string, prompt: string, success: boolean) => {
    analytics.event('website_generation', {
      tech_stack: techStack,
      prompt_length: prompt.length,
      success: success,
      timestamp: new Date().toISOString()
    });
  },

  // Track template usage
  trackTemplateUsage: (templateId: string, category: string) => {
    analytics.event('template_used', {
      template_id: templateId,
      template_category: category,
      timestamp: new Date().toISOString()
    });
  },

  // Track user engagement
  trackEngagement: (action: string, target?: string, value?: number) => {
    analytics.event('user_engagement', {
      engagement_action: action,
      engagement_target: target,
      engagement_value: value,
      timestamp: new Date().toISOString()
    });
  },

  // Track errors
  trackError: (error: string, context?: string) => {
    analytics.event('error', {
      error_message: error,
      error_context: context,
      timestamp: new Date().toISOString()
    });
  },

  // Track performance metrics
  trackPerformance: (metric: string, value: number, unit: string = 'ms') => {
    analytics.event('performance', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
      timestamp: new Date().toISOString()
    });
  },

  // Track business metrics
  trackBusinessMetric: (metric: string, value: number, currency?: string) => {
    analytics.event('business_metric', {
      metric_name: metric,
      metric_value: value,
      currency: currency,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Web Vitals
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        analytics.trackPerformance('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          analytics.trackPerformance('fid', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        analytics.trackPerformance('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);
};

export default Analytics;
