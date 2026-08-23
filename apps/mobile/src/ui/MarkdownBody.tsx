import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import type { MemoryNote } from '@core/model';
import { colors } from './theme';
import { openMarkdownLink } from './markdown-links';

type MarkdownBodyProps = {
  body: string;
  onOpenLink: (target: string) => void;
};

function openInlineLink(target: string, onOpenLink: (target: string) => void) {
  void openMarkdownLink(target, (url) => Linking.openURL(url), onOpenLink);
}

const INLINE_MARKDOWN = /(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|___[^_\n]+___|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|\[\[[^\]\n]+\]\]|\[[^\]\n]*\]\([^)\n]*\))/g;

function inlineParts(text: string, onOpenLink: (target: string) => void, keyPrefix = 'inline') {
  const parts = text.split(INLINE_MARKDOWN);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const wikilink = part.match(/^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
    if (wikilink) {
      const target = wikilink[1].trim();
      const label = wikilink[2]?.trim() || target.replace(/\.md$/i, '');
      return <Text key={key} accessibilityHint="Opens the linked note or creates it if missing" accessibilityRole="link" onPress={() => onOpenLink(target)} style={styles.link}>{label}</Text>;
    }

    const markdownLink = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (markdownLink) {
      return <Text key={key} accessibilityRole="link" onPress={() => openInlineLink(markdownLink[2], onOpenLink)} style={styles.link}>{markdownLink[1]}</Text>;
    }

    if ((part.startsWith('***') && part.endsWith('***')) || (part.startsWith('___') && part.endsWith('___'))) {
      return <Text key={key} style={[styles.strong, styles.emphasis]}>{inlineParts(part.slice(3, -3), onOpenLink, `${key}-strong-emphasis`)}</Text>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={key} style={styles.strong}>{inlineParts(part.slice(2, -2), onOpenLink, `${key}-strong`)}</Text>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <Text key={key} style={styles.strong}>{inlineParts(part.slice(2, -2), onOpenLink, `${key}-strong`)}</Text>;
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <Text key={key} style={styles.emphasis}>{inlineParts(part.slice(1, -1), onOpenLink, `${key}-emphasis`)}</Text>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <Text key={key} style={styles.code}>{part.slice(1, -1)}</Text>;
    }

    return <Text key={key}>{part}</Text>;
  });
}

function indentationFor(line: string) {
  const whitespace = line.match(/^[\t ]*/)?.[0] || '';
  const columns = Array.from(whitespace).reduce((total, character) => total + (character === '\t' ? 2 : 1), 0);
  return {
    content: line.slice(whitespace.length).trimEnd(),
    marginLeft: Math.floor(columns / 2) * 18,
  };
}

export function MarkdownBody({ body, onOpenLink }: MarkdownBodyProps) {
  return (
    <View style={styles.body}>
      {body.split('\n').map((line, index) => {
        const { content, marginLeft } = indentationFor(line);
        if (!content) return <View key={`blank-${index}`} style={styles.blankLine} />;
        const indented = marginLeft ? { marginLeft } : null;
        const heading = content.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
          return <Text key={`heading-${index}`} accessibilityRole="header" style={[styles.heading, indented]}>{inlineParts(heading[2], onOpenLink)}</Text>;
        }
        const quote = content.match(/^>\s?(.*)$/);
        if (quote) {
          return (
            <View key={`quote-${index}`} style={[styles.quoteRow, indented]}>
              <Text style={styles.quote}>{inlineParts(quote[1], onOpenLink)}</Text>
            </View>
          );
        }
        const task = content.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
        if (task) {
          return (
            <View key={`task-${index}`} accessible accessibilityLabel={`${task[1].toLowerCase() === 'x' ? 'Completed' : 'Not completed'}: ${task[2]}`} style={[styles.listRow, indented]}>
              <Text style={styles.checkbox}>{task[1].toLowerCase() === 'x' ? '✓' : '□'}</Text>
              <Text style={[styles.paragraph, task[1].toLowerCase() === 'x' && styles.done]}>{inlineParts(task[2], onOpenLink)}</Text>
            </View>
          );
        }
        const bullet = content.match(/^[-*+]\s+(.+)$/);
        if (bullet) {
          return (
            <View key={`bullet-${index}`} style={[styles.listRow, indented]}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.paragraph}>{inlineParts(bullet[1], onOpenLink)}</Text>
            </View>
          );
        }
        const ordered = content.match(/^(\d+[.)])\s+(.+)$/);
        if (ordered) {
          return (
            <View key={`ordered-${index}`} style={[styles.listRow, indented]}>
              <Text style={styles.orderedMarker}>{ordered[1]}</Text>
              <Text style={styles.paragraph}>{inlineParts(ordered[2], onOpenLink)}</Text>
            </View>
          );
        }
        return <Text key={`paragraph-${index}`} style={[styles.paragraph, indented]}>{inlineParts(content, onOpenLink)}</Text>;
      })}
    </View>
  );
}

export function noteKindLabel(note: Pick<MemoryNote, 'kind'>) {
  if (note.kind === 'book-learning') return 'Book learning';
  if (note.kind === 'experience') return 'Experience';
  return 'Note';
}

const styles = StyleSheet.create({
  body: { paddingBottom: 24 },
  blankLine: { height: 10 },
  heading: { color: colors.ink, fontSize: 22, fontWeight: '600', lineHeight: 29, marginBottom: 10, marginTop: 14 },
  paragraph: { color: colors.ink, flex: 1, fontSize: 17, lineHeight: 27 },
  listRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 9, marginBottom: 7 },
  bullet: { color: colors.accent, fontSize: 23, lineHeight: 27, width: 16 },
  orderedMarker: { color: colors.accent, fontSize: 16, lineHeight: 27, minWidth: 22 },
  checkbox: { color: colors.accent, fontSize: 18, lineHeight: 27, width: 19 },
  done: { color: colors.muted, textDecorationLine: 'line-through' },
  quoteRow: { borderLeftColor: colors.line, borderLeftWidth: 3, marginBottom: 7, paddingLeft: 13 },
  quote: { color: colors.muted, fontSize: 17, fontStyle: 'italic', lineHeight: 27 },
  strong: { fontWeight: '600' },
  emphasis: { fontStyle: 'italic' },
  code: { backgroundColor: colors.accentSoft, color: colors.ink, fontFamily: 'monospace' },
  link: { color: colors.accent, fontWeight: '500', textDecorationLine: 'underline' },
});
