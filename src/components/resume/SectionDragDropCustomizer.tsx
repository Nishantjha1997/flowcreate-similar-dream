
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EditableHeading } from '@/components/EditableHeading';
import { Plus, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Icons for different section types
import {
  User, Briefcase, GraduationCap, Award, BookOpen,
  Languages, Lightbulb, Medal, HandHeart
} from 'lucide-react';

interface SectionDragDropCustomizerProps {
  activeSections: string[];
  hiddenSections: string[];
  sectionTitles: Record<string, string>;
  onSectionsChange: (activeSections: string[], hiddenSections: string[]) => void;
  onSectionTitleChange: (sectionId: string, newTitle: string) => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  personal: <User className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  skills: <Award className="h-4 w-4" />,
  projects: <BookOpen className="h-4 w-4" />,
  languages: <Languages className="h-4 w-4" />,
  interests: <Lightbulb className="h-4 w-4" />,
  certifications: <Medal className="h-4 w-4" />,
  volunteer: <HandHeart className="h-4 w-4" />
};

const availableSections = [
  { id: 'personal', label: 'Personal Info' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'languages', label: 'Languages' },
  { id: 'interests', label: 'Interests' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'volunteer', label: 'Volunteer Work' }
];

export const SectionDragDropCustomizer = ({
  activeSections = ['personal', 'experience', 'education', 'skills', 'projects'],
  hiddenSections = [],
  sectionTitles = {},
  onSectionsChange,
  onSectionTitleChange
}: SectionDragDropCustomizerProps) => {
  const [sections, setSections] = useState<string[]>(activeSections);
  const [hidden, setHidden] = useState<string[]>(hiddenSections);

  useEffect(() => {
    // Update parent component when sections change
    onSectionsChange(sections, hidden);
  }, [sections, hidden]);

  const onDragEnd = (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedSections = Array.from(sections);
    const [removed] = reorderedSections.splice(result.source.index, 1);
    reorderedSections.splice(result.destination.index, 0, removed);

    setSections(reorderedSections);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    if (hidden.includes(sectionId)) {
      // Make visible again
      setHidden(hidden.filter(id => id !== sectionId));
    } else {
      // Hide section
      setHidden([...hidden, sectionId]);
    }
  };

  const addSection = (sectionId: string) => {
    if (!sections.includes(sectionId)) {
      setSections([...sections, sectionId]);
      // If it was hidden, make it visible
      if (hidden.includes(sectionId)) {
        setHidden(hidden.filter(id => id !== sectionId));
      }
    }
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(id => id !== sectionId));
  };

  // Get sections that can be added (not already in the list)
  const addableSections = availableSections.filter(
    section => !sections.includes(section.id)
  );

  return (
    <div className="space-y-6">
      <Label className="block font-medium">Section Order & Visibility</Label>
      <p className="text-sm text-muted-foreground mb-2">
        Drag to reorder sections or toggle visibility
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="section-list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {sections.map((sectionId, index) => {
                const isHidden = hidden.includes(sectionId);
                const sectionLabel = sectionTitles[sectionId] || 
                  availableSections.find(s => s.id === sectionId)?.label || 
                  sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

                return (
                  <Draggable key={sectionId} draggableId={sectionId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-3 bg-background rounded-md border 
                          transition-colors ${snapshot.isDragging ? 'border-primary' : ''} 
                          ${isHidden ? 'opacity-70' : ''}`}
                      >
                        <div className="flex items-center flex-1 gap-3">
                          <div 
                            {...provided.dragHandleProps} 
                            className="cursor-grab text-muted-foreground hover:text-foreground"
                          >
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          {sectionIcons[sectionId] && (
                            <span className="text-muted-foreground">
                              {sectionIcons[sectionId]}
                            </span>
                          )}
                          
                          <div className="flex-1">
                            <EditableHeading
                              id={sectionId}
                              title={sectionLabel}
                              onTitleChange={onSectionTitleChange}
                              icon={null}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSectionVisibility(sectionId)}
                            className="h-8 w-8"
                            title={isHidden ? "Show section" : "Hide section"}
                          >
                            {isHidden ? 
                              <EyeOff className="h-4 w-4" /> : 
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                          
                          {/* Don't allow removing essential sections */}
                          {!['personal', 'experience', 'education'].includes(sectionId) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSection(sectionId)}
                              className="h-8 w-8 text-destructive"
                              title="Remove section"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Section Section */}
      {addableSections.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <Label className="block mb-2">Add Sections</Label>
          <div className="grid grid-cols-2 gap-2">
            {addableSections.map(section => (
              <Button
                key={section.id}
                variant="outline"
                size="sm"
                onClick={() => addSection(section.id)}
                className="justify-start"
              >
                {sectionIcons[section.id]}
                <span className="ml-2">{section.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
