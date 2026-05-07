import { NextRequest, NextResponse } from "next/server";
import { filterServices, getAssumptions, getRefinements, estimateTotalValue } from "@/lib/knowledge-base";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { lifeEvent, employment, country } = await req.json();

  if (!lifeEvent || !employment || !country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const services    = filterServices(lifeEvent, employment, country);
  const assumptions = getAssumptions(lifeEvent, employment, country);
  const refinements = getRefinements(lifeEvent, employment);
  const totalValue  = estimateTotalValue(services);

  // Persist situation + save services to citizen profile if authenticated
  const session = await getSession();
  if (session) {
    await db.citizen.update({
      where: { id: session.citizenId },
      data: { lifeEvent, employment, country },
    });

    // Upsert each service so re-runs don't create duplicates
    await Promise.allSettled(
      services.map((s) =>
        db.savedService.upsert({
          where: { citizenId_serviceId: { citizenId: session.citizenId, serviceId: s.id } },
          update: { serviceName: s.name, agency: s.agency, amount: s.amount ?? null },
          create: {
            citizenId:   session.citizenId,
            serviceId:   s.id,
            serviceName: s.name,
            agency:      s.agency,
            amount:      s.amount ?? null,
            priority:    s.priority,
            status:      "not_started",
          },
        })
      )
    );
  }

  return NextResponse.json({ services, assumptions, refinements, totalValue });
}
