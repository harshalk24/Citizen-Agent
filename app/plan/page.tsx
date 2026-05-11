"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ActionPlanTimeline from "@/components/ActionPlanTimeline";
import { GovernmentService } from "@/lib/knowledge-base";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { countryFlag, countryName } from "@/lib/utils";

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

type Situation = { lifeEvent: string; employment: string; country: string };

// Human-readable labels
const LIFE_EVENT_LABEL: Record<string, string> = {
  "new-baby":       "Having a baby",
  "job-loss":       "Lost a job",
  "start-business": "Starting a business",
};
const EMPLOYMENT_LABEL: Record<string, string> = {
  "employed":      "Employed",
  "self-employed": "Self-employed",
  "unemployed":    "Unemployed",
};

function situationSummary(s: Situation) {
  const le  = LIFE_EVENT_LABEL[s.lifeEvent]  ?? s.lifeEvent.replace(/-/g, " ");
  const emp = EMPLOYMENT_LABEL[s.employment] ?? s.employment;
  const flag = countryFlag(s.country);
  const country = countryName(s.country);
  return `${flag} ${country} · ${le} · ${emp}`;
}

export default function PlanPage() {
  const [loading, setLoading]               = useState(true);
  const [plan, setPlan]                     = useState<ActionPlan | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const [situation, setSituation]           = useState<Situation | null>(null);
  const [fromDb, setFromDb]                 = useState(false);
  const [ready, setReady]                   = useState(false);
  const [readySituation, setReadySituation] = useState<Situation | null>(null);
  const [planStale, setPlanStale]           = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        // 1. Try DB first (authenticated users with a saved plan)
        try {
          const res = await fetch("/api/plan");
          if (res.ok) {
            const data = await res.json();
            if (!data?.items) throw new Error("Invalid plan data");
            setPlan(data);
            setFromDb(true);

            // Detect if plan is stale
            try {
              const citizenRes = await fetch("/api/citizen");
              if (citizenRes.ok) {
                const { citizen } = await citizenRes.json();
                const citizenCountry: string = citizen?.country ?? "";
                const firstId: string = data.items?.[0]?.serviceId ?? "";
                const countryPrefixMap: Record<string, string> = {
                  "ie-": "IE", "uae-": "UAE", "rw-": "RW", "in-": "IN", "ca-": "CA-US", "sv-": "SV",
                };
                const planCountry = Object.entries(countryPrefixMap).find(([prefix]) => firstId.startsWith(prefix))?.[1] ?? "";
                if (planCountry && citizenCountry && planCountry !== citizenCountry) {
                  setPlanStale(true);
                }
                if (citizen?.lifeEvent && citizen?.employment && citizen?.country) {
                  setSituation({ lifeEvent: citizen.lifeEvent, employment: citizen.employment, country: citizen.country });
                }
              }
            } catch { /* stale check is non-critical */ }
            return;
          }
        } catch {
          // not authenticated or network error — fall through
        }

        // 2. Check localStorage first
        const servicesRaw  = localStorage.getItem("ca_services");
        const situationRaw = localStorage.getItem("ca_situation");

        if (servicesRaw && situationRaw) {
          const sit = JSON.parse(situationRaw) as Situation;
          setReadySituation(sit);
          setReady(true);
          return;
        }

        // 3. No localStorage — try citizen profile (authenticated user without cached services)
        try {
          const citizenRes = await fetch("/api/citizen");
          if (citizenRes.ok) {
            const data = await citizenRes.json();
            const c = data?.citizen ?? data;
            if (c?.lifeEvent && c?.employment && c?.country) {
              const sit: Situation = {
                lifeEvent:  c.lifeEvent,
                employment: c.employment,
                country:    c.country,
              };
              setReadySituation(sit);
              setReady(true);
              return;
            }
          }
        } catch { /* not authenticated */ }

        // 4. Nothing found
        setError("no_situation");
      } catch {
        setError("Failed to load your plan. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, []);

  async function generatePlan() {
    if (!readySituation) return;

    setReady(false);
    setLoading(true);
    setError(null);
    setSituation(readySituation);
    setFromDb(false);

    try {
      // Try localStorage services first (faster, no extra API call)
      const servicesRaw = localStorage.getItem("ca_services");
      let services: GovernmentService[];

      if (servicesRaw) {
        services = JSON.parse(servicesRaw) as GovernmentService[];
      } else {
        // Fetch entitlements from profile
        const entRes = await fetch("/api/entitlements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(readySituation),
        });
        if (!entRes.ok) throw new Error("Failed to fetch entitlements");
        const entData = await entRes.json();
        services = entData.services as GovernmentService[];
        // Cache for next time
        localStorage.setItem("ca_services",  JSON.stringify(services));
        localStorage.setItem("ca_situation", JSON.stringify(readySituation));
      }

      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services, situation: readySituation }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  async function regeneratePlan() {
    setLoading(true);
    setError(null);
    setPlanStale(false);
    setFromDb(false);

    try {
      const servicesRaw  = localStorage.getItem("ca_services");
      const situationRaw = localStorage.getItem("ca_situation");

      if (servicesRaw && situationRaw) {
        const services: GovernmentService[] = JSON.parse(servicesRaw);
        const sit = JSON.parse(situationRaw) as Situation;
        setSituation(sit);
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ services, situation: sit }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPlan(data);
        return;
      }

      // Fall back to citizen profile
      const citizenRes = await fetch("/api/citizen");
      if (!citizenRes.ok) throw new Error("Not authenticated");
      const { citizen } = await citizenRes.json();

      if (!citizen.lifeEvent || !citizen.employment || !citizen.country) {
        setError("Please update your situation in the Discover page first.");
        return;
      }

      const sit: Situation = { lifeEvent: citizen.lifeEvent, employment: citizen.employment, country: citizen.country };
      setSituation(sit);

      const entRes = await fetch("/api/entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sit),
      });
      if (!entRes.ok) throw new Error("Failed to fetch entitlements");
      const { services } = await entRes.json();

      const planRes = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services, situation: sit }),
      });
      const data = await planRes.json();
      if (data.error) throw new Error(data.error);
      setPlan(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to regenerate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 96, paddingBottom: 64 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, color: "var(--ink-mute)", textDecoration: "none",
                marginBottom: 10, transition: "color var(--dur-fast)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-mute)"; }}
            >
              <ArrowLeft size={13} /> Back to dashboard
            </Link>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              Your Action Plan
            </h1>
            {situation && (
              <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 6 }}>
                {situationSummary(situation)}
              </p>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {fromDb && (
              <button
                onClick={regeneratePlan}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, color: "var(--ink-mute)",
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", transition: "color var(--dur-fast)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-mute)"; }}
              >
                <RefreshCw size={12} /> Regenerate
              </button>
            )}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(26,92,58,0.08)",
              border: "1px solid rgba(26,92,58,0.15)",
              borderRadius: 999, padding: "5px 14px",
            }}>
              <Sparkles size={13} color="var(--primary)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>
                {fromDb ? "Saved plan" : "AI-generated plan"}
              </span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
            ))}
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--ink-mute)" }} className="animate-pulse">
              {fromDb ? "Loading your saved plan…" : "Generating your personalised action plan…"}
            </p>
          </div>
        )}

        {/* Ready to generate ── shown when situation is known but no plan yet */}
        {ready && !plan && !loading && !error && readySituation && (
          <div style={{
            background: "var(--paper)",
            border: "0.5px solid var(--line)",
            borderRadius: 14, padding: "40px 36px",
            maxWidth: 540, margin: "0 auto",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--ink-mute)", marginBottom: 16,
            }}>
              Your saved situation
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8, letterSpacing: "-0.02em" }}>
              {situationSummary(readySituation)}
            </p>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.6, marginBottom: 28 }}>
              We&apos;ll build a personalised week-by-week plan based on the benefits you qualify for.
            </p>
            <button
              onClick={generatePlan}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--primary)", color: "#fff",
                border: "none", borderRadius: 10,
                padding: "12px 28px",
                fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(26,92,58,0.25)",
                transition: "background var(--dur-fast)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-deep)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--primary)"; }}
            >
              <Sparkles size={15} />
              Generate my action plan
            </button>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{
            background: "var(--paper)", border: "0.5px solid var(--line)",
            borderRadius: 14, padding: "40px 36px",
            maxWidth: 540, margin: "0 auto", textAlign: "center",
          }}>
            {error === "no_situation" ? (
              <>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                  No situation set up yet
                </p>
                <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6, marginBottom: 24 }}>
                  Tell us what&apos;s happening in your life and we&apos;ll find your benefits — then build your plan in one go.
                </p>
                <Link
                  href="/discover"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--primary)", color: "#fff",
                    border: "none", borderRadius: 10,
                    padding: "11px 24px", fontSize: 13, fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Find my benefits first <ArrowLeft size={13} style={{ transform: "rotate(180deg)" }} />
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--ineligible)", marginBottom: 16 }}>{error}</p>
                <button
                  onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "var(--ink-mute)",
                    background: "none", border: "1px solid var(--line)",
                    borderRadius: 6, padding: "6px 14px",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <RefreshCw size={12} /> Try again
                </button>
              </>
            )}
          </div>
        )}

        {/* Stale plan banner */}
        {planStale && fromDb && plan && !loading && (
          <div style={{
            background: "rgba(214,163,90,0.07)",
            border: "1px solid rgba(214,163,90,0.25)",
            borderRadius: 10, padding: "12px 16px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <span style={{ fontSize: 13, color: "var(--partial)" }}>
              ⚠️ This plan was generated for a different location. Regenerate to update it.
            </span>
            <button
              onClick={regeneratePlan}
              style={{
                fontSize: 12, fontWeight: 600, color: "var(--primary)",
                background: "none", border: "1px solid rgba(26,92,58,0.3)",
                borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              Regenerate
            </button>
          </div>
        )}

        {/* Plan */}
        {plan && !loading && (
          <ActionPlanTimeline
            items={plan.items}
            summary={plan.summary}
            totalEstimatedValue={plan.totalEstimatedValue}
          />
        )}

        {/* Bottom CTA */}
        {plan && !loading && (
          <div style={{
            marginTop: 36,
            background: "var(--paper)", border: "0.5px solid var(--line)",
            borderRadius: 12, padding: "16px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Want to talk through any step?</p>
              <p style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>Our AI advisor can answer questions about any specific benefit.</p>
            </div>
            <Link
              href="/chat/plan"
              style={{
                flexShrink: 0, background: "var(--primary)", color: "#fff",
                padding: "8px 18px", borderRadius: 8,
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              Ask the AI
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
