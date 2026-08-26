const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'always', 'because', 'before', 'being', 'between', 'could', 'didnt', 'doesnt', 'doing',
  'during', 'every', 'first', 'from', 'have', 'having', 'into', 'just', 'later', 'more', 'most', 'much', 'never', 'other', 'really',
  'should', 'something', 'still', 'their', 'there', 'these', 'thing', 'things', 'think', 'this', 'those', 'through', 'today', 'very',
  'want', 'wanted', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'youre', 'were', 'they', 'them', 'then',
  'than', 'that', 'some', 'such', 'only', 'once', 'over', 'under', 'back', 'make', 'made', 'like', 'good', 'great', 'remember',
  'forgot', 'forget', 'remembered', 'said', 'told', 'went', 'came', 'got', 'getting', 'felt', 'feeling', 'happened',
]);

const BULLET_PREFIX = /^\s*(?:[-*+•·◦▪‣⁃]\s+|\d+[.)]\s+)/u;

export type StoryTrigger = {
  primary: string;
  secondary?: string;
};

type TriggerWord = {
  word: string;
  normalized: string;
  score: number;
  index: number;
};

type TriggerCandidate = {
  text: string;
  score: number;
  start: number;
  end: number;
};

export function plainStoryText(body: string): string {
  return body
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target: string, label: string | undefined) => (label || target).replace(/\.md$/i, ''))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1 — $2')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .split('\n')
    .map((line) => line
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*>+\s?/, '')
      .replace(/^\s*(?:[-*+•·◦▪‣⁃]\s+)?\[[ xX]\]\s+/u, '')
      .replace(BULLET_PREFIX, '')
      .replace(/[*_~`]/g, '')
      .trimEnd())
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Compatibility alias for older callers. New product code should use plainStoryText. */
export const plainMemoryText = plainStoryText;

export function memoryTitle(body: string): string {
  const clean = plainStoryText(body);
  const firstLine = clean.split('\n').find((line) => line.trim())?.trim() || 'Untitled story';
  return firstLine.length <= 72 ? firstLine : `${firstLine.slice(0, 69).trimEnd()}…`;
}

export function storyPreview(body: string, maxLength = 150): string {
  const clean = plainStoryText(body).replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  const clipped = clean.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  const boundary = lastSpace >= Math.floor(maxLength * 0.65) ? lastSpace : clipped.length;
  return `${clipped.slice(0, boundary).trimEnd()}…`;
}

function normalizedWord(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}-]/gu, '');
}

function triggerWords(body: string): TriggerWord[] {
  const clean = plainStoryText(body).replace(/https?:\/\/\S+/gi, ' ');
  const matches = clean.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || [];
  const seen = new Map<string, number>();

  return matches.flatMap((word, index) => {
    const normalized = normalizedWord(word);
    if (!normalized || normalized.length < 3 || /^\d+$/u.test(normalized)) return [];
    const occurrence = seen.get(normalized) || 0;
    seen.set(normalized, occurrence + 1);
    if (STOP_WORDS.has(normalized)) return [];

    const startsUppercase = /^\p{Lu}/u.test(word) && index > 0;
    const uniquenessBonus = occurrence === 0 ? 2 : 0;
    const score = (startsUppercase ? 7 : 0) + uniquenessBonus + Math.min(normalized.length, 10) / 2;
    return [{ word: word.replace(/[.,;:!?]+$/g, ''), normalized, score, index }];
  });
}

function overlaps(a: TriggerCandidate, b: TriggerCandidate): boolean {
  return a.start <= b.end && b.start <= a.end;
}

function buildCandidates(words: TriggerWord[], safeBoundary: number): TriggerCandidate[] {
  const safe = words.filter((word) => word.index < safeBoundary);
  const candidates: TriggerCandidate[] = safe.map((word) => ({
    text: word.word,
    score: word.score,
    start: word.index,
    end: word.index,
  }));

  for (let index = 0; index < safe.length - 1; index += 1) {
    const first = safe[index];
    const second = safe[index + 1];
    if (second.index !== first.index + 1) continue;
    candidates.push({
      text: `${first.word} ${second.word}`,
      score: first.score + second.score + 5,
      start: first.index,
      end: second.index,
    });
  }

  return candidates.sort((a, b) => b.score - a.score || a.start - b.start || a.text.localeCompare(b.text));
}

/**
 * Builds a deterministic local retrieval trigger using only the user's own words.
 * The final 42% of the story is protected so endings and punchlines are less likely
 * to appear before reveal. The UI decides how the primary and secondary anchors
 * are presented; this function deliberately returns no decorative punctuation.
 */
export function storyTrigger(body: string): StoryTrigger {
  const clean = plainStoryText(body).replace(/https?:\/\/\S+/gi, ' ');
  const allWords = clean.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || [];
  const words = triggerWords(body);
  if (words.length === 0 || allWords.length === 0) return { primary: 'Something worth telling' };

  const safeBoundary = Math.max(2, Math.floor(allWords.length * 0.58));
  const candidates = buildCandidates(words, safeBoundary);
  const primary = candidates[0];
  if (!primary) return { primary: 'Something worth telling' };

  const secondary = candidates.find((candidate) => (
    !overlaps(candidate, primary)
    && candidate.text.toLowerCase() !== primary.text.toLowerCase()
    && !primary.text.toLowerCase().includes(candidate.text.toLowerCase())
    && !candidate.text.toLowerCase().includes(primary.text.toLowerCase())
  ));

  return secondary ? { primary: primary.text, secondary: secondary.text } : { primary: primary.text };
}

/** Compatibility helper for legacy/tests. Shipping UI should render storyTrigger structurally. */
export function storyCue(body: string): string {
  return storyTrigger(body).primary;
}
