import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description?: string;
}

export function usePageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    // Update the document title
    const defaultTitle = 'FlowCreate - AI Resume Builder';
    document.title = title ? `${title} | FlowCreate` : defaultTitle;

    // Update the meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
    
    // Cleanup is not strictly necessary for most SPA navigations since 
    // the next page will overwrite it, but good practice.
    return () => {
      document.title = defaultTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', 'Create a professional, ATS-friendly resume in minutes with FlowCreate\'s AI-powered builder.');
      }
    };
  }, [title, description]);
}
