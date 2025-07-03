import React from 'react';
import ResumeTemplate from '@/utils/resumeTemplates';
import { ResumeData } from '@/utils/types';

interface ResumeTemplatePreviewProps {
  templateKey: string;
  className?: string;
}

// Mock data for template previews
const mockResumeData: ResumeData = {
  personal: {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    address: 'New York, NY',
    summary: 'Experienced professional with a proven track record of success in leading teams and delivering results.',
    website: 'alexjohnson.com',
    linkedin: 'linkedin.com/in/alexjohnson',
  },
  experience: [
    {
      id: 1,
      title: 'Senior Manager',
      company: 'Tech Solutions Inc.',
      location: 'New York, NY',
      startDate: '2020-01',
      endDate: '',
      current: true,
      description: 'Led cross-functional teams to deliver innovative solutions and drive business growth.',
    },
    {
      id: 2,
      title: 'Project Manager',
      company: 'Digital Innovations LLC',
      location: 'Boston, MA',
      startDate: '2018-06',
      endDate: '2019-12',
      current: false,
      description: 'Managed multiple high-impact projects with budgets exceeding $2M.',
    },
  ],
  education: [
    {
      id: 1,
      school: 'Harvard University',
      degree: 'Master of Business Administration',
      field: 'Business Administration',
      startDate: '2016-09',
      endDate: '2018-05',
      description: 'Graduated Magna Cum Laude, Focus on Strategic Management.',
    },
  ],
  skills: ['Leadership', 'Strategic Planning', 'Project Management', 'Data Analysis', 'Team Building'],
  projects: [
    {
      id: 1,
      title: 'Digital Transformation Initiative',
      description: 'Led company-wide digital transformation resulting in 40% efficiency improvement.',
      technologies: ['Agile', 'Scrum', 'Digital Strategy'],
      link: '',
    },
  ],
  customization: {
    primaryColor: '#2563eb',
    secondaryColor: '#6b7280',
    fontSize: 'medium',
    spacing: 'normal'
  }
};

export const ResumeTemplatePreview = ({ templateKey, className = '' }: ResumeTemplatePreviewProps) => {
  return (
    <div className={`bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="scale-[0.3] origin-top-left transform w-[333%] h-[333%]">
        <ResumeTemplate 
          data={mockResumeData} 
          templateName={templateKey}
        />
      </div>
    </div>
  );
};