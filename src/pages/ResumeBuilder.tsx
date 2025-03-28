
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Share2, User, Briefcase, GraduationCap, Award, Settings } from 'lucide-react';

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || '1';
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [resume, setResume] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
    },
    experience: [
      {
        id: 1,
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ],
    education: [
      {
        id: 1,
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        description: '',
      },
    ],
    skills: [],
  });

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [name]: value,
      },
    }));
  };

  const handleDownload = () => {
    toast({
      title: "Resume Downloaded",
      description: "Your resume has been downloaded as a PDF.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Resume Builder</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue="sections" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sections">Sections</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="sections">
                      <div className="p-4 space-y-2">
                        <Button 
                          variant={activeSection === 'personal' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveSection('personal')}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Personal Info
                        </Button>
                        <Button 
                          variant={activeSection === 'experience' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveSection('experience')}
                        >
                          <Briefcase className="h-4 w-4 mr-2" />
                          Experience
                        </Button>
                        <Button 
                          variant={activeSection === 'education' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveSection('education')}
                        >
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Education
                        </Button>
                        <Button 
                          variant={activeSection === 'skills' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveSection('skills')}
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Skills
                        </Button>
                        <Button 
                          variant={activeSection === 'customize' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveSection('customize')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Customize
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="templates">
                      <div className="p-4 grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4].map((id) => (
                          <div 
                            key={id}
                            className={`cursor-pointer border rounded-md overflow-hidden ${
                              templateId === id.toString() ? 'ring-2 ring-primary' : ''
                            }`}
                          >
                            <img 
                              src={`https://images.unsplash.com/photo-1461749280684-dccba630e2f6`} 
                              alt={`Template ${id}`} 
                              className="w-full aspect-[3/4] object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-5">
              <Card>
                <CardContent className="p-6">
                  {activeSection === 'personal' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={resume.personal.name}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={resume.personal.email}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={resume.personal.phone}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="(123) 456-7890"
                          />
                        </div>
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-foreground mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={resume.personal.address}
                            onChange={handlePersonalInfoChange}
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <label htmlFor="summary" className="block text-sm font-medium text-foreground mb-1">
                            Professional Summary
                          </label>
                          <textarea
                            id="summary"
                            name="summary"
                            value={resume.personal.summary}
                            onChange={handlePersonalInfoChange}
                            rows={4}
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="Write a professional summary..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'experience' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Work Experience</h2>
                      <p className="text-muted-foreground">Add your work experience details here.</p>
                      {/* Experience form fields would go here */}
                      <Button variant="outline" className="w-full mt-4">
                        + Add Experience
                      </Button>
                    </div>
                  )}

                  {activeSection === 'education' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Education</h2>
                      <p className="text-muted-foreground">Add your educational background here.</p>
                      {/* Education form fields would go here */}
                      <Button variant="outline" className="w-full mt-4">
                        + Add Education
                      </Button>
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Skills</h2>
                      <p className="text-muted-foreground">Add your key skills and competencies.</p>
                      {/* Skills form fields would go here */}
                      <Button variant="outline" className="w-full mt-4">
                        + Add Skill
                      </Button>
                    </div>
                  )}

                  {activeSection === 'customize' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Customize</h2>
                      <p className="text-muted-foreground">Customize your resume design and layout.</p>
                      {/* Customization options would go here */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview */}
            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col">
                <div className="p-4 bg-muted flex items-center justify-between border-b">
                  <h3 className="font-medium">Preview</h3>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
                <CardContent className="flex-1 p-0 relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-background border-dashed border-2 m-4 rounded-md">
                    <div className="text-center p-4">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="text-lg font-medium mt-2">Resume Preview</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start filling in your information to see your resume take shape.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
