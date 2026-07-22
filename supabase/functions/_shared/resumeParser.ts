type JsonRecord = Record<string, unknown>

function createEmptyResume() {
  return {
    personal: { name: '', email: '', phone: '', address: '', linkedin: '', website: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeStringList(value: unknown): string[] {
  if (typeof value === 'string') return splitList(value)
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeLanguages(value: unknown): Array<{ language: string; proficiency: string }> {
  const entries = typeof value === 'string' ? splitList(value) : Array.isArray(value) ? value : []

  return entries.flatMap((entry) => {
    if (typeof entry === 'string') {
      const language = entry.trim()
      return language ? [{ language, proficiency: '' }] : []
    }
    if (!isRecord(entry) || typeof entry.language !== 'string' || !entry.language.trim()) return []
    return [{
      language: entry.language.trim(),
      proficiency: typeof entry.proficiency === 'string' ? entry.proficiency.trim() : '',
    }]
  })
}

export function parseExtractedJson(rawText: string) {
  try {
    const cleanedText = rawText.replace(/```json|```/gi, '').trim()
    const parsed: unknown = JSON.parse(cleanedText)
    if (!isRecord(parsed)) return createEmptyResume()

    const projects = Array.isArray(parsed.projects)
      ? parsed.projects.flatMap((project) => {
          if (!isRecord(project)) return []
          return [{
            ...project,
            technologies: normalizeStringList(project.technologies),
          }]
        })
      : []

    return {
      ...parsed,
      personal: isRecord(parsed.personal) ? parsed.personal : createEmptyResume().personal,
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      skills: normalizeStringList(parsed.skills),
      projects,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      languages: normalizeLanguages(parsed.languages),
    }
  } catch {
    return createEmptyResume()
  }
}
