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

export const templateNames: Record<string, string> = {
  "1": "modern",
  "2": "classic",
  "3": "professional",
  "4": "technical",
  "5": "developer",
  "6": "data-scientist",
  "7": "creative",
  "8": "elegant",
  "10": "medical",
  "12": "academic",
  "19": "executive",
  "21": "ats-pro"
};
