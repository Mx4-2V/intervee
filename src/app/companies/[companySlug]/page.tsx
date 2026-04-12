import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ companySlug: string }>;
};

export default async function CompanyPage({ params }: PageProps) {
  const { companySlug } = await params;

  redirect(`/companies/${companySlug}/interview`);
}
