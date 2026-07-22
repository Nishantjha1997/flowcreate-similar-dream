export type AtsArtifactWarningCode =
  | 'ambiguous-columns'
  | 'ignored-visual'
  | 'inaccessible-link'
  | 'missing-heading'
  | 'unusual-glyph';

export interface AtsArtifactWarning {
  code: AtsArtifactWarningCode;
  message: string;
}

export interface AtsArtifactLink {
  href: string;
  label: string;
  accessible: boolean;
}

export interface AtsSemanticDocument {
  text: string;
  blocks: string[];
  links: AtsArtifactLink[];
  warnings: AtsArtifactWarning[];
}

interface AtsSemanticDocumentOptions {
  expectedSectionHeadings?: string[];
}

const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIGCAPTION',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'LI',
  'MAIN',
  'NAV',
  'P',
  'SECTION',
  'TR',
]);

const IGNORED_TAGS = new Set(['CANVAS', 'NOSCRIPT', 'SCRIPT', 'STYLE', 'SVG', 'TEMPLATE']);
const SAFE_LINK_PATTERN = /^(https?:|mailto:|tel:)/i;
const UNUSUAL_GLYPH_PATTERN = /[\u2190-\u21ff\u2500-\u257f\u25a0-\u27bf]/u;

const normalizeInlineText = (value: string) => value.replace(/\s+/g, ' ').trim();

export const normalizeAtsText = (value: string) => value
  .replace(/\r\n?/g, '\n')
  .split('\n')
  .map(normalizeInlineText)
  .filter(Boolean)
  .join('\n');

const isHidden = (element: Element) => {
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') {
    return true;
  }

  if (!(element instanceof HTMLElement)) return false;
  return element.style.display === 'none' || element.style.visibility === 'hidden';
};

const hasSubstantialText = (element: Element) => normalizeInlineText(element.textContent ?? '').length >= 40;

const hasAmbiguousColumnLayout = (element: Element) => {
  if (!(element instanceof HTMLElement)) return false;

  const display = element.style.display;
  const flexDirection = element.style.flexDirection || 'row';
  const gridColumns = element.style.gridTemplateColumns;
  const substantialChildren = Array.from(element.children).filter(hasSubstantialText);

  if (substantialChildren.length < 2) return false;
  if (display === 'grid' && gridColumns && gridColumns !== 'none') return true;
  return display === 'flex' && (flexDirection === 'row' || flexDirection === 'row-reverse');
};

const isAccessibleHref = (href: string) => SAFE_LINK_PATTERN.test(href.trim());

/**
 * Produces the deterministic DOM-order preflight model used by Recruiter View.
 * This does not certify a PDF by itself: the saved artifact still has to match
 * this model in the Chrome/Edge extraction fixture gate documented in ADR 0001.
 */
export function extractAtsSemanticDocument(
  root: Element,
  options: AtsSemanticDocumentOptions = {},
): AtsSemanticDocument {
  const rawBlocks: string[] = [];
  const links: AtsArtifactLink[] = [];
  const warningMap = new Map<string, AtsArtifactWarning>();
  let currentBlock = '';

  const addWarning = (warning: AtsArtifactWarning) => {
    const key = `${warning.code}:${warning.message}`;
    if (!warningMap.has(key)) warningMap.set(key, warning);
  };

  const flushBlock = () => {
    const normalized = normalizeInlineText(currentBlock);
    if (normalized) rawBlocks.push(normalized);
    currentBlock = '';
  };

  const appendText = (value: string) => {
    const normalized = normalizeInlineText(value);
    if (!normalized) return;
    currentBlock = currentBlock ? `${currentBlock} ${normalized}` : normalized;
  };

  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendText(node.nodeValue ?? '');
      return;
    }

    if (!(node instanceof Element) || isHidden(node)) return;

    const tagName = node.tagName.toUpperCase();
    if (IGNORED_TAGS.has(tagName)) return;

    if (tagName === 'IMG') {
      addWarning({
        code: 'ignored-visual',
        message: 'Photos and decorative images are ignored by the recruiter text view.',
      });
      return;
    }

    if (hasAmbiguousColumnLayout(node)) {
      addWarning({
        code: 'ambiguous-columns',
        message: 'This layout has multiple visual columns; confirm the extracted reading order.',
      });
    }

    if (tagName === 'A') {
      const href = node.getAttribute('href')?.trim() ?? '';
      const label = normalizeInlineText(node.textContent ?? '');
      const accessible = isAccessibleHref(href);
      links.push({ href, label, accessible });
      if (!accessible) {
        addWarning({
          code: 'inaccessible-link',
          message: `A link${label ? ` labelled “${label}”` : ''} has no accessible web, email, or phone target.`,
        });
      }
    }

    const isBlock = BLOCK_TAGS.has(tagName);
    if (isBlock) flushBlock();
    Array.from(node.childNodes).forEach(visit);
    if (isBlock) flushBlock();
  };

  visit(root);
  flushBlock();

  const blocks = rawBlocks.filter((block, index) => block !== rawBlocks[index - 1]);
  const text = normalizeAtsText(blocks.join('\n'));

  if (UNUSUAL_GLYPH_PATTERN.test(text)) {
    addWarning({
      code: 'unusual-glyph',
      message: 'Decorative or unusual glyphs need saved-PDF extraction verification.',
    });
  }

  const normalizedBlocks = new Set(blocks.map((block) => block.toLowerCase()));
  for (const heading of options.expectedSectionHeadings ?? []) {
    const normalizedHeading = normalizeInlineText(heading).toLowerCase();
    if (normalizedHeading && !normalizedBlocks.has(normalizedHeading)) {
      addWarning({
        code: 'missing-heading',
        message: `Expected section heading “${heading}” was not found in extraction order.`,
      });
    }
  }

  return {
    text,
    blocks,
    links,
    warnings: Array.from(warningMap.values()),
  };
}
