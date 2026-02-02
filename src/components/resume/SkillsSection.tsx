
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AiSuggestionButton } from "@/components/resume/AiSuggestionButton";
import { Plus, X, Sparkles, Code, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsSectionProps {
  skills: string[];
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAIFeatureUpsell?: () => void;
  isPremium?: boolean;
}

const SKILL_SUGGESTIONS = {
  technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker', 'Git', 'REST APIs'],
  soft: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability'],
  tools: ['VS Code', 'Figma', 'Jira', 'Slack', 'GitHub', 'Notion', 'Postman', 'Excel']
};

export const SkillsSection = ({ skills, onChange, onAIFeatureUpsell, isPremium }: SkillsSectionProps) => {
  const [newSkill, setNewSkill] = useState('');
  const [activeCategory, setActiveCategory] = useState<'technical' | 'soft' | 'tools'>('technical');

  const getSkillsString = () => skills.join(', ');

  const addSkill = (skill: string) => {
    if (!skill.trim() || skills.includes(skill.trim())) return;
    const newSkills = [...skills, skill.trim()];
    onChange({
      target: { value: newSkills.join(', ') },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    onChange({
      target: { value: newSkills.join(', ') },
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const handleAcceptSuggestion = (suggested: string) => {
    onChange({
      target: { value: suggested },
    } as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(newSkill);
    }
  };

  const categoryIcons = {
    technical: Code,
    soft: Users,
    tools: Wrench
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Skills</h2>
          {skills.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {skills.length} skills
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Add skills that match the job you're applying for. Include both technical and soft skills.
      </p>
      
      {/* Quick Add Input */}
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter..."
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={() => addSkill(newSkill)}
          disabled={!newSkill.trim()}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Skill Suggestions */}
      <div className="space-y-3">
        <div className="flex gap-1">
          {(Object.keys(SKILL_SUGGESTIONS) as Array<keyof typeof SKILL_SUGGESTIONS>).map((category) => {
            const Icon = categoryIcons[category];
            return (
              <Button
                key={category}
                type="button"
                variant={activeCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="gap-1.5 text-xs capitalize"
              >
                <Icon className="h-3 w-3" />
                {category}
              </Button>
            );
          })}
        </div>
        
        <div className="flex flex-wrap gap-1.5">
          {SKILL_SUGGESTIONS[activeCategory].map((skill) => {
            const isAdded = skills.includes(skill);
            return (
              <Button
                key={skill}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => !isAdded && addSkill(skill)}
                disabled={isAdded}
                className={cn(
                  "text-xs h-7 px-2",
                  isAdded && "bg-primary/10 text-primary border-primary/30"
                )}
              >
                {isAdded ? '✓ ' : '+ '}{skill}
              </Button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestions */}
      <AiSuggestionButton
        value={getSkillsString()}
        onAccept={handleAcceptSuggestion}
        label="Get AI Skills Suggestions"
        section="skills"
        isPremium={isPremium}
        onUpsell={onAIFeatureUpsell}
        additionalContext="Skills section for professional resume"
      />
      
      {/* Current Skills Display */}
      {skills.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Your Skills</Label>
          <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border min-h-[60px]">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="group flex items-center gap-1 bg-background px-2.5 py-1 rounded-md text-sm border shadow-sm hover:border-destructive/50 transition-colors"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No skills added yet. Start typing or click suggestions above.
        </div>
      )}
    </div>
  );
};
