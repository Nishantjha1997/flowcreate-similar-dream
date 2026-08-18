import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));
vi.mock('@/hooks/useAdminStatus', () => ({
  useAdminStatus: () => ({ data: false }),
}));
vi.mock('@/hooks/useDesignMode', () => ({
  useDesignMode: () => ({ isNeoBrutalism: false }),
}));

// Polyfill Radix pointer-capture APIs that jsdom doesn't ship with.
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

    expect(screen.getAllByRole('link', { name: 'Templates' })[0].getAttribute('href')).toBe('/templates');
    expect(screen.getAllByRole('link', { name: 'Pricing' })[0].getAttribute('href')).toBe('/pricing');

    const buildTrigger = screen.getByRole('button', { name: /build/i });
    fireEvent.pointerDown(buildTrigger, { button: 0, pointerId: 1, pointerType: 'mouse' });
    fireEvent.pointerUp(buildTrigger, { button: 0, pointerId: 1, pointerType: 'mouse' });
    fireEvent.click(buildTrigger);

    expect((await screen.findByRole('menuitem', { name: 'Resume Builder' })).getAttribute('href')).toBe('/resume-builder');
    expect(screen.getByRole('menuitem', { name: 'Cover Letters' }).getAttribute('href')).toBe('/cover-letter-builder');
    expect(screen.getByRole('menuitem', { name: 'Master Profiles' }).getAttribute('href')).toBe('/master-profiles');
  });

  it('opens mobile navigation drawer and shows all nav links when hamburger is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // The mobile menu trigger is a plain <button> — no Radix events needed.
    const mobileMenuTrigger = screen.getByTestId('mobile-menu-trigger');
    expect(mobileMenuTrigger).toBeTruthy();

    fireEvent.click(mobileMenuTrigger);

    // Menu should now be open — portal renders into document.body
    expect(screen.getByRole('dialog', { name: /mobile navigation menu/i })).toBeTruthy();

    // "Get Started Free" sign-up link should be visible for guests
    const signupLink = screen.getByRole('link', { name: /get started free/i });
    expect(signupLink.getAttribute('href')).toBe('/register');

    // Resume Builder should be in the menu
    expect(screen.getAllByRole('link', { name: 'Resume Builder' }).length).toBeGreaterThanOrEqual(1);

    // Close button should be present inside the drawer
    const closeBtn = screen.getByLabelText(/close menu/i);
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn);

    // Dialog should be gone after closing
    expect(screen.queryByRole('dialog', { name: /mobile navigation menu/i })).toBeNull();
  });
});
