import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import UpdateSituationForm from "./UpdateSituationForm";

export default async function UpdateSituationPage() {
  const session = await getSession();
  if (!session) redirect("/auth?from=/update-situation");

  const citizen = await db.citizen.findUnique({
    where: { id: session.citizenId },
    select: {
      id: true, firstName: true, name: true, country: true,
      lifeEvent: true, employment: true, profileContext: true,
    },
  });

  if (!citizen) redirect("/auth");

  const ctx = citizen.profileContext ? JSON.parse(citizen.profileContext) : {};

  return (
    <UpdateSituationForm
      citizenId={citizen.id}
      initial={{
        country: citizen.country ?? "IE",
        city: ctx.city ?? "",
        recentlyMoved: ctx.recentlyMoved ?? false,
        salaryRange: ctx.salaryRange ?? "",
        employmentType: ctx.employmentType ?? "",
        maritalStatus: ctx.maritalStatus ?? "",
        dependents: ctx.dependents ?? 0,
        housingStatus: ctx.housingStatus ?? "",
        goals: ctx.goals ?? [],
      }}
    />
  );
}
