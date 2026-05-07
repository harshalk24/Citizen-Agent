import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import OnboardingFlow from "./OnboardingFlow";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/auth?from=/onboarding");

  const citizen = await db.citizen.findUnique({
    where: { id: session.citizenId },
    select: { onboarded: true, country: true },
  });

  if (!citizen) redirect("/auth");

  // Already onboarded — skip straight to dashboard
  if (citizen.onboarded) redirect("/dashboard");

  return (
    <OnboardingFlow
      citizenId={session.citizenId}
      prefillCountry={citizen.country ?? "IE"}
    />
  );
}
