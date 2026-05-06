import "server-only";

import {
  COMPANY_INTERVIEW_PROFILES,
  type CompanyInterviewProfile,
  type CompanyInterviewSlug,
} from "~/lib/company-interviews";
import { db } from "~/server/db";

function getFallbackCompanyInterviewProfile(slug: string) {
  return COMPANY_INTERVIEW_PROFILES[slug as CompanyInterviewSlug] ?? null;
}

export async function getCompanyInterviewProfile(slug: string) {
  try {
    const company = await db.company.findFirst({
      where: { isActive: true, slug },
      include: {
        interviewProfiles: {
          orderBy: { updatedAt: "desc" },
          take: 1,
          where: { isActive: true },
        },
      },
    });

    const interviewProfile = company?.interviewProfiles[0];

    if (!company || !interviewProfile) {
      return getFallbackCompanyInterviewProfile(slug);
    }

    return {
      companyRoute: `/companies/${company.slug}`,
      description: company.description,
      documentKey: interviewProfile.documentKey,
      documentText: interviewProfile.documentText,
      documentTitle: interviewProfile.documentTitle,
      evaluationPrompt: interviewProfile.evaluationPrompt,
      interviewRoute: `/companies/${company.slug}/interview`,
      location: company.location ?? "Remoto",
      logoUrl: company.logoUrl ?? "/assets/logos/microsoft.png",
      maxOutputTokens: interviewProfile.maxOutputTokens,
      name: company.name,
      passScore: interviewProfile.passScore,
      portalRadius: 3.2,
      questionCount: interviewProfile.questionCount,
      questionPrompt: interviewProfile.questionPrompt,
      roleTitle: interviewProfile.roleTitle,
      slug: company.slug,
      systemPrompt: interviewProfile.systemPrompt,
      temperature: interviewProfile.temperature,
      themeColor: company.themeColor ?? "#7dd3fc",
    } satisfies CompanyInterviewProfile;
  } catch {
    return getFallbackCompanyInterviewProfile(slug);
  }
}

export type ResolvedCompanyInterviewProfile = NonNullable<
  Awaited<ReturnType<typeof getCompanyInterviewProfile>>
>;
