import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(here, '..');
const roots = [path.join(mobileRoot, 'app'), path.join(mobileRoot, 'src', 'ui')];
const themePath = path.join(mobileRoot, 'src', 'ui', 'theme.ts');
const nativeTabLayout = path.join(mobileRoot, 'app', '(tabs)', '_layout.tsx');

async function sourceFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(ts|tsx)$/.test(entry.name) ? [target] : [];
  }));
  return nested.flat();
}

async function uiSources() {
  return (await Promise.all(roots.map(sourceFiles))).flat();
}

function relative(file) {
  return path.relative(mobileRoot, file);
}

test('screen and component code does not introduce raw hex colours', async () => {
  const violations = [];
  for (const file of await uiSources()) {
    if (file === themePath) continue;
    const source = await readFile(file, 'utf8');
    if (/#[0-9a-fA-F]{3,8}\b/.test(source)) violations.push(relative(file));
  }
  assert.deepEqual(violations, []);
});

test('interactive minimum dimensions never fall below 48dp', async () => {
  const violations = [];
  for (const file of await uiSources()) {
    const source = await readFile(file, 'utf8');
    const matches = source.matchAll(/min(?:Height|Width)\s*:\s*(\d+)/g);
    for (const match of matches) {
      const value = Number(match[1]);
      if (value > 0 && value < 48) violations.push(`${relative(file)}:${match[0]}`);
    }
  }
  assert.deepEqual(violations, []);
});

test('screens use tokenized typography, spacing, and radii', async () => {
  const violations = [];
  for (const file of await uiSources()) {
    if (file === themePath) continue;
    const source = await readFile(file, 'utf8');

    // Native tab labels are framework configuration rather than a reusable app text style.
    if (file !== nativeTabLayout && /fontSize\s*:\s*\d+/.test(source)) {
      violations.push(`${relative(file)}:fontSize`);
    }

    if (/(?:margin(?:Top|Bottom|Left|Right|Horizontal|Vertical)?|padding(?:Top|Bottom|Left|Right|Horizontal|Vertical)?|gap)\s*:\s*\d+/.test(source)) {
      violations.push(`${relative(file)}:spacing`);
    }

    if (/borderRadius\s*:\s*\d+/.test(source)) {
      violations.push(`${relative(file)}:radius`);
    }
  }
  assert.deepEqual(violations, []);
});
