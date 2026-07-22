// @vitest-environment node

import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const EMPTY_SELECT_VALUE = /<SelectItem\b[^>]*\bvalue\s*=\s*(?:""|''|\{\s*(?:""|''|``)\s*\})/;

function collectTsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTsxFiles(path);
    return extname(entry.name) === '.tsx' && !entry.name.endsWith('.test.tsx') ? [path] : [];
  });
}

describe('Radix SelectItem contract', () => {
  it('never mounts a SelectItem with an empty value', () => {
    const sourceRoot = resolve(process.cwd(), 'src');
    const violations = collectTsxFiles(sourceRoot).flatMap((file) => {
      const source = readFileSync(file, 'utf8');
      return EMPTY_SELECT_VALUE.test(source) ? [relative(process.cwd(), file)] : [];
    });

    expect(violations, 'Use a sentinel such as "none"; Radix throws when SelectItem value is empty.').toEqual([]);
  });
});
