import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { extractAtsSemanticDocument } from './atsSemanticDocument';
import ResumeTemplate, { templateMockData } from './resumeTemplates';
import { TEMPLATE_REGISTRY } from '@/templates/registry';

/**
 * F-7 fixture matrix: every registered template, rendered with representative
 * data, run through the same DOM-order extraction the semantic PDF export and
 * Recruiter View use. Snapshots pin each template's reading order and warning
 * set so a layout change that silently breaks extraction order (or newly
 * triggers a warning) fails CI instead of shipping unnoticed.
 *
 * This does not replace the ROADMAP D-5 acceptance bar (normalized view ==
 * pdftotext of the actual saved PDF artifact) - that needs a real
 * headless-browser + pdftotext pipeline this repo doesn't have yet. This is
 * the DOM-level regression gate that's achievable in vitest today.
 */
describe('extractAtsSemanticDocument over every registered template', () => {
  for (const template of TEMPLATE_REGISTRY) {
    it(`extracts a stable reading order for "${template.key}"`, () => {
      const resumeData = templateMockData[template.key] ?? templateMockData['clean-slate'];
      const { container } = render(
        <ResumeTemplate data={resumeData} templateName={template.key} />,
      );

      const result = extractAtsSemanticDocument(container);
      const warningCodes = result.warnings.map((warning) => warning.code).sort();

      expect({ blocks: result.blocks, warningCodes }).toMatchSnapshot();

      // The registry's hand-curated atsOptimized flag should agree with what
      // the engine actually finds: a template flagged optimized shouldn't
      // trip layout/visual warnings the flag claims it doesn't have.
      if (template.atsOptimized) {
        expect(warningCodes).not.toContain('ambiguous-columns');
      }
    });
  }
});
