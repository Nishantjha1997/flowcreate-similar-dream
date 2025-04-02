
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Github, Heart, Code, Users, Coffee, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              About FlowCreate
            </h1>
            <p className="text-xl text-muted-foreground">
              A free, open-source resume building platform designed to make professional resume creation accessible to everyone.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg mx-auto">
              <h2 className="text-3xl font-bold mt-12 mb-6">Our Mission</h2>
              <p className="text-lg mb-6">
                FlowCreate was born from a simple belief: creating a professional resume shouldn't cost money or require design skills. 
                Our mission is to democratize access to high-quality resume tools, making them available to everyone 
                regardless of their financial situation.
              </p>
              <p className="text-lg mb-6">
                We believe that no one should miss out on job opportunities due to lack of access to premium resume building tools. 
                That's why FlowCreate is and will always remain completely free, with no paywalls, no premium tiers, 
                and no hidden limitations.
              </p>

              <div className="bg-muted rounded-lg p-8 my-10">
                <h3 className="text-2xl font-semibold mb-4 text-center">Our Core Values</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Accessibility</h4>
                    <p className="text-muted-foreground">All features available to everyone, no premium tiers</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Code className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Transparency</h4>
                    <p className="text-muted-foreground">Open-source code with community contributions</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">Quality</h4>
                    <p className="text-muted-foreground">Professional designs and user-friendly experience</p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mt-12 mb-6">Our Story</h2>
              <p className="text-lg mb-6">
                FlowCreate began as a passion project by a small team of developers and designers who were frustrated with 
                the lack of accessible, high-quality resume building tools. Many existing platforms were either 
                prohibitively expensive or offered severely limited functionality on their free plans.
              </p>
              <p className="text-lg mb-6">
                Launched in 2023, we set out to create a resume builder that offered premium-quality templates and features 
                without the premium price tag. Our commitment to remaining free and open-source has shaped every decision 
                we've made since.
              </p>
              <p className="text-lg mb-6">
                Today, FlowCreate is maintained by a growing community of contributors who share our vision of making 
                professional resume creation accessible to everyone. Our open-source codebase allows developers from 
                around the world to contribute features, fix bugs, and help improve the platform for all users.
              </p>

              <h2 className="text-3xl font-bold mt-12 mb-6">How We're Funded</h2>
              <p className="text-lg mb-6">
                FlowCreate operates on a community-supported model. We accept donations to cover basic hosting and 
                operational costs, but we don't rely on charging users for our service. This ensures that we can stay 
                true to our mission of accessibility while maintaining the high quality of our platform.
              </p>
              <p className="text-lg mb-6">
                Our code is completely open-source and available on GitHub, where we welcome contributions from developers 
                who share our vision. Many of our improvements come from volunteer contributors who donate their time and 
                expertise to make FlowCreate better for everyone.
              </p>

              <div className="bg-card border rounded-lg p-8 my-10">
                <h3 className="text-2xl font-semibold mb-4 text-center">Join Our Community</h3>
                <p className="text-center mb-6">
                  There are many ways to contribute to the FlowCreate project:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 pt-1">
                      <Github className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <strong>Contribute code:</strong> Help us improve the platform by fixing bugs, adding features, or improving design.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 pt-1">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <strong>Spread the word:</strong> Tell others about FlowCreate and help us reach more people who could benefit.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 pt-1">
                      <Coffee className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <strong>Support financially:</strong> Make a small donation to help cover our operational costs.
                    </div>
                  </li>
                </ul>
              </div>
              
              <h2 className="text-3xl font-bold mt-12 mb-6">Our Commitment to Users</h2>
              <p className="text-lg mb-6">
                We believe that your data belongs to you. We don't collect unnecessary personal information, and we don't 
                sell or share any of your data with third parties. The resumes you create are yours and yours alone.
              </p>
              <p className="text-lg mb-6">
                We're committed to continuous improvement based on user feedback. We regularly add new templates, features, 
                and improvements to make FlowCreate the best free resume builder available.
              </p>
              <p className="text-lg mb-6">
                Thank you for being part of our community. Together, we're making professional resume creation accessible to everyone.
              </p>
              
              <div className="text-center mt-12">
                <Link to="/resume-builder">
                  <Button size="lg" className="mt-4">
                    Start Building Your Resume <ArrowRight className="ml-2 h-5 w-5" />
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
