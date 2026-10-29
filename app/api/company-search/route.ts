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

const DEMO_COMPANIES: CompanySuggestion[] = [
  { inn: '7736050003', name: 'ПАО «Газпром»', fullName: 'Публичное акционерное общество «Газпром»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027700070518', address: 'г. Москва, ул. Наметкина, д. 16' },
  { inn: '0278175040', name: 'ПАО «Газпром нефть»', fullName: 'Публичное акционерное общество «Газпром нефть»', region: 'г. Санкт-Петербург', status: 'ACTIVE', ogrn: '1025501701686', address: 'г. Санкт-Петербург, Галерная ул., д. 5' },
  { inn: '7708004935', name: 'ПАО «Сбербанк»', fullName: 'Публичное акционерное общество «Сбербанк России»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027700132195', address: 'г. Москва, ул. Вавилова, д. 19' },
  { inn: '7702070139', name: 'ПАО «Лукойл»', fullName: 'Публичное акционерное общество «Нефтяная компания «Лукойл»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027700035769', address: 'г. Москва, Сретенский б-р, д. 11' },
  { inn: '7709505477', name: 'ПАО «Роснефть»', fullName: 'Публичное акционерное общество «Нефтяная компания «Роснефть»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027700043502', address: 'г. Москва, Sofiyskaya Naberezhnaya 26/1' },
  { inn: '7743010905', name: 'ПАО «ВТБ»', fullName: 'Банк ВТБ (публичное акционерное общество)', region: 'г. Санкт-Петербург', status: 'ACTIVE', ogrn: '1027739609391', address: 'г. Санкт-Петербург, Дегтярный пер., д. 11' },
  { inn: '7710140679', name: 'ПАО «МТС»', fullName: 'Публичное акционерное общество «Мобильные ТелеСистемы»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027700149124', address: 'г. Москва, ул. Марксистская, д. 4' },
  { inn: '7736227700', name: 'ПАО «Норильский никель»', fullName: 'Публичное акционерное общество «Горно-металлургическая компания «Норильский никель»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1020400001671', address: 'г. Москва, ул. Дубининская, д. 53, стр. 6' },
  { inn: '7728168971', name: 'ПАО «Яндекс»', fullName: 'Публичное акционерное общество «Яндекс»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027739850962', address: 'г. Москва, ул. Льва Толстого, д. 16' },
  { inn: '7713114642', name: 'ПАО «Магнит»', fullName: 'Публичное акционерное общество «Магнит»', region: 'г. Краснодар', status: 'ACTIVE', ogrn: '1032304945947', address: 'г. Краснодар, ул. Солнечная, д. 15/5' },
  { inn: '7825706086', name: 'ПАО «Ростелеком»', fullName: 'Публичное акционерное общество «Ростелеком»', region: 'г. Санкт-Петербург', status: 'ACTIVE', ogrn: '1027700198767', address: 'г. Санкт-Петербург, ул. Достоевского, д. 15' },
  { inn: '7703355940', name: 'ПАО «Татнефть»', fullName: 'Публичное акционерное общество «Татнефть» им. В.Д. Шашина', region: 'Республика Татарстан', status: 'ACTIVE', ogrn: '1021601623702', address: 'Республика Татарстан, г. Альметьевск, ул. Ленина, д. 75' },
  { inn: '7707083893', name: 'ПАО «X5 Group»', fullName: 'Публичное акционерное общество «Корпоративный центр ИКС 5»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1027700574956', address: 'г. Москва, ул. Дмитровское шоссе, д. 9' },
  { inn: '7731414530', name: 'ПАО «Северсталь»', fullName: 'Публичное акционерное общество «Северсталь»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1023500745777', address: 'г. Москва, ул. Мосфильмовская, д. 42' },
  { inn: '7708503727', name: 'ПАО «Полюс»', fullName: 'Публичное акционерное общество «Полюс»', region: 'г. Москва', status: 'ACTIVE', ogrn: '1037739007830', address: 'г. Москва, Покровка ул., д. 47' },
];

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
    // Fallback: filter static demo list for the demo to work without a key
    const filtered = DEMO_COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(cacheKey) ||
        c.fullName.toLowerCase().includes(cacheKey) ||
        c.inn.includes(cacheKey)
    ).slice(0, 7);
    return NextResponse.json(filtered);
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
