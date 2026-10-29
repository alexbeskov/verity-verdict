const POLZA_BASE = 'https://polza.ai/api/v1';

const MODEL_CHAIN = [
  { id: 'google/gemma-4-26b-a4b-it', name: 'Gemma 4 26B' },
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
  { id: 'deepseek/deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash' },
];

interface PolzaUsage {
  prompt_tokens: number;
  completion_tokens: number;
}

interface PolzaResult {
  content: string;
  usage: PolzaUsage;
}

export async function callPolza(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  signal?: AbortSignal
): Promise<PolzaResult> {
  const res = await fetch(`${POLZA_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
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
    throw new Error(`Polza.ai ${res.status}: ${errorBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from model');
  const usage: PolzaUsage = {
    prompt_tokens: data.usage?.prompt_tokens ?? 0,
    completion_tokens: data.usage?.completion_tokens ?? 0,
  };
  return { content, usage };
}

interface FallbackResult {
  content: string;
  model: string;
  usage: PolzaUsage;
}

export async function callWithFallback(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  onStep: (msg: string) => void
): Promise<FallbackResult> {
  const errors: string[] = [];
  const totalUsage: PolzaUsage = { prompt_tokens: 0, completion_tokens: 0 };

  for (const model of MODEL_CHAIN) {
    try {
      onStep(`Запрашиваю модель ${model.name}...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      const result = await callPolza(
        apiKey,
        model.id,
        systemPrompt,
        userPrompt,
        controller.signal
      );
      clearTimeout(timeout);
      totalUsage.prompt_tokens += result.usage.prompt_tokens;
      totalUsage.completion_tokens += result.usage.completion_tokens;
      return { content: result.content, model: model.id, usage: totalUsage };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${model.id}: ${msg}`);
      onStep(`Модель ${model.name} недоступна, пробую следующую...`);
    }
  }

  throw new Error(`Все модели недоступны:\n${errors.join('\n')}`);
}
