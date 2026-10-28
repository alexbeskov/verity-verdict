export function extractJSON(raw: string): string {
  let text = raw.trim();

  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  text = text.replace(/,\s*([}\]])/g, '$1');
  text = text.replace(/\/\/[^\n]*/g, '');
  text = text.replace(/[\x00-\x1F\x7F]/g, (ch) =>
    ch === '\n' || ch === '\r' || ch === '\t' ? ch : ''
  );

  return text;
}

export function parseAnalysisJSON(raw: string): unknown {
  const cleaned = extractJSON(raw);
  return JSON.parse(cleaned);
}
