import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CharacterGuidance } from './CharacterGuidance';

describe('CharacterGuidance', () => {
  it('shows soft guidance without blocking content below the recommendation', () => {
    render(
      <CharacterGuidance
        value="Built accessible products"
        recommendedMax={400}
        guidance="Aim for 3–5 concise achievement bullets."
      />,
    );

    expect(screen.getByText('Aim for 3–5 concise achievement bullets.')).toBeTruthy();
    expect(screen.getByText('25 / ~400 recommended')).toBeTruthy();
  });

  it('warns when content is likely to increase page-break risk', () => {
    render(
      <CharacterGuidance
        value="A long description"
        recommendedMax={10}
        guidance="Keep it short."
      />,
    );

    expect(screen.getByText('Consider trimming this entry to reduce page-break risk.')).toBeTruthy();
  });
});
