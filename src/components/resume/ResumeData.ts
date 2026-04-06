import { ResumeData } from '@/utils/resumeAdapterUtils';

export const emptyExperience = {
  id: 0,
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
};

export const emptyEducation = {
  id: 0,
  school: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  description: '',
};

export const emptyProject = {
  id: 0,
  title: '',
  description: '',
  link: '',
  technologies: [],
};

export const exampleResumes: Record<string, ResumeData> = {
  "1": {
    personal: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      phone: "(555) 123-4567",
      address: "San Francisco, CA",
      summary: "Experienced marketing manager with 7 years of expertise in digital marketing, campaign management, and team leadership.",
      linkedin: "linkedin.com/in/alexmorgan"
    },
    experience: [
      { id: 1, title: "Senior Marketing Manager", company: "TechVision Inc.", location: "San Francisco, CA", startDate: "Jan 2020", endDate: "", current: true, description: "• Led rebranding initiative resulting in 40% increase in brand recognition\n• Managed a team of 5 marketing specialists and a $1.2M annual budget" },
      { id: 2, title: "Marketing Specialist", company: "InnovateTech", location: "Oakland, CA", startDate: "Mar 2017", endDate: "Dec 2019", current: false, description: "• Coordinated marketing campaigns across multiple channels\n• Analyzed campaign metrics and prepared monthly performance reports" },
    ],
    education: [
      { id: 1, school: "University of California, Berkeley", degree: "Master's", field: "Marketing and Communications", startDate: "2015", endDate: "2017", description: "GPA: 3.8/4.0" },
    ],
    skills: ["Digital Marketing", "Campaign Management", "Social Media Strategy", "SEO/SEM", "Google Analytics"],
    customization: { primaryColor: "#2563eb", fontFamily: "'Inter', sans-serif", fontSize: "medium", spacing: "normal" }
  },
  "2": {
    personal: {
      name: "Jordan Taylor",
      email: "jordan.taylor@example.com",
      phone: "(555) 987-6543",
      address: "Seattle, WA",
      summary: "Software engineer with 5+ years building scalable applications. Expertise in JavaScript, TypeScript, React, and Node.js.",
      website: "jordantaylor.dev"
    },
    experience: [
      { id: 1, title: "Senior Frontend Engineer", company: "CloudTech Solutions", location: "Seattle, WA", startDate: "Jun 2021", endDate: "", current: true, description: "• Developed core features for SaaS platform using React and TypeScript\n• Improved application performance by 35%" },
      { id: 2, title: "Full Stack Developer", company: "InnoSoft Systems", location: "Portland, OR", startDate: "Aug 2018", endDate: "May 2021", current: false, description: "• Built RESTful APIs using Node.js and Express\n• Developed responsive web applications with React" },
    ],
    education: [
      { id: 1, school: "University of Washington", degree: "Bachelor's", field: "Computer Science", startDate: "2014", endDate: "2018", description: "" },
    ],
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "GraphQL"],
    projects: [
      { id: 1, title: "Weather Dashboard", description: "React app displaying weather forecasts.", link: "", technologies: ["React", "APIs"] },
    ],
    customization: { primaryColor: "#0f172a", fontFamily: "'JetBrains Mono', monospace", fontSize: "medium", spacing: "normal" }
  },
};

export const templateNames: Record<string, string> = {
  "1": "clean-slate",
  "2": "executive-serif",
  "3": "sidebar-modern",
  "4": "tech-engineer",
  "5": "coral-creative",
  "6": "navy-professional",
  "7": "emerald-minimal",
};
