import { callModel, ChatMessage } from './modelProvider';

export interface GeneratedWebsite {
  html: string;
  css: string;
  javascript: string;
  notes: string;
  model: string;
}

const LOVABLE_STYLE_GUIDELINES = `
=== MANDATORY DESIGN QUALITY STANDARDS ===

TYPOGRAPHY:
- Load exactly 2 Google Fonts via <link> in <head>: one display/heading font, one clean body font
- Suggested pairs: "Outfit"+"Inter", "Plus Jakarta Sans"+"Inter", "Sora"+"DM Sans", "Bricolage Grotesque"+"Manrope"
- Use CSS custom properties: --font-display, --font-body
- Hero h1: clamp(2.5rem, 5vw, 4.5rem); Section h2: clamp(1.5rem, 3vw, 2.5rem); Body: 1rem/1.625

COLOR SYSTEM:
- Define a 6-token color palette as CSS custom properties at top of <style>:
  --color-primary, --color-primary-light, --color-accent, --color-text, --color-text-muted, --color-bg, --color-surface
- Use cohesive, professional palettes (e.g. deep violet + warm cream, slate + sky blue, emerald + off-white)
- Sufficient contrast: text on bg must be ≥4.5:1

SPACING & LAYOUT:
- 8px base unit. Use only: 4, 8, 12, 16, 24, 32, 48, 64, 80, 96px
- Section vertical padding: 80-96px desktop, 48px mobile
- Max content width: 1200px centered with auto margins
- CSS Grid for complex layouts, Flexbox for linear alignment

COMPONENTS (exact specs):
- Buttons: min-height 44px, 8px border-radius, 16px horizontal padding, 150ms transition, hover darken 8%
- Cards: 24px padding, 12px border-radius, 1px solid border (rgba(0,0,0,0.08)), box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)
- Inputs/forms: 44px height, 8px border-radius, 1px solid border, 200ms focus transition with accent outline
- Navigation: sticky top-0, backdrop-filter blur(8px), bg with 90% opacity, max-width 1200px centered
- Hero: min-height 100vh or 90vh, centered content, gradient or image background, one primary CTA + one ghost CTA

IMAGES & ICONS:
- Use placeholder images from: https://picsum.photos/{width}/{height}?random={n}
- Use inline SVG icons (24x24, 1.5px stroke, currentColor). Never use emoji as icons

ANIMATIONS:
- Fade-in on scroll via IntersectionObserver (opacity 0→1 + translateY 24px→0, 600ms ease)
- Hover micro-interactions: cards lift 2px + shadow increase (200ms), buttons darken (150ms)
- NO excessive animations, NO bounce, NO flash, NO marquee

NAVIGATION (always include):
- Sticky header: logo left, nav links center/right, primary CTA button far right
- Mobile hamburger menu that slides in an overlay nav
- Smooth scroll to sections on nav link click

FOOTER (always include):
- Dark or light background, company name + brief tagline, 3-4 nav links, copyright
- Optional: social media icons as inline SVGs

MOBILE RESPONSIVENESS:
- All multi-column layouts stack below 768px
- Font sizes reduce gracefully
- Horizontal padding: 16px on mobile, 24px on tablet, auto on desktop
- Touch targets minimum 44x44px

OUTPUT LENGTH: Generate AT LEAST 250 lines of HTML, 200 lines of CSS, and all required JavaScript. Never truncate.
=== END DESIGN STANDARDS ===`;

      
function getSystemPrompt(techStack: string): string {
  switch (techStack) {
    case 'react':
      return `You are an expert React developer. Generate COMPLETE, FUNCTIONAL React components with modern hooks and best practices.
${LOVABLE_STYLE_GUIDELINES}
CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
<!-- This will be the index.html file -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="app.js"></script>
</body>
</html>
</HTML>

<JAVASCRIPT>
// Complete React application with functional components and hooks
const { useState, useEffect } = React;

function App() {
  // Your React components here
  return (
    <div>
      {/* Complete React application */}
    </div>
  );
}

// Additional components as needed
function Header() {
  return <header>{/* Header content */}</header>;
}

function Footer() {
  return <footer>{/* Footer content */}</footer>;
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
</JAVASCRIPT>

<CSS>
/* Modern CSS with component-specific styling */
/* Use CSS modules approach or styled-components patterns */
</CSS>

<NOTES>
• React functional components with hooks
• Modern ES6+ syntax
• Component composition
• State management with useState/useEffect
• Responsive design
</NOTES>

REQUIREMENTS:
- Generate ACTUAL working React code using CDN
- Use modern React patterns (hooks, functional components)
- Make all interactive elements functional with React state
- Include realistic content and data
- Ensure mobile responsiveness
- Use modern JavaScript (ES6+)`;

    case 'vue':
      return `You are an expert Vue.js developer. Generate COMPLETE, FUNCTIONAL Vue.js application with composition API.
${LOVABLE_STYLE_GUIDELINES}
CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue App</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div id="app"></div>
    <script src="app.js"></script>
</body>
</html>
</HTML>

<JAVASCRIPT>
// Complete Vue 3 application with Composition API
const { createApp, ref, reactive, onMounted, computed } = Vue;

const App = {
  setup() {
    // Your Vue composition API logic here
    
    return {
      // Return reactive data and methods
    };
  },
  template: \`
    <div>
      <!-- Complete Vue application template -->
    </div>
  \`
};

// Additional components as needed
const Header = {
  template: \`<header><!-- Header content --></header>\`
};

const Footer = {
  template: \`<footer><!-- Footer content --></footer>\`
};

// Create and mount the app
createApp(App).mount('#app');
</JAVASCRIPT>

<CSS>
/* Modern CSS with Vue scoped styling approach */
</CSS>

<NOTES>
• Vue 3 Composition API
• Reactive data with ref/reactive
• Modern JavaScript ES6+
• Component composition
• Template-based rendering
</NOTES>

REQUIREMENTS:
- Generate ACTUAL working Vue.js code using CDN
- Use Vue 3 Composition API
- Make all interactive elements functional with Vue reactivity
- Include realistic content and data
- Ensure mobile responsiveness
- Use modern JavaScript (ES6+)`;

    case 'nextjs':
      return `You are an expert Next.js developer. Generate COMPLETE, FUNCTIONAL Next.js pages and components.
${LOVABLE_STYLE_GUIDELINES}
CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
// pages/index.js - Main Next.js page
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  // Your Next.js page component here
  return (
    <>
      <Head>
        <title>Next.js App</title>
        <meta name="description" content="Generated with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {/* Complete Next.js application */}
      </main>
    </>
  );
}

// Export any needed static props or server-side props
export async function getStaticProps() {
  return {
    props: {}
  };
}
</HTML>

<CSS>
/* styles/globals.css - Global styles for Next.js */
/* Modern CSS with Next.js styling patterns */
</CSS>

<JAVASCRIPT>
// Additional components and utilities
// components/Header.js
export default function Header() {
  return <header>{/* Header content */}</header>;
}

// components/Footer.js  
export default function Footer() {
  return <footer>{/* Footer content */}</footer>;
}

// utils/helpers.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</JAVASCRIPT>

<NOTES>
• Next.js pages and components
• SSG/SSR capabilities
• Built-in routing
• Head component for SEO
• Modern React patterns
</NOTES>

REQUIREMENTS:
- Generate ACTUAL working Next.js code structure
- Use Next.js specific features (Head, Image, Link)
- Modern React with hooks
- SEO optimized
- Production-ready structure`;

    case 'svelte':
      return `You are an expert SvelteKit developer. Generate COMPLETE, FUNCTIONAL Svelte components.
${LOVABLE_STYLE_GUIDELINES}
CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
<!-- src/routes/+page.svelte - Main Svelte page -->
<script>
  // Your Svelte component logic here
  let count = 0;
  
  function increment() {
    count += 1;
  }
</script>

<main>
  <!-- Complete Svelte application -->
</main>

<style>
  /* Component-scoped styles */
</style>
</HTML>

<JAVASCRIPT>
// src/lib/components/Header.svelte
export let title = 'Welcome';
</JAVASCRIPT>

<CSS>
/* src/app.css - Global styles */
/* Modern CSS for Svelte application */
</CSS>

<NOTES>
• Svelte component syntax
• Reactive statements
• Scoped styling
• No virtual DOM
• Compiled approach
</NOTES>

REQUIREMENTS:
- Generate ACTUAL working Svelte code
- Use Svelte's reactive syntax
- Component-scoped styles
- Modern JavaScript
- Mobile responsive`;

    case 'angular':
      return `You are an expert Angular developer. Generate COMPLETE, FUNCTIONAL Angular components with TypeScript.
${LOVABLE_STYLE_GUIDELINES}
CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
<!-- src/app/app.component.html -->
<div class="app">
  <!-- Complete Angular application template -->
</div>
</HTML>

<JAVASCRIPT>
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-app';
  
  constructor() {}
  
  ngOnInit(): void {
    // Initialization logic
  }
  
  // Your component methods here
}

// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
</JAVASCRIPT>

<CSS>
/* src/app/app.component.css */
/* Component-specific styles */
</CSS>

<NOTES>
• Angular components with TypeScript
• Dependency injection
• RxJS integration
• Angular CLI structure
• Enterprise-ready patterns
</NOTES>

REQUIREMENTS:
- Generate ACTUAL working Angular code
- Use TypeScript
- Angular best practices
- Component-based architecture
- Modern Angular (v15+)`;

    default:
      return `You are an expert web developer specializing in beautiful, production-quality websites. Generate COMPLETE, FUNCTIONAL HTML, CSS, and JavaScript.
${LOVABLE_STYLE_GUIDELINES}
CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Title</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Full semantic HTML: nav, hero, sections, footer -->
</body>
</html>
</HTML>

<CSS>
/* All CSS here — custom properties, typography, layout, components, animations, responsive */
</CSS>

<JAVASCRIPT>
// All JavaScript: smooth scroll, mobile nav, IntersectionObserver animations, form validation, interactions
document.addEventListener('DOMContentLoaded', function() {
    // code here
});
</JAVASCRIPT>

<NOTES>
• Summary of features and design decisions
</NOTES>

REQUIREMENTS:
- Generate COMPLETE working HTML/CSS/JavaScript. Never truncate or add "continues below..."
- Include a real sticky navigation with mobile hamburger menu
- Include a compelling hero section with gradient or image background
- Include at least 3-4 content sections
- Include a footer with links and copyright
- Use placeholder images from picsum.photos
- All interactive elements must be functional
- Mobile-responsive at 768px and 480px breakpoints
- Smooth scroll + IntersectionObserver fade-in animations`;
  }
}

function parseFrameworkResponse(raw: string, techStack: string): { html: string; css: string; javascript: string; notes: string } {
  // Standard parsing for all frameworks
  const htmlMatch = raw.match(/<HTML>([\s\S]*?)<\/HTML>/i);
  const cssMatch = raw.match(/<CSS>([\s\S]*?)<\/CSS>/i);
  const jsMatch = raw.match(/<JAVASCRIPT>([\s\S]*?)<\/JAVASCRIPT>/i);
  const notesMatch = raw.match(/<NOTES>([\s\S]*?)(<\/NOTES>|$)/i);

  let html = htmlMatch ? htmlMatch[1].trim() : '';
  let css = cssMatch ? cssMatch[1].trim().replace(/^\/\*[\s\S]*?\*\/\s*/, '') : '';
  let javascript = jsMatch ? jsMatch[1].trim().replace(/^\/\/[\s\S]*?\n/, '') : '';
  const notes = notesMatch ? notesMatch[1].replace(/<NOTES>/i, '').trim() : `Website generated successfully with ${techStack}`;

  // Framework-specific adjustments
  switch (techStack) {
    case 'react':
      if (!html.includes('unpkg.com/react')) {
        // Ensure React CDN is included
        html = html.replace('<head>', `<head>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>`);
      }
      break;
      
    case 'vue':
      if (!html.includes('unpkg.com/vue')) {
        html = html.replace('<head>', `<head>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>`);
      }
      break;
      
    case 'nextjs':
      // For Next.js, the HTML section contains the page component
      // We'll return it as JavaScript for proper handling
      if (html.includes('export default')) {
        javascript = html;
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Next.js App</title>
</head>
<body>
    <div id="__next">
        <!-- Next.js app will render here -->
        <p>This is a Next.js application. The component code is in the JavaScript section.</p>
    </div>
</body>
</html>`;
      }
      break;
      
    case 'svelte':
      // Svelte components are returned as HTML but contain the full component
      if (html.includes('<script>') && html.includes('<style>')) {
        // Extract styles from Svelte component
        const svelteStyleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (svelteStyleMatch && !css) {
          css = svelteStyleMatch[1].trim();
        }
      }
      break;
      
    case 'angular':
      // Angular components returned as structured code
      if (html.includes('@Component')) {
        javascript = html + '\n\n' + javascript;
        html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angular App</title>
</head>
<body>
    <app-root>
        <!-- Angular app will render here -->
        <p>This is an Angular application. The component code is in the JavaScript section.</p>
    </app-root>
</body>
</html>`;
      }
      break;
  }

  return { html, css, javascript, notes };
}

function getFrameworkFallback(techStack: string): { html: string; css: string; javascript: string } {
  switch (techStack) {
    case 'react':
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        function App() {
          return (
            <div>
              <h1>React App</h1>
              <p>This is a React application.</p>
            </div>
          );
        }
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>`,
        css: `body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }`,
        javascript: ''
      };
      
    case 'vue':
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue App</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div id="app">
        <h1>{{ title }}</h1>
        <p>This is a Vue.js application.</p>
    </div>
    <script>
        const { createApp } = Vue;
        createApp({
          data() {
            return { title: 'Vue App' };
          }
        }).mount('#app');
    </script>
</body>
</html>`,
        css: `body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }`,
        javascript: ''
      };
      
    default:
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
</head>
<body>
    <header>
        <h1>Welcome to Your Website</h1>
    </header>
    <main>
        <section>
            <h2>About</h2>
            <p>This website was generated based on your requirements.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 Your Website. All rights reserved.</p>
    </footer>
</body>
</html>`,
        css: `body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4; }
header { background: #333; color: white; padding: 1rem; text-align: center; }
main { max-width: 1200px; margin: 2rem auto; }
section { background: white; padding: 2rem; margin: 1rem 0; border-radius: 8px; }
footer { text-align: center; padding: 1rem; background: #333; color: white; }`,
        javascript: `document.addEventListener('DOMContentLoaded', function() {
  console.log('Website loaded successfully');
});`
      };
  }
}

export async function generateWebsiteFromPrompt(userPrompt: string, techStack: string = 'vanilla'): Promise<GeneratedWebsite> {
  const systemPrompt = getSystemPrompt(techStack);
  
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate a complete, functional website based on: ${userPrompt}` }
  ];
  
  const resp = await callModel(messages, {
    temperature: 0.3,
    maxTokens: 8000,
    model: process.env.AI_GENERATION_MODEL || 'gpt-4o-mini'
  });
  
  const raw = resp.content;

  // Use framework-aware parsing
  const parsed = parseFrameworkResponse(raw, techStack);
  let { html, css, javascript, notes } = parsed;

  // Fallback parsing if structured format fails
  if (!html) {
    console.log('Structured parsing failed, trying fallback...');
    
    // Try to find HTML document
    const htmlFallback = raw.match(/<!DOCTYPE[\s\S]*?<\/html>/i);
    if (htmlFallback) {
      html = htmlFallback[0];
      
      // Extract styles from HTML if present
      const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
      if (styleMatch && !css) {
        css = styleMatch[1].trim();
      }

      // Extract scripts from HTML if present
      const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch && !javascript) {
        javascript = scriptMatch[1].trim();
      }
    } else {
      // Generate framework-specific fallback
      const fallback = getFrameworkFallback(techStack);
      html = fallback.html;
      if (!css) css = fallback.css;
      if (!javascript) javascript = fallback.javascript;
    }
  }

  // Add framework-appropriate defaults if content is missing
  if (!css || !javascript) {
    const fallback = getFrameworkFallback(techStack);
    if (!css) css = fallback.css;
    if (!javascript) javascript = fallback.javascript;
  }

  console.log('Generated website:', {
    htmlLength: html.length,
    cssLength: css.length,
    jsLength: javascript.length,
    model: resp.model
  });

  return { 
    html, 
    css, 
    javascript,
    notes, 
    model: resp.model 
  };
}
