import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Award, ExternalLink } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface CertificationsFormProps { profile: UserProfile | null; onUpdate: (data: Partial<UserProfile>) => void; isNeoBrutalism?: boolean; }
interface Certification { name: string; issuer: string; date: string; url?: string; }

export const CertificationsForm = ({ profile, onUpdate, isNeoBrutalism = false }: CertificationsFormProps) => {
  const certifications = (profile?.certifications as Certification[]) || [];
  const [newCert, setNewCert] = useState<Certification>({ name: '', issuer: '', date: '', url: '' });
  const inputClass = isNeoBrutalism ? 'border-2 border-foreground' : '';
  const labelClass = isNeoBrutalism ? 'uppercase text-xs font-bold tracking-wide' : '';

  const addCert = () => { if (!newCert.name || !newCert.issuer) return; onUpdate({ certifications: [...certifications, { ...newCert }] }); setNewCert({ name: '', issuer: '', date: '', url: '' }); };
  const removeCert = (i: number) => onUpdate({ certifications: certifications.filter((_, idx) => idx !== i) });
  const updateCert = (i: number, updates: Partial<Certification>) => onUpdate({ certifications: certifications.map((c, idx) => idx === i ? { ...c, ...updates } : c) });

  return (
    <Card className={isNeoBrutalism ? 'border-3 border-foreground shadow-[6px_6px_0px_0px_hsl(var(--foreground))]' : ''}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isNeoBrutalism ? 'uppercase font-black' : ''}`}><Award className="w-5 h-5" />Certifications</CardTitle>
        <CardDescription>Add your professional certifications and credentials.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {certifications.map((c, i) => (
          <Card key={i} className={`relative ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
            <CardContent className="p-4">
              <Button variant="ghost" size="sm" onClick={() => removeCert(i)} className="absolute top-2 right-2 text-destructive"><X className="h-4 w-4" /></Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2"><Label className={labelClass}>Name</Label><Input value={c.name} onChange={(e) => updateCert(i, { name: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>Issuer</Label><Input value={c.issuer} onChange={(e) => updateCert(i, { issuer: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className={labelClass}>Date</Label><Input type="month" value={c.date} onChange={(e) => updateCert(i, { date: e.target.value })} className={inputClass} /></div>
                <div className="space-y-2"><Label className={labelClass}>URL</Label><div className="flex gap-2"><Input value={c.url || ''} onChange={(e) => updateCert(i, { url: e.target.value })} className={inputClass} />{c.url && <Button variant="outline" size="sm" asChild><a href={c.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button>}</div></div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className={`border-dashed ${isNeoBrutalism ? 'border-2 border-foreground' : ''}`}>
          <CardContent className="p-4">
            <h4 className={`font-medium mb-4 ${isNeoBrutalism ? 'uppercase font-bold' : ''}`}>Add New Certification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Name *</Label><Input value={newCert.name} onChange={(e) => setNewCert(p => ({ ...p, name: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>Issuer *</Label><Input value={newCert.issuer} onChange={(e) => setNewCert(p => ({ ...p, issuer: e.target.value }))} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2"><Label className={labelClass}>Date</Label><Input type="month" value={newCert.date} onChange={(e) => setNewCert(p => ({ ...p, date: e.target.value }))} className={inputClass} /></div>
              <div className="space-y-2"><Label className={labelClass}>URL</Label><Input value={newCert.url} onChange={(e) => setNewCert(p => ({ ...p, url: e.target.value }))} className={inputClass} /></div>
            </div>
            <Button onClick={addCert} className={isNeoBrutalism ? 'border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]' : ''}><Plus className="w-4 h-4 mr-2" />Add Certification</Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
