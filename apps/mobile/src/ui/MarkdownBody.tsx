import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import type { MemoryNote } from '@core/model';
import { colors, spacing, typography } from './theme';
import { openMarkdownLink } from './markdown-links';

type MarkdownBodyProps = {
  body: string;
  onOpenLink: (target: string) => void;
  onLinkError?: (target: string) => void;
};

function openInlineLink(target: string, onOpenLink: (target: string) => void, onLinkError?: (target: string) => void) {
  void openMarkdownLink(target, (url) => Linking.openURL(url), onOpenLink, onLinkError);
}

const INLINE_MARKDOWN = /(`[^`\n]+`|\*\*\*[^*\n]+\*\*\*|___[^_\n]+___|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|\[\[[^\]\n]+\]\]|\[[^\]\n]*\]\([^)\n]*\))/g;

function inlineParts(text: string, onOpenLink: (target: string) => void, keyPrefix = 'inline', onLinkError?: (target: string) => void) {
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
      return <Text key={key} accessibilityRole="link" onPress={() => openInlineLink(markdownLink[2], onOpenLink, onLinkError)} style={styles.link}>{markdownLink[1]}</Text>;
    }

    if ((part.startsWith('***') && part.endsWith('***')) || (part.startsWith('___') && part.endsWith('___'))) {
      return <Text key={key} style={[styles.strong, styles.emphasis]}>{inlineParts(part.slice(3, -3), onOpenLink, `${key}-strong-emphasis`, onLinkError)}</Text>;
    }
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <Text key={key} style={styles.strong}>{inlineParts(part.slice(2, -2), onOpenLink, `${key}-strong`, onLinkError)}</Text>;
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <Text key={key} style={styles.emphasis}>{inlineParts(part.slice(1, -1), onOpenLink, `${key}-emphasis`, onLinkError)}</Text>;
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
    marginLeft: Math.min(Math.floor(columns / 2), 4) * 18,
  };
}

export function MarkdownBody({ body, onOpenLink, onLinkError }: MarkdownBodyProps) {
  const sections = body.split(/(?=^## Recall reflection)/im);

  return (
    <View style={styles.body}>
      {sections.map((section, sectionIndex) => {
        const isRecallSection = /^## Recall reflection/i.test(section.trim());
        return (
          <View key={`section-${sectionIndex}`} style={isRecallSection ? styles.recallSection : null}>
            {section.split('\n').map((line, index) => {
              const { content, marginLeft } = indentationFor(line);
              if (!content) return <View key={`blank-${index}`} style={styles.blankLine} />;
              const indented = marginLeft ? { marginLeft } : null;

              if (isRecallSection && index < 4 && content.match(/^[*_](.+)[*_]$/)) {
                return <Text key={`date-${index}`} style={[styles.paragraph, styles.recallDate, indented]}>{content.replace(/[*_]/g, '')}</Text>;
              }

              const heading = content.match(/^(#{1,6})\s+(.+)$/);
              if (heading) {
                const level = heading[1].length;
                const headingStyle = level === 1 ? styles.headingOne : styles.headingOther;
                return <Text key={`heading-${index}`} accessibilityRole="header" style={[styles.heading, headingStyle, indented]}>{inlineParts(heading[2], onOpenLink, 'inline', onLinkError)}</Text>;
              }

              const quote = content.match(/^>\s?(.*)$/);
              if (quote) {
                return (
                  <View key={`quote-${index}`} style={[styles.quoteRow, indented]}>
                    <Text style={styles.quote}>{inlineParts(quote[1], onOpenLink, 'inline', onLinkError)}</Text>
                  </View>
                );
              }

              const task = content.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
              if (task) {
                return (
                  <View key={`task-${index}`} accessible accessibilityLabel={`${task[1].toLowerCase() === 'x' ? 'Completed' : 'Not completed'}: ${task[2]}`} style={[styles.listRow, indented]}>
                    <Text style={styles.checkbox}>{task[1].toLowerCase() === 'x' ? '✓' : '□'}</Text>
                    <Text style={[styles.paragraph, task[1].toLowerCase() === 'x' && styles.done]}>{inlineParts(task[2], onOpenLink, 'inline', onLinkError)}</Text>
                  </View>
                );
              }

              const bullet = content.match(/^[-*+]\s+(.+)$/);
              if (bullet) {
                return (
                  <View key={`bullet-${index}`} style={[styles.listRow, indented]}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.paragraph}>{inlineParts(bullet[1], onOpenLink, 'inline', onLinkError)}</Text>
                  </View>
                );
              }

              const ordered = content.match(/^(\d+[.)])\s+(.+)$/);
              if (ordered) {
                return (
                  <View key={`ordered-${index}`} style={[styles.listRow, indented]}>
                    <Text style={styles.orderedMarker}>{ordered[1]}</Text>
                    <Text style={styles.paragraph}>{inlineParts(ordered[2], onOpenLink, 'inline', onLinkError)}</Text>
                  </View>
                );
              }

              return <Text key={`paragraph-${index}`} style={[styles.paragraph, indented]}>{inlineParts(content, onOpenLink, 'inline', onLinkError)}</Text>;
            })}
          </View>
        );
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
  body: { paddingBottom: spacing.xl },
  blankLine: { height: spacing.sm },
  heading: { color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  headingOne: { ...typography.title },
  headingOther: { ...typography.section },
  paragraph: { color: colors.textPrimary, flex: 1, ...typography.body },
  listRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs },
  bullet: { color: colors.action, width: spacing.md, ...typography.body },
  orderedMarker: { color: colors.action, minWidth: spacing.xl, ...typography.supporting },
  checkbox: { color: colors.action, width: spacing.lg, ...typography.body },
  done: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  quoteRow: { borderLeftColor: colors.divider, borderLeftWidth: 3, marginBottom: spacing.xs, paddingLeft: spacing.sm },
  quote: { color: colors.textSecondary, fontStyle: 'italic', ...typography.body },
  strong: { fontWeight: '600' },
  emphasis: { fontStyle: 'italic' },
  code: { backgroundColor: colors.actionMuted, color: colors.textPrimary, fontFamily: 'monospace' },
  link: { color: colors.action, fontWeight: '500', textDecorationLine: 'underline' },
  recallSection: { borderLeftColor: colors.divider, borderLeftWidth: 2, marginTop: spacing.sm, paddingLeft: spacing.sm },
  recallDate: { color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.xs, ...typography.metadata },
});
