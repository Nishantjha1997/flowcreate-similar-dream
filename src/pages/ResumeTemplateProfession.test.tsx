import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ResumeTemplateProfession from './ResumeTemplateProfession';
import { professions } from '@/data/professions';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));
vi.mock('@/hooks/useAdminStatus', () => ({
  useAdminStatus: () => ({ data: false }),
}));
vi.mock('@/hooks/useDesignMode', () => ({
  useDesignMode: () => ({ isNeoBrutalism: false }),
}));

beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

describe('ResumeTemplateProfession', () => {
  it('renders software-engineer profession page with template preview and CTAs', () => {
    render(
      <MemoryRouter initialEntries={['/resume-template/software-engineer']}>
        <Routes>
          <Route path="/resume-template/:profession" element={<ResumeTemplateProfession />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Software Engineer Resume Template/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Build Your Software Engineer Resume/i)).toBeTruthy();
  });

  it('renders 404 fallback when profession slug does not exist', () => {
    render(
      <MemoryRouter initialEntries={['/resume-template/non-existent-profession']}>
        <Routes>
          <Route path="/resume-template/:profession" element={<ResumeTemplateProfession />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Profession Not Found/i)).toBeTruthy();
    expect(screen.getAllByText(/Browse All Templates/i).length).toBeGreaterThanOrEqual(1);
  });

  it('all 33 professions have unique slugs and valid template mappings', () => {
    const slugs = professions.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(professions.length);
    expect(professions.length).toBeGreaterThanOrEqual(30);

    professions.forEach((p) => {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.templateKey).toBeTruthy();
      expect(p.description).toBeTruthy();
    });
  });
});
