import type { DocumentInput, Flag, Contradiction } from './types';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[«»""„]/g, '"')
    .replace(/[—–‐]/g, '-')
    .replace(/ /g, ' ')
    .trim();
}

function fuzzyContains(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);

  if (h.includes(n)) return true;

  if (n.length < 10) return false;

  const words = n.split(' ').filter(w => w.length > 3);
  if (words.length === 0) return false;
  const matchedWords = words.filter(w => h.includes(w));
  return matchedWords.length / words.length >= 0.7;
}

function findDocument(docs: DocumentInput[], docName: string): DocumentInput | undefined {
  const name = normalize(docName);
  return docs.find(d => {
    const dn = normalize(d.name);
    return dn.includes(name) || name.includes(dn) ||
      dn.replace(/\.[^.]+$/, '').split(/[-_\s]/).some(part =>
        part.length > 3 && name.includes(part)
      );
  });
}

export function verifyFlags(flags: Flag[], documents: DocumentInput[]): Flag[] {
  return flags.map(flag => {
    const doc = findDocument(documents, flag.source.doc);
    if (!doc) return { ...flag, quoteVerified: false };
    return {
      ...flag,
      quoteVerified: fuzzyContains(doc.content, flag.source.quote),
    };
  });
}

export function verifyContradictions(
  contradictions: Contradiction[],
  documents: DocumentInput[]
): Contradiction[] {
  return contradictions.map(c => ({
    ...c,
    sources: c.sources.map(s => {
      const doc = findDocument(documents, s.doc);
      return {
        ...s,
        verified: doc ? fuzzyContains(doc.content, s.quote) : false,
      };
    }),
  }));
}
