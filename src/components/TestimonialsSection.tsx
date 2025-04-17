
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const testimonials = [
  {
    quote: "FlowCreate helped me land my dream job at Google! The ATS-friendly templates and clean designs made my resume stand out from the competition.",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "Google",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887"
  },
  {
    quote: "After struggling with my resume for weeks, I found FlowCreate and created a professional resume in just 30 minutes. The AI suggestions were incredibly helpful!",
    author: "Michael Chen",
    role: "Software Engineer",
    company: "Microsoft",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887"
  },
  {
    quote: "The built-in AI writer helped me highlight my achievements in a way I never could on my own. I've recommended FlowCreate to everyone in my network!",
    author: "Jessica Miller",
    role: "Marketing Director",
    company: "Adobe",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964"
  },
  {
    quote: "As a career coach, I recommend FlowCreate to all my clients. The templates are professional, modern, and most importantly, optimized for applicant tracking systems.",
    author: "David Wilson",
    role: "Career Coach",
    company: "CareerBoost",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887"
  },
  {
    quote: "FlowCreate helped me transition careers seamlessly. The industry-specific templates and content suggestions were exactly what I needed to highlight my transferable skills.",
    author: "Priya Patel",
    role: "Data Scientist",
    company: "Amazon",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success Stories from Our Users
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Join thousands of professionals who've advanced their careers with FlowCreate
          </p>
        </div>
        
        <div className="mt-12">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="bg-card border-border h-full">
                      <CardContent className="pt-6 h-full">
                        <div className="flex flex-col h-full">
                          <div className="mb-4 flex">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                          </div>
                          <div className="flex items-center mt-4">
                            <div className="mr-4">
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.author}
                                className="h-12 w-12 rounded-full object-cover" 
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{testimonial.author}</p>
                              <p className="text-sm text-muted-foreground">
                                {testimonial.role}, {testimonial.company}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex">
              <CarouselPrevious className="absolute -left-12" />
              <CarouselNext className="absolute -right-12" />
            </div>
          </Carousel>
        </div>
        
        {/* Company Logos Section */}
        <div className="mt-24 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-8">OUR USERS WORK AT LEADING COMPANIES WORLDWIDE</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe', 'Apple', 'Netflix', 'Spotify'].map((company) => (
              <div key={company} className="text-2xl font-bold text-foreground opacity-80">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
