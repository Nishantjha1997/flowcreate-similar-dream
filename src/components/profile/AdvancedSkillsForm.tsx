import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Star, Code, Users, Brain, Lightbulb } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';
import { AiSuggestionButton } from '@/components/resume/AiSuggestionButton';

interface AdvancedSkillsFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
  isPremium?: boolean;
}

interface Skill {
  name: string;
  level: number;
  category: 'technical' | 'soft' | 'language' | 'tool';
  yearsOfExperience?: number;
  certified?: boolean;
}

interface SkillCategory {
  name: string;
  icon: React.ReactNode;
  skills: Skill[];
}

const skillCategories = [
  { 
    id: 'technical', 
    name: 'Technical Skills', 
    icon: <Code className="w-4 h-4" />,
    description: 'Programming languages, frameworks, and technical expertise'
  },
  { 
    id: 'soft', 
    name: 'Soft Skills', 
    icon: <Users className="w-4 h-4" />,
    description: 'Communication, leadership, and interpersonal abilities'
  },
  { 
    id: 'cognitive', 
    name: 'Cognitive Skills', 
    icon: <Brain className="w-4 h-4" />,
    description: 'Problem-solving, analytical thinking, creativity'
  },
  { 
    id: 'tools', 
    name: 'Tools & Platforms', 
    icon: <Lightbulb className="w-4 h-4" />,
    description: 'Software tools, platforms, and methodologies'
  }
];

const proficiencyLevels = [
  { value: 1, label: 'Beginner', color: 'bg-red-500' },
  { value: 2, label: 'Basic', color: 'bg-orange-500' },
  { value: 3, label: 'Intermediate', color: 'bg-yellow-500' },
  { value: 4, label: 'Advanced', color: 'bg-blue-500' },
  { value: 5, label: 'Expert', color: 'bg-green-500' }
];

export const AdvancedSkillsForm: React.FC<AdvancedSkillsFormProps> = ({
  profile,
  onUpdate,
  isPremium = false
}) => {
  const [activeCategory, setActiveCategory] = useState('technical');
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 3,
    yearsOfExperience: 1,
    certified: false
  });

  // Transform profile skills to advanced format
  const getAdvancedSkills = (): Record<string, Skill[]> => {
    const skills: Record<string, Skill[]> = {
      technical: [],
      soft: [],
      cognitive: [],
      tools: []
    };

    // Convert existing technical skills
    (profile?.technical_skills || []).forEach(skill => {
      skills.technical.push({
        name: skill,
        level: 3, // Default to intermediate
        category: 'technical'
      });
    });

    // Convert existing soft skills
    (profile?.soft_skills || []).forEach(skill => {
      skills.soft.push({
        name: skill,
        level: 3,
        category: 'soft'
      });
    });

    return skills;
  };

  const [categorySkills, setCategorySkills] = useState<Record<string, Skill[]>>(getAdvancedSkills());

  const addSkill = () => {
    if (!newSkill.name.trim()) return;

    const skill: Skill = {
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: activeCategory as any,
      yearsOfExperience: newSkill.yearsOfExperience,
      certified: newSkill.certified
    };

    setCategorySkills(prev => ({
      ...prev,
      [activeCategory]: [...(prev[activeCategory] || []), skill]
    }));

    // Update profile
    updateProfile();

    setNewSkill({
      name: '',
      level: 3,
      yearsOfExperience: 1,
      certified: false
    });
  };

  const removeSkill = (category: string, skillName: string) => {
    setCategorySkills(prev => ({
      ...prev,
      [category]: prev[category]?.filter(skill => skill.name !== skillName) || []
    }));
    updateProfile();
  };

  const updateSkillLevel = (category: string, skillName: string, level: number) => {
    setCategorySkills(prev => ({
      ...prev,
      [category]: prev[category]?.map(skill => 
        skill.name === skillName ? { ...skill, level } : skill
      ) || []
    }));
    updateProfile();
  };

  const updateProfile = () => {
    const technicalSkills = categorySkills.technical?.map(skill => skill.name) || [];
    const softSkills = categorySkills.soft?.map(skill => skill.name) || [];

    onUpdate({
      technical_skills: technicalSkills,
      soft_skills: softSkills
    });
  };

  const getProficiencyLabel = (level: number) => {
    return proficiencyLevels.find(p => p.value === level)?.label || 'Intermediate';
  };

  const getProficiencyColor = (level: number) => {
    return proficiencyLevels.find(p => p.value === level)?.color || 'bg-yellow-500';
  };

  const getSkillSuggestions = (category: string): string => {
    const suggestions = {
      technical: 'JavaScript, Python, React, Node.js, AWS, Docker, Git, SQL',
      soft: 'Leadership, Communication, Teamwork, Problem Solving, Time Management',
      cognitive: 'Critical Thinking, Analytical Skills, Creativity, Strategic Planning',
      tools: 'Slack, Jira, Figma, VS Code, GitHub, Jenkins, Kubernetes'
    };
    return suggestions[category as keyof typeof suggestions] || '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Advanced Skills Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-4">
            {skillCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-1 text-xs"
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {skillCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {category.description}
              </div>

              {/* Existing Skills */}
              <div className="space-y-3">
                {(categorySkills[category.id] || []).map((skill, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.name}</span>
                        {skill.certified && (
                          <Badge variant="secondary" className="text-xs">Certified</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(category.id, skill.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Proficiency Level</span>
                        <Badge 
                          variant="outline" 
                          className={`text-white ${getProficiencyColor(skill.level)}`}
                        >
                          {getProficiencyLabel(skill.level)}
                        </Badge>
                      </div>
                      <Slider
                        value={[skill.level]}
                        onValueChange={([value]) => updateSkillLevel(category.id, skill.name, value)}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>

                    {skill.yearsOfExperience && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {skill.yearsOfExperience} years of experience
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Add New Skill */}
              <Card className="border-dashed">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add New {category.name.slice(0, -1)}</Label>
                      <Input
                        value={newSkill.name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={`Enter ${category.name.toLowerCase().slice(0, -1)}...`}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Proficiency Level</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[newSkill.level]}
                            onValueChange={([value]) => setNewSkill(prev => ({ ...prev, level: value }))}
                            max={5}
                            min={1}
                            step={1}
                          />
                          <div className="text-center">
                            <Badge 
                              variant="outline" 
                              className={`text-white ${getProficiencyColor(newSkill.level)}`}
                            >
                              {getProficiencyLabel(newSkill.level)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Select 
                          value={newSkill.yearsOfExperience.toString()} 
                          onValueChange={(value) => setNewSkill(prev => ({ ...prev, yearsOfExperience: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map(year => (
                              <SelectItem key={year} value={year.toString()}>
                                {year} year{year > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={addSkill} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add {category.name.slice(0, -1)}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <AiSuggestionButton
                value={getSkillSuggestions(category.id)}
                onAccept={(suggestion) => {
                  const skills = suggestion.split(',').map(s => s.trim());
                  skills.forEach(skillName => {
                    if (skillName && !categorySkills[category.id]?.some(s => s.name === skillName)) {
                      setNewSkill({ name: skillName, level: 3, yearsOfExperience: 2, certified: false });
                      addSkill();
                    }
                  });
                }}
                label={`Get ${category.name} Suggestions`}
                isPremium={isPremium}
                section="skills"
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Skills Summary */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Skills Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillCategories.map(category => {
              const count = categorySkills[category.id]?.length || 0;
              const avgLevel = count > 0 
                ? (categorySkills[category.id]?.reduce((sum, skill) => sum + skill.level, 0) || 0) / count 
                : 0;

              return (
                <div key={category.id} className="text-center p-3 rounded-lg bg-secondary/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {category.icon}
                    <span className="text-sm font-medium">{category.name.split(' ')[0]}</span>
                  </div>
                  <div className="text-lg font-bold">{count}</div>
                  {count > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Avg: {getProficiencyLabel(Math.round(avgLevel))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
