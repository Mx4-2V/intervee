import { z } from "zod";
import type { Prisma } from "../../../../generated/prisma";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const aiProviderSchema = z.enum([
  "gateway",
  "google",
  "openai",
  "anthropic",
  "groq",
  "openai-compatible",
]);

const companyInputSchema = z.object({
  description: z.string().min(1),
  id: z.string().optional(),
  isActive: z.boolean().default(true),
  location: z.string().optional(),
  logoUrl: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  themeColor: z.string().optional(),
});

const interviewProfileInputSchema = z.object({
  companyId: z.string().min(1),
  documentKey: z.string().min(1),
  documentText: z.string().min(1),
  documentTitle: z.string().min(1),
  evaluationPrompt: z.string().optional(),
  id: z.string().optional(),
  isActive: z.boolean().default(true),
  maxOutputTokens: z.number().int().positive().default(1600),
  passScore: z.number().int().min(0).max(100).default(72),
  questionCount: z.number().int().min(3).max(8).default(5),
  questionPrompt: z.string().optional(),
  roleTitle: z.string().min(1),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).default(0.35),
});

const portalInputSchema = z.object({
  activationRadius: z.number().min(1).max(20).default(1.6),
  companyId: z.string().min(1),
  id: z.string().optional(),
  isActive: z.boolean().default(true),
  logoUrl: z.string().optional(),
  positionX: z.number(),
  positionY: z.number().default(0.2),
  positionZ: z.number(),
  rotationY: z.number().default(0),
  themeColor: z.string().optional(),
});

type AuditContext = {
  db: {
    adminAuditLog: {
      create: (args: {
        data: {
          action: string;
          actorId: string;
          after?: Prisma.InputJsonValue;
          entity: string;
          entityId?: string;
        };
      }) => Promise<unknown>;
    };
  };
  session: { user: { id: string } };
};

async function audit(
  ctx: AuditContext,
  action: string,
  entity: string,
  entityId?: string,
  after?: unknown,
) {
  const serializedAfter =
    after === undefined
      ? undefined
      : (JSON.parse(JSON.stringify(after)) as Prisma.InputJsonValue);

  await ctx.db.adminAuditLog.create({
    data: {
      action,
      after: serializedAfter,
      actorId: ctx.session.user.id,
      entity,
      entityId,
    },
  });
}

export const adminRouter = createTRPCRouter({
  overview: adminProcedure.query(async ({ ctx }) => {
    const [companies, portals, whitelist, llmConfig] = await Promise.all([
      ctx.db.company.findMany({
        include: {
          interviewProfiles: { orderBy: { updatedAt: "desc" } },
          portals: { orderBy: { updatedAt: "desc" } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      ctx.db.companyPortal.count(),
      ctx.db.adminWhitelist.findMany({ orderBy: { updatedAt: "desc" } }),
      ctx.db.globalLlmConfig.findUnique({ where: { id: "global" } }),
    ]);

    return { companies, llmConfig, portals, whitelist };
  }),

  upsertCompany: adminProcedure
    .input(companyInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const company = id
        ? await ctx.db.company.update({ where: { id }, data })
        : await ctx.db.company.create({ data });

      await audit(ctx, id ? "company.update" : "company.create", "Company", company.id, company);

      return company;
    }),

  upsertInterviewProfile: adminProcedure
    .input(interviewProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const profile = id
        ? await ctx.db.interviewProfile.update({ where: { id }, data })
        : await ctx.db.interviewProfile.create({ data });

      await audit(
        ctx,
        id ? "interviewProfile.update" : "interviewProfile.create",
        "InterviewProfile",
        profile.id,
        profile,
      );

      return profile;
    }),

  upsertPortal: adminProcedure
    .input(portalInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const portal = id
        ? await ctx.db.companyPortal.update({ where: { id }, data })
        : await ctx.db.companyPortal.create({ data });

      await audit(ctx, id ? "portal.update" : "portal.create", "CompanyPortal", portal.id, portal);

      return portal;
    }),

  upsertWhitelistEntry: adminProcedure
    .input(
      z.object({
        email: z.string().email().transform((email) => email.toLowerCase()),
        isActive: z.boolean().default(true),
        role: z.enum(["USER", "ADMIN", "OWNER"]).default("USER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.adminWhitelist.upsert({
        create: input,
        update: { isActive: input.isActive, role: input.role },
        where: { email: input.email },
      });

      await audit(ctx, "adminWhitelist.upsert", "AdminWhitelist", entry.id, entry);

      return entry;
    }),

  updateGlobalLlmConfig: adminProcedure
    .input(
      z.object({
        baseUrl: z.string().url().optional(),
        maxOutputTokens: z.number().int().positive().default(1600),
        model: z.string().min(1),
        provider: aiProviderSchema,
        temperature: z.number().min(0).max(2).default(0.35),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.db.globalLlmConfig.upsert({
        create: { id: "global", ...input },
        update: input,
        where: { id: "global" },
      });

      await audit(ctx, "llmConfig.update", "GlobalLlmConfig", config.id, config);

      return config;
    }),
});
