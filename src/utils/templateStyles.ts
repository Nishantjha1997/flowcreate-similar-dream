export const templateStyles = {
  // Enhanced Modern - Tech Industry
  modern: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl border border-slate-200",
    header: "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8 relative overflow-hidden",
    headerName: "text-4xl font-bold tracking-tight drop-shadow-sm",
    headerTitle: "text-xl mt-2 opacity-90",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-6 border-b border-slate-100 hover:bg-slate-50/50 transition-colors",
    sectionTitle: "text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-4",
    subsection: "mb-6 p-4 rounded-lg bg-slate-50/80",
    subsectionTitle: "text-lg font-bold flex justify-between text-slate-800",
    subsectionDate: "text-blue-600 font-medium",
    subsectionContent: "mt-3 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all",
  },

  // Enhanced Classic - Finance/Legal
  classic: {
    container: "font-serif max-w-4xl mx-auto bg-white shadow-xl border-2 border-slate-300",
    header: "text-center py-12 border-b-4 border-slate-800 bg-slate-50",
    headerName: "text-5xl font-bold text-slate-900 tracking-wide",
    headerTitle: "text-2xl mt-4 text-slate-700 italic",
    headerContact: "mt-6 flex justify-center flex-wrap gap-6 text-base text-slate-600",
    section: "p-8 border-b-2 border-slate-200",
    sectionTitle: "text-3xl font-bold mb-6 text-slate-900 text-center border-b-2 border-slate-400 pb-3",
    subsection: "mb-8 border-l-4 border-slate-400 pl-6",
    subsectionTitle: "text-xl font-bold text-slate-900 flex justify-between mb-2",
    subsectionDate: "text-slate-600 italic font-medium",
    subsectionContent: "mt-4 text-slate-800 leading-loose text-lg",
    skillsContainer: "flex flex-wrap gap-4 justify-center",
    skillBadge: "border-2 border-slate-700 text-slate-800 px-4 py-2 rounded-md text-base font-medium hover:bg-slate-100 transition-colors",
  },

  // Enhanced Creative - Design/Marketing
  creative: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden",
    header: "bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white p-10 relative",
    headerName: "text-5xl font-extrabold tracking-tight drop-shadow-lg",
    headerTitle: "text-2xl mt-3 opacity-95 font-light",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-pink-100",
    sectionTitle: "text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 relative",
    subsection: "mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400",
    subsectionTitle: "text-xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-purple-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105",
  },

  // Enhanced Technical - Software/Engineering
  technical: {
    container: "font-mono max-w-4xl mx-auto bg-slate-900 text-green-400 shadow-2xl border border-green-500",
    header: "bg-black text-green-400 p-8 border-b-2 border-green-500 font-mono",
    headerName: "text-4xl font-bold tracking-wider text-green-300",
    headerTitle: "text-xl mt-2 text-green-400 opacity-80",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm text-green-300",
    section: "p-6 border-b border-green-800 hover:bg-slate-800/50 transition-colors",
    sectionTitle: "text-2xl font-bold text-green-300 mb-4 border-l-4 border-green-400 pl-4 font-mono",
    subsection: "mb-6 p-4 bg-slate-800/80 rounded border border-green-700",
    subsectionTitle: "text-lg font-bold flex justify-between text-green-200",
    subsectionDate: "text-green-400 font-mono text-sm",
    subsectionContent: "mt-3 text-green-100 leading-relaxed font-mono text-sm",
    skillsContainer: "grid grid-cols-2 md:grid-cols-3 gap-3",
    skillBadge: "bg-green-600 text-black px-4 py-2 rounded text-sm font-bold border border-green-400 hover:bg-green-500 transition-colors",
  },

  // Enhanced Professional - Corporate
  professional: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-xl border-l-8 border-blue-800",
    header: "bg-slate-100 p-10 border-b-4 border-blue-800 relative",
    headerName: "text-4xl font-bold text-slate-900 tracking-tight",
    headerTitle: "text-2xl mt-3 text-blue-800 font-semibold",
    headerContact: "mt-6 flex flex-wrap gap-6 text-base text-slate-700",
    section: "p-8 border-b border-slate-200",
    sectionTitle: "text-2xl font-bold text-blue-800 mb-6 pb-2 border-b-2 border-blue-200",
    subsection: "mb-8 p-6 bg-blue-50/50 rounded-lg border-l-4 border-blue-300",
    subsectionTitle: "text-lg font-bold text-slate-900 flex justify-between",
    subsectionDate: "text-blue-700 font-semibold",
    subsectionContent: "mt-4 text-slate-800 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-300 hover:bg-blue-200 transition-colors",
  },

  // Enhanced Minimalist - Clean & Simple
  minimalist: {
    container: "font-light max-w-[800px] mx-auto p-12 bg-white text-slate-800 shadow-lg border border-slate-200",
    header: "mb-10 pb-6 border-b border-slate-300",
    name: "text-3xl font-light text-center tracking-wide text-slate-900",
    contactInfo: "text-sm text-center text-slate-600 mt-4 space-x-4",
    contactItem: "inline-flex items-center hover:text-slate-800 transition-colors",
    summary: "text-base leading-relaxed border-b pb-6 text-center text-slate-700 mt-6",
    sectionContainer: "mt-8",
    sectionTitle: "text-sm uppercase tracking-[0.2em] mb-6 font-medium text-slate-800 border-b pb-2",
    experienceItem: "mb-6 pb-4 border-b border-slate-100 last:border-b-0",
    experienceTitle: "text-lg font-medium text-slate-900",
    experienceCompany: "text-base text-slate-600 italic",
    experienceDates: "text-sm text-slate-500 mt-1",
    experienceDescription: "text-sm mt-3 whitespace-pre-line leading-relaxed text-slate-700",
    educationItem: "mb-4",
    educationSchool: "text-lg font-medium text-slate-900",
    educationDegree: "text-base text-slate-600",
    educationDates: "text-sm text-slate-500",
    skillsContainer: "flex flex-wrap gap-3",
    skill: "text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-700 hover:bg-slate-200 transition-colors"
  },

  // Enhanced Executive - Leadership Roles
  executive: {
    container: "font-serif max-w-[800px] mx-auto p-12 bg-white text-slate-800 shadow-xl border-t-8 border-slate-800",
    header: "mb-12 pb-8 border-b-2 border-slate-300",
    name: "text-4xl font-bold text-slate-900 border-b-4 border-slate-800 pb-4 tracking-wide",
    contactInfo: "text-base text-slate-600 mt-6 flex flex-wrap gap-x-8 gap-y-2",
    contactItem: "inline-flex items-center font-medium",
    summary: "text-lg leading-relaxed my-8 text-slate-800 italic",
    sectionContainer: "mt-10",
    sectionTitle: "text-2xl font-bold mb-6 text-slate-900 border-b-2 border-slate-400 pb-3",
    experienceItem: "mb-8 pb-6 border-b border-slate-200",
    experienceTitle: "text-xl font-bold text-slate-900",
    experienceCompany: "text-lg italic text-slate-700 font-medium",
    experienceDates: "text-base text-slate-600 font-medium",
    experienceDescription: "text-base mt-4 whitespace-pre-line leading-relaxed text-slate-800",
    educationItem: "mb-6",
    educationSchool: "text-lg font-bold text-slate-900",
    educationDegree: "text-lg text-slate-700",
    educationDates: "text-base text-slate-600",
    skillsContainer: "flex flex-wrap gap-4",
    skill: "text-base px-4 py-2 bg-slate-200 rounded-lg text-slate-800 font-medium border border-slate-300"
  },

  // NEW: Healthcare Professional
  medical: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-xl border-t-4 border-teal-600",
    header: "bg-gradient-to-r from-teal-50 to-cyan-50 p-10 border-b-4 border-teal-600",
    headerName: "text-4xl font-bold text-teal-800 tracking-tight",
    headerTitle: "text-2xl mt-3 text-teal-700",
    headerContact: "mt-6 flex flex-wrap gap-6 text-base text-teal-600",
    section: "p-8 border-b border-teal-100",
    sectionTitle: "text-2xl font-bold text-teal-700 mb-6 flex items-center gap-3 border-l-4 border-teal-500 pl-4",
    subsection: "mb-8 p-6 bg-teal-50/50 rounded-lg border border-teal-200",
    subsectionTitle: "text-lg font-bold text-slate-800 flex justify-between",
    subsectionDate: "text-teal-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md",
  },

  // NEW: Sales & Marketing
  sales: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl border border-orange-200",
    header: "bg-gradient-to-r from-orange-500 to-red-500 text-white p-10 relative overflow-hidden",
    headerName: "text-5xl font-extrabold tracking-tight drop-shadow-lg",
    headerTitle: "text-2xl mt-3 opacity-95",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-orange-100",
    sectionTitle: "text-3xl font-bold text-orange-600 mb-6 relative",
    subsection: "mb-8 p-6 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400",
    subsectionTitle: "text-xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-orange-600 font-bold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg",
  },

  // NEW: Academic/Education
  academic: {
    container: "font-serif max-w-4xl mx-auto bg-white shadow-xl border-2 border-indigo-200",
    header: "text-center py-12 border-b-3 border-indigo-600 bg-indigo-50",
    headerName: "text-5xl font-bold text-indigo-900 tracking-wide",
    headerTitle: "text-2xl mt-4 text-indigo-700 italic",
    headerContact: "mt-6 flex justify-center flex-wrap gap-6 text-base text-indigo-600",
    section: "p-8 border-b border-indigo-100",
    sectionTitle: "text-2xl font-bold mb-6 text-indigo-800 text-center border-b-2 border-indigo-300 pb-3",
    subsection: "mb-8 p-6 bg-indigo-50/70 rounded-lg border-l-4 border-indigo-400",
    subsectionTitle: "text-lg font-bold text-slate-900 flex justify-between",
    subsectionDate: "text-indigo-600 font-semibold italic",
    subsectionContent: "mt-4 text-slate-800 leading-loose",
    skillsContainer: "flex flex-wrap gap-4 justify-center",
    skillBadge: "border-2 border-indigo-500 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50",
  },

  // NEW: Digital Marketing Specialist
  "digital-marketing": {
    container: "font-sans max-w-4xl mx-auto bg-gradient-to-br from-pink-50 to-purple-50 shadow-2xl rounded-2xl overflow-hidden",
    header: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white p-10",
    headerName: "text-5xl font-extrabold tracking-tight drop-shadow-lg",
    headerTitle: "text-2xl mt-3 opacity-95 font-light",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-purple-100",
    sectionTitle: "text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6",
    subsection: "mb-8 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-200",
    subsectionTitle: "text-xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-purple-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg",
  },

  // NEW: Finance Professional
  finance: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-xl border-l-8 border-emerald-700",
    header: "bg-emerald-50 p-10 border-b-4 border-emerald-700",
    headerName: "text-4xl font-bold text-emerald-900 tracking-tight",
    headerTitle: "text-2xl mt-3 text-emerald-700 font-semibold",
    headerContact: "mt-6 flex flex-wrap gap-6 text-base text-emerald-600",
    section: "p-8 border-b border-emerald-100",
    sectionTitle: "text-2xl font-bold text-emerald-800 mb-6 border-b-2 border-emerald-300 pb-2",
    subsection: "mb-8 p-6 bg-emerald-50/70 rounded-lg border-l-4 border-emerald-400",
    subsectionTitle: "text-lg font-bold text-slate-900 flex justify-between",
    subsectionDate: "text-emerald-700 font-bold",
    subsectionContent: "mt-4 text-slate-800 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-emerald-600",
  },

  // NEW: Startup Professional
  startup: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-violet-200",
    header: "bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-white p-10",
    headerName: "text-5xl font-extrabold tracking-tight drop-shadow-lg",
    headerTitle: "text-2xl mt-3 opacity-95 font-medium",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-violet-100",
    sectionTitle: "text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-6",
    subsection: "mb-8 p-6 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 border-l-4 border-violet-400",
    subsectionTitle: "text-xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-violet-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-violet-500 to-blue-500 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg",
  },

  // NEW: Consultant
  consultant: {
    container: "font-serif max-w-4xl mx-auto bg-white shadow-xl border-2 border-slate-300",
    header: "bg-slate-800 text-white p-10",
    headerName: "text-4xl font-bold tracking-wide",
    headerTitle: "text-2xl mt-3 opacity-90",
    headerContact: "mt-6 flex flex-wrap gap-6 text-base opacity-80",
    section: "p-8 border-b-2 border-slate-200",
    sectionTitle: "text-2xl font-bold text-slate-800 mb-6 border-l-6 border-slate-600 pl-6",
    subsection: "mb-8 p-6 bg-slate-50 rounded border-l-4 border-slate-400",
    subsectionTitle: "text-lg font-bold text-slate-900 flex justify-between",
    subsectionDate: "text-slate-600 font-semibold",
    subsectionContent: "mt-4 text-slate-800 leading-relaxed text-lg",
    skillsContainer: "flex flex-wrap gap-4",
    skillBadge: "bg-slate-700 text-white px-4 py-2 rounded text-sm font-medium border border-slate-600",
  },

  // NEW: Product Manager
  "product-manager": {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl border border-cyan-200 rounded-xl overflow-hidden",
    header: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-10",
    headerName: "text-5xl font-extrabold tracking-tight drop-shadow-lg",
    headerTitle: "text-2xl mt-3 opacity-95",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-cyan-100",
    sectionTitle: "text-3xl font-bold text-cyan-700 mb-6 flex items-center gap-3 border-l-4 border-cyan-500 pl-4",
    subsection: "mb-8 p-6 rounded-xl bg-cyan-50/70 border border-cyan-200",
    subsectionTitle: "text-xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-cyan-600 font-bold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg",
  },

  // NEW: Developer Specialist
  developer: {
    container: "font-mono max-w-4xl mx-auto bg-slate-950 text-emerald-400 shadow-2xl border border-emerald-500 rounded-lg overflow-hidden",
    header: "bg-black/80 text-emerald-300 p-8 border-b-2 border-emerald-500",
    headerName: "text-4xl font-bold tracking-wider text-emerald-200",
    headerTitle: "text-xl mt-2 text-emerald-400 opacity-90",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm text-emerald-300",
    section: "p-6 border-b border-emerald-800/50",
    sectionTitle: "text-2xl font-bold text-emerald-300 mb-4 border-l-4 border-emerald-400 pl-4",
    subsection: "mb-6 p-4 bg-slate-900/80 rounded border border-emerald-700/50",
    subsectionTitle: "text-lg font-bold flex justify-between text-emerald-200",
    subsectionDate: "text-emerald-400 font-mono text-sm",
    subsectionContent: "mt-3 text-emerald-100/90 leading-relaxed font-mono text-sm",
    skillsContainer: "grid grid-cols-2 md:grid-cols-4 gap-2",
    skillBadge: "bg-emerald-600/80 text-black px-3 py-1 rounded text-xs font-bold border border-emerald-400",
  },

  // NEW: Data Scientist
  "data-scientist": {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-xl border-t-6 border-purple-600 rounded-lg overflow-hidden",
    header: "bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-10",
    headerName: "text-4xl font-bold tracking-tight drop-shadow-sm",
    headerTitle: "text-2xl mt-3 opacity-95",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-purple-100",
    sectionTitle: "text-2xl font-bold text-purple-700 mb-6 flex items-center gap-3 border-l-4 border-purple-500 pl-4",
    subsection: "mb-8 p-6 rounded-lg bg-purple-50/70 border border-purple-200",
    subsectionTitle: "text-lg font-bold flex justify-between text-slate-800",
    subsectionDate: "text-purple-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "grid grid-cols-2 md:grid-cols-3 gap-3",
    skillBadge: "bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md",
  },

  // NEW: Elegant Design
  elegant: {
    container: "font-serif max-w-4xl mx-auto bg-white shadow-2xl border border-rose-200 rounded-2xl overflow-hidden",
    header: "text-center py-12 border-b border-rose-300 bg-gradient-to-b from-rose-50 to-white",
    headerName: "text-5xl font-light text-rose-900 tracking-wide mb-4",
    headerTitle: "text-2xl text-rose-700 italic font-light",
    headerContact: "mt-8 flex justify-center flex-wrap gap-6 text-base text-rose-600",
    section: "p-10 border-b border-rose-100",
    sectionTitle: "text-3xl font-light mb-8 text-rose-800 text-center relative pb-4",
    subsection: "mb-10 p-6 rounded-xl bg-rose-50/40 border border-rose-200",
    subsectionTitle: "text-xl font-semibold text-slate-900 flex justify-between mb-2",
    subsectionDate: "text-rose-600 italic",
    subsectionContent: "mt-4 text-slate-800 leading-loose text-lg",
    skillsContainer: "flex flex-wrap gap-4 justify-center",
    skillBadge: "border-2 border-rose-400 text-rose-700 px-6 py-3 rounded-full text-sm font-medium hover:bg-rose-50",
  },

  // NEW: Artistic Portfolio
  artistic: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border-4 border-amber-300",
    header: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white p-12 relative",
    headerName: "text-6xl font-black tracking-tight drop-shadow-xl transform -rotate-1",
    headerTitle: "text-2xl mt-4 opacity-95 font-bold transform rotate-1",
    headerContact: "mt-8 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-10 border-b-4 border-amber-200",
    sectionTitle: "text-4xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mb-8 transform -skew-x-3",
    subsection: "mb-10 p-8 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-4 border-amber-200 transform hover:scale-102 transition-transform",
    subsectionTitle: "text-2xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-orange-600 font-black",
    subsectionContent: "mt-6 text-slate-700 leading-relaxed text-lg",
    skillsContainer: "flex flex-wrap gap-4",
    skillBadge: "bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-full text-base font-black shadow-xl transform hover:scale-110 transition-all",
  },

  // NEW: Teacher/Educator
  teacher: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-xl border-l-8 border-green-600",
    header: "bg-green-50 p-10 border-b-4 border-green-600",
    headerName: "text-4xl font-bold text-green-800 tracking-tight",
    headerTitle: "text-2xl mt-3 text-green-700",
    headerContact: "mt-6 flex flex-wrap gap-6 text-base text-green-600",
    section: "p-8 border-b border-green-100",
    sectionTitle: "text-2xl font-bold text-green-700 mb-6 flex items-center gap-3 border-l-4 border-green-500 pl-4",
    subsection: "mb-8 p-6 bg-green-50/70 rounded-lg border border-green-200",
    subsectionTitle: "text-lg font-bold text-slate-800 flex justify-between",
    subsectionDate: "text-green-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold",
  },

  // NEW: ATS Optimized Pro
  "ats-pro": {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-md border border-gray-300",
    header: "bg-gray-100 p-8 border-b-2 border-gray-400",
    headerName: "text-3xl font-bold text-gray-900",
    headerTitle: "text-xl mt-2 text-gray-700",
    headerContact: "mt-4 flex flex-wrap gap-4 text-sm text-gray-600",
    section: "p-6 border-b border-gray-200",
    sectionTitle: "text-xl font-bold text-gray-800 mb-4 uppercase tracking-wide",
    subsection: "mb-6",
    subsectionTitle: "text-lg font-bold text-gray-900 flex justify-between",
    subsectionDate: "text-gray-600",
    subsectionContent: "mt-2 text-gray-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-2",
    skillBadge: "bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm",
  },

  // NEW: Compact Layout
  compact: {
    container: "font-sans max-w-3xl mx-auto bg-white shadow-lg border border-gray-200 text-sm",
    header: "bg-gray-50 p-6 border-b border-gray-300",
    headerName: "text-2xl font-bold text-gray-900",
    headerTitle: "text-lg mt-1 text-gray-700",
    headerContact: "mt-3 flex flex-wrap gap-3 text-xs text-gray-600",
    section: "p-4 border-b border-gray-100",
    sectionTitle: "text-lg font-bold text-gray-800 mb-3 uppercase tracking-wide",
    subsection: "mb-4",
    subsectionTitle: "text-base font-bold text-gray-900 flex justify-between",
    subsectionDate: "text-gray-600 text-xs",
    subsectionContent: "mt-1 text-gray-700 leading-snug text-sm",
    skillsContainer: "flex flex-wrap gap-1",
    skillBadge: "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs",
  },

  // NEW: VP Leader
  "vp-leader": {
    container: "font-serif max-w-4xl mx-auto bg-white shadow-2xl border-t-8 border-blue-900",
    header: "bg-blue-900 text-white p-12",
    headerName: "text-5xl font-bold tracking-wide",
    headerTitle: "text-2xl mt-4 opacity-90 font-light",
    headerContact: "mt-8 flex flex-wrap gap-8 text-lg opacity-85",
    section: "p-10 border-b-2 border-blue-100",
    sectionTitle: "text-3xl font-bold text-blue-900 mb-8 border-l-6 border-blue-700 pl-8",
    subsection: "mb-10 p-8 bg-blue-50/50 rounded-xl border-l-6 border-blue-300",
    subsectionTitle: "text-xl font-bold text-slate-900 flex justify-between",
    subsectionDate: "text-blue-700 font-bold text-lg",
    subsectionContent: "mt-6 text-slate-800 leading-loose text-lg",
    skillsContainer: "flex flex-wrap gap-4",
    skillBadge: "bg-blue-900 text-white px-6 py-3 rounded-lg text-base font-semibold",
  },

  // NEW: Pharmaceutical Specialist
  pharma: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-xl border-l-8 border-blue-700",
    header: "bg-blue-50 p-10 border-b-4 border-blue-700",
    headerName: "text-4xl font-bold text-blue-900 tracking-tight",
    headerTitle: "text-2xl mt-3 text-blue-700",
    headerContact: "mt-6 flex flex-wrap gap-6 text-base text-blue-600",
    section: "p-8 border-b border-blue-100",
    sectionTitle: "text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2",
    subsection: "mb-8 p-6 bg-blue-50/70 rounded-lg border-l-4 border-blue-400",
    subsectionTitle: "text-lg font-bold text-slate-900 flex justify-between",
    subsectionDate: "text-blue-700 font-semibold",
    subsectionContent: "mt-4 text-slate-800 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold",
  },

  // NEW: Marketing Manager
  marketing: {
    container: "font-sans max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-pink-200",
    header: "bg-gradient-to-r from-pink-500 to-purple-600 text-white p-10",
    headerName: "text-5xl font-extrabold tracking-tight drop-shadow-lg",
    headerTitle: "text-2xl mt-3 opacity-95",
    headerContact: "mt-6 flex flex-wrap gap-4 text-sm opacity-90",
    section: "p-8 border-b border-pink-100",
    sectionTitle: "text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6",
    subsection: "mb-8 p-6 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-400",
    subsectionTitle: "text-xl font-bold flex justify-between text-slate-800",
    subsectionDate: "text-pink-600 font-semibold",
    subsectionContent: "mt-4 text-slate-700 leading-relaxed",
    skillsContainer: "flex flex-wrap gap-3",
    skillBadge: "bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg",
  }
};

export type TemplateStylesKey = keyof typeof templateStyles;

export const getTemplateStyle = (templateKey: string) => {
  return templateStyles[templateKey as TemplateStylesKey] || templateStyles.modern;
};

export const applyCustomization = (
  baseStyles: typeof templateStyles.modern,
  customization: any
) => {
  let customizedStyles = { ...baseStyles };
  
  // Apply font family
  if (customization?.fontFamily && customization.fontFamily !== 'default') {
    const fontFamilyStyle = `font-family: ${customization.fontFamily};`;
    customizedStyles.container = `${customizedStyles.container} style="${fontFamilyStyle}"`;
  }
  
  // Apply font size
  if (customization?.fontSize) {
    let fontSizeClass = '';
    switch (customization.fontSize) {
      case 'small':
        fontSizeClass = 'text-sm';
        break;
      case 'medium':
        fontSizeClass = 'text-base';
        break;
      case 'large':
        fontSizeClass = 'text-lg';
        break;
    }
    customizedStyles.container = `${customizedStyles.container} ${fontSizeClass}`;
  }
  
  // Apply spacing
  if (customization?.spacing) {
    let spacingClass = '';
    switch (customization.spacing) {
      case 'compact':
        spacingClass = 'space-y-2';
        break;
      case 'normal':
        spacingClass = 'space-y-4';
        break;
      case 'spacious':
        spacingClass = 'space-y-6';
        break;
    }
    customizedStyles.container = `${customizedStyles.container} ${spacingClass}`;
  }
  
  // Apply primary color (assuming it's used in headers and titles)
  if (customization?.primaryColor) {
    // We need to handle this in the actual component rendering since it might need inline styles
  }
  
  // Apply secondary color
  if (customization?.secondaryColor) {
    // We need to handle this in the actual component rendering since it might need inline styles
  }
  
  return customizedStyles;
};

export const templateNameMap = {
  modern: "modern",
  classic: "classic", 
  creative: "creative",
  technical: "technical",
  professional: "professional",
  minimalist: "minimalist",
  executive: "executive",
  medical: "medical",
  sales: "sales",
  academic: "academic",
  "digital-marketing": "digital-marketing",
  finance: "finance",
  startup: "startup",
  consultant: "consultant",
  "product-manager": "product-manager",
  developer: "developer",
  "data-scientist": "data-scientist",
  elegant: "elegant",
  artistic: "artistic",
  teacher: "teacher",
  "ats-pro": "ats-pro",
  compact: "compact",
  "vp-leader": "vp-leader",
  pharma: "pharma",
  marketing: "marketing"
};
