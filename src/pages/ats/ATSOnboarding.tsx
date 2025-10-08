import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowRight, Check } from 'lucide-react';
import Header from '@/components/Header';

const ATSOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    industry: '',
    company_size: '',
    website_url: '',
    description: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an organization",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          slug: formData.slug,
          industry: formData.industry || null,
          company_size: formData.company_size || null,
          website_url: formData.website_url || null,
          description: formData.description || null,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast({
        title: "Organization created!",
        description: "Your workspace is ready. Let's start hiring!",
      });

      navigate('/ats/dashboard');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error creating organization",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {step > 1 ? <Check className="h-4 w-4" /> : '1'}
                </div>
                <span className="text-sm font-medium">Basic Info</span>
              </div>
              <div className="w-16 h-0.5 bg-border"></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Company Details</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Create Your Organization</h1>
              <p className="text-muted-foreground">
                Set up your hiring workspace in just a few steps
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Acme Corporation"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Organization URL *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">flowcreate.app/</span>
                      <Input
                        id="slug"
                        placeholder="acme-corp"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                        disabled={isLoading}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This will be your organization's unique URL
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.slug}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select
                      value={formData.company_size}
                      onValueChange={(value) => setFormData({ ...formData, company_size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1001+">1001+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      placeholder="https://yourcompany.com"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your company..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={isLoading}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Organization'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSOnboarding;
