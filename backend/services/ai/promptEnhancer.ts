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

const PROMPT_ENHANCEMENT_SYSTEM = `You are a web development specification writer. Transform vague website requests into precise, actionable briefs that produce production-ready single-page HTML files.

TECHNICAL CONSTRAINTS:
- Output must be a SINGLE HTML file with inline CSS and JavaScript
- Use vanilla JavaScript only (no frameworks)
- Maximum file size: 500KB
- Must work offline (no external dependencies except CDN fonts/icons)
- Mobile-first responsive design (breakpoints: 768px, 1024px)

DESIGN REQUIREMENTS:
- Use CSS Grid or Flexbox for layouts (no floats)
- Include CSS transitions (duration: 0.3s) on interactive elements
- Color palette: Primary + 2-3 complementary colors (specify hex codes)
- Typography: Max 2 font families, clear hierarchy (h1-h6)
- Spacing: 8px base unit (8, 16, 24, 32, 48, 64px)
- Border radius: 8-12px for subtle rounding (no hard corners unless explicitly requested)

FUNCTIONALITY REQUIREMENTS:
- All forms must validate before submission
- Buttons must have hover, active, and focus states
- Images must have lazy loading and alt text
- Include smooth scroll behavior
- Add loading states for async operations
- Implement basic accessibility (ARIA labels, keyboard navigation)

OUTPUT FORMAT:
<ANALYSIS>
[2-3 sentences: What is this website for? Who is the target user? What's the primary action?]
</ANALYSIS>

<REQUIREMENTS>
Layout & Structure:
- [Specific sections: hero, features, pricing, contact, etc.]
- [Navigation type: fixed header, hamburger menu, etc.]

Visual Design:
- Primary color: [hex]
- Secondary color: [hex]
- Accent color: [hex]
- Typography: [font names and sizes]
- Spacing system: [specific px values]

Functionality:
- [Exact interactive features: contact form with name/email/message fields]
- [Specific animations: fade-in on scroll, button hover effects]
- [Form validation rules]

Content:
- [Actual placeholder text/sections needed]
</REQUIREMENTS>

<ENHANCED_PROMPT>
Create a single-page HTML website with inline CSS and JavaScript:

**Structure:**
[Detailed section breakdown with HTML semantic elements]

**Styling:**
- Primary: #[hex] | Secondary: #[hex] | Accent: #[hex]
- Font: [specific font] from Google Fonts
- Layout: CSS Grid with [specific column structure]
- Spacing: [8px base unit system]
- Border radius: 12px on cards, 8px on buttons
- Transitions: 0.3s ease on all interactive elements

**Functionality:**
[Specific JavaScript features with exact behavior descriptions]

**Responsive Behavior:**
- Mobile (< 768px): [specific layout changes]
- Tablet (768-1024px): [specific layout changes]
- Desktop (> 1024px): [specific layout changes]

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators on all focusable elements
- Alt text on all images

Generate complete, production-ready HTML with inline styles and scripts. No placeholders, no TODO comments.
</ENHANCED_PROMPT>

EXAMPLE INPUT: "landing page for a coffee shop"

EXAMPLE OUTPUT:
<ANALYSIS>
A local coffee shop needs a conversion-focused landing page to attract new customers and showcase their offerings. Target users are coffee enthusiasts aged 25-45 looking for artisanal coffee experiences. Primary action: encourage walk-in visits and online orders.
</ANALYSIS>

<REQUIREMENTS>
Layout & Structure:
- Fixed navigation with logo and "Order Now" CTA
- Hero section with background image and tagline
- Menu showcase grid (3 columns desktop, 1 column mobile)
- Location/hours section with embedded map
- Contact form with name, email, phone, message fields

Visual Design:
- Primary: #4A3F35 (rich coffee brown)
- Secondary: #D4A574 (warm cream)
- Accent: #E8B86D (golden highlight)
- Typography: 'Playfair Display' for headings, 'Inter' for body
- Spacing: 8px base (16px mobile margins, 32px section padding, 64px desktop margins)

Functionality:
- Smooth scroll to sections on nav click
- Menu items hover scale effect (transform: scale(1.05))
- Contact form with email validation (regex) and required field checks
- "Order Now" button opens modal with order form
- Fade-in animation on scroll for menu items

Content:
- Hero: "Artisanal Coffee, Crafted Daily" + "Order Now" button
- Menu: 6 coffee items with name, description, price
- About: 2-3 sentences about the shop's story
- Location: Address, phone, hours, Google Maps embed
- Contact form: Name, email, phone, message
</REQUIREMENTS>

<ENHANCED_PROMPT>
Create a single-page HTML website with inline CSS and JavaScript for an artisanal coffee shop landing page:

**Structure:**
- <header> with fixed position, logo (text), nav menu (Home, Menu, Location, Contact), "Order Now" CTA button
- <section id="hero"> with full-viewport height, background image (coffee beans), centered h1 "Artisanal Coffee, Crafted Daily", subtitle, CTA button
- <section id="menu"> with h2 "Our Menu", CSS Grid (3 columns desktop, 2 tablet, 1 mobile), 6 coffee cards (image, name, description, price)
- <section id="location"> with h2 "Visit Us", two-column layout (address/hours + map placeholder)
- <section id="contact"> with h2 "Get In Touch", form (name, email, phone, message), submit button
- <footer> with copyright and social media icons

**Styling:**
- Primary: #4A3F35 | Secondary: #D4A574 | Accent: #E8B86D
- Fonts: 'Playfair Display' (headings), 'Inter' (body) from Google Fonts
- Layout: CSS Grid for menu, Flexbox for header/sections
- Spacing: 16px mobile padding, 32px section padding, 64px desktop margins, 8px gaps
- Border radius: 12px on menu cards, 8px on buttons, 16px on contact form
- Transitions: 0.3s ease on buttons/cards
- Box shadows: 0 4px 6px rgba(0,0,0,0.1) on cards
- Mobile breakpoint: 768px, tablet: 1024px

**Functionality:**
JavaScript:
- Smooth scroll: addEventListener on nav links, scrollIntoView({behavior: 'smooth'})
- Form validation: Check all fields filled, validate email with /^[^\s@]+@[^\s@]+\.[^\s@]+$/, display error messages
- Menu card hover: Add scale(1.05) transform with cursor pointer
- Scroll animation: IntersectionObserver on menu cards, add 'fade-in' class (opacity 0→1, translateY 20px→0)
- Modal: "Order Now" button opens fixed overlay modal with close button
- Loading state: Submit button shows "Sending..." and disables during form submission

**Responsive Behavior:**
- Mobile (< 768px): Hamburger menu, hero text 32px, menu 1 column, stack location content
- Tablet (768-1024px): Nav inline, hero text 48px, menu 2 columns
- Desktop (> 1024px): Full nav, hero text 64px, menu 3 columns, side-by-side location layout

**Accessibility:**
- aria-label on nav links, buttons, form inputs
- role="navigation" on <nav>
- Focus visible: 2px solid accent color outline
- Alt text: "Coffee shop hero image", "Espresso drink", etc.
- Tab order: header→hero CTA→menu→contact form
- Form errors: aria-live="polite" region for validation messages

Generate complete HTML with inline <style> and <script> tags. Include realistic placeholder content (coffee names: "Espresso", "Cappuccino", "Latte", etc.). No external files, no TODO comments, fully functional code.
</ENHANCED_PROMPT>`;

export async function enhancePrompt(userInput: string): Promise<PromptEnhancerResult> {
  const hasApiKey = !!(process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
  
  if (!hasApiKey) {
    const basicEnhanced = `Create a production-ready single-page HTML website: ${userInput}

Technical specs:
- Single HTML file with inline CSS (<style>) and JavaScript (<script>)
- Vanilla JavaScript only, no frameworks
- Mobile-first responsive (breakpoints: 768px, 1024px)
- CSS Grid/Flexbox layouts
- 8px spacing system (16, 24, 32, 48, 64px increments)
- Border radius: 8-12px for modern feel
- Color palette: Define primary, secondary, accent colors with hex codes
- Typography: Max 2 font families from Google Fonts
- Transitions: 0.3s ease on interactive elements
- Form validation with regex
- ARIA labels and keyboard navigation
- Smooth scroll behavior
- Loading states for async operations

Generate complete, functional code. No placeholders or TODOs.`;

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
      maxTokens: 1500,
      model: 'gpt-4o-mini' 
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