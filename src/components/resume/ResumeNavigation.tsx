
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionNav } from '@/components/resume/SectionNav';
import { TemplateSelector } from '@/components/resume/TemplateSelector';

interface ResumeNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

export const ResumeNavigation = ({ 
  activeSection, 
  onSectionChange,
  currentTemplateId,
  onTemplateChange 
}: ResumeNavigationProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="sections" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="sections">
            <SectionNav 
              activeSection={activeSection} 
              onSectionChange={onSectionChange} 
            />
          </TabsContent>
          <TabsContent value="templates">
            <TemplateSelector 
              currentTemplateId={currentTemplateId} 
              onTemplateChange={onTemplateChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
