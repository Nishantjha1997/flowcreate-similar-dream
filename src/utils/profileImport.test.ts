import { describe, expect, it } from 'vitest';
import { mergeProfileImport } from './profileImport';

describe('mergeProfileImport', () => {
  it('appends imported experience without duplicating the same role', () => {
    const result = mergeProfileImport(
      { work_experience: [{ title: 'Engineer', company: 'Acme' }] } as any,
      [{
        key: 'work_experience',
        mode: 'append',
        data: [
          { title: ' engineer ', company: 'ACME' },
          { title: 'Lead', company: 'FlowCreate' },
        ],
      }],
    );

    expect(result.work_experience).toEqual([
      { title: 'Engineer', company: 'Acme' },
      { title: 'Lead', company: 'FlowCreate' },
    ]);
  });

  it('does not erase existing personal values when parsing omitted them', () => {
    const result = mergeProfileImport({ email: 'kept@example.com' } as any, [{
      key: 'full_name',
      mode: 'replace',
      data: { full_name: 'Nishant', email: '' },
    }]);

    expect(result).toEqual({ full_name: 'Nishant' });
  });
});
