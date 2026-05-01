import { notFound } from "next/navigation";

import { CompanyInterviewExperience } from "~/components/interview/CompanyInterviewExperience";
import { getCompanyInterviewProfile } from "~/lib/company-interviews";

type PageProps = {
  params: Promise<{ companySlug: string }>;
};

export default async function CompanyInterviewPage({ params }: PageProps) {
  const { companySlug } = await params;
  const company = getCompanyInterviewProfile(companySlug);

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
