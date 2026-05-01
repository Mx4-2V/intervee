import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AI_GATEWAY_API_KEY: z.string().optional(),
    AI_PROVIDER: z
      .enum([
        "gateway",
        "google",
        "openai",
        "anthropic",
        "groq",
        "openai-compatible",
      ])
      .default("google"),
    AI_API_KEY: z.string().optional(),
    AI_BASE_URL: z.string().url().optional(),
    AI_INTERVIEW_MAX_OUTPUT_TOKENS: z.coerce
      .number()
      .int()
      .positive()
      .default(1600),
    AI_INTERVIEW_MODEL: z.string().default("gemini-2.5-flash"),
    AI_INTERVIEW_PASS_SCORE: z.coerce.number().min(0).max(100).default(72),
    AI_INTERVIEW_QUESTION_COUNT: z.coerce
      .number()
      .int()
      .min(3)
      .max(8)
      .default(5),
    AI_INTERVIEW_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.35),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_DISCORD_ID: z.string().optional(),
    AUTH_DISCORD_SECRET: z.string().optional(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_API_KEY: process.env.AI_API_KEY,
    AI_BASE_URL: process.env.AI_BASE_URL,
    AI_INTERVIEW_MAX_OUTPUT_TOKENS: process.env.AI_INTERVIEW_MAX_OUTPUT_TOKENS,
    AI_INTERVIEW_MODEL: process.env.AI_INTERVIEW_MODEL,
    AI_INTERVIEW_PASS_SCORE: process.env.AI_INTERVIEW_PASS_SCORE,
    AI_INTERVIEW_QUESTION_COUNT: process.env.AI_INTERVIEW_QUESTION_COUNT,
    AI_INTERVIEW_TEMPERATURE: process.env.AI_INTERVIEW_TEMPERATURE,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
