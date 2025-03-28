
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    quote: "I landed my dream job thanks to FlowCreate! The templates are professional and the editor is so easy to use.",
    author: "Sarah Johnson",
    role: "Marketing Manager",
    company: "Tech Solutions Inc."
  },
  {
    quote: "After struggling with my resume for weeks, I found FlowCreate and created a standout resume in just 30 minutes.",
    author: "Michael Chen",
    role: "Software Engineer",
    company: "Innovate Labs"
  },
  {
    quote: "The ATS-friendly templates and professional designs helped me get more interviews than ever before.",
    author: "Jessica Miller",
    role: "HR Specialist",
    company: "Global Enterprises"
  },
];

const TestimonialsSection = () => {
  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What our users say
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Join thousands of job seekers who have found success with FlowCreate
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <svg className="h-8 w-8 text-primary mb-4" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="text-foreground mb-4">{testimonial.quote}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
