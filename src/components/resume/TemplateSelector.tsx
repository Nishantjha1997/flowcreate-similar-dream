
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResumeTemplatePreview } from '@/components/ResumeTemplatePreview';
import { TEMPLATE_REGISTRY, resolveTemplateKey } from '@/templates/registry';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';

interface TemplateSelectorProps {
  currentTemplateId: string;
  onTemplateChange: (templateId: string) => void;
}

export const TemplateSelector = ({ currentTemplateId, onTemplateChange }: TemplateSelectorProps) => {
  const { user } = useAuth();
  const { data: premiumStatus } = usePremiumStatus(user?.id);
  const isPremiumUser = !!premiumStatus?.isPremium;
  const [upsellTemplate, setUpsellTemplate] = useState<string | null>(null);

  const activeKey = resolveTemplateKey(currentTemplateId);

  const handleSelect = (key: string, premium: boolean) => {
    if (premium && !isPremiumUser) {
      setUpsellTemplate(key);
      return;
    }
    onTemplateChange(key);
  };

  const upsellDef = upsellTemplate
    ? TEMPLATE_REGISTRY.find((t) => t.key === upsellTemplate)
    : null;

  return (
    <div className="p-4" data-tour="template-selector">
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Choose Template Style</h3>
        <p className="text-xs text-muted-foreground">
          {TEMPLATE_REGISTRY.length} designs. Your data is preserved when switching.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto p-1">
        {TEMPLATE_REGISTRY.map((template) => {
          const locked = template.premium && !isPremiumUser;
          const isActive = activeKey === template.key;
          return (
            <div
              key={template.key}
              className={`cursor-pointer border rounded-lg overflow-hidden transition-all hover:shadow-md group ${
                isActive ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'
              }`}
              onClick={() => handleSelect(template.key, template.premium)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted/30">
                <ResumeTemplatePreview
                  templateKey={template.key}
                  className="w-full h-full"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-primary/15 flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-full font-medium shadow-sm">Active</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  {template.premium && (
                    <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white hover:bg-amber-500">
                      <Crown className="h-2.5 w-2.5 mr-0.5" />
                      {locked ? 'Premium' : 'Pro'}
                    </Badge>
                  )}
                  {template.atsOptimized && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border border-green-200">
                      ATS ✓
                    </Badge>
                  )}
                </div>
                {locked && (
                  <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-full font-medium shadow-sm flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Unlock with Premium
                    </span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <div className="text-xs font-semibold">{template.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{template.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Every template is fully customizable with colors, fonts, and section reordering.
        </p>
      </div>

      <Dialog open={!!upsellTemplate} onOpenChange={(open) => !open && setUpsellTemplate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              {upsellDef ? `"${upsellDef.name}" is a Premium template` : 'Premium template'}
            </DialogTitle>
            <DialogDescription>
              Upgrade to Premium to unlock all {TEMPLATE_REGISTRY.filter((t) => t.premium).length} premium
              designs, unlimited resumes, and AI-powered suggestions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUpsellTemplate(null)}>
              Maybe later
            </Button>
            <Link to="/pricing">
              <Button className="w-full sm:w-auto">
                <Crown className="h-4 w-4 mr-2" />
                See Premium plans
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
