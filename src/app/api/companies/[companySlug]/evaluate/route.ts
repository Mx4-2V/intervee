import { interviewEvaluationInputSchema } from "~/lib/interview-schema";
import { evaluateCompanyInterview } from "~/lib/interview-ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ companySlug: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { companySlug } = await params;

  try {
    const payload = interviewEvaluationInputSchema.parse(await request.json());
    const { evaluation } = await evaluateCompanyInterview(
      companySlug,
      payload.answers,
    );

    return Response.json(evaluation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to evaluate interview";

    return Response.json(
      { error: message },
      { status: message.startsWith("Unknown company") ? 404 : 500 },
    );
  }
}
