import { PrismaClient } from "../generated/prisma/index.js";

const db = new PrismaClient();

const microsoftSoftwareEngineerDocument = `
Role: Software Engineer
Company: Microsoft
Team context: Product engineering teams that ship cloud, AI, platform, and productivity experiences at global scale.

Core responsibilities:
- Build, test, and maintain production software used by enterprise and consumer customers.
- Translate product requirements into clean, reliable, and scalable implementations.
- Participate in architecture reviews, design discussions, and code reviews.
- Debug complex incidents, improve observability, and reduce operational risk.
- Collaborate closely with product, design, security, and program management.
- Use data to improve quality, performance, and customer outcomes.

Interview evaluation rubric:
- Technical depth: Can the candidate explain how they would design, build, test, and operate software?
- Problem solving: Can they reason under constraints and make sensible tradeoffs?
- Communication: Are answers structured, direct, and understandable?
- Ownership: Do they proactively consider monitoring, failure modes, and delivery risks?
- Team fit: Do they show collaboration, coachability, and customer focus?
`.trim();

async function main() {
  const company = await db.company.upsert({
    create: {
      description:
        "Simulacion de entrevista para un rol de Software Engineer con foco en claridad tecnica, ownership y criterio de producto.",
      location: "Redmond / Remoto hibrido",
      logoUrl: "/assets/logos/microsoft.png",
      name: "Microsoft",
      slug: "microsoft",
      themeColor: "#7dd3fc",
    },
    update: {},
    where: { slug: "microsoft" },
  });

  await db.interviewProfile.upsert({
    create: {
      companyId: company.id,
      documentKey: "microsoft",
      documentText: microsoftSoftwareEngineerDocument,
      documentTitle: "Microsoft Software Engineer Interview Brief",
      roleTitle: "Software Engineer",
    },
    update: {},
    where: {
      companyId_documentKey: {
        companyId: company.id,
        documentKey: "microsoft",
      },
    },
  });

  const existingPortal = await db.companyPortal.findFirst({
    where: { companyId: company.id },
  });

  if (!existingPortal) {
    await db.companyPortal.create({
      data: {
        activationRadius: 1.6,
        companyId: company.id,
        positionX: -14.3,
        positionY: 0.2,
        positionZ: -12,
        themeColor: "#ffffff",
      },
    });
  }

  await db.globalLlmConfig.upsert({
    create: {
      id: "global",
      baseUrl: null,
      maxOutputTokens: 1600,
      model: "gemini-2.5-flash",
      provider: "google",
      temperature: 0.35,
    },
    update: {},
    where: { id: "global" },
  });
}

main()
  .finally(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
