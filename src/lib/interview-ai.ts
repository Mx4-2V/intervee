import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

import { env } from "~/env";
import { getCompanyInterviewProfile } from "~/lib/company-interviews";
import {
  type InterviewAnswer,
  type InterviewQuestion,
  interviewEvaluationModelSchema,
  interviewQuestionsResponseSchema,
} from "~/lib/interview-schema";

function ensureAiCredentials() {
  if (!env.GROQ_API_KEY && !env.AI_GATEWAY_API_KEY && !env.OPENAI_API_KEY && !process.env.VERCEL) {
    throw new Error(
      "Missing AI credentials. Set GROQ_API_KEY, OPENAI_API_KEY or AI_GATEWAY_API_KEY in .env.",
    );
  }
}

function getInterviewModel() {
  ensureAiCredentials();

  const apiKey = env.GROQ_API_KEY || env.OPENAI_API_KEY || env.AI_GATEWAY_API_KEY;
  const openai = createOpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
    compatibility: "compatible",
  });

  // Remove possible 'openai/' prefix from the model string
  const modelName = env.AI_INTERVIEW_MODEL.replace(/^openai\//, "");

  return openai(modelName, {
    structuredOutputs: false,
  });
}

export async function generateCompanyInterviewQuestions(companySlug: string) {
  const company = getCompanyInterviewProfile(companySlug);

  if (!company) {
    throw new Error(`Unknown company '${companySlug}'`);
  }

  const { text } = await generateText({
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
    system:
      "You are a senior technical interviewer creating a structured job interview. Keep the bar serious, practical, and aligned to the supplied hiring brief.\n" +
      "MUY IMPORTANTE: Todas las preguntas, respuestas esperadas y cualquier otro texto generado debe estar en ESPAÑOL.\n\n" +
      "DEBES devolver ÚNICAMENTE un JSON válido con esta estructura:\n" +
      "{\n" +
      '  "questions": [\n' +
      '    { "prompt": "string", "evaluationFocus": "string", "id": "string" }\n' +
      "  ]\n" +
      "}\n" +
      "NO agregues ningún texto extra, ni saludos, ni formato markdown.",
    temperature: env.AI_INTERVIEW_TEMPERATURE,
  });

  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const response = JSON.parse(cleanedText);

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

  const { text } = await generateText({
    maxOutputTokens: env.AI_INTERVIEW_MAX_OUTPUT_TOKENS,
    model: getInterviewModel(),
    prompt,
    system:
      "You are a hiring panel calibrating a pass or fail decision. Favor evidence, technical clarity, ownership, and communication. Penalize vague answers heavily.\n" +
      "MUY IMPORTANTE: Todas las evaluaciones, feedback, resúmenes y cualquier otro texto generado debe estar en ESPAÑOL.\n\n" +
      "DEBES devolver ÚNICAMENTE un JSON válido con esta estructura:\n" +
      "{\n" +
      '  "hiringSignals": ["string"],\n' +
      '  "risks": ["string"],\n' +
      '  "overallScore": 0,\n' +
      '  "summary": "string",\n' +
      '  "questionReviews": [\n' +
      '    { "questionId": "string", "score": 0, "feedback": "string" }\n' +
      "  ]\n" +
      "}\n" +
      "NO agregues ningún texto extra, ni saludos, ni formato markdown.",
    temperature: env.AI_INTERVIEW_TEMPERATURE,
  });

  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const evaluationResult = JSON.parse(cleanedText);

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
