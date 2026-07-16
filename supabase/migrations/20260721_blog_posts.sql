-- ═══════════════════════════════════════════════
-- BLOG POSTS TABLE + SEED DATA
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  description TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'Resume Tips' CHECK (category IN ('Resume Tips', 'Career Advice', 'Job Search', 'Interview Tips', 'Industry Insights')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  keywords TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'FlowCreate Team',
  read_time TEXT DEFAULT '5 min read',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_updated_at();

-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: can read published posts
CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

-- Admins: full access
CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════
-- SEED: 5 existing blog posts
-- ═══════════════════════════════════════════════

INSERT INTO public.blog_posts (slug, title, excerpt, description, content, category, status, keywords, author, read_time, published_at) VALUES
(
  'ats-friendly-resume-guide',
  'How to Write an ATS-Friendly Resume in 2025',
  'Most resumes never reach a human. Learn how to optimize your resume for Applicant Tracking Systems and get past the bots.',
  'Learn how to write an ATS-friendly resume that passes automated screening. Tips on formatting, keywords, and structure to get your resume seen by recruiters.',
  '<p>Did you know that <strong>75% of resumes are rejected by ATS software</strong> before a human ever sees them? If you''re applying to jobs online and not hearing back, your resume formatting might be the culprit.</p>
<h2>What is an ATS?</h2>
<p>An Applicant Tracking System (ATS) is software used by companies to filter, rank, and organize job applications. When you upload your resume, the ATS parses it, extracts key information, and scores you against the job description. Companies like Google, Amazon, and even small startups use ATS systems like Greenhouse, Lever, and Workday.</p>
<h2>7 Rules for ATS-Friendly Resumes</h2>
<h3>1. Use Standard Section Headings</h3>
<p>Stick to conventional headings: "Work Experience," "Education," "Skills," "Certifications." Creative headings like "Where I''ve Been" confuse ATS parsers.</p>
<h3>2. Avoid Tables, Columns, and Graphics</h3>
<p>ATS software struggles with multi-column layouts and embedded images. A single-column layout with clear section breaks is safest.</p>
<h3>3. Include Keywords from the Job Description</h3>
<p>The ATS compares your resume against the job posting. Mirror the exact language from the job description where possible.</p>
<h3>4. Use Standard Fonts</h3>
<p>Stick to Arial, Helvetica, Calibri, Georgia, or Times New Roman. Decorative fonts may not render correctly.</p>
<h3>5. Submit as PDF or DOCX</h3>
<p>Most modern ATS systems handle PDFs well, but some older systems prefer .docx. Check the posting.</p>
<h3>6. Don''t Put Critical Info in Headers or Footers</h3>
<p>Many ATS systems ignore content in headers and footers. Keep contact info in the body.</p>
<h3>7. Spell Out Acronyms on First Use</h3>
<p>Write "Search Engine Optimization (SEO)" the first time, then "SEO" after that.</p>
<h2>How FlowCreate Helps</h2>
<p>All FlowCreate templates are tested for ATS compatibility. <a href="/resume-builder">Try building your ATS-friendly resume now</a> — it''s free.</p>',
  'Resume Tips', 'published',
  ARRAY['ATS resume tips', 'applicant tracking system', 'resume optimization', 'ATS friendly resume', 'resume keywords'],
  'FlowCreate Team', '6 min read', now()
),
(
  'resume-mistakes-to-avoid',
  '10 Resume Mistakes That Get You Rejected Instantly',
  'From typos to vague bullet points — these common resume mistakes are costing you interviews. Fix them today.',
  'Avoid these 10 common resume mistakes that cause instant rejection. Learn what recruiters hate and how to fix your resume for better results.',
  '<p>Recruiters spend an average of <strong>6-7 seconds</strong> scanning a resume before deciding. Here are the 10 most common resume killers — and how to fix them.</p>
<h2>1. Typos and Grammar Errors</h2>
<p>This is the #1 reason resumes get rejected. Proofread multiple times, read aloud, and use tools like Grammarly.</p>
<h2>2. Vague Bullet Points</h2>
<p>"Responsible for sales" tells a recruiter nothing. Instead: "Grew regional sales by 34% in 12 months, generating $2.1M in new revenue."</p>
<h2>3. Using an Unprofessional Email Address</h2>
<p>"partyguy123@email.com" doesn''t inspire confidence. Create a simple email with your name.</p>
<h2>4. Too Long or Too Short</h2>
<p>For most professionals, one page is ideal. Senior roles can justify two pages. Never go beyond two.</p>
<h2>5. Including a Photo (in the US/UK)</h2>
<p>In the US, UK, and Canada, photos can lead to unconscious bias and rejection.</p>
<h2>6. Listing Responsibilities Instead of Achievements</h2>
<p>Every bullet should answer: "What did I accomplish?" not "What was I supposed to do?"</p>
<h2>7. Using a Generic Objective Statement</h2>
<p>"Seeking a challenging position" says nothing. Write a targeted professional summary instead.</p>
<h2>8. Inconsistent Formatting</h2>
<p>Mixed fonts and spacing make your resume look sloppy. Using a template ensures consistency.</p>
<h2>9. Including Irrelevant Information</h2>
<p>Your high school job from 15 years ago probably doesn''t belong on your senior-level resume.</p>
<h2>10. Not Tailoring Your Resume</h2>
<p>Sending the same resume to every job is the biggest missed opportunity. <a href="/resume-builder">FlowCreate makes it easy to customize</a>.</p>',
  'Resume Tips', 'published',
  ARRAY['resume mistakes', 'common resume errors', 'resume tips', 'job application tips', 'resume advice'],
  'FlowCreate Team', '7 min read', now()
),
(
  'resume-keywords-by-industry',
  'Resume Keywords That Land Interviews — Industry by Industry',
  'Discover the exact keywords recruiters search for in tech, finance, healthcare, marketing, and more.',
  'Industry-specific resume keywords that help you pass ATS screening and get noticed by recruiters. Covers tech, finance, healthcare, marketing, and engineering.',
  '<p>Keywords are the bridge between your resume and the interview. Here''s exactly what to include for your industry.</p>
<h2>Technology & Software Engineering</h2>
<ul><li><strong>Languages:</strong> Python, Java, TypeScript, Go, Rust, C++</li><li><strong>Frameworks:</strong> React, Next.js, Django, Spring Boot, Node.js</li><li><strong>Cloud:</strong> AWS, Azure, GCP, Terraform, Kubernetes, Docker</li><li><strong>Concepts:</strong> microservices, CI/CD, TDD, system design, REST APIs</li></ul>
<h2>Finance & Accounting</h2>
<ul><li><strong>Technical:</strong> financial modeling, DCF, NPV, IRR, GAAP, IFRS</li><li><strong>Tools:</strong> Excel (VBA), Bloomberg Terminal, SAP, Oracle, QuickBooks</li><li><strong>Credentials:</strong> CPA, CFA, MBA, Series 7, FRM</li></ul>
<h2>Healthcare & Nursing</h2>
<ul><li><strong>Clinical:</strong> patient assessment, medication administration, EHR/EMR (Epic, Cerner)</li><li><strong>Specialties:</strong> ICU, ER, pediatrics, oncology</li><li><strong>Compliance:</strong> HIPAA, JCAHO, infection control</li></ul>
<h2>Marketing & Content</h2>
<ul><li><strong>Channels:</strong> SEO, SEM, PPC, social media, email marketing</li><li><strong>Tools:</strong> Google Analytics, HubSpot, Salesforce, SEMrush, Ahrefs, Figma</li><li><strong>Concepts:</strong> A/B testing, funnel optimization, CAC, LTV, ROAS</li></ul>
<h2>Engineering</h2>
<ul><li><strong>Technical:</strong> CAD, SolidWorks, AutoCAD, MATLAB, FEA, PLC programming</li><li><strong>Standards:</strong> ASME, IEEE, ISO 9001, Six Sigma</li><li><strong>Credentials:</strong> PE license, PMP, EIT</li></ul>
<p><strong>Pro tip:</strong> Weave keywords into achievement-based bullet points. Instead of "Python, AWS" write "Built a Python data pipeline on AWS Lambda, processing 10M events/day."</p>',
  'Career Advice', 'published',
  ARRAY['resume keywords', 'ATS keywords', 'industry resume tips', 'resume optimization', 'job search keywords'],
  'FlowCreate Team', '8 min read', now()
),
(
  'free-vs-paid-resume-builders',
  'Free vs Paid Resume Builders: What''s Actually Worth It in 2025',
  'Are premium resume builders worth the money? We compare free and paid options to help you decide.',
  'Honest comparison of free vs paid resume builders. Learn when free is enough and when upgrading to premium features actually helps you land more interviews.',
  '<p>You need a great resume. Should you pay for a premium builder, or is free good enough? Here''s an honest breakdown.</p>
<h2>What Free Resume Builders Offer</h2>
<p>Most free resume builders give you 1-3 templates, PDF export, basic editing, and 1 saved resume. FlowCreate''s free plan includes all of this, plus access to every template in our library.</p>
<h2>When to Consider a Premium Plan</h2>
<ul><li><strong>Applying to multiple roles</strong> — unlimited resumes for different positions</li><li><strong>AI-powered suggestions</strong> — premium plans include AI that suggests better phrasing and keywords</li><li><strong>Version history</strong> — track changes and revert to previous versions</li><li><strong>Cloud backup</strong> — never lose your resume data</li><li><strong>Competitive industries</strong> — premium templates give you a design edge</li></ul>
<h2>The Verdict</h2>
<p>For most job seekers, a free resume builder is completely sufficient. FlowCreate''s free plan gives you everything you need. Premium plans are worth it if you''re job searching aggressively or want AI assistance. At ₹299/month, FlowCreate Premium pays for itself with one better interview.</p>
<p><a href="/pricing">Compare FlowCreate plans</a> or <a href="/resume-builder">start building for free</a>.</p>',
  'Career Advice', 'published',
  ARRAY['best free resume builder', 'paid resume builder', 'resume builder comparison', 'free resume maker', 'premium resume features'],
  'FlowCreate Team', '5 min read', now()
),
(
  'career-change-resume-guide',
  'Career Change Resume: How to Pivot Industries Successfully',
  'Switching careers? Learn how to reframe your experience, highlight transferable skills, and build a resume that opens doors in a new industry.',
  'Complete guide to writing a career change resume. Learn how to reframe your experience, identify transferable skills, and convince employers to take a chance on you.',
  '<p>Changing careers is exciting — and terrifying. Your resume needs to tell a compelling story about why your past experience makes you the right person for a completely different field.</p>
<h2>1. Lead With a Strong Summary, Not Your Past Job Titles</h2>
<p>Instead of "Marketing Manager with 8 years in CPG," write: "Strategic professional with 8 years of data-driven campaign management now transitioning into product management."</p>
<h2>2. Identify Your Transferable Skills</h2>
<ul><li><strong>Teaching → Corporate Training:</strong> curriculum design, public speaking, assessment</li><li><strong>Sales → Product Management:</strong> customer discovery, stakeholder management, data analysis</li><li><strong>Nursing → Healthcare Tech:</strong> clinical workflow expertise, compliance knowledge</li><li><strong>Military → Operations:</strong> logistics, team leadership, process optimization</li></ul>
<h2>3. Reframe Your Bullet Points</h2>
<p>Rewrite experience to emphasize skills relevant to your target industry, using metrics and outcomes.</p>
<h2>4. Add Relevant Certifications and Projects</h2>
<p>Fill gaps with certifications from Coursera, LinkedIn Learning, and industry credentials. Side projects prove initiative.</p>
<h2>5. Use a Skills-Based or Hybrid Resume Format</h2>
<p>Lead with a "Relevant Skills" section before chronological work history if your past roles don''t directly relate.</p>
<h2>6. Address the Career Change in Your Cover Letter</h2>
<p>Be honest, enthusiastic, and specific about why this new path excites you and why your unique background is an asset.</p>
<p>Ready to make the leap? <a href="/resume-builder">Build your career-change resume for free on FlowCreate</a>.</p>',
  'Career Advice', 'published',
  ARRAY['career change resume', 'career pivot', 'transferable skills', 'changing industries', 'resume for career changers'],
  'FlowCreate Team', '7 min read', now()
);
