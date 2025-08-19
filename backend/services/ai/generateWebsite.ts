import { callModel, ChatMessage } from './modelProvider';

export interface GeneratedWebsite {
  html: string;
  css: string;
  javascript: string;
  notes: string;
  model: string;
}

const SYSTEM_PROMPT = `You are an expert web developer. Generate COMPLETE, FUNCTIONAL HTML, CSS, and JavaScript code for a website.

CRITICAL: You must ONLY return actual code, NOT explanations or briefs.

REQUIRED OUTPUT FORMAT (follow this exactly):
<HTML>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Title</title>
</head>
<body>
    <!-- Complete HTML structure with semantic elements -->
    <!-- Include all content, forms, buttons, navigation -->
    <!-- Use placeholder text and images -->
</body>
</html>
</HTML>

<CSS>
/* Complete CSS styling including:
 * - Responsive design with media queries
 * - Modern styling with animations
 * - Hover effects and transitions
 * - Mobile-first approach
 */
body {
    /* styles here */
}
/* ... all other CSS ... */
</CSS>

<JAVASCRIPT>
// Complete JavaScript functionality including:
// - Form validation and handling
// - Interactive UI elements
// - Smooth scrolling
// - Mobile menu toggle
// - Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // JavaScript code here
});
</JAVASCRIPT>

<NOTES>
• Interactive features implemented
• Responsive design included
• Accessibility considerations
• Browser compatibility notes
• Key functionality highlights
</NOTES>

REQUIREMENTS:
- Generate ACTUAL working HTML/CSS/JavaScript code, not documentation
- Make all interactive elements functional
- Include realistic content and placeholder images
- Ensure mobile responsiveness
- Use modern web standards
- Make the code production-ready`; 

export async function generateWebsiteFromPrompt(userPrompt: string): Promise<GeneratedWebsite> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Generate a complete, functional website with HTML, CSS, and JavaScript based on: ${userPrompt}` }
  ];
  
  const resp = await callModel(messages, { 
    temperature: 0.4, 
    maxTokens: 4000, // Increased for more complete code
    model: 'gpt-4o-mini'
  });
  
  const raw = resp.content;

  // Parse the structured response
  const htmlMatch = raw.match(/<HTML>([\s\S]*?)<\/HTML>/i);
  const cssMatch = raw.match(/<CSS>([\s\S]*?)<\/CSS>/i);
  const jsMatch = raw.match(/<JAVASCRIPT>([\s\S]*?)<\/JAVASCRIPT>/i);
  const notesMatch = raw.match(/<NOTES>([\s\S]*?)(<\/NOTES>|$)/i);

  // Extract and clean each section
  let html = htmlMatch ? htmlMatch[1].trim() : '';
  let css = cssMatch ? cssMatch[1].trim().replace(/^\/\*[\s\S]*?\*\/\s*/, '') : '';
  let javascript = jsMatch ? jsMatch[1].trim().replace(/^\/\/[\s\S]*?\n/, '') : '';
  const notes = notesMatch ? notesMatch[1].replace(/<NOTES>/i, '').trim() : 'Website generated successfully';

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
      // Generate basic HTML if none found
      html = `<!DOCTYPE html>
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
        <section>
            <h2>Contact</h2>
            <form id="contact-form">
                <input type="text" placeholder="Your Name" required>
                <input type="email" placeholder="Your Email" required>
                <textarea placeholder="Your Message" required></textarea>
                <button type="submit">Send Message</button>
            </form>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 Your Website. All rights reserved.</p>
    </footer>
</body>
</html>`;
    }
  }

  // Add basic CSS if none generated
  if (!css) {
    css = `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

header {
    background: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
}

section {
    margin: 2rem 0;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

input, textarea {
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

button {
    padding: 0.8rem 2rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background: #0056b3;
}

footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}

@media (max-width: 768px) {
    main {
        margin: 1rem auto;
    }
    
    section {
        margin: 1rem 0;
        padding: 1rem;
    }
}`;
  }

  // Add basic JavaScript if none generated
  if (!javascript) {
    javascript = `
document.addEventListener('DOMContentLoaded', function() {
    // Form handling
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            form.reset();
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});`;
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
