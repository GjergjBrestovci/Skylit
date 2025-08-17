import { callModel, ChatMessage } from './modelProvider';

export interface GeneratedWebsite {
  html: string;
  css: string;
  notes: string;
  model: string;
}

const SYSTEM_PROMPT = `You are an AI that generates concise production-ready single-file website HTML & CSS.
Return:
<OUTPUT>
<!DOCTYPE html>
<html>...</html>
<CSS>
/* Tailwind-compatible utility suggestions or embedded styles if essential */
</CSS>
<NOTES>
Short bullet notes (max 5) about next enhancement steps.
</NOTES>
`; 

export async function generateWebsiteFromPrompt(userPrompt: string): Promise<GeneratedWebsite> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ];
  const resp = await callModel(messages, { temperature: 0.4, maxTokens: 1600 });
  const raw = resp.content;

  // Naive parsing of sections
  const htmlMatch = raw.match(/<!DOCTYPE[\s\S]*?<\/html>/i);
  const cssMatch = raw.match(/<CSS>[\s\S]*?<\/CSS>/i);
  const notesMatch = raw.match(/<NOTES>[\s\S]*?$/i);

  const html = htmlMatch ? htmlMatch[0] : raw;
  const css = cssMatch ? cssMatch[0].replace(/<CSS>|<\/CSS>/g,'').trim() : '';
  const notes = notesMatch ? notesMatch[0].replace(/<NOTES>/i,'').trim() : '';

  return { html, css, notes, model: resp.model };
}
