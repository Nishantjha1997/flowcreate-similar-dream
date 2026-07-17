import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { professions } from '@/data/professions';
import { TEMPLATE_REGISTRY } from '@/templates/registry';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

const ResumeTemplateProfession = () => {
  const { profession } = useParams<{ profession: string }>();
  const data = professions.find((p) => p.slug === profession);

  usePageMeta({
    title: data ? `${data.title} | FlowCreate` : 'Resume Templates by Profession',
    description: data?.description || 'Browse free resume templates tailored for your profession. ATS-optimized, professional designs with instant PDF download.',
    noindex: !data,
  });

  useEffect(() => {
    if (!data) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'profession-structured-data';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Resume Templates', item: absoluteUrl('/templates') },
            { '@type': 'ListItem', position: 3, name: data.title, item: absoluteUrl(`/resume-template/${data.slug}`) },
          ],
        },
        {
          '@type': 'Product',
          name: data.title,
          description: data.description,
          category: data.category,
          brand: { '@type': 'Brand', name: 'FlowCreate' },
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
        },
      ],
    });
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('profession-structured-data');
      if (el) el.remove();
    };
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Profession Not Found</h1>
            <p className="text-muted-foreground mb-8">We don't have a dedicated page for this profession yet. Browse all templates below.</p>
            <Link to="/templates">
              <Button size="lg">Browse All Templates <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const template = TEMPLATE_REGISTRY.find((t) => t.key === data.templateKey);
  const relatedProfessions = professions.filter(
    (p) => p.category === data.category && p.slug !== data.slug
  ).slice(0, 4);
  const otherProfessions = professions.filter(
    (p) => p.category !== data.category
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="max-w-4xl mx-auto mb-4">
            <p className="text-sm text-muted-foreground">
              <Link to="/templates" className="hover:text-primary underline">Resume Templates</Link>
              <span className="mx-2">/</span>
              <Link to={`/resume-template/${data.slug}`} className="text-foreground font-medium">{data.title}</Link>
            </p>
          </div>

          {/* Hero */}
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Free {data.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              {data.description}
            </p>
            <Link to={`/resume-builder?template=${data.templateKey}`}>
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                Build Your {data.title.replace(' Resume Template', '')} Resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          </ScrollReveal>

          {/* Template Preview + Why This Template */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
            <ScrollReveal delay={50}>
            <div className="flex justify-center">
              <div className="w-full max-w-[320px]">
                <ResumeTemplatePreview templateKey={data.templateKey} scale={0.48} />
              </div>
            </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-4">Why This Template Works</h2>
              <p className="text-muted-foreground mb-6">{data.summary}</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">ATS-optimized layout that passes applicant tracking systems</span>
                </div>
                {template?.atsOptimized !== false && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Structured sections for skills, experience, and education</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Instant PDF download — ready to send to employers</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Completely free — no credit card required</span>
                </div>
              </div>
              {template && (
                <p className="text-sm text-muted-foreground mt-4">
                  Template: <span className="font-medium text-foreground">{template.name}</span>
                  {template.premium && (
                    <span className="ml-2 inline-flex items-center gap-1 text-yellow-600 text-xs font-medium">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Premium
                    </span>
                  )}
                </p>
              )}
            </div>
            </ScrollReveal>
          </div>

          {/* How It Works */}
          <ScrollReveal delay={150}>
          <div className="max-w-4xl mx-auto mb-16 bg-muted/50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-center mb-8">How to Create Your {data.title.replace(' Resume Template', '')} Resume</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Template</h3>
                <p className="text-sm text-muted-foreground">Pick from 30+ professionally designed templates</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Fill Your Details</h3>
                <p className="text-sm text-muted-foreground">Add your experience, skills, and education</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Download & Apply</h3>
                <p className="text-sm text-muted-foreground">Export as PDF and start applying to jobs</p>
              </div>
            </div>
          </div>
          </ScrollReveal>

          {/* Related Professions */}
          {relatedProfessions.length > 0 && (
            <ScrollReveal delay={200}>
            <div className="max-w-4xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">
                More {data.category} Resume Templates
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProfessions.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/resume-template/${p.slug}`}
                    className="p-4 rounded-xl border hover:border-primary hover:shadow-sm transition-all text-center"
                  >
                    <p className="text-sm font-medium">{p.title.replace(' Resume Template', '')}</p>
                  </Link>
                ))}
              </div>
            </div>
            </ScrollReveal>
          )}

          {otherProfessions.length > 0 && (
            <ScrollReveal delay={250}>
            <div className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Other Resume Templates</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {otherProfessions.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/resume-template/${p.slug}`}
                    className="p-4 rounded-xl border hover:border-primary hover:shadow-sm transition-all text-center"
                  >
                    <p className="text-sm font-medium">{p.title.replace(' Resume Template', '')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.category}</p>
                  </Link>
                ))}
              </div>
            </div>
            </ScrollReveal>
          )}

          {/* CTA */}
          <ScrollReveal delay={300}>
          <div className="max-w-4xl mx-auto bg-[hsl(var(--surface-dark))] rounded-3xl p-10 md:p-16 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Resume?</h2>
            <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
              Join thousands of job seekers who landed interviews with a FlowCreate resume. Free, fast, and professional.
            </p>
            <Link to={`/resume-builder?template=${data.templateKey}`}>
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base">
                Create My Free Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResumeTemplateProfession;
