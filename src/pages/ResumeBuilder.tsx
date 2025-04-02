import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import { 
  Download, 
  FileText, 
  Share2, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award,
  Settings,
  Trash2,
  Plus,
  BookOpen
} from 'lucide-react';
import ResumeTemplate, { ResumeData } from '@/utils/resumeTemplates';

const exampleResumes: Record<string, ResumeData> = {
  "1": {
    personal: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "(555) 123-4567",
      address: "San Francisco, CA",
      summary: "Experienced marketing manager with 7 years of expertise in digital marketing, campaign management, and team leadership. Proven track record of increasing brand visibility and driving engagement across multiple platforms.",
      linkedin: "linkedin.com/in/alexmorgan"
    },
    experience: [
      {
        id: 1,
        title: "Senior Marketing Manager",
        company: "TechVision Inc.",
        location: "San Francisco, CA",
        startDate: "Jan 2020",
        endDate: "",
        current: true,
        description: "• Led rebranding initiative resulting in 40% increase in brand recognition\n• Managed a team of 5 marketing specialists and a $1.2M annual budget\n• Developed and executed comprehensive marketing campaigns across digital and traditional channels\n• Increased social media engagement by 65% and email open rates by 32%"
      },
      {
        id: 2,
        title: "Marketing Specialist",
        company: "InnovateTech",
        location: "Oakland, CA",
        startDate: "Mar 2017",
        endDate: "Dec 2019",
        current: false,
        description: "• Coordinated marketing campaigns across multiple channels\n• Created content for website, social media, and email newsletters\n• Analyzed campaign metrics and prepared monthly performance reports\n• Collaborated with sales team to align marketing strategies with sales goals"
      }
    ],
    education: [
      {
        id: 1,
        school: "University of California, Berkeley",
        degree: "Master's",
        field: "Marketing and Communications",
        startDate: "2015",
        endDate: "2017",
        description: "GPA: 3.8/4.0, Marketing Society President"
      },
      {
        id: 2,
        school: "San Francisco State University",
        degree: "Bachelor's",
        field: "Business Administration",
        startDate: "2011",
        endDate: "2015",
        description: "Dean's List, Marketing Club Member"
      }
    ],
    skills: ["Digital Marketing", "Campaign Management", "Social Media Strategy", "Market Research", "SEO/SEM", "Content Creation", "Google Analytics", "Adobe Creative Suite", "Project Management"],
    customization: {
      primaryColor: "#2563eb",
      fontFamily: "'Roboto', sans-serif",
      fontSize: "medium",
      spacing: "normal"
    }
  },
  "2": {
    personal: {
      name: "Jordan Taylor",
      email: "jordan.taylor@example.com",
      phone: "(555) 987-6543",
      address: "Seattle, WA",
      summary: "Software engineer with 5+ years of experience building scalable applications and APIs. Expertise in JavaScript, TypeScript, React, and Node.js. Passionate about clean code and delivering exceptional user experiences.",
      website: "jordantaylor.dev"
    },
    experience: [
      {
        id: 1,
        title: "Senior Frontend Engineer",
        company: "CloudTech Solutions",
        location: "Seattle, WA",
        startDate: "Jun 2021",
        endDate: "",
        current: true,
        description: "• Developed and maintained core features for the company's flagship SaaS platform using React and TypeScript\n• Improved application performance by 35% through code optimization and implementing lazy loading\n• Implemented CI/CD pipelines that reduced deployment time by 40%\n• Mentored junior developers and led frontend architecture discussions"
      },
      {
        id: 2,
        title: "Full Stack Developer",
        company: "InnoSoft Systems",
        location: "Portland, OR",
        startDate: "Aug 2018",
        endDate: "May 2021",
        current: false,
        description: "• Built RESTful APIs using Node.js and Express\n• Developed responsive web applications with React and Redux\n• Implemented authentication and authorization systems\n• Worked in an agile environment with two-week sprint cycles"
      }
    ],
    education: [
      {
        id: 1,
        school: "University of Washington",
        degree: "Bachelor's",
        field: "Computer Science",
        startDate: "2014",
        endDate: "2018",
        description: "Minor in Mathematics, Coding Club Member"
      }
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Git", "AWS", "Docker", "REST APIs", "GraphQL"],
    projects: [
      {
        id: 1,
        title: "Weather Dashboard",
        description: "A React application that displays weather forecasts using the OpenWeatherMap API.",
        link: "github.com/jordantaylor/weather-dashboard",
        technologies: ["React", "CSS", "RESTful APIs"]
      },
      {
        id: 2,
        title: "E-commerce Backend",
        description: "A Node.js backend for an e-commerce platform with product, user, and order management.",
        link: "github.com/jordantaylor/ecommerce-api",
        technologies: ["Node.js", "Express", "MongoDB", "JWT"]
      }
    ],
    customization: {
      primaryColor: "#003366",
      secondaryColor: "#555555",
      fontFamily: "'Montserrat', sans-serif",
      fontSize: "medium",
      spacing: "normal"
    }
  },
  "3": {
    personal: {
      name: "Taylor Rodriguez",
      email: "taylor.rodriguez@example.com",
      phone: "(555) 456-7890",
      address: "Austin, TX",
      summary: "Creative designer with a passion for crafting visually stunning and intuitive user experiences. Specializing in UI/UX design, brand identity, and digital media.",
      website: "taylor-design.co"
    },
    experience: [
      {
        id: 1,
        title: "Senior UX Designer",
        company: "CreativeSpace Agency",
        location: "Austin, TX",
        startDate: "Mar 2022",
        endDate: "",
        current: true,
        description: "• Led the redesign of client's flagship product, increasing user engagement by 40%\n• Created wireframes, prototypes, and high-fidelity mockups using Figma\n• Conducted user interviews and usability testing to inform design decisions\n• Collaborated with development team to ensure design implementation"
      },
      {
        id: 2,
        title: "UI Designer",
        company: "Digital Innovations",
        location: "Houston, TX",
        startDate: "Jun 2019",
        endDate: "Feb 2022",
        current: false,
        description: "• Designed user interfaces for web and mobile applications\n• Created and maintained design systems for consistency across products\n• Developed interactive prototypes for client presentations\n• Produced visual assets including icons, illustrations, and marketing materials"
      }
    ],
    education: [
      {
        id: 1,
        school: "Rhode Island School of Design",
        degree: "Bachelor's",
        field: "Graphic Design",
        startDate: "2015",
        endDate: "2019",
        description: "Design Excellence Award, Student Design Association"
      }
    ],
    skills: ["UI/UX Design", "Figma", "Adobe Creative Suite", "Wireframing", "Prototyping", "User Research", "Interaction Design", "Typography", "Color Theory", "Brand Identity", "Web Design", "Mobile Design"],
    projects: [
      {
        id: 1,
        title: "Fitness App Redesign",
        description: "Complete redesign of a fitness tracking application focusing on improved usability and visual appeal.",
        link: "behance.net/taylor-rodriguez/fitness-app",
        technologies: ["Figma", "Photoshop", "Illustrator"]
      }
    ],
    customization: {
      primaryColor: "#FF6B6B",
      secondaryColor: "#333333",
      fontFamily: "'Poppins', sans-serif",
      fontSize: "medium",
      spacing: "spacious"
    }
  },
  "4": {
    personal: {
      name: "Morgan Zhang",
      email: "morgan.zhang@example.com",
      phone: "(555) 789-0123",
      address: "Boston, MA",
      summary: "Data scientist with expertise in machine learning, statistical analysis, and data visualization. Experienced in translating complex business problems into data-driven solutions.",
      linkedin: "linkedin.com/in/morganzhang"
    },
    experience: [
      {
        id: 1,
        title: "Lead Data Scientist",
        company: "AnalyticsPro",
        location: "Boston, MA",
        startDate: "Aug 2021",
        endDate: "",
        current: true,
        description: "• Developed machine learning models that increased prediction accuracy by 25%\n• Led a team of 3 data scientists working on customer segmentation projects\n• Created automated reporting dashboards using Python and Tableau\n• Collaborated with product and engineering teams to implement data-driven features"
      },
      {
        id: 2,
        title: "Data Analyst",
        company: "TechMetrics",
        location: "Cambridge, MA",
        startDate: "May 2019",
        endDate: "Jul 2021",
        current: false,
        description: "• Performed statistical analysis on large datasets to identify trends and patterns\n• Built predictive models using Python and scikit-learn\n• Created interactive data visualizations using Tableau\n• Produced regular reports and presentations for executive team"
      }
    ],
    education: [
      {
        id: 1,
        school: "Massachusetts Institute of Technology",
        degree: "Master's",
        field: "Data Science",
        startDate: "2017",
        endDate: "2019",
        description: "GPA: 3.9/4.0, Research Assistant in ML Lab"
      },
      {
        id: 2,
        school: "University of Michigan",
        degree: "Bachelor's",
        field: "Computer Science",
        startDate: "2013",
        endDate: "2017",
        description: "Minor in Statistics, Dean's List"
      }
    ],
    skills: ["Python", "R", "SQL", "Machine Learning", "Statistical Analysis", "Data Visualization", "Tableau", "Pandas", "TensorFlow", "scikit-learn", "A/B Testing", "Big Data"],
    projects: [
      {
        id: 1,
        title: "Customer Churn Prediction",
        description: "Built a machine learning model to predict customer churn with 87% accuracy.",
        link: "github.com/morganzhang/churn-prediction",
        technologies: ["Python", "scikit-learn", "Pandas"]
      }
    ],
    customization: {
      primaryColor: "#4CAF50",
      secondaryColor: "#555555",
      fontFamily: "'Roboto Mono', monospace",
      fontSize: "small",
      spacing: "compact"
    }
  },
  "5": {
    personal: {
      name: "Riley Johnson",
      email: "riley.johnson@example.com",
      phone: "(555) 234-5678",
      address: "Chicago, IL",
      summary: "Versatile project manager with 8+ years of experience in leading cross-functional teams and delivering high-impact projects on time and within budget.",
      linkedin: "linkedin.com/in/rileyjohnson"
    },
    experience: [
      {
        id: 1,
        title: "Senior Project Manager",
        company: "Enterprise Solutions Inc.",
        location: "Chicago, IL",
        startDate: "Feb 2019",
        endDate: "",
        current: true,
        description: "• Led enterprise-wide digital transformation projects with budgets exceeding $2M\n• Managed cross-functional teams of up to 15 members across different departments\n• Implemented agile methodologies that improved project delivery time by 30%\n• Developed comprehensive project plans, risk assessments, and status reports"
      },
      {
        id: 2,
        title: "Project Coordinator",
        company: "Innovative Systems",
        location: "Detroit, MI",
        startDate: "Jul 2015",
        endDate: "Jan 2019",
        current: false,
        description: "• Assisted in planning and executing multiple simultaneous projects\n• Coordinated communication between stakeholders, vendors, and team members\n• Tracked project milestones, deliverables, and budget allocations\n• Prepared and maintained project documentation and reports"
      }
    ],
    education: [
      {
        id: 1,
        school: "Northwestern University",
        degree: "MBA",
        field: "Project Management",
        startDate: "2013",
        endDate: "2015",
        description: "Leadership Excellence Award"
      },
      {
        id: 2,
        school: "University of Illinois",
        degree: "Bachelor's",
        field: "Business Administration",
        startDate: "2009",
        endDate: "2013",
        description: "Minor in Information Systems"
      }
    ],
    skills: ["Project Management", "Agile Methodologies", "Budgeting", "Risk Management", "Stakeholder Communication", "Microsoft Project", "JIRA", "Scrum", "Team Leadership", "Strategic Planning", "Process Improvement", "Change Management"],
    customization: {
      primaryColor: "#003366",
      secondaryColor: "#666666",
      fontFamily: "'Montserrat', sans-serif",
      fontSize: "medium",
      spacing: "normal"
    }
  }
};

const templateNames: Record<string, string> = {
  "1": "modern",
  "2": "classic",
  "3": "creative",
  "4": "technical",
  "5": "professional"
};

const emptyExperience = {
  id: 0,
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
};

const emptyEducation = {
  id: 0,
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  description: '',
};

const ResumeBuilder = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || '1';
  const isExample = searchParams.get('example') === 'true';
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [resume, setResume] = useState<ResumeData>({
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
    customization: {
      primaryColor: '#2563eb',
      secondaryColor: '#6b7280',
      fontSize: 'medium',
      spacing: 'normal'
    }
  });

  useEffect(() => {
    if (isExample) {
      const exampleId = templateId;
      if (exampleResumes[exampleId]) {
        setResume(exampleResumes[exampleId]);
      }
    } else {
      const templateKey = templateNames[templateId];
      let primaryColor = '#2563eb';
      let secondaryColor = '#6b7280';
      
      switch(templateKey) {
        case 'modern':
          primaryColor = '#2563eb';
          secondaryColor = '#6b7280';
          break;
        case 'classic':
          primaryColor = '#000000';
          secondaryColor = '#333333';
          break;
        case 'creative':
          primaryColor = '#FF6B6B';
          secondaryColor = '#FFE66D';
          break;
        case 'technical':
          primaryColor = '#4CAF50';
          secondaryColor = '#333333';
          break;
        case 'professional':
          primaryColor = '#003366';
          secondaryColor = '#555555';
          break;
      }
      
      setResume(prev => ({
        ...prev,
        customization: {
          ...prev.customization,
          primaryColor,
          secondaryColor
        }
      }));
    }
  }, [templateId, isExample]);

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

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [name]: value,
      };
      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const handleCurrentJobToggle = (checked: boolean, index: number) => {
    setResume((prev) => {
      const updatedExperience = [...prev.experience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        current: checked,
        endDate: checked ? '' : updatedExperience[index].endDate,
      };
      return {
        ...prev,
        experience: updatedExperience,
      };
    });
  };

  const addExperience = () => {
    setResume((prev) => {
      const newId = prev.experience.length > 0 
        ? Math.max(...prev.experience.map(e => e.id)) + 1 
        : 1;
        
      return {
        ...prev,
        experience: [
          ...prev.experience,
          { ...emptyExperience, id: newId },
        ],
      };
    });
  };

  const removeExperience = (id: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    setResume((prev) => {
      const updatedEducation = [...prev.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [name]: value,
      };
      return {
        ...prev,
        education: updatedEducation,
      };
    });
  };

  const addEducation = () => {
    setResume((prev) => {
      const newId = prev.education.length > 0 
        ? Math.max(...prev.education.map(e => e.id)) + 1 
        : 1;
        
      return {
        ...prev,
        education: [
          ...prev.education,
          { ...emptyEducation, id: newId },
        ],
      };
    });
  };

  const removeEducation = (id: number) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const skillsString = e.target.value;
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    
    setResume((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const getSkillsString = () => {
    return resume.skills.join(', ');
  };
  
  const handleCustomizationChange = (customization: ResumeData['customization']) => {
    setResume(prev => ({
      ...prev,
      customization
    }));
  };

  const handleDownload = () => {
    toast({
      title: "Resume Downloaded",
      description: "Your resume has been downloaded as a PDF.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Resume Shared",
      description: "A shareable link has been copied to your clipboard.",
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
              <Button size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                          variant={activeSection === 'projects' ? 'default' : 'ghost'} 
                          className="w-full justify-start"
                          onClick={() => setActiveSection('projects')}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Projects
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
                        {[1, 2, 3, 4, 5].map((id) => (
                          <div 
                            key={id}
                            className={`cursor-pointer border rounded-md overflow-hidden ${
                              templateId === id.toString() ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => {
                              const url = new URL(window.location.href);
                              url.searchParams.set('template', id.toString());
                              window.history.pushState({}, '', url.toString());
                              window.location.reload();
                            }}
                          >
                            <img 
                              src={`https://images.unsplash.com/photo-1461749280684-dccba630e2f6`} 
                              alt={`Template ${id}`} 
                              className="w-full aspect-[3/4] object-cover"
                            />
                            <div className="p-2 text-xs font-medium text-center">
                              {id === 1 && "Modern"}
                              {id === 2 && "Classic"}
                              {id === 3 && "Creative"}
                              {id === 4 && "Technical"}
                              {id === 5 && "Professional"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <Card>
                <CardContent className="p-6">
                  {activeSection === 'personal' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="name" className="block text-sm font-medium mb-1">
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={resume.personal.name}
                            onChange={handlePersonalInfoChange}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                          </Label>
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            value={resume.personal.email}
                            onChange={handlePersonalInfoChange}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="block text-sm font-medium mb-1">
                            Phone
                          </Label>
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={resume.personal.phone}
                            onChange={handlePersonalInfoChange}
                            placeholder="(123) 456-7890"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address" className="block text-sm font-medium mb-1">
                            Location
                          </Label>
                          <Input
                            type="text"
                            id="address"
                            name="address"
                            value={resume.personal.address}
                            onChange={handlePersonalInfoChange}
                            placeholder="City, Country"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="block text-sm font-medium mb-1">
                            Website (Optional)
                          </Label>
                          <Input
                            type="text"
                            id="website"
                            name="website"
                            value={resume.personal.website || ''}
                            onChange={handlePersonalInfoChange}
                            placeholder="yourwebsite.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="linkedin" className="block text-sm font-medium mb-1">
                            LinkedIn (Optional)
                          </Label>
                          <Input
                            type="text"
                            id="linkedin"
                            name="linkedin"
                            value={resume.personal.linkedin || ''}
                            onChange={handlePersonalInfoChange}
                            placeholder="linkedin.com/in/username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="summary" className="block text-sm font-medium mb-1">
                            Professional Summary
                          </Label>
                          <Textarea
                            id="summary"
                            name="summary"
                            value={resume.personal.summary}
                            onChange={handlePersonalInfoChange}
                            rows={4}
                            placeholder="Write a professional summary..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'experience' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Work Experience</h2>
                      <p className="text-muted-foreground">Add your professional experience, starting with the most recent.</p>
                      
                      {resume.experience.map((exp, index) => (
                        <div key={exp.id} className="p-4 border rounded-md space-y-4 relative">
                          {resume.experience.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExperience(exp.id)}
                              className="absolute right-2 top-2 h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <div>
                            <Label htmlFor={`title-${index}`} className="block text-sm font-medium mb-1">
                              Job Title
                            </Label>
                            <Input
                              id={`title-${index}`}
                              name="title"
                              value={exp.title}
                              onChange={(e) => handleExperienceChange(e, index)}
                              placeholder="Marketing Manager"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`company-${index}`} className="block text-sm font-medium mb-1">
                              Company
                            </Label>
                            <Input
                              id={`company-${index}`}
                              name="company"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(e, index)}
                              placeholder="Company Name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`location-${index}`} className="block text-sm font-medium mb-1">
                              Location (Optional)
                            </Label>
                            <Input
                              id={`location-${index}`}
                              name="location"
                              value={exp.location}
                              onChange={(e) => handleExperienceChange(e, index)}
                              placeholder="City, Country"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`startDate-${index}`} className="block text-sm font-medium mb-1">
                                Start Date
                              </Label>
                              <Input
                                id={`startDate-${index}`}
                                name="startDate"
                                value={exp.startDate}
                                onChange={(e) => handleExperienceChange(e, index)}
                                placeholder="Jan 2020"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`endDate-${index}`} className="block text-sm font-medium mb-1">
                                End Date
                              </Label>
                              <Input
                                id={`endDate-${index}`}
                                name="endDate"
                                value={exp.endDate}
                                onChange={(e) => handleExperienceChange(e, index)}
                                placeholder="Dec 2022"
                                disabled={exp.current}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch 
                              id={`current-${index}`}
                              checked={exp.current}
                              onCheckedChange={(checked) => handleCurrentJobToggle(checked, index)}
                            />
                            <Label htmlFor={`current-${index}`}>I currently work here</Label>
                          </div>
                          
                          <div>
                            <Label htmlFor={`description-${index}`} className="block text-sm font-medium mb-1">
                              Description
                            </Label>
                            <Textarea
                              id={`description-${index}`}
                              name="description"
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(e, index)}
                              rows={4}
                              placeholder="Describe your responsibilities and achievements..."
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Tip: Use bullet points (•) to format your description.
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full" onClick={addExperience}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                  )}

                  {activeSection === 'education' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Education</h2>
                      <p className="text-muted-foreground">Add your educational background, starting with the most recent.</p>
                      
                      {resume.education.map((edu, index) => (
                        <div key={edu.id} className="p-4 border rounded-md space-y-4 relative">
                          {resume.education.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeEducation(edu.id)}
                              className="absolute right-2 top-2 h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <div>
                            <Label htmlFor={`school-${index}`} className="block text-sm font-medium mb-1">
                              School/University
                            </Label>
                            <Input
                              id={`school-${index}`}
                              name="school"
                              value={edu.school}
                              onChange={(e) => handleEducationChange(e, index)}
                              placeholder="University Name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`degree-${index}`} className="block text-sm font-medium mb-1">
                              Degree
                            </Label>
                            <Input
                              id={`degree-${index}`}
                              name="degree"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(e, index)}
                              placeholder="Bachelor's, Master's, etc."
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`field-${index}`} className="block text-sm font-medium mb-1">
                              Field of Study
                            </Label>
                            <Input
                              id={`field-${index}`}
                              name="field"
                              value={edu.field}
                              onChange={(e) => handleEducationChange(e, index)}
                              placeholder="Computer Science, Business, etc."
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`eduStartDate-${index}`} className="block text-sm font-medium mb-1">
                                Start Date
                              </Label>
                              <Input
                                id={`eduStartDate-${index}`}
                                name="startDate"
                                value={edu.startDate}
                                onChange={(e) => handleEducationChange(e, index)}
                                placeholder="2018"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`eduEndDate-${index}`} className="block text-sm font-medium mb-1">
                                End Date (or Expected)
                              </Label>
                              <Input
                                id={`eduEndDate-${index}`}
                                name="endDate"
                                value={edu.endDate}
                                onChange={(e) => handleEducationChange(e, index)}
                                placeholder="2022"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`eduDescription-${index}`} className="block text-sm font-medium mb-1">
                              Description (Optional)
                            </Label>
                            <Textarea
                              id={`eduDescription-${index}`}
                              name="description"
                              value={edu.description}
                              onChange={(e) => handleEducationChange(e, index)}
                              rows={2}
                              placeholder="GPA, honors, relevant coursework, etc."
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full" onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Skills</h2>
                      <p className="text-muted-foreground">Add your key skills, separated by commas.</p>
                      
                      <div>
                        <Label htmlFor="skills" className="block text-sm font-medium mb-1">
                          Skills
                        </Label>
                        <Textarea
                          id="skills"
                          value={getSkillsString()}
                          onChange={handleSkillsChange}
                          rows={4}
                          placeholder="JavaScript, React, Project Management, Leadership"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: JavaScript, React, Customer Service, Team Leadership
                        </p>
                      </div>
                      
                      {resume.skills.length > 0 && (
                        <div>
                          <Label className="block text-sm font-medium mb-2">
                            Your Skills
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {resume.skills.map((skill, index) => (
                              <div key={index} className="bg-muted px-3 py-1 rounded-md text-sm">
                                {skill}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSection === 'projects' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold">Projects</h2>
                      <p className="text-muted-foreground">Add your personal or professional projects to showcase your work.</p>
                      
                      {!resume.projects || resume.projects.length === 0 ? (
                        <div className="p-6 border border-dashed rounded-md text-center">
                          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium">Add Your First Project</h3>
                          <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Showcase your work by adding details about projects you've worked on.
                          </p>
                          <Button
                            onClick={() => {
                              setResume(prev => ({
                                ...prev,
                                projects: [
                                  {
                                    id: 1,
                                    title: '',
                                    description: '',
                                    technologies: []
                                  }
                                ]
                              }));
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                      ) : (
                        <>
                          {resume.projects.map((project, index) => (
                            <div key={project.id} className="p-4 border rounded-md space-y-4 relative">
                              {resume.projects && resume.projects.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setResume(prev => ({
                                      ...prev,
                                      projects: prev.projects?.filter(p => p.id !== project.id)
                                    }));
                                  }}
                                  className="absolute right-2 top-2 h-8 w-8 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <div>
                                <Label htmlFor={`projectTitle-${index}`} className="block text-sm font-medium mb-1">
                                  Project Title
                                </Label>
                                <Input
                                  id={`projectTitle-${index}`}
                                  value={project.title}
                                  onChange={(e) => {
                                    setResume(prev => {
                                      const updatedProjects = [...(prev.projects || [])];
                                      updatedProjects[index] = {
                                        ...updatedProjects[index],
                                        title: e.target.value
                                      };
                                      return { ...prev, projects: updatedProjects };
                                    });
                                  }}
                                  placeholder="E-commerce Website"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`projectDescription-${index}`} className="block text-sm font-medium mb-1">
                                  Description
                                </Label>
                                <Textarea
                                  id={`projectDescription-${index}`}
                                  value={project.description}
                                  onChange={(e) => {
                                    setResume(prev => {
                                      const updatedProjects = [...(prev.projects || [])];
                                      updatedProjects[index] = {
                                        ...updatedProjects[index],
                                        description: e.target.value
                                      };
                                      return { ...prev, projects: updatedProjects };
                                    });
                                  }}
                                  rows={3}
                                  placeholder="Describe your project, its purpose, and your role..."
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`projectLink-${index}`} className="block text-sm font-medium mb-1">
                                  Link (Optional)
                                </Label>
                                <Input
                                  id={`projectLink-${index}`}
                                  value={project.link || ''}
                                  onChange={(e) => {
                                    setResume(prev => {
                                      const updatedProjects = [...(prev.projects || [])];
                                      updatedProjects[index] = {
                                        ...updatedProjects[index],
                                        link: e.target.value
                                      };
                                      return { ...prev, projects: updatedProjects };
                                    });
                                  }}
                                  placeholder="https://github.com/yourusername/project"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`projectTech-${index}`} className="block text-sm font-medium mb-1">
                                  Technologies Used (comma separated)
                                </Label>
                                <Input
                                  id={`projectTech-${index}`}
                                  value={(project.technologies || []).join(', ')}
                                  onChange={(e) => {
                                    const techs = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                    setResume(prev => {
                                      const updatedProjects = [...(prev.projects || [])];
                                      updatedProjects[index] = {
                                        ...updatedProjects[index],
                                        technologies: techs
                                      };
                                      return { ...prev, projects: updatedProjects };
                                    });
                                  }}
                                  placeholder="React, Node.js, MongoDB"
                                />
                              </div>
                            </div>
                          ))}
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              setResume(prev => {
                                const projects = prev.projects || [];
                                const newId = projects.length > 0 
                                  ? Math.max(...projects.map(p => p.id)) + 1 
                                  : 1;
                                
                                return {
                                  ...prev,
                                  projects: [
                                    ...projects,
                                    {
                                      id: newId,
                                      title: '',
                                      description: '',
                                      technologies: []
                                    }
                                  ]
                                };
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {activeSection === 'customize' && (
                    <CustomizationPanel 
                      customization={resume.customization} 
                      onCustomizationChange={handleCustomizationChange}
                      resumeData={resume}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col">
                <div className="p-4 bg-muted flex items-center justify-between border-b">
                  <h3 className="font-medium">Preview</h3>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Full Preview
                  </Button>
                </div>
                <CardContent className="flex-1 p-0 relative overflow-auto">
                  {(resume.personal.name || resume.experience.some(e => e.title || e.company)) ? (
                    <div className="absolute inset-0 overflow-auto" style={{ zoom: 0.65 }}>
                      <ResumeTemplate 
                        data={resume} 
                        templateName={templateNames[templateId]} 
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-background border-dashed border-2 m-4 rounded-md">
                      <div className="text-center p-4">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="text-lg font-medium mt-2">Resume Preview</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Start filling in your information to see your resume take shape.
                        </p>
                      </div>
                    </div>
                  )}
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
