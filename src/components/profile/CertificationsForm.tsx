import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Award, ExternalLink } from 'lucide-react';
import { UserProfile } from '@/hooks/useUserProfile';

interface CertificationsFormProps {
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => void;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export const CertificationsForm = ({ profile, onUpdate }: CertificationsFormProps) => {
  const certifications = (profile?.certifications as Certification[]) || [];
  
  const [newCertification, setNewCertification] = useState<Certification>({
    name: '',
    issuer: '',
    date: '',
    url: ''
  });

  const addCertification = () => {
    if (!newCertification.name || !newCertification.issuer) return;
    
    const updatedCertifications = [...certifications, { ...newCertification }];
    onUpdate({ certifications: updatedCertifications });
    
    setNewCertification({
      name: '',
      issuer: '',
      date: '',
      url: ''
    });
  };

  const removeCertification = (index: number) => {
    const updatedCertifications = certifications.filter((_, i) => i !== index);
    onUpdate({ certifications: updatedCertifications });
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const updatedCertifications = certifications.map((cert, i) => 
      i === index ? { ...cert, ...updates } : cert
    );
    onUpdate({ certifications: updatedCertifications });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Certifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Certifications */}
        {certifications.map((cert, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-4">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Certification Name</Label>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(index, { name: e.target.value })}
                    placeholder="AWS Certified Solutions Architect"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Organization</Label>
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(index, { issuer: e.target.value })}
                    placeholder="Amazon Web Services"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input
                    type="month"
                    value={cert.date}
                    onChange={(e) => updateCertification(index, { date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verification URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cert.url || ''}
                      onChange={(e) => updateCertification(index, { url: e.target.value })}
                      placeholder="https://credly.com/badges/..."
                    />
                    {cert.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Certification */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4">Add New Certification</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Certification Name *</Label>
                <Input
                  value={newCertification.name}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Organization *</Label>
                <Input
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                  placeholder="Amazon Web Services"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input
                  type="month"
                  value={newCertification.date}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Verification URL</Label>
                <Input
                  value={newCertification.url}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://credly.com/badges/..."
                />
              </div>
            </div>
            
            <Button onClick={addCertification}>
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
