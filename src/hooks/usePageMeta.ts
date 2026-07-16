import { useEffect } from 'react';

interface PageMetaProps {
  title: string;
  description?: string;
}

export function usePageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    // Update the document title
    const defaultTitle = 'Free Online Resume Builder — Create Professional Resumes | FlowCreate';
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
    
    // Cleanup on unmount
    return () => {
      document.title = defaultTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', 'Build a professional resume online free with FlowCreate. 30+ ATS-friendly templates, AI-powered suggestions, and instant PDF download. No credit card required.');
      }
    };
  }, [title, description]);
}
