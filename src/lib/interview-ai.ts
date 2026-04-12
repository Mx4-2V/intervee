import { generateObject, gateway } from "ai";

import { env } from "~/env";
import { getCompanyInterviewProfile } from "~/lib/company-interviews";
import {
  type InterviewAnswer,
  type InterviewQuestion,
  interviewEvaluationModelSchema,
  interviewQuestionsResponseSchema,
} from "~/lib/interview-schema";

function ensureAiGatewayConfig() {
  if (!env.AI_GATEWAY_API_KEY && !process.env.VERCEL) {
    throw new Error(
      "Missing AI Gateway credentials. Set AI_GATEWAY_API_KEY in .env for local development.",
    );
  }
}

function getInterviewModel() {
  ensureAiGatewayConfig();
  return gateway(env.AI_INTERVIEW_MODEL);
}

export async function generateCompanyInterviewQuestions(companySlug: string) {
  const company = getCompanyInterviewProfile(companySlug);

  if (!company) {
    throw new Error(`Unknown company '${companySlug}'`);
  }

  const result = await generateObject({
    maxOutputTokens: env.AI_INTERVIEW_MAX_OUTPUT_TOKENS,
    model: getInterviewModel(),
    prompt: [
      `Company: ${company.name}`,
      `Role: ${company.roleTitle}`,
      `Question count: ${env.AI_INTERVIEW_QUESTION_COUNT}`,
      "",
      "Use only the following document as hiring context:",
      company.documentText,
      "",
      "Generate direct interview questions for a real screening.",
      "Questions must be answerable in free text by a candidate.",
      "Each question needs a short evaluationFocus describing what you want to measure.",
      "Use pragmatic engineering language and avoid trivia.",
      `Return exactly ${env.AI_INTERVIEW_QUESTION_COUNT} questions.`,
    ].join("\n"),
    schema: interviewQuestionsResponseSchema,
    schemaDescription:
      "Interview questions for a candidate based on a company hiring brief.",
    schemaName: "interview_questions",
    system:
      "You are a senior technical interviewer creating a structured job interview. Keep the bar serious, practical, and aligned to the supplied hiring brief.",
    temperature: env.AI_INTERVIEW_TEMPERATURE,
  });

  const response = result.object;

  return {
    company,
    questions: response.questions
      .slice(0, env.AI_INTERVIEW_QUESTION_COUNT)
      .map((question: InterviewQuestion, index: number) => ({
        ...question,
        id: question.id || `question-${index + 1}`,
      })),
  };
}

export async function evaluateCompanyInterview(
  companySlug: string,
  answers: InterviewAnswer[],
) {
  const company = getCompanyInterviewProfile(companySlug);

  if (!company) {
    throw new Error(`Unknown company '${companySlug}'`);
  }

  const prompt = [
    `Company: ${company.name}`,
    `Role: ${company.roleTitle}`,
    "",
    "Evaluate this candidate using only the hiring document below.",
    company.documentText,
    "",
    "Candidate answers:",
    ...answers.map((answer, index) => {
      return [
        `${index + 1}. Question ID: ${answer.id}`,
        `Question: ${answer.prompt}`,
        `Evaluation focus: ${answer.evaluationFocus}`,
        `Candidate answer: ${answer.answer}`,
      ].join("\n");
    }),
    "",
    "Score each answer from 0 to 100. Be strict but fair.",
    "Summary feedback must explain whether the candidate is hireable for this specific role.",
  ].join("\n\n");

  const result = await generateObject({
    maxOutputTokens: env.AI_INTERVIEW_MAX_OUTPUT_TOKENS,
    model: getInterviewModel(),
    prompt,
    schema: interviewEvaluationModelSchema,
    schemaDescription:
      "Structured interview evaluation for a candidate applying to a company role.",
    schemaName: "interview_evaluation",
    system:
      "You are a hiring panel calibrating a pass or fail decision. Favor evidence, technical clarity, ownership, and communication. Penalize vague answers heavily.",
    temperature: env.AI_INTERVIEW_TEMPERATURE,
  });

  const evaluationResult = result.object;

  const reviewByQuestionId = new Map(
    evaluationResult.questionReviews.map((review) => [
      review.questionId,
      review,
    ]),
  );

  const questionReviews = answers.map((answer) => {
    return (
      reviewByQuestionId.get(answer.id) ?? {
        feedback:
          "No hubo una evaluacion puntual para esta respuesta. Se marca como debil por falta de evidencia estructurada.",
        questionId: answer.id,
        score: 0,
      }
    );
  });

  const overallScore = Math.round(evaluationResult.overallScore);
  const passed = overallScore >= env.AI_INTERVIEW_PASS_SCORE;

  return {
    company,
    evaluation: {
      companyName: company.name,
      hiringSignals: evaluationResult.hiringSignals,
      overallScore,
      passScore: env.AI_INTERVIEW_PASS_SCORE,
      passed,
      questionReviews,
      recommendation: passed ? "apto" : "no_apto",
      risks: evaluationResult.risks,
      roleTitle: company.roleTitle,
      summary: evaluationResult.summary,
    },
  };
}
