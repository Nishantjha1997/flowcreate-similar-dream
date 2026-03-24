
import { Star } from 'lucide-react';
import { useDesignMode } from '@/hooks/useDesignMode';

const testimonials = [
  {
    quote: "FlowCreate helped me land my dream job. The ATS-friendly templates made my resume stand out from the competition.",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "Google",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887"
  },
  {
    quote: "I created a professional resume in just 30 minutes. The AI suggestions were incredibly helpful and spot-on.",
    author: "Michael Chen",
    role: "Software Engineer",
    company: "Microsoft",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887"
  },
  {
    quote: "The AI writer helped me highlight achievements I never could on my own. Highly recommended to everyone.",
    author: "Jessica Miller",
    role: "Marketing Director",
    company: "Adobe",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964"
  },
  {
    quote: "As a career coach, I recommend FlowCreate to all my clients. Professional, modern, and ATS-optimized.",
    author: "David Wilson",
    role: "Career Coach",
    company: "CareerBoost",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887"
  },
];

const TestimonialsSection = () => {
  const { isNeoBrutalism } = useDesignMode();

  if (isNeoBrutalism) {
    return (
      <section className="py-20 bg-background border-y-4 border-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Success Stories</h2>
            <p className="text-xl font-mono text-foreground/80">Real results from real professionals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-background border-[3px] border-foreground p-6 nb-card">
                <div className="flex mb-3">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />))}</div>
                <p className="text-foreground mb-4 font-mono text-sm">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.image} alt={t.author} className="h-10 w-10 rounded-none border-2 border-foreground object-cover" />
                  <div>
                    <p className="font-bold text-sm">{t.author}</p>
                    <p className="text-xs font-mono text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Apple-inspired testimonials
  return (
    <section className="apple-section bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <h2 className="apple-headline mb-5">
            Loved by <span className="text-muted-foreground">professionals.</span>
          </h2>
          <p className="apple-subheadline mx-auto">
            Join thousands who've advanced their careers with FlowCreate.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="rounded-2xl bg-section-alt p-8 transition-all duration-500 hover:shadow-md"
            >
              <div className="flex mb-4 gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary/80 text-primary/80" />
                ))}
              </div>
              <p className="text-foreground text-sm leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author}
                  className="h-10 w-10 rounded-full object-cover" 
                  loading="lazy"
                />
                <div>
                  <p className="font-medium text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Company logos */}
        <div className="mt-20 md:mt-24 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">
            Our users work at leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe', 'Apple', 'Netflix', 'Spotify'].map((company) => (
              <span key={company} className="text-lg font-semibold text-foreground/15 hover:text-foreground/30 transition-colors duration-500">
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
