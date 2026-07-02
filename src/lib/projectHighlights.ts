export type HighlightTextSegment = {
  text: string;
  highlighted: boolean;
};

export const splitHighlightText = (
  text: string,
  phrases: readonly string[] = [],
): HighlightTextSegment[] => {
  const orderedPhrases = [...new Set(phrases.filter(Boolean))].sort((a, b) => b.length - a.length);

  if (!text || orderedPhrases.length === 0) {
    return [{ text, highlighted: false }];
  }

  const segments: HighlightTextSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let nextIndex = -1;
    let nextPhrase = "";

    for (const phrase of orderedPhrases) {
      const index = text.indexOf(phrase, cursor);

      if (
        index !== -1 &&
        (nextIndex === -1 || index < nextIndex || (index === nextIndex && phrase.length > nextPhrase.length))
      ) {
        nextIndex = index;
        nextPhrase = phrase;
      }
    }

    if (nextIndex === -1) {
      segments.push({ text: text.slice(cursor), highlighted: false });
      break;
    }

    if (nextIndex > cursor) {
      segments.push({ text: text.slice(cursor, nextIndex), highlighted: false });
    }

    segments.push({ text: nextPhrase, highlighted: true });
    cursor = nextIndex + nextPhrase.length;
  }

  return segments;
};
