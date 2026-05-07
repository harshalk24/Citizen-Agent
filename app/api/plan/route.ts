import { NextRequest, NextResponse } from "next/server";
import { generateJSON, PLAN_SYSTEM_PROMPT } from "@/lib/ai";
import { GovernmentService } from "@/lib/knowledge-base";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await db.actionPlan.findFirst({
    where: { citizenId: session.citizenId },
    orderBy: { updatedAt: "desc" },
  });

  if (!plan) return NextResponse.json({ error: "No plan found" }, { status: 404 });

  return NextResponse.json(JSON.parse(plan.planJson));
}

interface ActionItem {
  serviceId:   string;
  serviceName: string;
  agency:      string;
  action:      string;
  weekToApply: 1 | 2 | 4 | 12;
  amount?:     string;
  deadline:    string;
  documents:   string[];
  tips:        string[];
}

interface ActionPlan {
  summary:             string;
  totalEstimatedValue: string;
  items:               ActionItem[];
}

export async function POST(req: NextRequest) {
  const { services, situation } = await req.json() as {
    services:  GovernmentService[];
    situation: { lifeEvent: string; employment: string; country: string };
  };

  if (!services || services.length === 0) {
    return NextResponse.json({ error: "No services provided" }, { status: 400 });
  }

  const prompt = `Generate an action plan for a citizen in ${situation.country} who is ${situation.lifeEvent.replace(/-/g, " ")} and is ${situation.employment}.

They qualify for these government benefits (use the id field exactly as the serviceId):
${services.map((s) => `- id="${s.id}" name="${s.name}" agency="${s.agency}" amount="${s.amount ?? "varies"}" weekToApply=${s.weekToApply} deadline="${s.deadline}"`).join("\n")}

Return a JSON object matching this schema:
{
  "summary": "2-sentence plain-English summary of what to do",
  "totalEstimatedValue": "human-readable total like €8,450 over 6 months",
  "items": [
    {
      "serviceId": "MUST be the exact id= value from input, e.g. 'in-maternity-benefit'",
      "serviceName": "exact name= value from input",
      "agency": "exact agency",
      "action": "specific action verb phrase, e.g., Apply online via MyWelfare.ie",
      "weekToApply": 1,
      "amount": "€250/week for 26 weeks",
      "deadline": "Within 8 weeks of birth",
      "documents": ["list", "of", "docs"],
      "tips": ["one practical tip", "one more if relevant"]
    }
  ]
}`;

  try {
    const plan = await generateJSON<ActionPlan>(prompt, PLAN_SYSTEM_PROMPT);

    // Persist plan and create deadline records for authenticated citizens
    const session = await getSession();
    if (session) {
      await db.actionPlan.upsert({
        where: {
          // Use a compound check — one plan per lifeEvent+country per citizen
          id: (await db.actionPlan.findFirst({
            where: { citizenId: session.citizenId, lifeEvent: situation.lifeEvent, country: situation.country },
            select: { id: true },
          }))?.id ?? "new",
        },
        update: { planJson: JSON.stringify(plan) },
        create: {
          citizenId: session.citizenId,
          planJson:  JSON.stringify(plan),
          lifeEvent: situation.lifeEvent,
          country:   situation.country,
        },
      });

      // Create deadline entries for week-1 and week-2 items
      const urgentItems = plan.items.filter((i) => i.weekToApply <= 2);
      await Promise.allSettled(
        urgentItems.map((item) => {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + item.weekToApply * 7);
          return db.deadline.upsert({
            where: {
              id: item.serviceId + "_" + session.citizenId,
            },
            update: { dueDate, description: item.action },
            create: {
              id:          item.serviceId + "_" + session.citizenId,
              citizenId:   session.citizenId,
              title:       `Apply: ${item.serviceName}`,
              serviceName: item.serviceName,
              dueDate,
              description: item.action,
            },
          });
        })
      );
    }

    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[plan] generation failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
