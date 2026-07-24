import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

// Header only needs these hooks to resolve to a logged-out, default-design
// state - the nav links under test render identically regardless of auth,
// and mocking avoids hitting the real Supabase client from a unit test.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));
vi.mock('@/hooks/useAdminStatus', () => ({
  useAdminStatus: () => ({ data: false }),
}));
vi.mock('@/hooks/useDesignMode', () => ({
  useDesignMode: () => ({ isNeoBrutalism: false }),
}));

// Radix's DropdownMenu relies on pointer-capture and scroll APIs jsdom
// doesn't implement; polyfill the no-ops so opening the "Build" menu in a
// test doesn't throw. This is standard practice for testing Radix in jsdom.
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

describe('Header navigation', () => {
  it('exposes every core product surface, including the ones behind the Build menu', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Templates and Pricing are always in the DOM (top-level nav items).
    expect(screen.getAllByRole('link', { name: 'Templates' })[0].getAttribute('href')).toBe('/templates');
    expect(screen.getAllByRole('link', { name: 'Pricing' })[0].getAttribute('href')).toBe('/pricing');

    // The document builders had zero header entry points before this fix -
    // they live behind the "Build" dropdown, which Radix only mounts into
    // the DOM once opened. Radix's trigger opens on pointerdown (not click,
    // to avoid double-firing on touch), so fireEvent.click alone is a no-op.
    const buildTrigger = screen.getByRole('button', { name: /build/i });
    fireEvent.pointerDown(buildTrigger, { button: 0, pointerId: 1, pointerType: 'mouse' });
    fireEvent.pointerUp(buildTrigger, { button: 0, pointerId: 1, pointerType: 'mouse' });
    fireEvent.click(buildTrigger);

    // Radix's DropdownMenuItem sets role="menuitem" on its child even when
    // that child is an <a> (asChild composition overrides the implicit role).
    expect((await screen.findByRole('menuitem', { name: 'Resume Builder' })).getAttribute('href')).toBe('/resume-builder');
    expect(screen.getByRole('menuitem', { name: 'Cover Letters' }).getAttribute('href')).toBe('/cover-letter-builder');
    expect(screen.getByRole('menuitem', { name: 'Master Profiles' }).getAttribute('href')).toBe('/master-profiles');
  });
});
