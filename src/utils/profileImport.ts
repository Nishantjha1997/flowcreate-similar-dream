import type { UserProfile } from '@/hooks/useUserProfile';

export type ProfileImportMode = 'replace' | 'append' | 'skip';

export type ProfileImportSelection = {
  key: keyof UserProfile;
  data: unknown;
  mode: ProfileImportMode;
};

const arrayKeys = new Set<keyof UserProfile>([
  'technical_skills',
  'soft_skills',
  'languages',
  'work_experience',
  'education',
  'projects',
  'certifications',
  'achievements',
  'volunteer_experience',
]);

const normalized = (value: unknown) => String(value ?? '').trim().toLocaleLowerCase();

const identityFor = (key: keyof UserProfile, item: unknown): string => {
  if (typeof item === 'string') return normalized(item);
  if (!item || typeof item !== 'object') return normalized(item);

  const record = item as Record<string, unknown>;
  switch (key) {
    case 'work_experience':
      return `${normalized(record.title ?? record.position)}|${normalized(record.company ?? record.organization)}`;
    case 'education':
      return `${normalized(record.degree)}|${normalized(record.institution ?? record.school ?? record.university)}`;
    case 'projects':
      return normalized(record.name ?? record.title);
    case 'certifications':
      return `${normalized(record.name ?? record.title)}|${normalized(record.issuer ?? record.organization)}`;
    case 'languages':
      return normalized(record.language ?? record.name);
    default:
      return JSON.stringify(record);
  }
};

const uniqueValues = (key: keyof UserProfile, values: unknown[]) => {
  const seen = new Set<string>();
  return values.filter((item) => {
    const identity = identityFor(key, item);
    if (!identity || seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

const definedValues = (record: Record<string, unknown>) => Object.fromEntries(
  Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== ''),
);

/** Builds a safe profile update. Append is deduplicated by the stable identity of each item. */
export const mergeProfileImport = (
  current: Partial<UserProfile> | undefined,
  selections: ProfileImportSelection[],
): Partial<UserProfile> => {
  const next: Partial<UserProfile> = {};

  for (const selection of selections) {
    if (selection.mode === 'skip') continue;

    if (selection.key === 'full_name' && selection.data && typeof selection.data === 'object') {
      Object.assign(next, definedValues(selection.data as Record<string, unknown>));
      continue;
    }

    if (arrayKeys.has(selection.key)) {
      const incoming = Array.isArray(selection.data) ? selection.data : [];
      const existing = Array.isArray(current?.[selection.key]) ? current?.[selection.key] as unknown[] : [];
      const values = selection.mode === 'append' ? [...existing, ...incoming] : incoming;
      (next as Record<string, unknown>)[selection.key] = uniqueValues(selection.key, values);
      continue;
    }

    (next as Record<string, unknown>)[selection.key] = selection.data;
  }

  return next;
};

export const isProfileImportArray = (key: keyof UserProfile) => arrayKeys.has(key);
