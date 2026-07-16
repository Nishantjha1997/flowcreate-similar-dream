
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, Zap, ArrowRight, User, Mail } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';

const About = () => {
  usePageMeta({
    title: 'About Us - FlowCreate',
    description: 'FlowCreate is a free online resume builder. Our premium plans with AI-powered features help cover API costs and keep the platform running for everyone.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              About FlowCreate
            </h1>
            <p className="text-xl text-muted-foreground">
              A free online resume builder with AI-powered features — built to help everyone create professional resumes that land interviews.
            </p>
          </div>
          </ScrollReveal>
          
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg mx-auto">
              <ScrollReveal delay={50}>
              <h2 className="text-3xl font-bold mt-12 mb-6">Our Mission</h2>
              <p className="text-lg mb-6">
                FlowCreate was born from a simple belief: creating a professional resume shouldn't require expensive software 
                or design skills. Our mission is to make high-quality resume building accessible to everyone — job seekers, 
                career changers, and professionals at every stage.
              </p>
              <p className="text-lg mb-6">
                The core resume builder is and will always remain <strong>completely free</strong>. You can create, customize, 
                and download a professional resume without ever reaching for your wallet. No trial periods, no hidden fees — 
                just a great resume builder available to anyone with an internet connection.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={100}>
              <div className="bg-muted rounded-lg p-8 my-10">
                <h3 className="text-2xl font-semibold mb-4 text-center">Our Core Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Accessibility</h4>
                    <p className="text-muted-foreground">Free resume builder available to everyone, no exceptions</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Quality</h4>
                    <p className="text-muted-foreground">Professionally designed templates that make you stand out</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Sustainability</h4>
                    <p className="text-muted-foreground">Premium plans fund our servers, AI costs, and ongoing development</p>
                  </div>
                </div>
              </div>
              </ScrollReveal>

              <ScrollReveal delay={100}>
              <h2 className="text-3xl font-bold mt-12 mb-6">Our Story</h2>
              <p className="text-lg mb-6">
                FlowCreate began as a passion project by a solo developer who was frustrated with the state of online 
                resume builders. Most platforms were either expensive subscription services or offered severely limited 
                free versions that produced unprofessional-looking results.
              </p>
              <p className="text-lg mb-6">
                Launched in 2023, we set out to build a resume creator that was genuinely free at its core — with 
                beautiful templates, ATS-friendly formatting, and a clean, modern interface. No watermarks, no 
                "free trial" gimmicks, no forcing you to enter credit card details just to download your own resume.
              </p>
              <p className="text-lg mb-6">
                As we grew, we added AI-powered features — smart content suggestions, auto-formatting, and 
                ATS optimization — to help users create even better resumes faster. These AI capabilities come 
                with real API costs, which is why we introduced affordable premium plans. Every subscription helps 
                us pay for the infrastructure, AI services, and ongoing improvements that keep FlowCreate running.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={150}>
              <h2 className="text-3xl font-bold mt-12 mb-6">Why Premium Plans Exist</h2>
              <p className="text-lg mb-6">
                We're committed to keeping the core resume builder <strong>free forever</strong>. You can always create, 
                edit, and download a professional resume at no cost. But running a modern web platform isn't free:
              </p>
              <ul className="space-y-3 mb-6 list-disc list-inside">
                <li className="text-lg">
                  <strong>AI API costs</strong> — Every AI suggestion, content improvement, and smart formatting feature 
                  calls external AI services that charge per request. These costs add up quickly as more users join.
                </li>
                <li className="text-lg">
                  <strong>Server & infrastructure</strong> — Hosting, databases, CDN delivery, and PDF generation all 
                  require reliable cloud infrastructure that comes with monthly bills.
                </li>
                <li className="text-lg">
                  <strong>Ongoing development</strong> — New templates, features, security updates, and platform 
                  improvements require dedicated development time and resources.
                </li>
              </ul>
              <p className="text-lg mb-6">
                Our premium plans — starting at just ₹299/month — give power users access to unlimited resumes, 
                unlimited AI suggestions, cloud backup, and priority support. For everyone else, the free plan 
                covers all the essentials: one resume, all templates, live preview, and PDF download.
              </p>
              </ScrollReveal>

              <ScrollReveal delay={200}>
              <h2 className="text-3xl font-bold mt-12 mb-6">Our Commitment to You</h2>
              <p className="text-lg mb-6">
                Your data belongs to you. We don't sell, share, or monetize your personal information. The resumes 
                you create are yours — we don't claim ownership, and we don't use your content to train AI models.
              </p>
              <p className="text-lg mb-6">
                We're committed to continuous improvement. We regularly add new templates, refine existing features, 
                and listen closely to user feedback. Every update we ship is aimed at one goal: helping you land 
                more interviews.
              </p>
              <p className="text-lg mb-6">
                Thank you for trusting FlowCreate with your career journey. Whether you're building your first resume 
                or your fiftieth, we're honored to be part of your story.
              </p>
              </ScrollReveal>
              
              {/* About the Creator Section */}
              <ScrollReveal delay={250}>
              <div className="bg-muted rounded-xl p-8 mt-16">
                <h3 className="text-2xl font-semibold mb-4 text-center flex items-center justify-center gap-2">
                  <User className="h-6 w-6 text-primary" /> About the Creator
                </h3>
                <div className="text-center mb-2">
                  <span className="font-bold text-lg text-foreground">
                    Nishant
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <a 
                      href="mailto:hinishaant@gmail.com"
                      className="text-primary underline hover:text-primary/80"
                    >
                      hinishaant@gmail.com
                    </a>
                  </div>
                </div>
                <p className="text-base text-muted-foreground text-center italic">
                  "My mission is to empower job seekers globally by providing a free, professional resume builder — with premium AI tools for those who want an extra edge."
                </p>
              </div>
              </ScrollReveal>
              
              <div className="text-center mt-12">
                <Link to="/resume-builder">
                  <Button size="lg" className="mt-4">
                    Start Building Your Free Resume <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
