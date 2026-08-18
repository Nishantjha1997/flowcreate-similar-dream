export const brand = {
  name: 'MakeCV',
  formerName: 'FlowCreate',
  siteUrl: 'https://makecv.site',
  supportEmail: 'support.makecv@gmail.com',
  linkedInUrl: 'https://www.linkedin.com/in/nishant-jha-059828104/',
  logo: '/logo.svg',
  darkLogo: '/logo-dark.svg',
  favicon: '/favicon.svg',
} as const;

export const historicalBrandPhrase = `${brand.name} (formerly ${brand.formerName})`;

/** Prevent legacy CMS rows from leaking the old name before migration. */
export const normalizeBrandText = (value: string | null | undefined): string =>
  String(value ?? '').replace(/\bFlowCreate\b/gi, brand.name);
