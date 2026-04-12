import { generateCompanyInterviewQuestions } from "~/lib/interview-ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ companySlug: string }>;
};

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

    return Response.json(
      { error: message },
      { status: message.startsWith("Unknown company") ? 404 : 500 },
    );
  }
}
