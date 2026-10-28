import { getDemoDocuments } from '@/lib/demo-data';
import { getFreeModels, callWithFallback } from '@/lib/openrouter';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts';
import { parseAnalysisJSON } from '@/lib/json-parser';
import { verifyFlags } from '@/lib/quote-verifier';
import type { AnalysisResult, DocumentInput } from '@/lib/types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const maxDuration = 300;

function sseEncode(event: string, data: unknown): string {
  const json = typeof data === 'string' ? data : JSON.stringify(data);
  return `event: ${event}\ndata: ${json}\n\n`;
}

function validateResult(parsed: Record<string, unknown>): AnalysisResult {
  const result: AnalysisResult = {
    score: Math.max(0, Math.min(100, Number(parsed.score) || 50)),
    subscores: {
      legal: Math.max(0, Math.min(100, Number((parsed.subscores as Record<string, unknown>)?.legal) || 50)),
      financial: Math.max(0, Math.min(100, Number((parsed.subscores as Record<string, unknown>)?.financial) || 50)),
      reputation: Math.max(0, Math.min(100, Number((parsed.subscores as Record<string, unknown>)?.reputation) || 50)),
      ownership: Math.max(0, Math.min(100, Number((parsed.subscores as Record<string, unknown>)?.ownership) || 50)),
    },
    verdict: ['go', 'conditional', 'no-go'].includes(parsed.verdict as string)
      ? (parsed.verdict as AnalysisResult['verdict'])
      : 'conditional',
    flags: Array.isArray(parsed.flags) ? parsed.flags.map((f: Record<string, unknown>, i: number) => ({
      id: String(f.id || `flag_${i + 1}`),
      severity: ['high', 'medium', 'low'].includes(f.severity as string) ? f.severity as 'high' | 'medium' | 'low' : 'medium',
      category: ['legal', 'financial', 'reputation', 'ownership'].includes(f.category as string)
        ? f.category as 'legal' | 'financial' | 'reputation' | 'ownership' : 'legal',
      title: String(f.title || ''),
      explanation: String(f.explanation || ''),
      source: {
        doc: String((f.source as Record<string, unknown>)?.doc || ''),
        quote: String((f.source as Record<string, unknown>)?.quote || ''),
      },
      quoteVerified: false,
    })) : [],
    contradictions: Array.isArray(parsed.contradictions) ? parsed.contradictions.map((c: Record<string, unknown>) => ({
      title: String(c.title || ''),
      explanation: String(c.explanation || ''),
      sources: Array.isArray(c.sources) ? c.sources.map((s: Record<string, unknown>) => ({
        doc: String(s.doc || ''),
        quote: String(s.quote || ''),
      })) : [],
    })) : [],
    questions: Array.isArray(parsed.questions) ? parsed.questions.map(String) : [],
    summary: String(parsed.summary || ''),
  };
  return result;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseEncode(event, data)));
      };
      const step = (msg: string) => send('step', msg);

      try {
        const body = await request.json();

        if (body.useCached) {
          step('Загружаю записанный результат...');
          await new Promise(r => setTimeout(r, 500));

          const steps = [
            'Читаю пакет документов...',
            'Анализирую сведения о компании...',
            'Сверяю устав и договор...',
            'Проверяю динамику выручки и налоги...',
            'Ищу аффилированные связи...',
            'Проверяю цитаты в источниках...',
            'Формирую отчёт...',
          ];
          for (const s of steps) {
            step(s);
            await new Promise(r => setTimeout(r, 800));
          }

          const cached = readFileSync(join(process.cwd(), 'data', 'cached-result.json'), 'utf-8');
          send('result', JSON.parse(cached));
          controller.close();
          return;
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          send('error', 'OPENROUTER_API_KEY не настроен');
          controller.close();
          return;
        }

        step('Читаю пакет документов...');

        let documents: DocumentInput[];
        if (body.documents && Array.isArray(body.documents) && body.documents.length > 0) {
          documents = body.documents;
        } else {
          documents = getDemoDocuments();
        }

        step('Получаю список доступных ИИ-моделей...');
        const models = await getFreeModels(apiKey);

        if (models.length === 0) {
          send('error', 'Не найдено доступных бесплатных моделей');
          controller.close();
          return;
        }

        step(`Найдено ${models.length} моделей. Начинаю анализ...`);

        const userPrompt = buildUserPrompt(documents);

        step('Анализирую сведения о компании и структуру собственности...');

        const { content: rawContent } = await callWithFallback(
          apiKey, models, SYSTEM_PROMPT, userPrompt, step
        );

        step('Разбираю результат анализа...');

        let parsed: Record<string, unknown>;
        try {
          parsed = parseAnalysisJSON(rawContent) as Record<string, unknown>;
        } catch {
          step('Формат ответа некорректен, запрашиваю исправление...');
          const retryPrompt = `Твой предыдущий ответ не является валидным JSON. Верни результат анализа СТРОГО в формате JSON без markdown-обёрток. Вот твой предыдущий ответ для исправления:\n\n${rawContent.slice(0, 2000)}`;

          const { content: retryContent } = await callWithFallback(
            apiKey, models, SYSTEM_PROMPT, retryPrompt, step
          );
          parsed = parseAnalysisJSON(retryContent) as Record<string, unknown>;
        }

        step('Проверяю цитаты в источниках...');

        let result = validateResult(parsed);
        result.flags = verifyFlags(result.flags, documents);

        step('Формирую итоговый отчёт...');
        await new Promise(r => setTimeout(r, 300));

        send('result', result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
        send('error', msg);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
