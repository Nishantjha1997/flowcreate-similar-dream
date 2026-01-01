import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Heart } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface VolunteerFormProps { profile: UserProfile | null; onUpdate: (data: Partial<UserProfile>) => void; isNeoBrutalism?: boolean; }
interface VolunteerExperience { organization: string; role: string; startDate: string; endDate: string; description: string; current?: boolean; }

export const VolunteerForm = ({ profile, onUpdate, isNeoBrutalism = false }: VolunteerFormProps) => {
  const volunteer = (profile?.volunteer_experience as VolunteerExperience[]) || [];
  const [newVol, setNewVol] = useState<VolunteerExperience>({ organization: '', role: '', startDate: '', endDate: '', description: '', current: false });
  const inputClass = isNeoBrutalism ? 'border-2 border-foreground' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  const addVol = () => { if (!newVol.organization || !newVol.role) return; onUpdate({ volunteer_experience: [...volunteer, { ...newVol }] }); setNewVol({ organization: '', role: '', startDate: '', endDate: '', description: '', current: false }); };
  const removeVol = (i: number) => onUpdate({ volunteer_experience: volunteer.filter((_, idx) => idx !== i) });
  const updateVol = (i: number, updates: Partial<VolunteerExperience>) => onUpdate({ volunteer_experience: volunteer.map((v, idx) => idx === i ? { ...v, ...updates } : v) });

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}><Heart className="w-5 h-5" />Volunteer Experience</CardTitle>
        <CardDescription>Add your community involvement and volunteer work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {volunteer.map((v, i) => (
          <Card key={i} className={`relative ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
            <CardContent className="p-4">
              <Button variant="ghost" size="sm" onClick={() => removeVol(i)} className="absolute top-2 right-2 text-destructive"><X className="h-4 w-4" /></Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Organization</Label><Input value={v.organization} onChange={(e) => updateVol(i, { organization: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Role</Label><Input value={v.role} onChange={(e) => updateVol(i, { role: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Start Date</Label><Input type="month" value={v.startDate} onChange={(e) => updateVol(i, { startDate: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>End Date</Label><Input type="month" value={v.endDate} onChange={(e) => updateVol(i, { endDate: e.target.value })} disabled={v.current} className={inputClass} /></div>
              </div>
              <div className="flex items-center space-x-2 mb-4"><Switch checked={v.current || false} onCheckedChange={(c) => updateVol(i, { current: c, endDate: c ? '' : v.endDate })} /><Label>Currently volunteering</Label>{v.current && <Badge variant="secondary">Current</Badge>}</div>
              <div className="space-y-2"><Label className={labelClass}>Description</Label><Textarea value={v.description} onChange={(e) => updateVol(i, { description: e.target.value })} rows={3} className={inputClass} /></div>
            </CardContent>
          </Card>
        ))}
        <Card className={`border-dashed ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
          <CardContent className="p-4">
            <h4 className={`font-medium mb-4 ${isNeoBrutalism ? 'uppercase font-bold' : ''}`}>Add Volunteer Experience</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Organization *</Label><Input value={newVol.organization} onChange={(e) => setNewVol(p => ({ ...p, organization: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Role *</Label><Input value={newVol.role} onChange={(e) => setNewVol(p => ({ ...p, role: e.target.value }))} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Start Date</Label><Input type="month" value={newVol.startDate} onChange={(e) => setNewVol(p => ({ ...p, startDate: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>End Date</Label><Input type="month" value={newVol.endDate} onChange={(e) => setNewVol(p => ({ ...p, endDate: e.target.value }))} disabled={newVol.current} className={inputClass} /></div>
            </div>
            <div className="flex items-center space-x-2 mb-4"><Switch checked={newVol.current || false} onCheckedChange={(c) => setNewVol(p => ({ ...p, current: c, endDate: c ? '' : p.endDate }))} /><Label>Currently volunteering</Label></div>
            <div className="space-y-2 mb-4"><Label className={labelClass}>Description</Label><Textarea value={newVol.description} onChange={(e) => setNewVol(p => ({ ...p, description: e.target.value }))} rows={3} className={inputClass} /></div>
            <Button onClick={addVol} className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}><Plus className="w-4 h-4 mr-2" />Add Volunteer Experience</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
