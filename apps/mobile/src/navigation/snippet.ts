export function cleanSnippet(body: string, title: string): string {
  const lines = body.split('\n');
  for (const rawLine of lines) {
    const clean = rawLine
      .replace(/^#+\s*/, '')
      .replace(/^[\s>*-]+/, '')
      .replace(/^\d+[.)]\s*/, '')
      .replace(/\[\[(.*?)\]\]/g, '$1')
      .replace(/[*_~`]/g, '')
      .trim();
    if (clean && clean.toLowerCase() !== title.toLowerCase()) {
      return clean;
    }
  }
  return '';
}
