import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, FileText, User, Briefcase, GraduationCap, Code, FolderOpen, Award, Languages } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface PDFDataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: Partial<UserProfile>;
  onImport: (selectedData: Partial<UserProfile>) => void;
}

interface SelectableSection {
  key: keyof UserProfile;
  label: string;
  icon: React.ReactNode;
  data: any;
  selected: boolean;
}

export const PDFDataPreviewModal: React.FC<PDFDataPreviewModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  onImport,
}) => {
  const [selectableSections, setSelectableSections] = useState<SelectableSection[]>(() => {
    const sections: SelectableSection[] = [];
    
    if (extractedData.full_name || extractedData.email || extractedData.phone || extractedData.address) {
      sections.push({
        key: 'full_name',
        label: 'Personal Information',
        icon: <User className="w-4 h-4" />,
        data: {
          full_name: extractedData.full_name,
          email: extractedData.email,
          phone: extractedData.phone,
          address: extractedData.address,
          linkedin_url: extractedData.linkedin_url,
          website_url: extractedData.website_url,
        },
        selected: true,
      });
    }

    if (extractedData.professional_summary) {
      sections.push({
        key: 'professional_summary',
        label: 'Professional Summary',
        icon: <FileText className="w-4 h-4" />,
        data: extractedData.professional_summary,
        selected: true,
      });
    }

    if (extractedData.work_experience && extractedData.work_experience.length > 0) {
      sections.push({
        key: 'work_experience',
        label: 'Work Experience',
        icon: <Briefcase className="w-4 h-4" />,
        data: extractedData.work_experience,
        selected: true,
      });
    }

    if (extractedData.education && extractedData.education.length > 0) {
      sections.push({
        key: 'education',
        label: 'Education',
        icon: <GraduationCap className="w-4 h-4" />,
        data: extractedData.education,
        selected: true,
      });
    }

    if (extractedData.technical_skills && extractedData.technical_skills.length > 0) {
      sections.push({
        key: 'technical_skills',
        label: 'Technical Skills',
        icon: <Code className="w-4 h-4" />,
        data: extractedData.technical_skills,
        selected: true,
      });
    }

    if (extractedData.projects && extractedData.projects.length > 0) {
      sections.push({
        key: 'projects',
        label: 'Projects',
        icon: <FolderOpen className="w-4 h-4" />,
        data: extractedData.projects,
        selected: true,
      });
    }

    if (extractedData.certifications && extractedData.certifications.length > 0) {
      sections.push({
        key: 'certifications',
        label: 'Certifications',
        icon: <Award className="w-4 h-4" />,
        data: extractedData.certifications,
        selected: true,
      });
    }

    if (extractedData.languages && extractedData.languages.length > 0) {
      sections.push({
        key: 'languages',
        label: 'Languages',
        icon: <Languages className="w-4 h-4" />,
        data: extractedData.languages,
        selected: true,
      });
    }

    return sections;
  });

  const handleSectionToggle = (index: number) => {
    setSelectableSections(prev => 
      prev.map((section, i) => 
        i === index ? { ...section, selected: !section.selected } : section
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = selectableSections.every(section => section.selected);
    setSelectableSections(prev => 
      prev.map(section => ({ ...section, selected: !allSelected }))
    );
  };

  const handleImportSelected = () => {
    const selectedData: Partial<UserProfile> = {};
    
    selectableSections.forEach(section => {
      if (section.selected) {
        if (section.key === 'full_name') {
          // Handle personal information as a group
          Object.assign(selectedData, section.data);
        } else {
          (selectedData as any)[section.key] = section.data;
        }
      }
    });
    
    onImport(selectedData);
    onClose();
  };

  const renderSectionPreview = (section: SelectableSection) => {
    const { data } = section;
    
    switch (section.key) {
      case 'full_name':
        return (
          <div className="space-y-2">
            {data.full_name && <p><strong>Name:</strong> {data.full_name}</p>}
            {data.email && <p><strong>Email:</strong> {data.email}</p>}
            {data.phone && <p><strong>Phone:</strong> {data.phone}</p>}
            {data.address && <p><strong>Address:</strong> {data.address}</p>}
            {data.linkedin_url && <p><strong>LinkedIn:</strong> {data.linkedin_url}</p>}
            {data.website_url && <p><strong>Website:</strong> {data.website_url}</p>}
          </div>
        );
      
      case 'professional_summary':
        return (
          <p className="text-sm text-muted-foreground line-clamp-3">{data}</p>
        );
      
      case 'work_experience':
        return (
          <div className="space-y-2">
            {data.map((exp: any, index: number) => (
              <div key={index} className="text-sm">
                <p className="font-medium">{exp.title} at {exp.company}</p>
                <p className="text-muted-foreground">{exp.startDate} - {exp.endDate}</p>
              </div>
            ))}
          </div>
        );
      
      case 'education':
        return (
          <div className="space-y-2">
            {data.map((edu: any, index: number) => (
              <div key={index} className="text-sm">
                <p className="font-medium">{edu.degree}</p>
                <p className="text-muted-foreground">{edu.institution}</p>
              </div>
            ))}
          </div>
        );
      
      case 'technical_skills':
        return (
          <div className="flex flex-wrap gap-1">
            {data.slice(0, 8).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {data.length > 8 && (
              <Badge variant="outline" className="text-xs">
                +{data.length - 8} more
              </Badge>
            )}
          </div>
        );
      
      case 'projects':
        return (
          <div className="space-y-2">
            {data.map((project: any, index: number) => (
              <div key={index} className="text-sm">
                <p className="font-medium">{project.name}</p>
                <p className="text-muted-foreground line-clamp-2">{project.description}</p>
              </div>
            ))}
          </div>
        );
      
      case 'certifications':
        return (
          <div className="space-y-1">
            {data.map((cert: any, index: number) => (
              <p key={index} className="text-sm font-medium">{cert.name}</p>
            ))}
          </div>
        );
      
      case 'languages':
        return (
          <div className="flex flex-wrap gap-1">
            {data.map((lang: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        );
      
      default:
        return <p className="text-sm text-muted-foreground">Preview not available</p>;
    }
  };

  const selectedCount = selectableSections.filter(section => section.selected).length;
  const allSelected = selectableSections.every(section => section.selected);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Data Extracted Successfully
          </DialogTitle>
          <DialogDescription>
            Review and select the information you want to import into your profile.
            You can choose specific sections or import everything at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              aria-label={allSelected ? "Deselect all sections" : "Select all sections"}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedCount} of {selectableSections.length} sections selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportSelected}
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Import Selected ({selectedCount})
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4">
            {selectableSections.map((section, index) => (
              <Card 
                key={section.key} 
                className={`transition-all ${section.selected ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {section.icon}
                      {section.label}
                    </CardTitle>
                    <Checkbox
                      checked={section.selected}
                      onCheckedChange={() => handleSectionToggle(index)}
                      aria-label={`Toggle ${section.label} import`}
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderSectionPreview(section)}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};