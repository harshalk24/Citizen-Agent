"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ArrowLeft, Shield, ExternalLink, Clock, ChevronRight, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { services as KB, filterServices, type GovernmentService } from "@/lib/knowledge-base";
import { applyEnrichment } from "@/lib/apply-enrichment";

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedAnnotations {
  schemeIds:    string[];
  recommendId:  string | null;
  chips:        string[];
  text:         string;
}

interface RichMessage {
  role:        "user" | "assistant";
  raw:         string;
  parsed:      ParsedAnnotations;
  isError?:    boolean;
  isGreeting?: boolean;
}

interface CitizenProfile {
  name?:           string;
  country?:        string;
  lifeEvent?:      string;
  employment?:     string;
  profileContext?: string;
}

// ── Annotation Parser ─────────────────────────────────────────────────────────

function parseAnnotations(raw: string): ParsedAnnotations {
  let text = raw;
  let schemeIds:   string[]     = [];
  let recommendId: string|null  = null;
  let chips:       string[]     = [];

  // [CA_SCHEMES:id1,id2]
  const schemesMatch = text.match(/\[CA_SCHEMES:([^\]]+)\]/);
  if (schemesMatch) {
    schemeIds = schemesMatch[1].split(",").map(s => s.trim()).filter(Boolean);
    text = text.replace(schemesMatch[0], "");
  }

  // [CA_RECOMMEND:id]
  const recMatch = text.match(/\[CA_RECOMMEND:([^\]]+)\]/);
  if (recMatch) {
    recommendId = recMatch[1].trim();
    text = text.replace(recMatch[0], "");
  }

  // [CA_CHIPS:Q1|Q2|Q3]
  const chipsMatch = text.match(/\[CA_CHIPS:([^\]]+)\]/);
  if (chipsMatch) {
    chips = chipsMatch[1].split("|").map(s => s.trim()).filter(Boolean).slice(0, 4);
    text = text.replace(chipsMatch[0], "");
  }

  return { schemeIds, recommendId, chips, text: text.trim() };
}

// ── Inline Scheme Card ────────────────────────────────────────────────────────

function InlineSchemeCard({
  service,
  isRecommended,
}: {
  service:       GovernmentService;
  isRecommended: boolean;
}) {
  const applyUrl = applyEnrichment[service.id]?.applyUrl ?? service.agencyUrl;

  return (
    <div style={{
      background:    isRecommended ? "rgba(106,166,216,0.08)" : "var(--bg-alt)",
      border:        isRecommended ? "1.5px solid rgba(106,166,216,0.4)" : "1px solid var(--line)",
      borderRadius:  10,
      padding:       "11px 13px",
      marginBottom:  6,
      position:      "relative",
    }}>
      {isRecommended && (
        <div style={{
          position:    "absolute",
          top:         -9,
          left:        10,
          background:  "var(--primary)",
          color:       "#fff",
          fontSize:    9,
          fontWeight:  700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding:     "2px 8px",
          borderRadius: 20,
          display:     "flex",
          alignItems:  "center",
          gap:         3,
        }}>
          <Star size={8} fill="currentColor" /> Start here
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3, marginBottom: 2 }}>
            {service.name}
          </p>
          <p style={{ fontSize: 10, color: "var(--ink-mute)", marginBottom: 5 }}>
            {service.agency}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {service.amount && (
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: "var(--primary)",
                background: "var(--primary-soft)",
                padding: "2px 7px",
                borderRadius: 20,
              }}>
                {service.amount}
              </span>
            )}
            <span style={{
              fontSize: 10,
              color: "var(--partial)",
              background: "rgba(214,163,90,0.1)",
              padding: "2px 7px",
              borderRadius: 20,
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <Clock size={8} />
              {service.deadline}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize:    10,
                fontWeight:  700,
                color:       "#fff",
                background:  "var(--primary)",
                padding:     "5px 10px",
                borderRadius: 8,
                textDecoration: "none",
                display:     "flex",
                alignItems:  "center",
                gap:         4,
                whiteSpace:  "nowrap",
              }}
            >
              <ExternalLink size={9} />
              Apply
            </a>
          ) : null}
          <Link
            href={`/chat/entitlement-${service.id}`}
            style={{
              fontSize:    10,
              fontWeight:  600,
              color:       "var(--primary)",
              textDecoration: "none",
              textAlign:   "center",
              display:     "flex",
              alignItems:  "center",
              justifyContent: "center",
              gap:         3,
            }}
          >
            Details <ChevronRight size={9} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Proactive Greeting ────────────────────────────────────────────────────────

function buildGreeting(profile: CitizenProfile): ParsedAnnotations {
  const firstName = profile.name?.split(" ")[0];
  const { country, lifeEvent, employment } = profile;

  if (!country || !lifeEvent || !employment) {
    return {
      schemeIds:   [],
      recommendId: null,
      chips:       ["What benefits am I eligible for?", "I need help with housing", "How do I apply for something?"],
      text:        `Hi${firstName ? ` ${firstName}` : ""}! I'm your Citizen Assist advisor. Tell me your situation and I'll find every benefit you qualify for — instantly.`,
    };
  }

  const eligible = filterServices(
    lifeEvent as "new-baby"|"job-loss"|"start-business",
    employment as "employed"|"self-employed"|"unemployed",
    country as "IE"|"UAE"|"RW"|"IN"|"CA-US"
  );

  const countryNames: Record<string, string> = {
    IE: "Ireland", UAE: "UAE", RW: "Rwanda", IN: "India", "CA-US": "California",
  };
  const lifeLabel = lifeEvent.replace(/-/g, " ");

  if (eligible.length === 0) {
    return {
      schemeIds:   [],
      recommendId: null,
      chips:       ["What help is available?", "Show me housing support", "How do I appeal a decision?"],
      text:        `Hi${firstName ? ` ${firstName}` : ""}! Based on your profile in ${countryNames[country] ?? country}, I'll help you navigate available support. What would you like to know?`,
    };
  }

  const top = eligible.find(s => s.priority === "high") ?? eligible[0];
  const schemeIds = eligible.slice(0, 5).map(s => s.id);

  return {
    schemeIds,
    recommendId: top.id,
    chips: [
      `How do I apply for ${top.name}?`,
      "What documents do I need?",
      "Which one should I do first?",
      "Generate my action plan",
    ],
    text: `Hi${firstName ? ` ${firstName}` : ""}! Based on your profile — **${lifeLabel}** · **${employment}** · **${countryNames[country] ?? country}** — here are **${eligible.length} benefit${eligible.length !== 1 ? "s" : ""}** you qualify for. I've highlighted the most urgent one to start with.`,
  };
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p style='margin-top:8px'>")
    .replace(/\n/g, "<br/>");
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  onChip,
  schemeMap,
}: {
  msg:      RichMessage;
  onChip:   (text: string) => void;
  schemeMap: Map<string, GovernmentService>;
}) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          maxWidth:     "82%",
          background:   "var(--primary)",
          color:        "#fff",
          padding:      "10px 14px",
          borderRadius: "18px 18px 4px 18px",
          fontSize:     13,
          lineHeight:   1.5,
        }}>
          {msg.raw}
        </div>
      </div>
    );
  }

  const { parsed } = msg;
  const resolvedSchemes = parsed.schemeIds
    .map(id => schemeMap.get(id))
    .filter(Boolean) as GovernmentService[];

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", gap: 8, alignItems: "flex-start" }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "var(--primary-soft)",
        border: "1px solid rgba(106,166,216,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 2,
      }}>
        <Shield size={13} color="var(--primary)" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Scheme cards */}
        {resolvedSchemes.length > 0 && (
          <div style={{ marginBottom: parsed.text ? 10 : 0 }}>
            {resolvedSchemes.map(svc => (
              <InlineSchemeCard
                key={svc.id}
                service={svc}
                isRecommended={svc.id === parsed.recommendId}
              />
            ))}
          </div>
        )}

        {/* Text bubble */}
        {parsed.text && (
          <div style={{
            background:   "var(--paper)",
            border:       "1px solid var(--line)",
            padding:      "10px 14px",
            borderRadius: "4px 18px 18px 18px",
            fontSize:     13,
            lineHeight:   1.6,
            color:        "var(--ink)",
            marginBottom: parsed.chips.length > 0 ? 8 : 0,
          }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(parsed.text) }}
          />
        )}

        {/* Quick reply chips */}
        {parsed.chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {parsed.chips.map((chip, i) => (
              <button
                key={i}
                onClick={() => onChip(chip)}
                style={{
                  fontSize:     11,
                  fontWeight:   600,
                  color:        "var(--primary)",
                  background:   "var(--primary-soft)",
                  border:       "1px solid rgba(106,166,216,0.25)",
                  borderRadius: 20,
                  padding:      "5px 12px",
                  cursor:       "pointer",
                  fontFamily:   "inherit",
                  transition:   "all 0.15s",
                  whiteSpace:   "nowrap",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(106,166,216,0.2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-soft)";
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "var(--primary-soft)",
        border: "1px solid rgba(106,166,216,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Shield size={13} color="var(--primary)" />
      </div>
      <div style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        padding: "12px 16px",
        borderRadius: "4px 18px 18px 18px",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="typing-dot" style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--ink-mute)",
            display: "inline-block",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main Chat Page ────────────────────────────────────────────────────────────

export default function ChatPage({ params }: { params: { context: string } }) {
  const { context } = params;
  const [messages, setMessages]             = useState<RichMessage[]>([]);
  const [input, setInput]                   = useState("");
  const [streaming, setStreaming]           = useState(false);
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile>({});
  const [profileLoaded, setProfileLoaded]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const contextType = context.startsWith("entitlement-")
    ? "entitlement"
    : context === "plan"
    ? "plan"
    : "open";

  const serviceId = contextType === "entitlement"
    ? context.replace("entitlement-", "")
    : null;

  const contextData = serviceId
    ? KB.find(s => s.id === serviceId) ?? (() => {
        try {
          const stored = typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("ca_services") ?? "[]") : [];
          return stored.find((s: { id: string }) => s.id === serviceId) ?? null;
        } catch { return null; }
      })()
    : null;

  const contextLabel =
    contextType === "entitlement" && contextData
      ? contextData.name
      : contextType === "plan"
      ? "Your Action Plan"
      : "Benefits Advisor";

  // ── Build a lookup map for fast scheme resolution ─────────────────────────
  const schemeMap = new Map<string, GovernmentService>(KB.map(s => [s.id, s]));

  // ── Load citizen profile ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/citizen");
        if (res.ok) {
          const data = await res.json();
          const citizen = data.citizen ?? data;
          setCitizenProfile({
            name:           citizen.name        ?? undefined,
            country:        citizen.country     ?? undefined,
            lifeEvent:      citizen.lifeEvent   ?? undefined,
            employment:     citizen.employment  ?? undefined,
            profileContext: citizen.profileContext ?? undefined,
          });
          setProfileLoaded(true);
          return;
        }
      } catch { /* not authenticated */ }
      try {
        const stored = localStorage.getItem("ca_situation");
        if (stored) setCitizenProfile(JSON.parse(stored));
      } catch { /* ignore */ }
      setProfileLoaded(true);
    }
    loadProfile();
  }, []);

  // ── Set initial greeting once profile is loaded ───────────────────────────
  useEffect(() => {
    if (!profileLoaded || messages.length > 0) return;

    let parsed: ParsedAnnotations;

    if (contextType === "entitlement" && contextData) {
      const svc = contextData as GovernmentService;
      parsed = {
        schemeIds:   [],
        recommendId: null,
        chips: [
          "Am I eligible?",
          "How do I apply?",
          "What documents do I need?",
          "How long does it take?",
        ],
        text: `I'm here to help you with **${svc.name}** from **${svc.agency}**${svc.amount ? ` — worth **${svc.amount}**` : ""}. What would you like to know?`,
      };
    } else if (contextType === "plan") {
      parsed = {
        schemeIds:   [],
        recommendId: null,
        chips: ["What should I do first?", "Explain week 1 steps", "How do I apply for the top benefit?"],
        text: "I can walk you through your action plan step by step. What would you like to start with?",
      };
    } else {
      parsed = buildGreeting(citizenProfile);
    }

    setMessages([{ role: "assistant", raw: "", parsed, isGreeting: true }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded, citizenProfile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;

    const userMsg: RichMessage = {
      role: "user",
      raw:  text,
      parsed: { schemeIds: [], recommendId: null, chips: [], text },
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const contextPayload =
      contextType === "entitlement" && contextData
        ? { type: "entitlement" as const, data: contextData }
        : contextType === "plan"
        ? { type: "plan" as const }
        : { type: "open" as const };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.raw || m.parsed.text })),
          context: contextPayload,
          citizenProfile,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        setMessages(prev => [...prev, {
          role: "assistant",
          raw:  err.error,
          parsed: { schemeIds: [], recommendId: null, chips: ["Try again", "Start over"], text: err.error },
          isError: true,
        }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Push empty placeholder
      setMessages(prev => [...prev, {
        role:   "assistant",
        raw:    "",
        parsed: { schemeIds: [], recommendId: null, chips: [], text: "" },
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const parsed = parseAnnotations(accumulated);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", raw: accumulated, parsed };
          return updated;
        });
      }

      // Final parse on complete response
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role:   "assistant",
          raw:    accumulated,
          parsed: parseAnnotations(accumulated),
        };
        return updated;
      });

    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        raw:  "Connection error.",
        parsed: { schemeIds: [], recommendId: null, chips: ["Try again"], text: "Connection error. Please check your network and try again." },
        isError: true,
      }]);
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, messages, streaming, contextType, contextData, citizenProfile]);

  const handleChip = useCallback((chip: string) => {
    setInput(chip);
    setTimeout(() => sendMessage(chip), 0);
  }, [sendMessage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 64, display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column", padding: "0 16px" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 0 14px",
          borderBottom: "1px solid var(--line)",
          marginBottom: 20,
        }}>
          <Link href="/discover" style={{ color: "var(--ink-mute)", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--primary-soft)",
              border: "1px solid rgba(106,166,216,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Citizen Assist</p>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "var(--primary)",
                  background: "var(--primary-soft)", padding: "2px 6px", borderRadius: 20,
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <Sparkles size={8} /> AI Advisor
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--ink-mute)", margin: 0 }}>{contextLabel}</p>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--eligible)" }}>
            <span className="live-dot" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingBottom: 8 }}>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onChip={handleChip}
              schemeMap={schemeMap}
            />
          ))}

          {streaming && (
            <TypingBubble />
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ paddingTop: 12, paddingBottom: 16 }}>
          <form onSubmit={handleFormSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                contextType === "entitlement" && contextData
                  ? `Ask about ${(contextData as GovernmentService).name}…`
                  : "Ask anything about your benefits…"
              }
              disabled={streaming}
              style={{
                flex: 1,
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "11px 16px",
                fontSize: 13,
                color: "var(--ink)",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
                opacity: streaming ? 0.5 : 1,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(106,166,216,0.5)"; }}
              onBlur={e  => { e.currentTarget.style.borderColor = "var(--line)"; }}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              style={{
                background:  "var(--primary)",
                border:      "none",
                borderRadius: 12,
                width:       44,
                height:      44,
                display:     "flex",
                alignItems:  "center",
                justifyContent: "center",
                cursor:      "pointer",
                opacity:     (!input.trim() || streaming) ? 0.4 : 1,
                transition:  "opacity 0.15s",
                flexShrink:  0,
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 10, color: "var(--ink-faint)", marginTop: 8 }}>
            AI advisor · Not legal advice · Verify with official agencies
          </p>
        </div>
      </div>
    </div>
  );
}
