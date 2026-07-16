-- ═══════════════════════════════════════════════
-- SEO UPDATE: Add FAQ sections + internal links to existing articles
-- ═══════════════════════════════════════════════

-- Article 1: ATS-Friendly Resume Guide
UPDATE public.blog_posts SET content = content || '
<h2>Frequently Asked Questions</h2>
<h3>Q: Do I really need an ATS-friendly resume?</h3>
<p>A: Yes — over 75% of large companies use ATS software to screen resumes. If your resume isn''t ATS-compatible, a human recruiter may never see it. <a href="/resume-builder">Use FlowCreate''s ATS-optimized templates</a> to ensure your resume passes automated screening.</p>
<h3>Q: Should I use a PDF or Word document?</h3>
<p>A: Most modern ATS systems handle PDFs well, but some older systems prefer .docx files. If the job posting specifies a format, follow it. FlowCreate exports clean, machine-readable PDFs optimized for ATS parsing.</p>
<h3>Q: Can I use creative designs and still be ATS-friendly?</h3>
<p>A: Yes, but stick to single-column layouts without graphics, tables, or text boxes. <a href="/templates">Browse FlowCreate''s ATS-tested templates</a> — all designed to pass automated screening while looking professional.</p>
<h3>Q: How do I know if my resume is ATS-friendly?</h3>
<p>A: Use a plain-text test: copy your resume content and paste it into Notepad. If it reads clearly with proper section order, it will likely pass ATS parsing. All FlowCreate templates pass this test.</p>'
WHERE slug = 'ats-friendly-resume-guide' AND content NOT LIKE '%Frequently Asked Questions%';

-- Article 2: Resume Mistakes
UPDATE public.blog_posts SET content = content || '
<h2>Frequently Asked Questions</h2>
<h3>Q: What is the #1 resume mistake that gets you rejected?</h3>
<p>A: Typos and grammar errors. A single spelling mistake signals carelessness to recruiters who spend only 6-7 seconds scanning each resume. Always proofread — or use <a href="/resume-builder">FlowCreate''s AI suggestions</a> to catch errors.</p>
<h3>Q: Should I include my GPA on my resume?</h3>
<p>A: Only if you graduated within the last 2-3 years AND your GPA is 3.5 or above. After a few years of work experience, your professional achievements matter far more than your grades.</p>
<h3>Q: Is it okay to use a two-page resume?</h3>
<p>A: Yes — for professionals with 10+ years of experience. For everyone else, stick to one page. <a href="/templates">FlowCreate''s templates</a> help you fit everything cleanly on a single page.</p>'
WHERE slug = 'resume-mistakes-to-avoid' AND content NOT LIKE '%Frequently Asked Questions%';

-- Article 3: Resume Keywords
UPDATE public.blog_posts SET content = content || '
<h2>Frequently Asked Questions</h2>
<h3>Q: How many keywords should I include in my resume?</h3>
<p>A: Aim for 15-25 relevant keywords naturally woven into your experience bullet points and skills section. Don''t keyword-stuff — ATS systems penalize unnatural repetition. <a href="/resume-builder">FlowCreate''s AI can help identify the right keywords</a> for your target role.</p>
<h3>Q: Where can I find the right keywords for my industry?</h3>
<p>A: Study 5-10 job descriptions for roles you''re targeting. Note the recurring technical skills, certifications, and soft skills. Those are your keywords. FlowCreate''s templates organize them in ATS-friendly skills sections.</p>
<h3>Q: Do soft skills count as keywords?</h3>
<p>A: Yes — but back them with evidence. Instead of just listing "leadership," write "Led a team of 8 engineers to deliver 3 product launches on schedule." Show, don''t just tell.</p>'
WHERE slug = 'resume-keywords-by-industry' AND content NOT LIKE '%Frequently Asked Questions%';

-- Article 4: Free vs Paid Resume Builders
UPDATE public.blog_posts SET content = content || '
<h2>Frequently Asked Questions</h2>
<h3>Q: Is FlowCreate really free?</h3>
<p>A: Yes. The core resume builder is completely free — you can create, customize, and download a professional resume without paying anything. <a href="/pricing">Premium plans</a> unlock AI suggestions, unlimited resumes, and cloud backup for power users.</p>
<h3>Q: What does the premium plan include that free doesn''t?</h3>
<p>A: Premium gives you unlimited resumes, AI-powered content suggestions, version history, cloud backup, and priority support. <a href="/pricing">See full plan comparison</a>.</p>
<h3>Q: Do employers care which resume builder I used?</h3>
<p>A: No — employers care about the content and formatting of your resume, not which tool created it. FlowCreate''s PDFs are professional, clean, and indistinguishable from resumes built with expensive software.</p>
<h3>Q: Can I switch from free to premium later?</h3>
<p>A: Absolutely. Upgrade anytime from your <a href="/account">account settings</a>. All your saved resume data carries over seamlessly.</p>'
WHERE slug = 'free-vs-paid-resume-builders' AND content NOT LIKE '%Frequently Asked Questions%';

-- Article 5: Career Change Resume
UPDATE public.blog_posts SET content = content || '
<h2>Frequently Asked Questions</h2>
<h3>Q: How do I explain a career change on my resume?</h3>
<p>A: Lead with a strong professional summary that connects your past experience to your target role. Focus on transferable skills, not past job titles. <a href="/resume-builder">FlowCreate''s customizable templates</a> let you reorder sections to put your most relevant qualifications first.</p>
<h3>Q: Should I include irrelevant past jobs on a career-change resume?</h3>
<p>A: Include them briefly if they demonstrate transferable skills (leadership, communication, problem-solving). But don''t let them dominate. Focus 80% of your resume on what''s relevant to your NEW career direction.</p>
<h3>Q: Do I need a completely different resume format for a career change?</h3>
<p>A: A hybrid format works best — lead with a skills summary, followed by chronological experience. FlowCreate supports custom section ordering so you can highlight your strongest content first. <a href="/templates">Browse templates</a> that work well for career changers.</p>
<h3>Q: Will employers take a chance on someone changing careers?</h3>
<p>A: Yes — especially if you can demonstrate enthusiasm, relevant skills, and a clear reason for the pivot. Many employers value diverse backgrounds. Your resume''s job is to get you the interview; your cover letter and interview explain the "why" behind your career change.</p>'
WHERE slug = 'career-change-resume-guide' AND content NOT LIKE '%Frequently Asked Questions%';
