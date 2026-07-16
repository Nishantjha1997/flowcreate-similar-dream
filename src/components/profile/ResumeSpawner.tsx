import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Json } from '@/integrations/supabase/types';
import { ResumeData } from '@/utils/types';
import { resolveTemplateKey } from '@/templates/registry';
import {
  Copy,
  Loader2,
  CheckCircle2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Code,
} from 'lucide-react';

interface MasterProfile {
  id: string;
  name: string;
  profile_data: Record<string, any>;
}

interface ResumeSpawnerProps {
  masterProfile: MasterProfile;
}

const SECTION_OPTIONS = [
  { key: 'personal', label: 'Personal Info', icon: User, default: true },
  { key: 'experience', label: 'Work Experience', icon: Briefcase, default: true },
  { key: 'education', label: 'Education', icon: GraduationCap, default: true },
  { key: 'skills', label: 'Skills', icon: Wrench, default: true },
  { key: 'projects', label: 'Projects', icon: Code, default: false },
];

export function ResumeSpawner({ masterProfile }: ResumeSpawnerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(SECTION_OPTIONS.filter((s) => s.default).map((s) => s.key))
  );
  const [isSpawning, setIsSpawning] = useState(false);

  const toggleSection = (key: string) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSections(new Set(SECTION_OPTIONS.map((s) => s.key)));
  };

  const clearAll = () => {
    setSelectedSections(new Set());
  };

  const handleSpawn = async () => {
    if (!user?.id) {
      toast.error('Please log in to create a resume.');
      return;
    }

    if (selectedSections.size === 0) {
      toast.error('Please select at least one section.');
      return;
    }

    setIsSpawning(true);

    try {
      const profileData = masterProfile.profile_data || {};

      // Build resume data from selected sections
      const resumeData: Partial<ResumeData> = {
        personal: selectedSections.has('personal')
          ? {
              name: profileData.full_name || '',
              email: profileData.email || '',
              phone: profileData.phone || '',
              address: profileData.location || '',
              summary: profileData.professional_summary || '',
              website: profileData.website || '',
              linkedin: profileData.linkedin_url || '',
            }
          : {
              name: '',
              email: '',
              phone: '',
              address: '',
              summary: '',
            },
        experience: selectedSections.has('experience')
          ? (profileData.work_experience || []).map((exp: any, i: number) => ({
              id: i + 1,
              title: exp.title || exp.position || '',
              company: exp.company || '',
              location: exp.location || '',
              startDate: exp.start_date || '',
              endDate: exp.end_date || '',
              current: exp.current || false,
              description: exp.description || '',
            }))
          : [],
        education: selectedSections.has('education')
          ? (profileData.education || []).map((edu: any, i: number) => ({
              id: i + 1,
              school: edu.school || edu.institution || '',
              degree: edu.degree || '',
              field: edu.field || edu.field_of_study || '',
              startDate: edu.start_date || '',
              endDate: edu.end_date || '',
              description: edu.description || '',
            }))
          : [],
        skills: selectedSections.has('skills')
          ? profileData.technical_skills || profileData.skills || []
          : [],
        projects: selectedSections.has('projects')
          ? (profileData.projects || []).map((proj: any, i: number) => ({
              id: i + 1,
              title: proj.title || proj.name || '',
              description: proj.description || '',
              link: proj.link || proj.url || '',
              technologies: proj.technologies || proj.tech_stack || [],
            }))
          : [],
        customization: {
          primaryColor: '#3b82f6',
          fontSize: 'medium',
          spacing: 'normal',
        },
      };

      // Insert new resume with master_profile_id
      const { data, error } = await supabase
        .from('resumes')
        .insert([{
          user_id: user.id,
          resume_data: resumeData as unknown as Json,
          template_id: 'modern',
          master_profile_id: masterProfile.id,
        }])
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Resume created from master profile!');
      navigate(`/resume-builder?edit=${data.id}`);
    } catch (error: any) {
      toast.error('Failed to create resume: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSpawning(false);
    }
  };

  const dataPreview = masterProfile.profile_data || {};
  const hasData = Object.keys(dataPreview).length > 0;

  return (
    <div className="space-y-4">
      {/* Profile Data Summary */}
      {!hasData ? (
        <div className="rounded-lg bg-muted/30 p-4 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            This profile has no data yet. Add information to your master profile from the Account page first.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {dataPreview.full_name && (
              <Badge variant="secondary" className="text-xs">{dataPreview.full_name}</Badge>
            )}
            {dataPreview.email && (
              <Badge variant="secondary" className="text-xs">{dataPreview.email}</Badge>
            )}
            {dataPreview.current_position && (
              <Badge variant="secondary" className="text-xs">{dataPreview.current_position}</Badge>
            )}
            {dataPreview.work_experience?.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dataPreview.work_experience.length} experience{dataPreview.work_experience.length > 1 ? 's' : ''}
              </Badge>
            )}
            {dataPreview.education?.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {dataPreview.education.length} education{dataPreview.education.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Sections to include</Label>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline"
                >
                  Select all
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SECTION_OPTIONS.map((section) => {
                const Icon = section.icon;
                const hasContent = (() => {
                  const pd = masterProfile.profile_data || {};
                  switch (section.key) {
                    case 'personal':
                      return !!(pd.full_name || pd.email);
                    case 'experience':
                      return !!(pd.work_experience?.length > 0);
                    case 'education':
                      return !!(pd.education?.length > 0);
                    case 'skills':
                      return !!(pd.technical_skills?.length > 0 || pd.skills?.length > 0);
                    case 'projects':
                      return !!(pd.projects?.length > 0);
                    default:
                      return false;
                  }
                })();

                return (
                  <label
                    key={section.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSections.has(section.key)
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border/60 bg-background hover:bg-muted/30'
                    } ${!hasContent ? 'opacity-50' : ''}`}
                  >
                    <Checkbox
                      checked={selectedSections.has(section.key)}
                      onCheckedChange={() => toggleSection(section.key)}
                      disabled={!hasContent}
                    />
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{section.label}</p>
                      {!hasContent && (
                        <p className="text-[10px] text-muted-foreground">No data</p>
                      )}
                    </div>
                    {selectedSections.has(section.key) && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Spawn Button */}
          <Button
            onClick={handleSpawn}
            disabled={isSpawning || selectedSections.size === 0 || !hasData}
            className="w-full"
          >
            {isSpawning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {isSpawning
              ? 'Creating resume...'
              : `Spawn Resume (${selectedSections.size} section${selectedSections.size !== 1 ? 's' : ''})`}
          </Button>
        </>
      )}
    </div>
  );
}
