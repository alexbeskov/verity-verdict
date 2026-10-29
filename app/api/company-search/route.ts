import { NextRequest, NextResponse } from 'next/server';

export interface CompanySuggestion {
  inn: string;
  name: string;
  fullName: string;
  region: string;
  status: 'ACTIVE' | 'LIQUIDATED' | 'REORGANIZING' | 'LIQUIDATING' | string;
  ogrn: string;
  address: string;
}

// Simple in-memory cache
const cache = new Map<string, { data: CompanySuggestion[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const apiKey = process.env.DADATA_API_KEY;
  if (!apiKey) {
    // Return empty when key not configured — graceful degradation
    return NextResponse.json([]);
  }

  try {
    const res = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({ query, count: 7, status: ['ACTIVE'] }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) throw new Error(`DaData ${res.status}`);

    const json = await res.json() as {
      suggestions: Array<{
        data: {
          inn: string;
          name: { full_with_opf: string; short_with_opf: string };
          state: { status: string };
          ogrn: string;
          address: { value: string };
        };
        value: string;
      }>;
    };

    const suggestions: CompanySuggestion[] = (json.suggestions ?? []).map((s) => {
      const region = s.data.address?.value?.split(',')[0]?.trim() ?? '';
      return {
        inn: s.data.inn,
        name: s.data.name?.short_with_opf ?? s.value,
        fullName: s.data.name?.full_with_opf ?? s.value,
        region,
        status: s.data.state?.status ?? 'UNKNOWN',
        ogrn: s.data.ogrn,
        address: s.data.address?.value ?? '',
      };
    });

    cache.set(cacheKey, { data: suggestions, ts: Date.now() });
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
