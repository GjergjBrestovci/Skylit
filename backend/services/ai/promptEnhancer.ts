/**
 * AI Prompt Enhancement Service (placeholder)
 */

export interface PromptEnhancerResult {
  enhanced: string;
  usedKey: boolean;
}

export function enhancePrompt(raw: string): Promise<PromptEnhancerResult> {
  const key = process.env.AI_API_KEY;
  const prefix = key ? '[Enhanced]' : '[Mock]';
  const enhanced = `${prefix} ${raw.trim()}`;
  return Promise.resolve({ enhanced, usedKey: !!key });
}

export default enhancePrompt;
