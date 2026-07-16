# DEEPSEEK PHASE 11 EVALUATION PROMPT

Copy and paste the prompt below into DeepSeek / GLM 5.2. You should also attach the FlowCV full page PDF/screenshots to your DeepSeek conversation as visual reference.

***

```markdown
Role: Senior Frontend Engineer & UI/UX Designer
Task: Execute Phase 11 - The "FlowCV Classics" Premium Template Library & Dashboard Simplification

You are tasked with overhauling the user dashboard and implementing **12 brand new, pixel-perfect resume templates** modeled EXACTLY after FlowCV's top designs. The user has attached screenshots of FlowCV templates for your visual reference.

### Part 1: Dashboard Simplification
Modify `src/pages/Account.tsx` and create related components to achieve a clutter-free, FlowCV-style dashboard:
1. **Tabs Reduction**: Reduce the main user dashboard to exactly 4 tabs: `My Documents` (default), `Master Profile`, `Analytics`, `Settings`.
2. **Documents Tab (`DocumentsDashboard.tsx`)**: Build a clean card grid showing the user's resumes and cover letters with thumbnail previews and quick action dropdowns (Edit, Clone, Delete, Download).
3. **Master Profile Tab (`MasterProfileForm.tsx`)**: Combine all 8 existing profile data forms (Personal, Experience, Skills, etc.) into a single scrollable view with a left-side vertical sticky navigation menu.

### Part 2: The "FlowCV Classics" Premium Template Library
You must completely replace the existing templates with these 12 new premium templates. 
- Modify `src/templates/registry.ts`: Clear out the old templates (or set `featured: false` for all old ones) and register these 12 new ones.
- Modify `src/utils/resumeTemplates.tsx`: Implement the exact HTML/Tailwind rendering logic for all 12 templates.

**CRITICAL RULES FOR TEMPLATES**:
- A4 dimensions are precisely `w-[794px]` by `min-h-[1123px]`.
- Use absolute pixel values for text (e.g., `text-[14px]`, `text-[24px]`) to ensure exact PDF scaling.
- Use only hex/rgb colors, no CSS variables for colors inside the template renderers (html2pdf requires hardcoded colors).
- For proficiency skills, implement a reusable 5-dot matrix component (filled vs empty circles).

---

### The 12 Template Design Specifications

#### 1. `atlantic-blue` (The Dark Navy Sidebar)
- **Reference**: Brian T. Wayne (FlowCV)
- **Layout**: Flex row. Left sidebar `w-[35%]`. Right body `w-[65%]`.
- **Colors**: Sidebar bg `#1e293b` (Navy), text `#f8fafc`. Body bg `#ffffff`, text `#1e293b`.
- **Sidebar Content**: Circular photo (`w-32 h-32`), Name (`text-[28px] font-bold mt-4`), Role (`text-[16px]`), Contact grid with icons, Profile Summary, Languages (5-dot matrix), Awards.
- **Body Content**: Work Experience, Education, Skills. Section headers uppercase, bold.

#### 2. `mercury-flow` (The Centered Minimalist)
- **Reference**: Camila Rivera (FlowCV)
- **Layout**: Single column, high padding (`px-[60px] py-[50px]`).
- **Header**: Centered circular photo, Centered Name (`text-[32px] font-serif`), Centered Role, Centered Contact string separated by bullets (`•`).
- **Body**: Section headers centered, all caps, tracking-widest. Work Experience dates on the left `w-[20%]`, content on the right `w-[80%]`.

#### 3. `steady-form` (The Traditional Academic)
- **Reference**: Rohan K. Patel (FlowCV)
- **Layout**: Single column.
- **Typography**: Classic serif (`font-serif` everywhere).
- **Header**: Name (`text-[36px] font-bold`) and Role (`text-[16px] italic`) left-aligned. Contact info stacked below. Photo on the far right (`absolute top-[50px] right-[60px]`).
- **Body**: Section headers centered with a thin horizontal line (`border-t border-black w-full`) below them. 

#### 4. `classic-clear` (The Corporate Standard)
- **Reference**: Andrew O'Sullivan (FlowCV)
- **Layout**: Single Column.
- **Header**: Massive centered name, centered role, centered inline contact.
- **Body**: Section headers left-aligned, bold, uppercase, with a full-width thick accent line (blue `#2563eb`) underneath (`border-b-2 border-[#2563eb] pb-1 mb-3`).

#### 5. `editorial-rule` (The Executive Dense)
- **Reference**: Lena Hoffmann (FlowCV)
- **Layout**: Single Column.
- **Header**: Name and Role centered. Contact inline.
- **Body**: Section headers left-aligned, all caps, with a full-width thin black line underneath. Very dense, highly academic structure. Clean sans-serif. Dates on the right.

#### 6. `hunter-green` (The Green Panel)
- **Reference**: Yassine Ben Salem (FlowCV)
- **Layout**: Split. Left sidebar 35% (`#166534` Hunter Green, white text). Right body 65% (White).
- **Twist**: The Name (`text-[36px]`) and Role are located at the top of the **White Body**, not the sidebar! 
- **Sidebar**: Profile, Skills (as dot matrix), Languages, Certificates.

#### 7. `cobalt-edge` (The Blue Header Band)
- **Reference**: Alejandro Herrera (FlowCV)
- **Layout**: Top header band full width (`#1e3a8a` Cobalt Blue). Below header: Left sidebar 30% (`#f3f4f6` Light Gray), Right body 70%.
- **Header Band**: Name, Role, Contact in white text.
- **Sidebar**: Skills, Languages.
- **Body**: Summary, Experience, Education.

#### 8. `blue-neon` (The Tech Minimalist)
- **Reference**: Anna Field (FlowCV)
- **Layout**: Single column, with a thick Blue left border on the entire page (`border-l-8 border-blue-600 pl-[40px]`).
- **Body**: Clean spacing. Section headers have a blue dot prefix or small blue accent.

#### 9. `precision-line` (The Grid Matrix)
- **Reference**: Olivia Bennett (FlowCV)
- **Layout**: Single Column, extremely compact margins (`px-[40px] py-[30px]`).
- **Header**: Name centered, role centered.
- **Body**: Section headers are small, bold, uppercase. The Skills section is a tight 3-column CSS grid (`grid-cols-3`) with dot matrix indicators.

#### 10. `saffron-line` (The Warm Accent)
- **Reference**: Matteo Ricci (FlowCV)
- **Layout**: Narrow left sidebar 25% (White background). Main body 75%.
- **Design Details**: Accent color is Saffron (`#d97706`). Section headers have saffron colored icons or left borders. Clean sans-serif.

#### 11. `charcoal-glow` (The Dark Header Band)
- **Reference**: Maria Teresa Villanueva (FlowCV)
- **Layout**: Thick dark charcoal header band (`#1f2937`) spanning full width. 
- **Header Band**: Name and Role in white. Contact info in white. Photo on right side of header band.
- **Body**: Single column, very dense, classic fonts.

#### 12. `quicksilver` (The Silver Sidebar)
- **Reference**: Michael Nwosu (FlowCV)
- **Layout**: 35% Left Sidebar (Light Silver/Gray `#e5e7eb`). Main body white.
- **Sidebar**: Photo, Contact, Skills, Languages. Dark text (`#111827`).
- **Main Body**: Name, Role, Summary, Experience.

#### 13. `almost-black` (The Dark Mode Canvas)
- **Reference**: Carla Rivera (FlowCV - Almost Black)
- **Layout**: Single column or standard grid.
- **Color Palette**: Full dark mode. Background `#0f172a` (Slate 900), text `#f8fafc`. 
- **Body**: Section headers are bold, uppercase, with neon or high-contrast accent color (`#38bdf8`). Skills rendered as dark pill badges with bright borders.

#### 14. `typewriter-photo` (The Image Sidebar)
- **Reference**: (FlowCV - Typewriter)
- **Layout**: 35% Left Sidebar, 65% Main Body.
- **Sidebar**: The entire sidebar has a dark image background overlay (`bg-cover` with a dark overlay `bg-black/60`). Name, Role, and Contact info sit over this image in white, typewriter serif font.
- **Main Body**: White background, dark typewriter serif font (`font-mono` or classic serif), highly academic right-side structure.

---

### Execution Plan
1. **P11-T1**: Modify `src/pages/Account.tsx` to the 4-tab dashboard structure.
2. **P11-T2**: Create `DocumentsDashboard.tsx` and wire it to the `documents` tab.
3. **P11-T3**: Create `MasterProfileForm.tsx` and wire it to the `profile` tab.
4. **P11-T4**: Update `src/templates/registry.ts` to deprecate old templates (set `featured: false`) and register the 14 new FlowCV Classics.
5. **P11-T5**: Implement the HTML/Tailwind rendering logic for all 14 templates in `src/utils/resumeTemplates.tsx`. Pay extremely close attention to the nested flex/grid layouts required for the sidebars and header bands.

Ensure all React components compile without TypeScript errors before finalizing.
```
