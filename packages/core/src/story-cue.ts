const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'always', 'because', 'before', 'being', 'between', 'could', 'didnt', 'doesnt', 'doing',
  'during', 'every', 'first', 'from', 'have', 'having', 'into', 'just', 'later', 'more', 'most', 'much', 'never', 'other', 'really',
  'should', 'something', 'still', 'their', 'there', 'these', 'thing', 'things', 'think', 'this', 'those', 'through', 'today', 'very',
  'want', 'wanted', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'youre', 'were', 'they', 'them', 'then',
  'than', 'that', 'some', 'such', 'only', 'once', 'over', 'under', 'back', 'make', 'made', 'like', 'good', 'great', 'remember',
  'forgot', 'forget', 'remembered', 'said', 'told', 'went', 'came', 'got', 'getting', 'felt', 'feeling', 'happened',
]);

export function plainMemoryText(body: string): string {
  return body
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target: string, label: string | undefined) => (label || target).replace(/\.md$/i, ''))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split('\n')
    .map((line) => line
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*>\s?/, '')
      .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .replace(/^\s*\d+[.)]\s+/, '')
      .replace(/[*_~`]/g, '')
      .trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function memoryTitle(body: string): string {
  const clean = plainMemoryText(body);
  const firstLine = clean.split('\n').find((line) => line.trim())?.trim() || 'Untitled memory';
  return firstLine.length <= 72 ? firstLine : `${firstLine.slice(0, 69).trimEnd()}…`;
}

function normalizedWord(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}-]/gu, '');
}

function meaningfulWords(body: string) {
  const clean = plainMemoryText(body);
  const matches = clean.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || [];
  const seen = new Set<string>();

  return matches.flatMap((word, index) => {
    const normalized = normalizedWord(word);
    if (!normalized || normalized.length < 3 || STOP_WORDS.has(normalized) || seen.has(normalized)) return [];
    seen.add(normalized);
    const startsUppercase = /^\p{Lu}/u.test(word) && index > 0;
    const containsNumber = /\d/.test(word);
    const score = (startsUppercase ? 7 : 0) + (containsNumber ? 3 : 0) + Math.min(normalized.length, 10) / 2;
    return [{ word: word.replace(/[.,;:!?]+$/g, ''), score, index }];
  });
}

/**
 * Builds a short deterministic retrieval clue from the user's own words.
 * It never generates facts and intentionally reveals only a few handles.
 */
export function storyCue(body: string): string {
  const words = meaningfulWords(body);
  if (words.length === 0) return 'A memory worth bringing back';

  const cleanWordCount = plainMemoryText(body).split(/\s+/).filter(Boolean).length;
  const cueCount = words.length <= 4 ? 1 : cleanWordCount >= 18 ? 3 : 2;
  const ranked = [...words]
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, cueCount)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.word);

  return ranked.length === 1 ? `${ranked[0]} · What comes back?` : ranked.join(' · ');
}
