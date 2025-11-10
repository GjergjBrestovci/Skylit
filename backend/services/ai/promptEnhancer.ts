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

const PROMPT_ENHANCEMENT_SYSTEM = `You are a web development requirements analyst. Transform user website requests into clear, code-focused development specifications.

Your job: Take user inputs and create a detailed brief that will help generate ACTUAL HTML, CSS, and JavaScript code.

Focus on:
1. Specific visual design requirements (colors, fonts, layout)
2. Exact functionality needed (forms, buttons, animations)
3. Technical implementation details
4. Content structure and sections
5. Interactive elements and behaviors
6. Clean code
7. Modern styling
8. Functional javascript


Output format:
<ANALYSIS>
Brief analysis of user needs and target audience (2-3 sentences)
</ANALYSIS>

<REQUIREMENTS>
- Visual design specifications (colors, typography, layout)
- Functional requirements (what should work)
- Content sections needed
- Interactive elements required
- Technical considerations
</REQUIREMENTS>

<ENHANCED_PROMPT>
Create a fully functional website with the following specifications:
[Detailed, technical prompt that will result in actual HTML/CSS/JavaScript code being generated, not documentation]

Include specific details about:
- Page structure and sections
- Color schemes and styling
- Interactive functionality
- Forms and user interactions
- Responsive design requirements
- Content to include

- also very important is that you write clean and functional code, make sure you pay extra attention to the functionality and styling, 
  make sure you use, appropriate animations and clean and modern
- extra to styling, use a bubble effect to individual corners, never use straight blocks except it is mentioned in the prompt.


IMPORTANT: This prompt should result in ACTUAL CODE being generated, not explanations or documentation.
</ENHANCED_PROMPT>`;

export async function enhancePrompt(userInput: string): Promise<PromptEnhancerResult> {
  const hasApiKey = !!(process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
  
  if (!hasApiKey) {
    // Fallback enhancement without API call
    const basicEnhanced = `Create a professional, fully functional website with the following requirements: ${userInput}. 

Include:
- Responsive HTML5 structure with semantic elements
- Modern CSS styling with animations and hover effects  
- Interactive JavaScript functionality for buttons, forms, and user interactions
- Mobile-first responsive design
- Accessible design patterns
- Clean, professional visual hierarchy
- Working contact forms and interactive elements where applicable`;

    return {
      enhanced: basicEnhanced,
      analysis: 'Basic requirements analysis (offline mode)',
      requirements: ['Responsive design', 'Modern styling', 'Interactive JavaScript', 'Mobile optimization'],
      usedKey: false
    };
  }

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: PROMPT_ENHANCEMENT_SYSTEM },
      { role: 'user', content: `Transform this website request into professional development requirements: ${userInput}` }
    ];

    const response = await callModel(messages, { 
      temperature: 0.3, 
      maxTokens: 1000,
      model: 'gpt-4o-mini' 
    });

    // Parse the structured response
    const analysisMatch = response.content.match(/<ANALYSIS>([\s\S]*?)<\/ANALYSIS>/);
    const requirementsMatch = response.content.match(/<REQUIREMENTS>([\s\S]*?)<\/REQUIREMENTS>/);
    const enhancedMatch = response.content.match(/<ENHANCED_PROMPT>([\s\S]*?)<\/ENHANCED_PROMPT>/);

    const analysis = analysisMatch ? analysisMatch[1].trim() : 'User needs analysis';
    const requirementsText = requirementsMatch ? requirementsMatch[1].trim() : '';
    const enhanced = enhancedMatch ? enhancedMatch[1].trim() : userInput;

    // Extract requirements into array
    const requirements = requirementsText
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(line => line.length > 0);

    return {
      enhanced,
      analysis,
      requirements,
      usedKey: true
    };
  } catch (error) {
    console.error('Prompt enhancement failed:', error);
    // Fallback to basic enhancement
    const fallbackEnhanced = `Create a professional, fully functional website: ${userInput}. Include interactive JavaScript functionality, responsive design, and modern styling.`;
    
    return {
      enhanced: fallbackEnhanced,
      analysis: 'Fallback analysis due to API error',
      requirements: ['Responsive design', 'Modern styling', 'Interactive functionality'],
      usedKey: false
    };
  }
}

export default enhancePrompt;
