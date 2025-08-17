/**
 * AI Prompt Enhancement Service
 * - Adds structure & clarity to user prompt before sending to model.
 */

export interface PromptEnhancerResult {
  enhanced: string;
  usedKey: boolean;
}

const BASE_INSTRUCTION = `Generate a modern, accessible, mobile-first website. Prefer semantic HTML5 tags. Avoid external image dependencies (use placeholders). Keep inline script minimal.`;

export function enhancePrompt(raw: string): Promise<PromptEnhancerResult> {
  const key = process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const header = key ? '[Structured]' : '[Mock]';
  const user = raw.trim();
  const enhanced = `${header} ${BASE_INSTRUCTION}\nUser Requirements:\n${user}`;
  return Promise.resolve({ enhanced, usedKey: !!key });
}

export default enhancePrompt;
