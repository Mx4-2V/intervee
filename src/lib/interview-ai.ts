import { gateway, generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { jsonrepair } from "jsonrepair";
import { type ZodType, z } from "zod";

import { env } from "~/env";
import {
  getCompanyInterviewProfile,
  type ResolvedCompanyInterviewProfile,
} from "~/server/company-interviews";
import { db } from "~/server/db";
import {
  type InterviewAnswer,
  type InterviewQuestion,
  type InterviewQuestionReview,
  interviewEvaluationModelSchema,
  interviewQuestionSchema,
  type interviewQuestionsResponseSchema,
} from "~/lib/interview-schema";

const DEFAULT_REVIEW_FEEDBACK =
  "No hubo una evaluacion puntual para esta respuesta. Se marca como debil por falta de evidencia estructurada.";
const DEFAULT_EVALUATION_SUMMARY =
  "Evaluacion generada sin resumen explicito.";
const MAX_AI_GENERATION_ATTEMPTS = 3;
const AI_PROVIDERS = [
  "gateway",
  "google",
  "openai",
  "anthropic",
  "groq",
  "openai-compatible",
] as const;

type AiProvider = (typeof AI_PROVIDERS)[number];

type LlmConfig = {
  baseUrl?: string | null;
  maxOutputTokens: number;
  model: string;
  provider: AiProvider;
  temperature: number;
};

const DEFAULT_LLM_CONFIG: LlmConfig = {
  baseUrl: null,
  maxOutputTokens: 1600,
  model: "gemini-2.5-flash",
  provider: "google",
  temperature: 0.35,
};

const generatedInterviewQuestionsResponseSchema = z.object({
  questions: z.array(interviewQuestionSchema).min(1).max(8),
});

function isAiProvider(value: string): value is AiProvider {
  return AI_PROVIDERS.includes(value as AiProvider);
}

function getProviderApiKey(provider: AiProvider) {
  switch (provider) {
    case "gateway":
      return env.AI_GATEWAY_API_KEY;
    case "google":
      return env.GOOGLE_AI_API_KEY;
    case "openai":
      return env.OPENAI_AI_API_KEY;
    case "anthropic":
      return env.ANTHROPIC_AI_API_KEY;
    case "groq":
      return env.GROQ_AI_API_KEY;
    case "openai-compatible":
      return env.OPENAI_COMPATIBLE_AI_API_KEY;
  }
}

function getProviderApiKeyName(provider: AiProvider) {
  if (provider === "gateway") return "AI_GATEWAY_API_KEY";
  return `${provider.toUpperCase().replaceAll("-", "_")}_AI_API_KEY`;
}

async function getGlobalLlmConfig(): Promise<LlmConfig> {
  try {
    const config = await db.globalLlmConfig.findUnique({
      where: { id: "global" },
    });

    if (config && isAiProvider(config.provider)) {
      return {
        baseUrl: config.baseUrl,
        maxOutputTokens: config.maxOutputTokens,
        model: config.model,
        provider: config.provider,
        temperature: config.temperature,
      };
    }
  } catch {
    // Keep env-based AI working before migrations or when the database is unavailable.
  }

  return DEFAULT_LLM_CONFIG;
}

function ensureAiCredentials(config: LlmConfig) {
  if (config.provider === "gateway") {
    if (!env.AI_GATEWAY_API_KEY && !process.env.VERCEL) {
      throw new Error(
        "Missing AI credentials. Set AI_GATEWAY_API_KEY or run on Vercel with AI Gateway auth.",
      );
    }

    if (!config.model.includes("/")) {
      throw new Error(
        "AI Gateway models must use provider/model format, for example 'google/gemini-2.5-flash'. Configure this in /admin/settings/llm.",
      );
    }

    return;
  }

  const apiKey = getProviderApiKey(config.provider);

  if (!apiKey) {
    throw new Error(
      `Missing API key for provider '${config.provider}'. Set ${getProviderApiKeyName(config.provider)} in .env.`,
    );
  }

  if (config.provider === "openai-compatible" && !config.baseUrl) {
    throw new Error(
      "Base URL is required when the global LLM provider is 'openai-compatible'. Configure this in /admin/settings/llm.",
    );
  }
}

function getModelName(provider: AiProvider, model: string) {
  const prefixes = {
    anthropic: "anthropic/",
    google: "google/",
    groq: "groq/",
    openai: "openai/",
    "openai-compatible": "openai-compatible/",
    gateway: "",
  } as const;

  const prefix = prefixes[provider];

  if (!prefix) {
    return model;
  }

  return model.startsWith(prefix) ? model.slice(prefix.length) : model;
}

function getInterviewModel(config: LlmConfig) {
  ensureAiCredentials(config);

  const apiKey = getProviderApiKey(config.provider);
  const baseURL = config.baseUrl ?? undefined;

  switch (config.provider) {
    case "gateway": {
      return gateway(config.model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });

      return google(getModelName("google", config.model));
    }
    case "openai": {
      const openai = createOpenAI({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });

      return openai(getModelName("openai", config.model));
    }
    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });

      return anthropic(getModelName("anthropic", config.model));
    }
    case "groq": {
      const groq = createGroq({
        apiKey,
        ...(baseURL ? { baseURL } : {}),
      });

      return groq(getModelName("groq", config.model));
    }
    case "openai-compatible": {
      const provider = createOpenAICompatible({
        apiKey,
        baseURL: config.baseUrl!,
        name: "openai-compatible",
      });

      return provider.chatModel(getModelName("openai-compatible", config.model));
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCamelCase(value: string) {
  return value.replace(/[-_]+([a-z])/gi, (_, char: string) => char.toUpperCase());
}

function normalizeObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeObjectKeys);
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, nestedValue]) => [
      toCamelCase(key),
      normalizeObjectKeys(nestedValue),
    ]),
  );
}

function parseGeneratedJson(text: string) {
  const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");
  const jsonText =
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleanedText.slice(firstBrace, lastBrace + 1)
      : cleanedText;

  return normalizeObjectKeys(JSON.parse(jsonrepair(jsonText)));
}

function normalizeInterviewQuestionsResponse(value: unknown) {
  if (!isRecord(value)) {
    return value;
  }

  const rawQuestions = Array.isArray(value.questions)
    ? value.questions
    : Array.isArray(value.items)
      ? value.items
      : [];
  const questions = rawQuestions
    .map((question, index) => {
      if (typeof question === "string") {
        return {
          evaluationFocus: "Evaluar claridad tecnica, profundidad y criterio de ingenieria.",
          id: `question-${index + 1}`,
          prompt: question,
        };
      }

      if (!isRecord(question)) {
        return null;
      }

      const prompt =
        typeof question.prompt === "string"
          ? question.prompt
          : typeof question.question === "string"
            ? question.question
            : typeof question.text === "string"
              ? question.text
              : typeof question.title === "string"
                ? question.title
                : "";

      if (prompt.length === 0) {
        return null;
      }

      return {
        evaluationFocus:
          typeof question.evaluationFocus === "string"
            ? question.evaluationFocus
            : typeof question.focus === "string"
              ? question.focus
              : "Evaluar claridad tecnica, profundidad y criterio de ingenieria.",
        id:
          typeof question.id === "string"
            ? question.id
            : typeof question.questionId === "string"
              ? question.questionId
              : `question-${index + 1}`,
        prompt,
      };
    })
    .filter((question): question is InterviewQuestion => question !== null);

  return {
    questions,
  };
}

function getNumericValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  return undefined;
}

function normalizeInterviewEvaluationResult(
  value: unknown,
  answers: InterviewAnswer[],
) {
  const record = isRecord(value) ? value : {};
  const wrappedEvaluation = isRecord(record.evaluation) ? record.evaluation : undefined;
  const source =
    wrappedEvaluation && record.overallScore === undefined ? wrappedEvaluation : record;

  const rawReviews = Array.isArray(source.questionReviews)
    ? source.questionReviews
    : Array.isArray(source.reviews)
      ? source.reviews
      : [];

  const mappedReviews = rawReviews
    .filter(isRecord)
    .map((review) => {
      const questionId =
        typeof review.questionId === "string"
          ? review.questionId
          : typeof review.id === "string"
            ? review.id
            : "";
      const score =
        getNumericValue(review.score) ?? getNumericValue(review.rating) ?? 0;
      const feedback =
        typeof review.feedback === "string"
          ? review.feedback
          : typeof review.comment === "string"
            ? review.comment
            : typeof review.justification === "string"
              ? review.justification
              : "Evaluacion no proporcionada por el modelo.";

      return {
        feedback,
        questionId,
        score,
      } satisfies InterviewQuestionReview;
    })
    .filter((review) => review.questionId.length > 0);

  const reviewByQuestionId = new Map(
    mappedReviews.map((review) => [review.questionId, review]),
  );

  const questionReviews = answers.map((answer) => {
    return (
      reviewByQuestionId.get(answer.id) ?? {
        feedback: DEFAULT_REVIEW_FEEDBACK,
        questionId: answer.id,
        score: 0,
      }
    );
  });

  const computedOverallScore =
    questionReviews.reduce((total, review) => total + review.score, 0) /
    questionReviews.length;
  const overallScore =
    getNumericValue(source.overallScore) ??
    getNumericValue(source.totalScore) ??
    getNumericValue(source.score) ??
    computedOverallScore;
  const hiringSignals = Array.isArray(source.hiringSignals)
    ? source.hiringSignals
    : Array.isArray(source.strengths)
      ? source.strengths
      : [];
  const risks = Array.isArray(source.risks)
    ? source.risks
    : Array.isArray(source.concerns)
      ? source.concerns
      : Array.isArray(source.weaknesses)
        ? source.weaknesses
        : [];
  const summary =
    typeof source.summary === "string"
      ? source.summary
      : typeof source.overallFeedback === "string"
        ? source.overallFeedback
        : typeof source.feedback === "string"
          ? source.feedback
          : DEFAULT_EVALUATION_SUMMARY;

  return {
    hiringSignals: hiringSignals.filter((item): item is string => typeof item === "string"),
    overallScore,
    questionReviews,
    risks: risks.filter((item): item is string => typeof item === "string"),
    summary,
  };
}

function parseGeneratedObject<T>(
  text: string,
  schema: ZodType<T>,
  normalize?: (value: unknown) => unknown,
) {
  const parsedValue = parseGeneratedJson(text);

  return schema.parse(normalize ? normalize(parsedValue) : parsedValue);
}

function buildQuestionsPrompt(
  company: ResolvedCompanyInterviewProfile,
  questionCount: number,
  existingQuestions: InterviewQuestion[] = [],
) {
  return [
    `Company: ${company.name}`,
    `Role: ${company.roleTitle}`,
    `Question count: ${questionCount}`,
    "",
    "Use only the following document as hiring context:",
    company.documentText,
    "",
    "Generate direct interview questions for a real screening.",
    company.questionPrompt ?? "",
    "Questions must be answerable in free text by a candidate.",
    "Each question needs a short evaluationFocus describing what you want to measure.",
    "Use pragmatic engineering language and avoid trivia.",
    existingQuestions.length > 0
      ? [
          "Do not repeat or paraphrase these existing questions:",
          ...existingQuestions.map((question, index) => `${index + 1}. ${question.prompt}`),
        ].join("\n")
      : "",
    `Return exactly ${questionCount} questions.`,
  ].join("\n");
}

export async function generateCompanyInterviewQuestions(companySlug: string) {
  const company = await getCompanyInterviewProfile(companySlug);

  if (!company) {
    throw new Error(`Unknown company '${companySlug}'`);
  }

  const llmConfig = await getGlobalLlmConfig();
  const model = getInterviewModel(llmConfig);

  let response:
    | ReturnType<typeof interviewQuestionsResponseSchema.parse>
    | undefined;
  let lastError: unknown;
  const collectedQuestions: InterviewQuestion[] = [];

  for (let attempt = 1; attempt <= MAX_AI_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const missingQuestionCount =
        company.questionCount - collectedQuestions.length;

      if (missingQuestionCount <= 0) {
        break;
      }

      const { text } = await generateText({
        maxOutputTokens: company.maxOutputTokens || llmConfig.maxOutputTokens,
        model,
        prompt: [
          buildQuestionsPrompt(company, missingQuestionCount, collectedQuestions),
          attempt > 1
            ? "The previous answer was invalid or incomplete. Generate only the missing questions and avoid overlap with the existing ones."
            : "",
        ].join("\n"),
        system:
          (company.systemPrompt ? `${company.systemPrompt}\n\n` : "") +
          "You are a senior technical interviewer creating a structured job interview. Keep the bar serious, practical, and aligned to the supplied hiring brief.\n" +
          "MUY IMPORTANTE: Todas las preguntas, respuestas esperadas y cualquier otro texto generado debe estar en ESPAÑOL.\n\n" +
          "DEBES devolver ÚNICAMENTE un JSON válido con esta estructura:\n" +
          "{\n" +
          '  "questions": [\n' +
          '    { "prompt": "string", "evaluationFocus": "string", "id": "string" }\n' +
          "  ]\n" +
          "}\n" +
          "NO agregues ningún texto extra, ni saludos, ni formato markdown.",
        temperature: company.temperature || llmConfig.temperature,
      });

      const parsedResponse = parseGeneratedObject(
        text,
        generatedInterviewQuestionsResponseSchema,
        normalizeInterviewQuestionsResponse,
      );

      const seenPrompts = new Set(
        collectedQuestions.map((question) => question.prompt.trim().toLowerCase()),
      );

      for (const question of parsedResponse.questions) {
        const normalizedPrompt = question.prompt.trim().toLowerCase();

        if (seenPrompts.has(normalizedPrompt)) {
          continue;
        }

        seenPrompts.add(normalizedPrompt);
        collectedQuestions.push(question);
      }

      if (collectedQuestions.length >= company.questionCount) {
        response = {
          questions: collectedQuestions,
        };
        break;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    if (collectedQuestions.length >= 3) {
      response = {
        questions: collectedQuestions,
      };
    } else {
      throw lastError instanceof Error
        ? lastError
        : new Error("Failed to generate interview questions");
    }
  }

  return {
    company,
    questions: response.questions
      .slice(0, company.questionCount)
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
  const company = await getCompanyInterviewProfile(companySlug);

  if (!company) {
    throw new Error(`Unknown company '${companySlug}'`);
  }

  const llmConfig = await getGlobalLlmConfig();
  const model = getInterviewModel(llmConfig);

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
    company.evaluationPrompt ?? "",
  ].join("\n\n");

  let evaluationResult:
    | ReturnType<typeof interviewEvaluationModelSchema.parse>
    | undefined;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_AI_GENERATION_ATTEMPTS; attempt += 1) {
    try {
      const { text } = await generateText({
        maxOutputTokens: company.maxOutputTokens || llmConfig.maxOutputTokens,
        model,
        prompt,
        system:
          (company.systemPrompt ? `${company.systemPrompt}\n\n` : "") +
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
        temperature: company.temperature || llmConfig.temperature,
      });

      const parsedEvaluation = parseGeneratedObject(
        text,
        interviewEvaluationModelSchema,
        (value) => normalizeInterviewEvaluationResult(value, answers),
      );

      const hasRealReview = parsedEvaluation.questionReviews.some(
        (review) => review.feedback !== DEFAULT_REVIEW_FEEDBACK,
      );

      if (!hasRealReview && attempt < MAX_AI_GENERATION_ATTEMPTS) {
        throw new Error("Model returned incomplete question reviews.");
      }

      evaluationResult = parsedEvaluation;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!evaluationResult) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Failed to evaluate interview");
  }

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
          DEFAULT_REVIEW_FEEDBACK,
        questionId: answer.id,
        score: 0,
      }
    );
  });

  const overallScore = Math.round(evaluationResult.overallScore);
  const passed = overallScore >= company.passScore;

  return {
    company,
    evaluation: {
      companyName: company.name,
      hiringSignals: evaluationResult.hiringSignals,
      overallScore,
      passScore: company.passScore,
      passed,
      questionReviews,
      recommendation: passed ? "apto" : "no_apto",
      risks: evaluationResult.risks,
      roleTitle: company.roleTitle,
      summary: evaluationResult.summary,
    },
  };
}
