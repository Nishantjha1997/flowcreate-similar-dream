
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Share2, 
  Clock, 
  Layout, 
  PenTool, 
  CheckCircle,
  Star,
  ArrowRight,
  Layers,
  Globe,
  Zap
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Layout className="h-8 w-8 text-primary" />,
      title: "Professional Templates",
      description: "Choose from dozens of expertly-designed templates suitable for all industries and career levels."
    },
    {
      icon: <PenTool className="h-8 w-8 text-primary" />,
      title: "Easy Customization",
      description: "Easily customize colors, fonts, and layouts to create a unique resume that reflects your personal brand."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Real-time Preview",
      description: "See changes instantly as you edit, ensuring your resume looks exactly how you want it."
    },
    {
      icon: <Layers className="h-8 w-8 text-primary" />,
      title: "Content Suggestions",
      description: "Get expert suggestions for each section of your resume based on your industry and role."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "ATS-Friendly",
      description: "All our templates are optimized to pass through Applicant Tracking Systems used by employers."
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "Multiple Export Options",
      description: "Download your resume as PDF, DOCX, or TXT formats to suit different application requirements."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Cloud Storage",
      description: "Save your resumes in the cloud and access them anywhere, anytime from any device."
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Easy Sharing",
      description: "Generate a shareable link to your resume that you can send to potential employers."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Version History",
      description: "Keep track of different versions of your resume and revert to previous versions if needed."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Powerful Features to Create Standout Resumes
              </h1>
              <p className="mt-6 text-xl text-muted-foreground">
                Everything you need to build professional resumes that get noticed by recruiters and hiring managers.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/resume-builder">
                  <Button size="lg">
                    Start Building Your Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/templates">
                  <Button variant="outline" size="lg">
                    Browse Templates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Create a professional resume in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
                <p className="text-muted-foreground">
                  Browse our collection of professionally designed templates and select one that suits your style.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                  <PenTool className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fill in Your Details</h3>
                <p className="text-muted-foreground">
                  Add your experience, education, skills, and other details using our easy-to-use interface.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Download & Share</h3>
                <p className="text-muted-foreground">
                  Download your completed resume in your preferred format or share it directly with employers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-xl text-muted-foreground">
                Don't just take our word for it - hear from people who have used FlowCreate
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  "I landed my dream job using a resume I created with FlowCreate. The templates are professional and the interface is so intuitive. Highly recommend!"
                </p>
                <p className="font-semibold">Sarah T.</p>
                <p className="text-sm text-muted-foreground">Marketing Manager</p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  "As a student with limited work experience, I was worried about my resume. FlowCreate helped me highlight my skills and education in a way that impressed employers."
                </p>
                <p className="font-semibold">Michael J.</p>
                <p className="text-sm text-muted-foreground">Recent Graduate</p>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  "I've tried many resume builders, and FlowCreate is by far the best. It's completely free but offers features that premium services charge for. Amazing tool!"
                </p>
                <p className="font-semibold">David L.</p>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl hero-gradient p-8 md:p-12 lg:p-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to create a resume that gets results?
                </h2>
                <p className="mt-4 text-xl text-blue-100">
                  Join thousands of job seekers who have found success with FlowCreate
                </p>
                <div className="mt-8">
                  <Link to="/resume-builder">
                    <Button size="lg" className="bg-white text-primary hover:bg-blue-50">
                      Build My Resume <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
