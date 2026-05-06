import { generateCompanyInterviewQuestions } from "~/lib/interview-ai";
import { getCompanyInterviewProfile } from "~/server/company-interviews";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ companySlug: string }>;
};

async function buildFallbackQuestions(companySlug: string) {
  const company = await getCompanyInterviewProfile(companySlug);

  if (!company) {
    return null;
  }

  return {
    company,
    questions: [
      {
        evaluationFocus: "Claridad tecnica y decisiones de implementacion",
        id: "fallback-1",
        prompt: `Cuentame sobre un proyecto relevante para el rol de ${company.roleTitle}. Que problema resolviste, que decisiones tecnicas tomaste y por que?`,
      },
      {
        evaluationFocus: "Tradeoffs, calidad y confiabilidad",
        id: "fallback-2",
        prompt:
          "Si tuvieras que mejorar un sistema existente bajo restricciones de tiempo, como priorizarias rendimiento, mantenibilidad, testing y monitoreo?",
      },
      {
        evaluationFocus: "Ownership y colaboracion",
        id: "fallback-3",
        prompt:
          "Describe una situacion donde tuviste que alinear a otras personas, defender una decision tecnica y al mismo tiempo adaptarte a feedback de producto o negocio.",
      },
    ],
  };
}

export async function POST(_: Request, { params }: RouteContext) {
  const { companySlug } = await params;

  try {
    const { company, questions } =
      await generateCompanyInterviewQuestions(companySlug);

    return Response.json({
      companyName: company.name,
      questions,
      roleTitle: company.roleTitle,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate questions";

    const fallback = await buildFallbackQuestions(companySlug);
    const shouldUseFallback =
      fallback &&
      /quota|rate limit|exceeded|temporarily unavailable|overloaded/i.test(
        message,
      );

    if (shouldUseFallback) {
      return Response.json({
        companyName: fallback.company.name,
        questions: fallback.questions,
        roleTitle: fallback.company.roleTitle,
      });
    }

    return Response.json(
      { error: message },
      { status: message.startsWith("Unknown company") ? 404 : 500 },
    );
  }
}
