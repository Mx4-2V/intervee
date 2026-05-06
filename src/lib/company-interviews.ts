export type CompanyInterviewProfile = {
  companyRoute: string;
  description: string;
  documentKey: string;
  documentTitle: string;
  documentText: string;
  evaluationPrompt?: string | null;
  interviewRoute: string;
  location: string;
  logoUrl: string;
  maxOutputTokens: number;
  name: string;
  portalRadius: number;
  passScore: number;
  questionCount: number;
  questionPrompt?: string | null;
  roleTitle: string;
  slug: string;
  systemPrompt?: string | null;
  temperature: number;
  themeColor: string;
};

const microsoftSoftwareEngineerDocument = `
Role: Software Engineer
Company: Microsoft
Team context: Product engineering teams that ship cloud, AI, platform, and productivity experiences at global scale.

Core responsibilities:
- Build, test, and maintain production software used by enterprise and consumer customers.
- Translate product requirements into clean, reliable, and scalable implementations.
- Participate in architecture reviews, design discussions, and code reviews.
- Debug complex incidents, improve observability, and reduce operational risk.
- Collaborate closely with product, design, security, and program management.
- Use data to improve quality, performance, and customer outcomes.

What strong candidates show:
- Solid computer science fundamentals and strong coding ability.
- Clear reasoning about distributed systems, APIs, performance, reliability, and maintainability.
- Ownership: they can break ambiguous problems into deliverable steps.
- Communication: they explain tradeoffs, risks, and decisions clearly.
- Product mindset: they connect engineering work to customer value.
- Growth mindset and collaboration in cross-functional teams.

Signals Microsoft tends to value:
- Customer obsession and accountability.
- Ability to learn quickly and adapt to new technical areas.
- Respectful collaboration and low-ego problem solving.
- Pragmatic engineering judgment rather than buzzword-heavy answers.

Interview evaluation rubric:
- Technical depth: Can the candidate explain how they would design, build, test, and operate software?
- Problem solving: Can they reason under constraints and make sensible tradeoffs?
- Communication: Are answers structured, direct, and understandable?
- Ownership: Do they proactively consider monitoring, failure modes, and delivery risks?
- Team fit: Do they show collaboration, coachability, and customer focus?

Red flags:
- Vague answers with no implementation detail.
- No mention of testing, reliability, security, or monitoring.
- Over-engineering simple problems.
- Inability to justify technical decisions.
- Weak collaboration or dismissive behavior toward other functions.
`.trim();

export const COMPANY_INTERVIEW_PROFILES = {
  microsoft: {
    companyRoute: "/companies/microsoft",
    description:
      "Simulacion de entrevista para un rol de Software Engineer con foco en claridad tecnica, ownership y criterio de producto.",
    documentKey: "microsoft",
    documentText: microsoftSoftwareEngineerDocument,
    documentTitle: "Microsoft Software Engineer Interview Brief",
    evaluationPrompt: null,
    interviewRoute: "/companies/microsoft/interview",
    location: "Redmond / Remoto hibrido",
    logoUrl: "/assets/logos/microsoft.png",
    maxOutputTokens: 1600,
    name: "Microsoft",
    passScore: 72,
    portalRadius: 3.2,
    questionCount: 5,
    questionPrompt: null,
    roleTitle: "Software Engineer",
    slug: "microsoft",
    systemPrompt: null,
    temperature: 0.35,
    themeColor: "#7dd3fc",
  },
} satisfies Record<string, CompanyInterviewProfile>;

export type CompanyInterviewSlug = keyof typeof COMPANY_INTERVIEW_PROFILES;

export function getCompanyInterviewProfile(slug: string) {
  return COMPANY_INTERVIEW_PROFILES[slug as CompanyInterviewSlug] ?? null;
}

export function getCompanyPortalDefaults(slug: string) {
  const company = getCompanyInterviewProfile(slug);

  if (!company) {
    return null;
  }

  return {
    activationRadius: company.portalRadius,
    companyName: company.name,
    companyRoute: company.interviewRoute,
    companySlug: company.slug,
    documentKey: company.documentKey,
    logoUrl: company.logoUrl,
    themeColor: company.themeColor,
  };
}
