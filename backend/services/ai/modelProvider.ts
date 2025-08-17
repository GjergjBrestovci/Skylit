export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }
export interface ModelResponse { content: string; model: string; tokens?: number; }

const OPENROUTER_BASE = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

function getProviderBase() {
  if (process.env.OPENROUTER_API_KEY) return { base: OPENROUTER_BASE, key: process.env.OPENROUTER_API_KEY, provider: 'openrouter' } as const;
  if (process.env.OPENAI_API_KEY) return { base: OPENAI_BASE, key: process.env.OPENAI_API_KEY, provider: 'openai' } as const;
  if (process.env.AI_API_KEY) return { base: OPENROUTER_BASE, key: process.env.AI_API_KEY, provider: 'openrouter' } as const; // fallback
  return null;
}

export async function callModel(messages: ChatMessage[], opts?: { model?: string; temperature?: number; maxTokens?: number }): Promise<ModelResponse> {
  const provider = getProviderBase();
  if (!provider) {
    return { content: '[Mock AI] ' + messages.filter(m=>m.role==='user').map(m=>m.content).join('\n').slice(0,400), model: 'mock-local' };
  }
  const model = opts?.model || process.env.AI_MODEL || 'gpt-4o-mini';
  const temperature = opts?.temperature ?? 0.7;
  try {
    const resp = await fetch(provider.base + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
        ...(provider.provider === 'openrouter' ? { 'HTTP-Referer': process.env.SITE_URL || 'http://localhost:5000', 'X-Title': 'Skylit.ai'} : {})
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: opts?.maxTokens || 1200
      })
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error('Model API error: ' + text);
    }
    const data = await resp.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content || '[Empty response]';
    return { content, model, tokens: data.usage?.total_tokens };
  } catch (e: any) {
    console.error('AI call failed, falling back to mock.', e.message);
    return { content: '[Mock Fallback] ' + messages.filter(m=>m.role==='user').map(m=>m.content).join('\n').slice(0,400), model: 'mock-fallback' };
  }
}
