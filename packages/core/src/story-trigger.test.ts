import assert from 'node:assert/strict';
import test from 'node:test';
import { plainStoryText, storyPreview, storyTrigger } from './story-cue.ts';

test('plain story text removes legacy and unicode list decoration consistently', () => {
  const input = [
    '# Trip',
    '• Bangalore airport',
    '· Security guard recognised my book',
    '◦ We talked about his daughter',
    '- **I wanted to remember this**',
  ].join('\n');

  const clean = plainStoryText(input);
  assert.equal(clean, [
    'Trip',
    'Bangalore airport',
    'Security guard recognised my book',
    'We talked about his daughter',
    'I wanted to remember this',
  ].join('\n'));
  assert.doesNotMatch(clean, /^[•·◦▪‣⁃]/mu);
});

test('story triggers are structured contextual anchors without decorative punctuation', () => {
  const trigger = storyTrigger('At Bangalore airport a security guard recognised my book and we talked about his daughter reading more.');
  assert.equal(trigger.primary, 'Bangalore airport');
  assert.ok(trigger.secondary);
  assert.doesNotMatch(trigger.primary, /[•·,…]$/u);
  assert.doesNotMatch(trigger.secondary || '', /[•·,…]$/u);
});

test('story triggers protect short answers and later endings', () => {
  const fact = storyTrigger('The capital of France is Paris.');
  assert.doesNotMatch(`${fact.primary} ${fact.secondary || ''}`, /Paris/i);

  const punchline = storyTrigger('At dinner with Ravi we argued about tiny restaurant menus until he revealed the chef was his father.');
  assert.doesNotMatch(`${punchline.primary} ${punchline.secondary || ''}`, /father/i);
});

test('story triggers ignore URLs while readable text and previews preserve useful link context', () => {
  const body = '[Article](https://example.com) changed how I think about onboarding after a long conversation with Meera.';
  const clean = plainStoryText(body);
  assert.match(clean, /Article — https:\/\/example\.com/);
  assert.doesNotMatch(`${storyTrigger(body).primary} ${storyTrigger(body).secondary || ''}`, /https|example\.com/i);
  assert.match(storyPreview(body, 80), /^Article — https:\/\/example\.com/);
});

test('story preview is content-first, whitespace-normalized and bounded', () => {
  const preview = storyPreview('First line\n\nSecond line with a useful detail that should remain readable in the Library.', 50);
  assert.ok(preview.length <= 50);
  assert.doesNotMatch(preview, /\n/);
  assert.match(preview, /^First line Second line/);
});
