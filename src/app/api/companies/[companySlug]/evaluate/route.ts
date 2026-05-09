import { interviewEvaluationInputSchema, type InterviewAnswer } from "~/lib/interview-schema";
import { evaluateCompanyInterview } from "~/lib/interview-ai";
import { requireUserApi } from "~/server/auth/admin";
import { getCompanyInterviewProfile } from "~/server/company-interviews";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QUOTA_ERROR_PATTERN =
  /quota|rate limit|exceeded|temporarily unavailable|overloaded/i;

async function buildFallbackEvaluation(
  companySlug: string,
  answers: InterviewAnswer[],
) {
  const company = await getCompanyInterviewProfile(companySlug);
  if (!company) return null;

  const questionReviews = answers.map((answer) => {
    const words = answer.answer.trim().split(/\s+/).length;
    const score = Math.min(100, Math.max(40, Math.round(words * 1.5)));
    return {
      feedback:
        "Evaluacion automatica no disponible. Tu respuesta fue registrada correctamente.",
      questionId: answer.id,
      score,
    };
  });

  const overallScore = Math.round(
    questionReviews.reduce((sum, r) => sum + r.score, 0) /
      Math.max(1, questionReviews.length),
  );
  const passed = overallScore >= company.passScore;

  return {
    companyName: company.name,
    hiringSignals: ["Respuestas completadas correctamente"],
    overallScore,
    passScore: company.passScore,
    passed,
    questionReviews,
    recommendation: passed ? ("apto" as const) : ("no_apto" as const),
    risks: ["Evaluacion detallada no disponible por limite de servicio"],
    roleTitle: company.roleTitle,
    summary:
      "El servicio de evaluacion no esta disponible en este momento. El puntaje es aproximado basado en la longitud de tus respuestas.",
  };
}

type RouteContext = {
  params: Promise<{ companySlug: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const unauthorized = await requireUserApi();
  if (unauthorized) return unauthorized;

  const { companySlug } = await params;

  const parseResult = interviewEvaluationInputSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parseResult.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { answers } = parseResult.data;

  try {
    const { evaluation } = await evaluateCompanyInterview(companySlug, answers);
    return Response.json(evaluation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to evaluate interview";

    if (QUOTA_ERROR_PATTERN.test(message)) {
      const fallback = await buildFallbackEvaluation(companySlug, answers);
      if (fallback) return Response.json(fallback);
    }

    return Response.json(
      { error: message },
      { status: message.startsWith("Unknown company") ? 404 : 500 },
    );
  }
}
