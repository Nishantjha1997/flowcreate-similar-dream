export const SITE_NAME = 'FlowCreate';
export const DEFAULT_SITE_URL = 'https://flowcreate-similar-dream.vercel.app';
export const DEFAULT_OG_IMAGE = '/og-image.png';

export function getSiteUrl() {
  return (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

// These are the public, canonical routes we intentionally want search engines
// to index. Authenticated, account, admin, and user-specific routes are kept out
// of the sitemap and receive X-Robots-Tag headers in vercel.json.
export const PUBLIC_ROUTES = [
  {
    path: '/',
    title: 'Free Online Resume Builder — Create Professional Resumes',
    description: 'Build a professional resume online free with FlowCreate. Choose from 30+ ATS-friendly templates, get AI writing suggestions, and download a polished PDF.',
    heading: 'Build a Professional Resume Online for Free',
    changefreq: 'weekly',
    priority: '1.0',
    type: 'WebApplication',
  },
  {
    path: '/resume-builder',
    title: 'Free Resume Builder — Create an ATS-Friendly Resume',
    description: 'Create a professional, ATS-friendly resume online for free. Choose a template, add your experience, and download a polished PDF in minutes.',
    heading: 'Free Online Resume Builder',
    changefreq: 'weekly',
    priority: '0.9',
    type: 'WebApplication',
  },
  {
    path: '/templates',
    title: 'Free ATS-Friendly Resume Templates',
    description: 'Browse 30+ free, ATS-optimized resume templates for every industry. Customize any design and download your professional resume as a PDF.',
    heading: 'Free Resume Templates',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/cover-letter-builder',
    title: 'Free AI Cover Letter Builder',
    description: 'Write a tailored, professional cover letter with AI assistance. Match it to your resume, edit every detail, and download it as a PDF.',
    heading: 'Free Cover Letter Builder',
    changefreq: 'monthly',
    priority: '0.8',
    type: 'WebApplication',
  },
  {
    path: '/pricing',
    title: 'Resume Builder Pricing — Free and Premium Plans',
    description: 'Start with FlowCreate for free. Compare resume builder plans with AI suggestions, unlimited resumes, version history, and cloud backup.',
    heading: 'Simple Resume Builder Pricing',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/features',
    title: 'Resume Builder Features — ATS Templates and AI Tools',
    description: 'Explore FlowCreate features including ATS-friendly templates, live preview, AI writing help, PDF export, cloud storage, and resume sharing.',
    heading: 'Everything You Need to Build a Better Resume',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/examples',
    title: 'Professional Resume Examples by Industry',
    description: 'Browse professional resume examples across industries and experience levels. Use an example as inspiration and build your own resume online.',
    heading: 'Professional Resume Examples',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/blog',
    title: 'Resume Tips and Career Advice Blog',
    description: 'Read practical resume writing tips, career advice, ATS guidance, and job search strategies from the FlowCreate team.',
    heading: 'Resume Tips and Career Advice',
    changefreq: 'daily',
    priority: '0.8',
  },
  {
    path: '/resources',
    title: 'Free Resume Resources and Job Search Tools',
    description: 'Find free resume templates, examples, career advice, and job search resources to build a stronger application and land more interviews.',
    heading: 'Free Resume Resources',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/career-advice',
    title: 'Career Advice and Job Search Tips',
    description: 'Get practical career advice for writing resumes, preparing for interviews, negotiating offers, and advancing your career.',
    heading: 'Career Advice and Job Search Tips',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/help',
    title: 'FlowCreate Help Center and Support',
    description: 'Find answers about FlowCreate resume tools, accounts, downloads, billing, and support.',
    heading: 'FlowCreate Help Center',
    changefreq: 'monthly',
    priority: '0.5',
  },
  {
    path: '/about',
    title: 'About FlowCreate',
    description: 'Learn about FlowCreate, the online resume and cover letter builder designed to help job seekers create professional applications.',
    heading: 'About FlowCreate',
    changefreq: 'yearly',
    priority: '0.5',
  },
  {
    path: '/ats',
    title: 'Applicant Tracking System for Collaborative Hiring',
    description: 'Manage jobs, candidates, hiring pipelines, team feedback, and recruiting analytics with FlowCreate ATS.',
    heading: 'Hire Smarter, Faster, Together',
    changefreq: 'monthly',
    priority: '0.6',
    type: 'SoftwareApplication',
  },
  {
    path: '/ats/jobs/browse',
    title: 'Browse Open Jobs',
    description: 'Browse current job openings published by hiring teams using FlowCreate ATS.',
    heading: 'Browse Open Jobs',
    changefreq: 'daily',
    priority: '0.6',
  },
  {
    path: '/terms',
    title: 'Terms and Conditions',
    description: 'Read the terms and conditions for using FlowCreate resume, cover letter, and career tools.',
    heading: 'Terms and Conditions',
    changefreq: 'yearly',
    priority: '0.2',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy',
    description: 'Learn how FlowCreate collects, uses, and protects personal information and resume data.',
    heading: 'Privacy Policy',
    changefreq: 'yearly',
    priority: '0.2',
  },
  {
    path: '/refund-policy',
    title: 'Refund Policy',
    description: 'Review FlowCreate cancellation and refund policies for subscriptions and services.',
    heading: 'Refund Policy',
    changefreq: 'yearly',
    priority: '0.2',
  },
  {
    path: '/shipping-policy',
    title: 'Digital Delivery and Shipping Policy',
    description: 'Information about the digital delivery of FlowCreate products and services.',
    heading: 'Digital Delivery and Shipping Policy',
    changefreq: 'yearly',
    priority: '0.2',
  },
];

export function completeTitle(title) {
  return new RegExp(`\\b${SITE_NAME}\\b`, 'i').test(title)
    ? title
    : `${title} | ${SITE_NAME}`;
}
