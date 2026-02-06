-- Create resume_templates table for admin template management
CREATE TABLE IF NOT EXISTS public.resume_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_ats_optimized BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates" 
ON public.resume_templates 
FOR SELECT 
USING (is_active = true);

-- Admins can manage all templates
CREATE POLICY "Admins can manage all templates" 
ON public.resume_templates 
FOR ALL 
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_resume_templates_updated_at
BEFORE UPDATE ON public.resume_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.resume_templates (name, template_key, category, description, is_active, is_featured, is_ats_optimized) VALUES
('Executive Modern', 'modern', 'Professional', 'Clean and professional template with modern layout, perfect for senior executives', true, true, true),
('Corporate Classic', 'classic', 'Professional', 'Timeless design with traditional formatting, suitable for all industries', true, false, true),
('Business Elite', 'professional', 'Professional', 'Balanced and versatile template for professionals in any field', true, false, true),
('Software Engineer Pro', 'technical', 'Technology', 'Focused on technical skills with dedicated sections for projects', true, true, true),
('DevOps Specialist', 'developer', 'Technology', 'Perfect for DevOps engineers with emphasis on tools and certifications', true, false, true),
('Data Scientist', 'data-scientist', 'Technology', 'Specialized for data scientists with sections for publications and projects', true, true, true),
('Creative Portfolio', 'creative', 'Creative', 'Bold and eye-catching layout for creative professionals', true, true, false),
('UI/UX Designer', 'elegant', 'Creative', 'Refined and elegant design with sophisticated typography', true, false, false),
('Medical Professional', 'medical', 'Healthcare', 'Professional template designed for doctors and healthcare workers', true, true, true),
('Academic Researcher', 'academic', 'Education', 'Perfect for professors and researchers with publication sections', true, true, true),
('C-Level Executive', 'executive', 'Executive', 'Sophisticated design for senior managers and executives', true, true, true),
('ATS Optimized Pro', 'ats-pro', 'ATS-Friendly', 'Specifically designed to pass ATS systems while maintaining professional appearance', true, true, true),
('Simple & Clean', 'compact', 'ATS-Friendly', 'Space-efficient layout optimized for ATS parsing', true, false, true),
('Minimal ATS', 'minimalist', 'ATS-Friendly', 'Ultra-clean design optimized for ATS parsing with maximum readability', true, false, true)
ON CONFLICT (template_key) DO NOTHING;