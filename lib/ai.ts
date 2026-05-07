import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { services as KB, filterServices, type GovernmentService } from "@/lib/knowledge-base";

const MODEL = "gemini-2.0-flash";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── Country code → full display name ─────────────────────────────────────────
const COUNTRY_NAMES: Record<string, string> = {
  IE:    "Ireland",
  UAE:   "United Arab Emirates",
  RW:    "Rwanda",
  IN:    "India",
  "CA-US": "California, USA",
};

// ── Streaming chat (returns an async iterable of text chunks) ─────────────────
export async function streamChat(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<AsyncIterable<string>> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
  });

  // Gemini requires history to start with a user turn
  const trimmed = messages.slice(0, -1);
  const firstUser = trimmed.findIndex((m) => m.role === "user");
  const historyMessages = firstUser >= 0 ? trimmed.slice(firstUser) : [];

  const history = historyMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessageStream(lastMessage);

  return (async function* () {
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  })();
}

// ── Structured JSON generation ────────────────────────────────────────────────
export async function generateJSON<T>(
  prompt: string,
  systemPrompt: string
): Promise<T> {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}

// ── Build rich context-aware system prompt ────────────────────────────────────
export function buildChatSystemPrompt(
  context: { type: "entitlement" | "plan" | "open"; data?: unknown },
  citizenProfile?: {
    name?: string;
    country?: string;
    lifeEvent?: string;
    employment?: string;
    profileContext?: string;
  }
): string {
  const countryCode    = citizenProfile?.country ?? "IE";
  const countryName    = COUNTRY_NAMES[countryCode] ?? countryCode;
  const lifeEventRaw   = citizenProfile?.lifeEvent ?? null;           // "new-baby" etc.
  const lifeEvent      = lifeEventRaw?.replace(/-/g, " ") ?? null;   // "new baby" (display)
  const employment     = citizenProfile?.employment ?? null;
  const firstName      = citizenProfile?.name?.split(" ")[0] ?? null;

  // Extra context from Update Situation form
  let extraCtx = "";
  if (citizenProfile?.profileContext) {
    try {
      const ctx = JSON.parse(citizenProfile.profileContext) as Record<string, string>;
      const parts: string[] = [];
      if (ctx.city)            parts.push(`City: ${ctx.city}`);
      if (ctx.salaryRange)     parts.push(`Salary range: ${ctx.salaryRange}`);
      if (ctx.maritalStatus)   parts.push(`Marital status: ${ctx.maritalStatus}`);
      if (ctx.dependents)      parts.push(`Dependents: ${ctx.dependents}`);
      if (ctx.housingStatus)   parts.push(`Housing: ${ctx.housingStatus}`);
      if (ctx.employmentType)  parts.push(`Employment type: ${ctx.employmentType}`);
      if (ctx.goals)           parts.push(`Goals: ${ctx.goals}`);
      if (parts.length)        extraCtx = `\nAdditional citizen context:\n${parts.join("\n")}`;
    } catch { /* ignore malformed */ }
  }

  // Retrieve eligible schemes for this citizen
  const eligibleSchemes: GovernmentService[] = (() => {
    if (!countryCode) return [];
    const lifeEventKey = (lifeEventRaw ?? null) as ("new-baby"|"job-loss"|"start-business") | null;
    const empKey = (employment ?? null) as ("employed"|"self-employed"|"unemployed") | null;
    if (lifeEventKey && empKey) {
      return filterServices(lifeEventKey, empKey, countryCode as "IE"|"UAE"|"RW"|"IN"|"CA-US");
    }
    // Fallback: all schemes for country
    return KB.filter((s) => s.country === countryCode).slice(0, 12);
  })();

  const schemesCatalog = eligibleSchemes
    .map((s) =>
      `• id="${s.id}" | ${s.name} | ${s.agency} | ${s.amount ?? "amount varies"} | deadline: ${s.deadline} | priority: ${s.priority} | week: ${s.weekToApply}`
    )
    .join("\n");

  // ─── ANNOTATION FORMAT ────────────────────────────────────────────────────
  // The AI can embed special annotations that the UI renders as rich components.
  // Format (always on a line by itself, before the text):
  //   [CA_SCHEMES:id1,id2,id3]          → renders scheme cards
  //   [CA_RECOMMEND:id1]                → highlights one scheme as top pick
  //   [CA_CHIPS:Question 1|Question 2]  → adds quick-reply chips
  //
  // Rules:
  //   - Annotations go FIRST, then the plain text message below.
  //   - Use scheme IDs EXACTLY as listed in the catalog.
  //   - Never put annotations mid-sentence.
  // ─────────────────────────────────────────────────────────────────────────

  const annotationGuide = `
## Annotation System
You can embed rich UI components in your response using these tags on their own lines, BEFORE your text:

[CA_SCHEMES:id1,id2,id3]   — show scheme cards (use exact IDs from the catalog)
[CA_RECOMMEND:id1]         — highlight one scheme as the top recommendation
[CA_CHIPS:Q1|Q2|Q3]        — add up to 4 quick-reply chips for next questions

IMPORTANT:
- Annotations go at the TOP of your response, before any text.
- Only reference IDs that appear in the "Eligible schemes" catalog below.
- Always add [CA_CHIPS:...] with 2–4 relevant follow-up questions.
- When listing multiple schemes, always add [CA_RECOMMEND:...] for the highest-priority one.
- Never explain what these tags are — they are invisible to the citizen.`;

  const base = `You are Citizen Assist — a proactive, expert government benefits advisor on Modveon's sovereign platform. You are NOT a generic chatbot.
${firstName ? `The citizen's name is ${firstName}.` : ""}
Location: ${countryName}${lifeEvent ? ` | Life event: ${lifeEvent}` : ""}${employment ? ` | Employment: ${employment}` : ""}
${extraCtx}

## Eligible schemes for this citizen
${schemesCatalog || "No schemes pre-loaded — ask citizen for their situation first."}

## Behaviour Rules
- You KNOW the citizen's eligible schemes. When asked what they qualify for, immediately show them using [CA_SCHEMES:...] — do NOT ask them to navigate elsewhere.
- Be proactive: if the citizen's situation is clear, surface relevant schemes without being asked.
- ALWAYS add quick-reply chips [CA_CHIPS:...] at the end of every response.
- Recommend one scheme to start with and explain WHY it's urgent.
- Use **bold** for scheme names, amounts, and key deadlines.
- Be specific — cite exact amounts (e.g. ₹5,000 lump sum) and deadlines.
- Keep text concise: 2–3 short paragraphs max.
- If asked about eligibility, reference the specific scheme's criteria.
- Never say "I cannot help" — always provide a path forward.
- If citizen is in India, say "India" not "Indiana". ${countryName} is the country.
${annotationGuide}`;

  if (context.type === "entitlement" && context.data) {
    const svc = context.data as GovernmentService;
    return `${base}

## Current focus: ${svc.name}
Agency: ${svc.agency}
Amount: ${svc.amount ?? "varies"}
Deadline: ${svc.deadline}
Documents: ${svc.documents.join(", ")}

Help the citizen understand eligibility, how to apply, what documents to prepare, and what to expect after applying.`;
  }

  if (context.type === "plan") {
    return `${base}

The citizen is asking about their action plan. Help them prioritise, understand deadlines, and take the next step. Reference specific scheme names and amounts.`;
  }

  return base;
}

export const PLAN_SYSTEM_PROMPT = `You are a government services advisor. Generate a structured action plan as JSON.
Output ONLY valid JSON matching the ActionPlan schema — no markdown, no explanation.`;
