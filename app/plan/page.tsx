"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ActionPlanTimeline from "@/components/ActionPlanTimeline";
import { GovernmentService } from "@/lib/knowledge-base";
import { ArrowLeft, Sparkles, RefreshCw } from "lucide-react";

interface ActionItem {
  serviceId: string;
  serviceName: string;
  agency: string;
  action: string;
  weekToApply: 1 | 2 | 4 | 12;
  amount?: string;
  deadline: string;
  documents: string[];
  tips: string[];
}

interface ActionPlan {
  summary: string;
  totalEstimatedValue: string;
  items: ActionItem[];
}

export default function PlanPage() {
  const [loading, setLoading]               = useState(true);
  const [plan, setPlan]                     = useState<ActionPlan | null>(null);
  const [error, setError]                   = useState<string | null>(null);
  const [situation, setSituation]           = useState<{ lifeEvent: string; employment: string; country: string } | null>(null);
  const [fromDb, setFromDb]                 = useState(false);
  const [ready, setReady]                   = useState(false);
  const [readySituation, setReadySituation] = useState<{ lifeEvent: string; employment: string; country: string } | null>(null);
  const [planStale, setPlanStale]           = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        // 1. Try DB first (authenticated users)
        try {
          const res = await fetch("/api/plan");
          if (res.ok) {
            const data = await res.json();
            if (!data?.items) throw new Error("Invalid plan data");
            setPlan(data);
            setFromDb(true);

            // Detect if plan is stale (generated for a different country)
            try {
              const citizenRes = await fetch('/api/citizen');
              if (citizenRes.ok) {
                const { citizen } = await citizenRes.json();
                const citizenCountry: string = citizen?.country ?? '';
                const firstId: string = data.items?.[0]?.serviceId ?? '';
                const countryPrefixMap: Record<string, string> = {
                  'ie-': 'IE', 'uae-': 'UAE', 'rw-': 'RW', 'in-': 'IN', 'ca-': 'CA-US',
                };
                const planCountry = Object.entries(countryPrefixMap).find(([prefix]) => firstId.startsWith(prefix))?.[1] ?? '';
                if (planCountry && citizenCountry && planCountry !== citizenCountry) {
                  setPlanStale(true);
                }
                if (citizen?.lifeEvent && citizen?.employment && citizen?.country) {
                  setSituation({ lifeEvent: citizen.lifeEvent, employment: citizen.employment, country: citizen.country });
                }
              }
            } catch { /* stale check failure is non-critical */ }
            return;
          }
        } catch {
          // not authenticated or network error — fall through to localStorage
        }

        // 2. Check localStorage — but do NOT auto-generate; wait for user action
        const servicesRaw  = localStorage.getItem("ca_services");
        const situationRaw = localStorage.getItem("ca_situation");

        if (!servicesRaw || !situationRaw) {
          setError("No situation found. Please visit My Situation first.");
          return;
        }

        const sit = JSON.parse(situationRaw) as { lifeEvent: string; employment: string; country: string };
        setReadySituation(sit);
        setReady(true);
      } catch {
        setError("Failed to load your plan. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, []);

  async function generatePlan() {
    const servicesRaw  = localStorage.getItem("ca_services");
    const situationRaw = localStorage.getItem("ca_situation");
    if (!servicesRaw || !situationRaw) return;

    setReady(false);
    setLoading(true);
    setError(null);
    const services: GovernmentService[] = JSON.parse(servicesRaw);
    const sit = JSON.parse(situationRaw);
    setSituation(sit);
    setFromDb(false);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services, situation: sit }),
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
      // Try localStorage first
      const servicesRaw = localStorage.getItem("ca_services");
      const situationRaw = localStorage.getItem("ca_situation");

      if (servicesRaw && situationRaw) {
        const services: GovernmentService[] = JSON.parse(servicesRaw);
        const sit = JSON.parse(situationRaw);
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

      // Fall back: regenerate from citizen profile
      const citizenRes = await fetch("/api/citizen");
      if (!citizenRes.ok) throw new Error("Not authenticated");
      const { citizen } = await citizenRes.json();

      if (!citizen.lifeEvent || !citizen.employment || !citizen.country) {
        setError("Please update your situation on My Situation page first.");
        return;
      }

      const sit = { lifeEvent: citizen.lifeEvent, employment: citizen.employment, country: citizen.country };
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
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <Link href="/discover" className="flex items-center gap-1 text-tx-secondary hover:text-tx-primary text-sm mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to results
            </Link>
            <h1 className="text-2xl font-bold text-tx-primary">Your Action Plan</h1>
            {situation && (
              <p className="text-tx-secondary text-sm mt-1">
                {situation.country} · {situation.lifeEvent.replace(/-/g, " ")} · {situation.employment}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {fromDb && (
              <button
                onClick={regeneratePlan}
                className="flex items-center gap-1.5 text-tx-secondary hover:text-tx-primary text-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            )}
            <div className="flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-accent-blue" />
              <span className="text-accent-blue text-sm font-semibold">
                {fromDb ? "Saved plan" : "AI-generated plan"}
              </span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="skeleton h-20 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="skeleton h-6 rounded-full w-24" />
                  <div className="skeleton h-40 rounded-xl" />
                  <div className="skeleton h-32 rounded-xl" />
                </div>
              ))}
            </div>
            <p className="text-center text-tx-secondary text-sm animate-pulse">
              {fromDb ? "Loading your saved plan…" : "Generating your personalised action plan…"}
            </p>
          </div>
        )}

        {/* Ready to generate */}
        {ready && !plan && !loading && !error && (
          <div style={{
            background: "var(--paper)",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "32px 40px",
            maxWidth: 560,
            margin: "0 auto",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 8 }}>
              Your situation
            </p>
            {readySituation && (
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                {readySituation.country} · {readySituation.lifeEvent.replace(/-/g, " ")} · {readySituation.employment}
              </p>
            )}
            <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24 }}>
              Ready to generate your week-by-week action plan.
            </p>
            <button
              onClick={generatePlan}
              className="btn btn-primary"
              style={{ borderRadius: 8 }}
            >
              Generate my plan →
            </button>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card p-8 text-center">
            <p className="text-danger text-sm mb-4">
              Select your situation on My Situation page first, then come back to generate your plan.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/discover" className="text-accent-blue text-sm hover:underline">
                ← Go to My Situation
              </Link>
              <button
                onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
                className="flex items-center gap-1 text-tx-secondary text-sm hover:text-tx-primary"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Stale plan banner */}
        {planStale && fromDb && plan && !loading && (
          <div style={{
            background: 'var(--partial-bg)', border: '1px solid rgba(214,163,90,0.25)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            fontSize: 13,
          }}>
            <span style={{ color: 'var(--partial)' }}>
              ⚠️ This plan was generated for a different location. Update your situation to regenerate.
            </span>
            <button
              onClick={regeneratePlan}
              style={{
                fontSize: 12, fontWeight: 600, color: 'var(--primary)',
                background: 'none', border: '1px solid var(--primary)',
                borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
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
          <div className="mt-10 card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-tx-primary font-semibold text-sm">Want to talk through any step?</p>
              <p className="text-tx-secondary text-xs mt-0.5">Our AI advisor can answer questions about any specific benefit.</p>
            </div>
            <Link
              href="/chat/plan"
              className="shrink-0 bg-accent-blue hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Ask the AI
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
