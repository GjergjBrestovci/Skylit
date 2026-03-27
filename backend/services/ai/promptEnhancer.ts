/**
 * AI Prompt Enhancement Service
 * - Analyzes user selections and creates professional development briefs
 * - Generates detailed technical specifications for code generation
 */

import { callModel, ChatMessage } from './modelProvider';

export interface PromptEnhancerResult {
  enhanced: string;
  analysis: string;
  requirements: string[];
  usedKey: boolean;
}

const PROMPT_ENHANCEMENT_SYSTEM = `You are a world-class web designer and UX strategist. Transform website requests into precise, actionable technical briefs that produce visually stunning, production-quality websites.

DESIGN PHILOSOPHY:
- Modern, minimal, and intentional — every element earns its place
- Generous whitespace with a clear 8px spacing rhythm
- Bold typographic hierarchy using Google Fonts pairings
- Cohesive color palette defined as CSS custom properties
- Micro-interactions: hover lifts, fade-ins, smooth transitions (never excessive)
- Mobile-first responsive with smooth reflow at 768px and 480px
- Accessibility baked in: ARIA labels, keyboard navigation, sufficient contrast

MANDATORY INCLUSIONS IN EVERY ENHANCED PROMPT:
1. Two specific Google Fonts (heading + body) with the exact CDN link format
2. A complete 6-color palette with exact hex codes as CSS custom properties
3. Specific section structure with semantic HTML element names
4. Exact font sizes using clamp() for responsive scaling
5. Specific placeholder image URLs using https://picsum.photos/{w}/{h}?random={n}
6. IntersectionObserver scroll animations on content sections
7. Sticky navigation with mobile hamburger menu
8. At least one interactive feature (form, tabs, accordion, modal, filter)
9. A footer with nav links and copyright

OUTPUT FORMAT — respond with ONLY these three XML tags, nothing else:

<ANALYSIS>
[2-3 sentences: website purpose, target user, primary conversion action]
</ANALYSIS>

<REQUIREMENTS>
Sections: [bullet list of exact sections in order]
Colors: --color-primary: #hex; --color-accent: #hex; --color-bg: #hex; --color-surface: #hex; --color-text: #hex; --color-text-muted: #hex
Fonts: Heading "[Name]", Body "[Name]" — include Google Fonts CDN link
Hero: [description with exact headline and subheadline copy]
Interactivity: [specific JS features needed]
Images: [which sections use picsum.photos URLs and at what sizes]
</REQUIREMENTS>

<ENHANCED_PROMPT>
Create a complete, production-ready single-page HTML website:

**Google Fonts (include in <head>):**
<link href="https://fonts.googleapis.com/css2?family=[HeadingFont]:[weights]&family=[BodyFont]:[weights]&display=swap" rel="stylesheet">

**CSS Custom Properties (define at top of <style>):**
:root {
  --color-primary: #[hex];
  --color-primary-light: #[hex];
  --color-accent: #[hex];
  --color-bg: #[hex];
  --color-surface: #[hex];
  --color-text: #[hex];
  --color-text-muted: #[hex];
  --font-display: '[HeadingFont]', sans-serif;
  --font-body: '[BodyFont]', sans-serif;
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.08);
}

**Sections (in order):**
[detailed section list with semantic element names and content]

**Typography:**
- h1: clamp(2.5rem, 5vw, 4.5rem), font-weight: 800, var(--font-display)
- h2: clamp(1.75rem, 3vw, 2.5rem), font-weight: 700, var(--font-display)
- Body: 1rem/1.625, var(--font-body)

**Interactive Features:**
[specific JS functionality with implementation details]

**Responsive Behavior:**
- Mobile (<768px): [layout changes]
- Desktop (≥768px): [layout changes]

**Placeholder Images:** Use https://picsum.photos/{width}/{height}?random={n} for all images

Generate COMPLETE HTML with inline <style> and <script>. No truncation. No TODO comments. Fully functional.
</ENHANCED_PROMPT>`;

export async function enhancePrompt(userInput: string): Promise<PromptEnhancerResult> {
  const hasApiKey = !!(process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
  
  if (!hasApiKey) {
    const basicEnhanced = `Create a production-ready, visually stunning single-page HTML website: ${userInput}

Include in <head>:
- Google Fonts: Plus Jakarta Sans (700,800) + Inter (400,500,600) from fonts.googleapis.com
- Meta charset, viewport, and a descriptive title

CSS requirements:
- Define CSS custom properties: --color-primary, --color-accent, --color-bg, --color-surface, --color-text, --color-text-muted, --font-display, --font-body, --radius-sm/md/lg, --shadow-sm/md
- Choose a cohesive professional color palette with exact hex codes
- 8px spacing system; section padding 80px desktop / 48px mobile
- Sticky navigation with logo + links + CTA button; mobile hamburger menu
- Hero: min-height 90vh, compelling headline with clamp() sizing, subheadline, two CTAs
- At least 3-4 content sections with CSS Grid/Flexbox layouts
- Cards: 24px padding, border-radius var(--radius-lg), var(--shadow-sm)
- Buttons: min-height 44px, border-radius var(--radius-md), hover transition 150ms
- Footer with links and copyright

JavaScript:
- Mobile menu toggle
- Smooth scroll on nav links
- IntersectionObserver for scroll fade-in animations (opacity 0→1, translateY 24px→0)
- Form validation if a form is present

Placeholder images: https://picsum.photos/{width}/{height}?random={n}
Generate complete, functional HTML. No truncation. No TODO comments.`;

    return {
      enhanced: basicEnhanced,
      analysis: 'Basic requirements (no API key)',
      requirements: ['Single HTML file', 'Responsive design', 'Form validation', 'Accessibility'],
      usedKey: false
    };
  }

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: PROMPT_ENHANCEMENT_SYSTEM },
      { role: 'user', content: userInput }
    ];

    const response = await callModel(messages, {
      temperature: 0.4,
      maxTokens: 2500,
      model: process.env.AI_ENHANCEMENT_MODEL || 'gpt-4o-mini'
    });

    const analysisMatch = response.content.match(/<ANALYSIS>([\s\S]*?)<\/ANALYSIS>/);
    const requirementsMatch = response.content.match(/<REQUIREMENTS>([\s\S]*?)<\/REQUIREMENTS>/);
    const enhancedMatch = response.content.match(/<ENHANCED_PROMPT>([\s\S]*?)<\/ENHANCED_PROMPT>/);

    const analysis = analysisMatch?.[1].trim() || 'Requirements analysis';
    const requirementsText = requirementsMatch?.[1].trim() || '';
    const enhanced = enhancedMatch?.[1].trim() || userInput;

    const requirements = requirementsText
      .split('\n')
      .map(line => line.replace(/^[-•]\s*/, '').trim())
      .filter(line => line.length > 10);

    return { enhanced, analysis, requirements, usedKey: true };
  } catch (error) {
    console.error('Enhancement failed:', error);
    
    const fallbackEnhanced = `Create a single-page HTML website: ${userInput}. Include inline CSS and JavaScript, responsive design (768px/1024px breakpoints), form validation, and accessibility features. Use 8px spacing system and 12px border radius.`;
    
    return {
      enhanced: fallbackEnhanced,
      analysis: 'Fallback (API error)',
      requirements: ['Single HTML file', 'Responsive', 'Validated forms'],
      usedKey: false
    };
  }
}

export default enhancePrompt;