"use client";

import { useState, useEffect, useRef } from "react";
import { countryFlag, countryName } from "@/lib/utils";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";

// ── Chip data ─────────────────────────────────────────────────────────────────
const LIFE_EVENTS = [
  { id: "new-baby",       label: "Having a baby",      emoji: "👶" },
  { id: "job-loss",       label: "Lost my job",         emoji: "📋" },
  { id: "start-business", label: "Starting a business", emoji: "🚀" },
];

const EMPLOYMENTS = [
  { id: "employed",      label: "Employed",      emoji: "💼" },
  { id: "self-employed", label: "Self-employed",  emoji: "🧾" },
  { id: "unemployed",    label: "Unemployed",     emoji: "🔍" },
];

const COUNTRIES = [
  { id: "IE",    label: "Ireland",     flag: "🇮🇪" },
  { id: "UAE",   label: "UAE",         flag: "🇦🇪" },
  { id: "RW",    label: "Rwanda",      flag: "🇷🇼" },
  { id: "IN",    label: "India",       flag: "🇮🇳" },
  { id: "CA-US", label: "California",  flag: "🇺🇸" },
  { id: "SV",    label: "El Salvador", flag: "🇸🇻" },
  { id: "other", label: "Other",       flag: "🌍" },
];

interface SituationBuilderProps {
  onSubmit: (lifeEvent: string, employment: string, country: string) => void;
  loading: boolean;
  prefillCountry?: string | null;
  prefillLifeEvent?: string | null;
  prefillEmployment?: string | null;
}

// ── Keyword parser — extracts structured fields from free text ────────────────
interface ParseResult {
  lifeEvent: string | null;
  employment: string | null;
  country: string | null;
}

function parseSituationText(raw: string): ParseResult {
  const t = raw.toLowerCase();

  // Life event
  let lifeEvent: string | null = null;
  if (/\b(baby|babies|pregnant|pregnancy|maternity|birth|newborn|expecting|due|having a child|new child)\b/.test(t)) {
    lifeEvent = "new-baby";
  } else if (/\b(lost.{0,10}job|lost my job|laid off|redundant|fired|let go|made redundant|losing.{0,5}job|lost employment|no longer employed|looking for (a )?job|looking for work|job hunt(ing)?|job search|job seeker|seeking (work|employment)|need(ing)? (a )?job|out of work|between jobs|in between jobs|recently unemployed|currently unemployed|without (a )?job|no job)\b/.test(t)) {
    lifeEvent = "job-loss";
  } else if (/\b(start.{0,10}business|new business|startup|start-up|entrepreneur|set up.{0,10}company|open.{0,10}business|launch.{0,10}business|going self.?employed)\b/.test(t)) {
    lifeEvent = "start-business";
  }

  // Employment
  let employment: string | null = null;
  if (/\bself.?employed\b|\bfreelance(r|r?ing)?\b|\bcontractor\b|\bmy own business\b|\bown company\b/.test(t)) {
    employment = "self-employed";
  } else if (
    /\bunemployed\b|\bnot working\b|\bjobless\b|\bout of work\b|\bno (longer |currently )?employed\b/.test(t) ||
    /\blooking for a job\b|\blooking for work\b|\bjob hunting\b|\bjob search\b|\bjob seeker\b|\bseeking work\b|\bseeking employment\b/.test(t) ||
    /\bneed a job\b|\bneed work\b|\bin between jobs\b|\brecently unemployed\b|\bcurrently unemployed\b/.test(t) ||
    /\bnot employed\b|\bwithout a job\b|\bwithout work\b|\bno job\b|\bno work\b/.test(t)
  ) {
    employment = "unemployed";
  } else if (/\bemployed\b|\bworking\b|\bmy (employer|job|company)\b|\bsalaried\b|\bpaye\b/.test(t)) {
    employment = "employed";
  }

  // Country
  let country: string | null = null;
  if (/\bireland\b|\birish\b|\b(in|from) ie\b/.test(t)) {
    country = "IE";
  } else if (/\buae\b|\bdubai\b|\babu dhabi\b|\bemirati\b|\bunited arab\b/.test(t)) {
    country = "UAE";
  } else if (/\brwanda\b|\brwandan\b|\bkigali\b|\b(in|from) rw\b/.test(t)) {
    country = "RW";
  } else if (/\bindia\b|\bindian\b|\bmumbai\b|\bdelhi\b|\bbengaluru\b|\bbangalore\b|\bchennai\b|\bhyderabad\b/.test(t)) {
    country = "IN";
  } else if (/\bcalifornia\b|\bca\b|\blos angeles\b|\bsan francisco\b|\bsan diego\b|\bla\b/.test(t)) {
    country = "CA-US";
  } else if (/\bel salvador\b|\bsalvador(an)?\b|\bsv\b|\bsan salvador\b|\bsanta ana el sal|\bsonsonate\b/.test(t)) {
    country = "SV";
  }

  return { lifeEvent, employment, country };
}

export default function SituationBuilder({ onSubmit, loading, prefillCountry, prefillLifeEvent, prefillEmployment }: SituationBuilderProps) {
  const [mode, setMode]             = useState<"chips" | "text">("chips");
  const [lifeEvent, setLifeEvent]   = useState<string | null>(prefillLifeEvent ?? null);
  const [employment, setEmployment] = useState<string | null>(prefillEmployment ?? null);
  const [country, setCountry]       = useState<string | null>(prefillCountry ?? null);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Text-mode state
  const [textInput, setTextInput]   = useState("");
  const [parseHint, setParseHint]   = useState<string | null>(null);
  const [clarify, setClarify]       = useState<{ lifeEvent: string|null; employment: string|null; country: string|null } | null>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  // Auto-submit 400ms after all three chips are selected
  useEffect(() => {
    if (mode === "chips" && lifeEvent && employment && country && !autoSubmitted) {
      const timer = setTimeout(() => {
        setAutoSubmitted(true);
        onSubmit(lifeEvent, employment, country);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mode, lifeEvent, employment, country, autoSubmitted, onSubmit]);

  // Focus textarea when switching to text mode
  useEffect(() => {
    if (mode === "text") {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [mode]);

  const rowComplete = (v: string | null) => v !== null;

  function handleTextSubmit() {
    const text = textInput.trim();
    if (!text) return;

    const parsed = parseSituationText(text);

    // Infer lifeEvent from employment when unambiguous
    if (!parsed.lifeEvent && parsed.employment === "unemployed") parsed.lifeEvent = "job-loss";

    // Fall back to citizen's saved context for fields not found in text
    if (!parsed.country && prefillCountry) parsed.country = prefillCountry;
    if (!parsed.lifeEvent && prefillLifeEvent) parsed.lifeEvent = prefillLifeEvent;
    if (!parsed.employment && prefillEmployment) parsed.employment = prefillEmployment;

    const missingFields: Array<"lifeEvent" | "employment" | "country"> = [];
    if (!parsed.lifeEvent)  missingFields.push("lifeEvent");
    if (!parsed.employment) missingFields.push("employment");
    if (!parsed.country)    missingFields.push("country");

    if (missingFields.length === 0) {
      // All extracted — submit directly
      onSubmit(parsed.lifeEvent!, parsed.employment!, parsed.country!);
    } else if (missingFields.length <= 2) {
      // 1-2 missing — show inline clarification UI
      setClarify({ lifeEvent: parsed.lifeEvent, employment: parsed.employment, country: parsed.country });
      setParseHint(null);
    } else {
      // Couldn't parse enough — show hint
      setParseHint("Could not understand. Please be more specific or use Quick select.");
      setClarify(null);
    }
  }

  function handleClarifyChip(field: "lifeEvent" | "employment" | "country", value: string) {
    const updated = { ...(clarify ?? { lifeEvent: null, employment: null, country: null }), [field]: value };
    setClarify(updated);

    // Auto-submit after 300ms if all 3 resolved
    if (updated.lifeEvent && updated.employment && updated.country) {
      setTimeout(() => {
        onSubmit(updated.lifeEvent!, updated.employment!, updated.country!);
      }, 300);
    }
  }

  function resetAll() {
    setLifeEvent(null);
    setEmployment(null);
    setCountry(null);
    setAutoSubmitted(false);
    setTextInput("");
    setParseHint(null);
    setClarify(null);
    setMode("chips");
  }

  const clarifyAllResolved = !!(clarify?.lifeEvent && clarify?.employment && clarify?.country);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Mode toggle — centred */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{
          display: "inline-flex",
          background: "var(--bg-alt)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-pill)",
          padding: 4,
          gap: 3,
        }}>
          {(["chips", "text"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setParseHint(null); setClarify(null); }}
              style={{
                fontSize: 13, fontWeight: 700,
                padding: "8px 22px",
                borderRadius: "var(--r-pill)",
                border: "none", cursor: "pointer",
                fontFamily: "inherit",
                transition: "all var(--dur-fast) var(--ease-out)",
                background: mode === m ? "var(--paper)" : "transparent",
                color: mode === m ? "var(--ink)" : "var(--ink-mute)",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "chips" ? "🎯 Quick select" : "✏️ Describe it"}
            </button>
          ))}
        </div>

        {/* Reset — shown when something is selected */}
        {(lifeEvent || employment || country || textInput) && (
          <button
            onClick={resetAll}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--ink-faint)", fontSize: 12,
              display: "flex", alignItems: "center", gap: 4,
              fontFamily: "inherit",
              transition: "color var(--dur-fast)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-mute)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-faint)"; }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Parse hint (shared between modes) */}
      {parseHint && (
        <div style={{
          fontSize: 12, color: "var(--partial)",
          background: "var(--partial-bg)",
          border: "1px solid rgba(214,163,90,0.2)",
          borderRadius: "var(--r-md)",
          padding: "8px 12px",
          lineHeight: 1.5,
        }}
          className="animate-fade-in"
        >
          {parseHint}
        </div>
      )}

      {/* ── TEXT MODE ─────────────────────────────────────────────────── */}
      {mode === "text" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="animate-fade-in">
          <p style={{ fontSize: 11, color: "var(--ink-mute)", margin: 0 }}>
            Describe your situation in your own words — we&apos;ll map it to the right benefits.
          </p>
          <textarea
            ref={textareaRef}
            value={textInput}
            onChange={(e) => { setTextInput(e.target.value); setParseHint(null); setClarify(null); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
            }}
            placeholder={
              "e.g. I just had a baby and I'm employed in Ireland\n" +
              "or: Lost my job in Dubai last month\n" +
              "or: Starting a business in Rwanda"
            }
            rows={3}
            style={{
              width: "100%",
              padding: "12px 14px",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--ink)",
              background: "var(--bg-alt)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--r-md)",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,92,58,0.12)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--line-strong)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* ── Inline clarification UI ─────────────────────────────── */}
          {clarify !== null && (
            <div style={{
              background: "var(--bg-alt)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              padding: "12px 14px",
              display: "flex", flexDirection: "column", gap: 10,
            }} className="animate-fade-in">
              {/* Resolved fields */}
              {(clarify.lifeEvent || clarify.employment || clarify.country) && (
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", marginRight: 2 }}>Understood:</span>
                  {clarify.lifeEvent && (
                    <span style={{
                      fontSize: 12, padding: "2px 10px",
                      background: "var(--primary-soft)", color: "var(--primary)",
                      border: "1px solid rgba(26,92,58,0.25)",
                      borderRadius: "var(--r-pill)", fontWeight: 500,
                    }}>
                      {LIFE_EVENTS.find(e => e.id === clarify.lifeEvent)?.label ?? clarify.lifeEvent}
                    </span>
                  )}
                  {clarify.employment && (
                    <span style={{
                      fontSize: 12, padding: "2px 10px",
                      background: "var(--primary-soft)", color: "var(--primary)",
                      border: "1px solid rgba(26,92,58,0.25)",
                      borderRadius: "var(--r-pill)", fontWeight: 500,
                    }}>
                      {EMPLOYMENTS.find(e => e.id === clarify.employment)?.label ?? clarify.employment}
                    </span>
                  )}
                  {clarify.country && (
                    <span style={{
                      fontSize: 12, padding: "2px 10px",
                      background: "var(--primary-soft)", color: "var(--primary)",
                      border: "1px solid rgba(26,92,58,0.25)",
                      borderRadius: "var(--r-pill)", fontWeight: 500,
                    }}>
                      {COUNTRIES.find(c => c.id === clarify.country)?.flag} {COUNTRIES.find(c => c.id === clarify.country)?.label ?? clarify.country}
                    </span>
                  )}
                </div>
              )}

              {/* Missing field: lifeEvent */}
              {!clarify.lifeEvent && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    What&apos;s happening?
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {LIFE_EVENTS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleClarifyChip("lifeEvent", e.id)}
                        style={{
                          fontSize: 12, padding: "4px 12px",
                          background: "var(--paper)", color: "var(--ink)",
                          border: "1px solid var(--line-strong)",
                          borderRadius: "var(--r-pill)",
                          cursor: "pointer", fontFamily: "inherit",
                          display: "inline-flex", alignItems: "center", gap: 5,
                          transition: "border-color var(--dur-fast), background var(--dur-fast)",
                        }}
                        onMouseEnter={(el) => { (el.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)"; }}
                        onMouseLeave={(el) => { (el.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-strong)"; }}
                      >
                        <span>{e.emoji}</span>
                        <span>{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing field: employment */}
              {!clarify.employment && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Employment status
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {EMPLOYMENTS.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => handleClarifyChip("employment", e.id)}
                        style={{
                          fontSize: 12, padding: "4px 12px",
                          background: "var(--paper)", color: "var(--ink)",
                          border: "1px solid var(--line-strong)",
                          borderRadius: "var(--r-pill)",
                          cursor: "pointer", fontFamily: "inherit",
                          display: "inline-flex", alignItems: "center", gap: 5,
                          transition: "border-color var(--dur-fast), background var(--dur-fast)",
                        }}
                        onMouseEnter={(el) => { (el.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)"; }}
                        onMouseLeave={(el) => { (el.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-strong)"; }}
                      >
                        <span>{e.emoji}</span>
                        <span>{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing field: country */}
              {!clarify.country && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Your country
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleClarifyChip("country", c.id)}
                        style={{
                          fontSize: 12, padding: "4px 12px",
                          background: "var(--paper)", color: "var(--ink)",
                          border: "1px solid var(--line-strong)",
                          borderRadius: "var(--r-pill)",
                          cursor: "pointer", fontFamily: "inherit",
                          display: "inline-flex", alignItems: "center", gap: 5,
                          transition: "border-color var(--dur-fast), background var(--dur-fast)",
                        }}
                        onMouseEnter={(el) => { (el.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)"; }}
                        onMouseLeave={(el) => { (el.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-strong)"; }}
                      >
                        <span>{c.flag}</span>
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={() => {
                  if (clarifyAllResolved) {
                    onSubmit(clarify.lifeEvent!, clarify.employment!, clarify.country!);
                  }
                }}
                disabled={!clarifyAllResolved || loading}
                style={{
                  alignSelf: "flex-start",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600,
                  color: "var(--on-primary)",
                  background: clarifyAllResolved && !loading ? "var(--primary)" : "var(--line-strong)",
                  border: "none",
                  borderRadius: "var(--r-md)",
                  padding: "8px 18px",
                  cursor: clarifyAllResolved && !loading ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  transition: "background var(--dur-fast) var(--ease-out)",
                }}
              >
                <Sparkles size={13} />
                Find my benefits →
              </button>
            </div>
          )}

          {/* Normal submit button (when no clarify UI) */}
          {clarify === null && (
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || loading}
              style={{
                alignSelf: "flex-end",
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 600,
                color: "var(--on-primary)",
                background: textInput.trim() && !loading ? "var(--primary)" : "var(--line-strong)",
                border: "none",
                borderRadius: "var(--r-md)",
                padding: "8px 18px",
                cursor: textInput.trim() && !loading ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                transition: "background var(--dur-fast) var(--ease-out)",
              }}
            >
              {loading ? (
                <>
                  <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--on-primary)" }} />
                  <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--on-primary)" }} />
                  <span className="typing-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--on-primary)" }} />
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  Find my benefits
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── CHIP MODE ─────────────────────────────────────────────────── */}
      {mode === "chips" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>

          {/* Row 1: Life event */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }}>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>
              What&apos;s happening in your life?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {LIFE_EVENTS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setLifeEvent(e.id);
                    setAutoSubmitted(false);
                    setParseHint(null);
                    if (e.id === "job-loss")       setEmployment("unemployed");
                    else if (e.id === "start-business") setEmployment("self-employed");
                    else setEmployment(null);
                  }}
                  className={`chip ${lifeEvent === e.id ? "selected" : ""}`}
                  style={{ fontSize: 14, padding: "10px 20px" }}
                >
                  <span>{e.emoji}</span>
                  <span>{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Employment — revealed after row 1 */}
          {rowComplete(lifeEvent) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }} className="animate-slide-down">
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>
                Your employment status
              </p>

              {/* Locked: job-loss → unemployed only */}
              {lifeEvent === "job-loss" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <div className="chip selected" style={{ cursor: "default", opacity: 1, fontSize: 14, padding: "10px 20px" }}>
                    <span>🔍</span>
                    <span>Unemployed</span>
                  </div>
                  <span style={{
                    fontSize: 11, color: "var(--primary)",
                    background: "rgba(26,92,58,0.08)",
                    border: "1px solid rgba(26,92,58,0.18)",
                    borderRadius: "var(--r-pill)",
                    padding: "3px 12px",
                    fontWeight: 500,
                  }}>
                    Auto-selected · based on your life event
                  </span>
                </div>
              )}

              {/* Locked: start-business → self-employed only */}
              {lifeEvent === "start-business" && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <div className="chip selected" style={{ cursor: "default", opacity: 1, fontSize: 14, padding: "10px 20px" }}>
                    <span>🧾</span>
                    <span>Self-employed</span>
                  </div>
                  <span style={{
                    fontSize: 11, color: "var(--primary)",
                    background: "rgba(26,92,58,0.08)",
                    border: "1px solid rgba(26,92,58,0.18)",
                    borderRadius: "var(--r-pill)",
                    padding: "3px 12px",
                    fontWeight: 500,
                  }}>
                    Auto-selected · based on your life event
                  </span>
                </div>
              )}

              {/* Free choice: new-baby (or any other event) shows all 3 */}
              {lifeEvent !== "job-loss" && lifeEvent !== "start-business" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {EMPLOYMENTS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => { setEmployment(e.id); setAutoSubmitted(false); }}
                      className={`chip ${employment === e.id ? "selected" : ""}`}
                      style={{ fontSize: 14, padding: "10px 20px" }}
                    >
                      <span>{e.emoji}</span>
                      <span>{e.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Row 3: Country — revealed after row 2 */}
          {rowComplete(lifeEvent) && rowComplete(employment) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", width: "100%" }} className="animate-slide-down">
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", margin: 0 }}>
                Your country
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                {COUNTRIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCountry(c.id); setAutoSubmitted(false); }}
                    className={`chip ${country === c.id ? "selected" : ""}`}
                    style={{ fontSize: 14, padding: "10px 20px" }}
                  >
                    <span>{c.flag}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--primary)", fontSize: 13 }} className="animate-fade-in">
              <div style={{ display: "flex", gap: 4 }}>
                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
              </div>
              Finding your entitlements in {countryFlag(country ?? "")} {countryName(country ?? "")}…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
