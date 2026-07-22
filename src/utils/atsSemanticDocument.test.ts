import { describe, expect, it } from 'vitest';

import {
  extractAtsSemanticDocument,
  normalizeAtsText,
} from './atsSemanticDocument';

const parseFixture = (html: string) => {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const root = document.body.firstElementChild;
  if (!root) throw new Error('Fixture must contain a root element.');
  return root;
};

describe('extractAtsSemanticDocument', () => {
  it('extracts deterministic block order without hidden or decorative content', () => {
    const root = parseFixture(`
      <main>
        <header><div>Samira Núñez</div><div>samira@example.com</div></header>
        <section><div>Summary</div><p>Product designer building accessible tools.</p></section>
        <svg><text>decorative icon label</text></svg>
        <div aria-hidden="true">preview-only controls</div>
        <section><div>Experience</div><div>Lead Designer</div><div>Northwind Labs</div></section>
      </main>
    `);

    const result = extractAtsSemanticDocument(root, {
      expectedSectionHeadings: ['Summary', 'Experience'],
    });

    expect(result.blocks).toEqual([
      'Samira Núñez',
      'samira@example.com',
      'Summary',
      'Product designer building accessible tools.',
      'Experience',
      'Lead Designer',
      'Northwind Labs',
    ]);
    expect(result.text).not.toContain('decorative icon label');
    expect(result.text).not.toContain('preview-only controls');
    expect(result.warnings).not.toContainEqual(expect.objectContaining({ code: 'missing-heading' }));
  });

  it('records link targets and warns about links that an ATS cannot follow', () => {
    const root = parseFixture(`
      <div>
        <a href="https://example.com/portfolio">Portfolio</a>
        <a href="mailto:samira@example.com">Email</a>
        <a href="javascript:void(0)">Project</a>
      </div>
    `);

    const result = extractAtsSemanticDocument(root);

    expect(result.links).toEqual([
      { href: 'https://example.com/portfolio', label: 'Portfolio', accessible: true },
      { href: 'mailto:samira@example.com', label: 'Email', accessible: true },
      { href: 'javascript:void(0)', label: 'Project', accessible: false },
    ]);
    expect(result.warnings).toContainEqual(expect.objectContaining({ code: 'inaccessible-link' }));
  });

  it('flags substantial visual columns, images, unusual glyphs, and missing headings', () => {
    const root = parseFixture(`
      <div style="display:flex;flex-direction:row">
        <aside>
          <img src="avatar.png" alt="Candidate portrait">
          Skills TypeScript React Accessibility Research Systems
        </aside>
        <section>
          Experience Senior Engineer Northwind Labs 2022 Present Built reliable products ↗
        </section>
      </div>
    `);

    const result = extractAtsSemanticDocument(root, {
      expectedSectionHeadings: ['Experience', 'Education'],
    });
    const warningCodes = result.warnings.map((warning) => warning.code);

    expect(warningCodes).toEqual(expect.arrayContaining([
      'ambiguous-columns',
      'ignored-visual',
      'missing-heading',
      'unusual-glyph',
    ]));
  });
});

describe('normalizeAtsText', () => {
  it('normalizes platform line endings and unstable whitespace', () => {
    expect(normalizeAtsText('  Summary\r\n\r\n  Builds   products  \n Experience '))
      .toBe('Summary\nBuilds products\nExperience');
  });
});
