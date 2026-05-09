import { redirect } from "next/navigation";

import { HomeScreen } from "~/components/world/home/HomeScreen";
import { env } from "~/env";
import { auth } from "~/server/auth";

type HomePageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;
  const nextUrl = callbackUrl ?? "/game";

  if (session?.user) {
    redirect(nextUrl);
  }

  return (
    <HomeScreen
      callbackUrl={nextUrl}
      error={error}
      googleEnabled={Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET)}
    />
  );
}
