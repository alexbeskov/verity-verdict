import type { OpenRouterModel } from './types';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

let cachedModels: OpenRouterModel[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function getFreeModels(apiKey: string): Promise<OpenRouterModel[]> {
  if (cachedModels && Date.now() - cacheTime < CACHE_TTL) {
    return cachedModels;
  }

  const res = await fetch(`${OPENROUTER_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`);

  const data = await res.json();
  const models: OpenRouterModel[] = (data.data || [])
    .filter((m: OpenRouterModel) => {
      const isFree =
        m.pricing &&
        (m.pricing.prompt === '0' || parseFloat(m.pricing.prompt) === 0) &&
        (m.pricing.completion === '0' || parseFloat(m.pricing.completion) === 0);
      const hasContext = m.context_length >= 8000;
      return isFree && hasContext && m.id.includes(':free');
    })
    .sort((a: OpenRouterModel, b: OpenRouterModel) => b.context_length - a.context_length)
    .slice(0, 6);

  cachedModels = models;
  cacheTime = Date.now();
  return models;
}

export async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://verity-app.vercel.app',
      'X-Title': 'Verity Due Diligence',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }),
    signal,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from model');
  return content;
}

export async function callWithFallback(
  apiKey: string,
  models: OpenRouterModel[],
  systemPrompt: string,
  userPrompt: string,
  onStep: (msg: string) => void
): Promise<{ content: string; model: string }> {
  const errors: string[] = [];

  for (const model of models) {
    try {
      onStep(`Запрашиваю модель ${model.name || model.id}...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      const content = await callOpenRouter(
        apiKey,
        model.id,
        systemPrompt,
        userPrompt,
        controller.signal
      );
      clearTimeout(timeout);
      return { content, model: model.id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${model.id}: ${msg}`);
      onStep(`Модель ${model.id} недоступна, пробую следующую...`);
    }
  }

  throw new Error(`All models failed:\n${errors.join('\n')}`);
}
