const POLZA_BASE = 'https://polza.ai/api/v1';

const MODEL_CHAIN = [
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash' },
  { id: 'deepseek/deepseek-v4.1-flash', name: 'DeepSeek V4.1 Flash' },
  { id: 'google/gemma-4-26b-a4b-it', name: 'Gemma 4 26B' },
];

export async function callPolza(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  signal?: AbortSignal
): Promise<string> {
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
  return content;
}

export async function callWithFallback(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  onStep: (msg: string) => void
): Promise<{ content: string; model: string }> {
  const errors: string[] = [];

  for (const model of MODEL_CHAIN) {
    try {
      onStep(`Запрашиваю модель ${model.name}...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      const content = await callPolza(
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
      onStep(`Модель ${model.name} недоступна, пробую следующую...`);
    }
  }

  throw new Error(`Все модели недоступны:\n${errors.join('\n')}`);
}
