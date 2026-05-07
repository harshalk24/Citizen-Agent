import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";
import { getServicesByCountry } from "@/lib/knowledge-base";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth?from=/dashboard");

  const citizen = await db.citizen.findUnique({
    where: { id: session.citizenId },
    include: {
      savedServices: { orderBy: { createdAt: "desc" } },
      deadlines:     { orderBy: { dueDate: "asc" } },
      actionPlans:   { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!citizen) redirect("/auth");

  const hasProfile = !!(citizen.lifeEvent && citizen.employment);

  // Always compute location services for "What's New" section
  const locationServices = citizen.country
    ? getServicesByCountry(citizen.country as Parameters<typeof getServicesByCountry>[0]).slice(0, 8)
    : [];

  const actionPlan = citizen.actionPlans[0]
    ? (JSON.parse(citizen.actionPlans[0].planJson) as { summary: string })
    : null;

  // Serialize dates to ISO strings for the client component
  const deadlines = citizen.deadlines.map((d) => ({
    id:          d.id,
    title:       d.title,
    dueDate:     d.dueDate.toISOString(),
    description: d.description,
    completed:   d.completed,
  }));

  const countryPrefix: Record<string, string> = {
    IE: "ie-", UAE: "uae-", RW: "rw-", IN: "in-", "CA-US": "ca-",
  };
  const prefix = citizen.country ? (countryPrefix[citizen.country] ?? "") : "";

  const savedServices = citizen.savedServices
    .filter(s => !prefix || s.serviceId.startsWith(prefix))
    .map((s) => ({
      id:          s.id,
      serviceId:   s.serviceId,
      serviceName: s.serviceName,
      agency:      s.agency,
      amount:      s.amount,
      status:      s.status,
      priority:    s.priority,
    }));

  return (
    <DashboardClient
      citizen={{
        name:       citizen.firstName ?? citizen.name,
        country:    citizen.country,
        lifeEvent:  citizen.lifeEvent,
        employment: citizen.employment,
      }}
      savedServices={savedServices}
      deadlines={deadlines}
      actionPlan={actionPlan}
      hasProfile={hasProfile}
      locationServices={locationServices.map(s => ({
        id: s.id,
        name: s.name,
        agency: s.agency,
        amount: s.amount ?? null,
        weekToApply: s.weekToApply,
      }))}
    />
  );
}
