import { NextRequest } from "next/server";
import { streamChat, buildChatSystemPrompt } from "@/lib/ai";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages, context, citizenProfile, sessionId } = await req.json() as {
      messages: { role: string; content: string }[];
      context?: { type: "entitlement" | "plan" | "open"; data?: unknown };
      citizenProfile?: {
        name?: string;
        country?: string;
        lifeEvent?: string;
        employment?: string;
        profileContext?: string;
      };
      sessionId?: string;
    };

    const contextObj = context ?? { type: "open" as const };
    const systemPrompt = buildChatSystemPrompt(contextObj, citizenProfile);

    const chunks = await streamChat(messages, systemPrompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        try {
          for await (const text of chunks) {
            fullContent += text;
            controller.enqueue(encoder.encode(text));
          }
        } catch {
          controller.enqueue(encoder.encode("\n\n[Error generating response. Please try again.]"));
        } finally {
          controller.close();
          if (sessionId) {
            prisma.session.update({
              where: { id: sessionId },
              data: {
                messages: JSON.stringify([
                  ...messages,
                  { role: "assistant", content: fullContent },
                ]),
                context: contextObj.type,
              },
            }).catch(() => {});
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chat] error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
