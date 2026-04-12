import { z } from "zod";

export const interviewQuestionSchema = z.object({
  evaluationFocus: z.string().min(1),
  id: z.string().min(1),
  prompt: z.string().min(1),
});

export const interviewQuestionsResponseSchema = z.object({
  questions: z.array(interviewQuestionSchema).min(3).max(8),
});

export const interviewAnswerSchema = interviewQuestionSchema.extend({
  answer: z.string().min(1),
});

export const interviewEvaluationInputSchema = z.object({
  answers: z.array(interviewAnswerSchema).min(1),
});

export const interviewQuestionReviewSchema = z.object({
  feedback: z.string().min(1),
  questionId: z.string().min(1),
  score: z.number().min(0).max(100),
});

export const interviewEvaluationModelSchema = z.object({
  hiringSignals: z.array(z.string().min(1)).max(5),
  overallScore: z.number().min(0).max(100),
  questionReviews: z.array(interviewQuestionReviewSchema).min(1).max(8),
  risks: z.array(z.string().min(1)).max(5),
  summary: z.string().min(1),
});

export const interviewQuestionsApiResponseSchema =
  interviewQuestionsResponseSchema.extend({
    companyName: z.string().min(1),
    roleTitle: z.string().min(1),
  });

export const interviewEvaluationResponseSchema =
  interviewEvaluationModelSchema.extend({
    companyName: z.string().min(1),
    passScore: z.number().min(0).max(100),
    passed: z.boolean(),
    recommendation: z.enum(["apto", "no_apto"]),
    roleTitle: z.string().min(1),
  });

export type InterviewAnswer = z.infer<typeof interviewAnswerSchema>;
export type InterviewEvaluationInput = z.infer<
  typeof interviewEvaluationInputSchema
>;
export type InterviewEvaluationModel = z.infer<
  typeof interviewEvaluationModelSchema
>;
export type InterviewEvaluationResponse = z.infer<
  typeof interviewEvaluationResponseSchema
>;
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type InterviewQuestionReview = z.infer<
  typeof interviewQuestionReviewSchema
>;
export type InterviewQuestionsApiResponse = z.infer<
  typeof interviewQuestionsApiResponseSchema
>;
export type InterviewQuestionsResponse = z.infer<
  typeof interviewQuestionsResponseSchema
>;
