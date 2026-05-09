import { notFound } from "next/navigation";

import { CompanyInterviewExperience } from "~/components/interview/CompanyInterviewExperience";
import { requireUserPage } from "~/server/auth/admin";
import { getCompanyInterviewProfile } from "~/server/company-interviews";

type PageProps = {
  params: Promise<{ companySlug: string }>;
};

export default async function CompanyInterviewPage({ params }: PageProps) {
  const { companySlug } = await params;
  await requireUserPage(`/companies/${companySlug}/interview`);
  const company = await getCompanyInterviewProfile(companySlug);

  if (!company) {
    notFound();
  }

  return (
    <CompanyInterviewExperience
      companyName={company.name}
      companySlug={company.slug}
      description={company.description}
      location={company.location}
      logoUrl={company.logoUrl}
      roleTitle={company.roleTitle}
    />
  );
}
