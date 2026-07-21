import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, FolderKanban, Star } from 'lucide-react';
import { useMasterProfile } from '@/hooks/useMasterProfile';
import { PDFResumeUploader } from '@/components/profile/PDFResumeUploader';
import { MasterProfileForm } from '@/components/profile/MasterProfileForm';
import type { UserProfile } from '@/hooks/useUserProfile';

// The Master Profile is a superset profile resumes can be spawned from -
// distinct from the single per-account profile edited in the other tabs.
// A PDF import here updates this master profile (auto-creating one on first
// use), not the legacy profiles row.
export function MasterProfileTab() {
  const { defaultProfile, profiles, isLoading, updateProfile, setDefault } = useMasterProfile();
  const [showUploader, setShowUploader] = useState(!defaultProfile);

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    updateProfile(updates);
  };

  const handleDataExtracted = (data: Partial<UserProfile>) => {
    // Merge the AI-extracted fields straight into the master profile.
    updateProfile(data);
    setShowUploader(false);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading master profile...</div>;
  }

  const profileData = (defaultProfile?.profile_data ?? {}) as Partial<UserProfile>;

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderKanban className="h-4 w-4" /> What is a Master Profile?
          </CardTitle>
          <CardDescription>
            A superset of your career history - every job, skill, and project you've ever had. Build it once
            (or import it from an existing resume PDF), then spawn tailored, trimmed-down resumes from it for
            each application.
          </CardDescription>
        </CardHeader>
        {profiles.length > 1 && (
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profiles.map((p) => (
                <Button
                  key={p.id}
                  size="sm"
                  variant={p.is_default ? 'default' : 'outline'}
                  onClick={() => !p.is_default && setDefault(p.id)}
                  className="gap-1.5"
                >
                  {p.is_default && <Star className="h-3 w-3 fill-current" />}
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {(showUploader || !defaultProfile) && (
        <PDFResumeUploader onDataExtracted={handleDataExtracted} />
      )}

      {defaultProfile && !showUploader && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowUploader(true)} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Re-import from a PDF
          </Button>
        </div>
      )}

      {!defaultProfile && (
        <div className="text-center">
          <Badge variant="outline">No master profile yet</Badge>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Upload a resume PDF above, or start filling in sections below to create one automatically.
          </p>
        </div>
      )}

      <MasterProfileForm profile={profileData} onUpdate={handleProfileUpdate} />
    </div>
  );
}
