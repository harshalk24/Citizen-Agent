"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SituationBuilder from "@/components/SituationBuilder";
import EntitlementCard from "@/components/EntitlementCard";
import RefinementChips from "@/components/RefinementChips";
import { GovernmentService } from "@/lib/knowledge-base";
import { countryFlag } from "@/lib/utils";
import { ArrowRight, MapPin, Sparkles, CheckCircle } from "lucide-react";

interface EntitlementResult {
  services: GovernmentService[];
  assumptions: string[];
  refinements: string[];
  totalValue: string;
}

function DiscoverPageInner() {
  const searchParams = useSearchParams();
  const fromProfile  = searchParams.get("from") === "profile";

  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<EntitlementResult | null>(null);
  const [situation, setSituation] = useState<{ lifeEvent: string; employment: string; country: string } | null>(null);
  const [citizenCtx, setCitizenCtx] = useState<{ country?: string; lifeEvent?: string; employment?: string } | null>(null);
  const [profileBanner, setProfileBanner] = useState(fromProfile);

  useEffect(() => {
    fetch('/api/citizen')
      .then(r => r.ok ? r.json() : null)
      .then(data => { const c = data?.citizen ?? data; if (c) setCitizenCtx({ country: c.country ?? undefined, lifeEvent: c.lifeEvent ?? undefined, employment: c.employment ?? undefined }); })
      .catch(() => {});
  }, []);

  // Auto-dismiss the profile banner after 5 s
  useEffect(() => {
    if (!profileBanner) return;
    const t = setTimeout(() => setProfileBanner(false), 5000);
    return () => clearTimeout(t);
  }, [profileBanner]);

  const handleSubmit = useCallback(async (lifeEvent: string, employment: string, country: string) => {
    setLoading(true);
    setResult(null);
    setSituation({ lifeEvent, employment, country });

    try {
      const res = await fetch("/api/entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lifeEvent, employment, country }),
      });
      if (!res.ok) {
        setResult(null);
        return;
      }
      const data: EntitlementResult = await res.json();
      // Guard: ensure the response has the expected shape
      if (!Array.isArray(data?.services)) {
        setResult(null);
        return;
      }
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefine = useCallback((label: string) => {
    if (!situation) return;
    const employmentMap: Record<string, string> = {
      "I'm employed": "employed",
      "I'm self-employed": "self-employed",
      "I'm unemployed": "unemployed",
      "I'm currently employed": "employed",
      "I'm already self-employed": "self-employed",
      "I'm currently unemployed": "unemployed",
      "I was self-employed": "self-employed",
    };
    if (employmentMap[label]) {
      handleSubmit(situation.lifeEvent, employmentMap[label], situation.country);
    }
    // other refinements (e.g. "I have children", "I'm renting") are informational only for now
  }, [situation, handleSubmit]);

  // Group by weekToApply for the timeline view
  const byWeek = result
    ? [1, 2, 4, 12].reduce<Record<number, GovernmentService[]>>((acc, w) => {
        const services = result.services.filter((s) => s.weekToApply === w);
        if (services.length) acc[w] = services;
        return acc;
      }, {})
    : {};

  const weekLabel: Record<number, string> = {
    1:  "Do this first",
    2:  "Do this soon",
    4:  "This month",
    12: "When you're ready",
  };
  const weekColor: Record<number, string> = {
    1:  "var(--ineligible)",
    2:  "var(--partial)",
    4:  "var(--primary)",
    12: "var(--ink-mute)",
  };

  return (
    <main className="min-h-screen dot-grid pt-24 pb-16">
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        {/* Profile-updated banner */}
        {profileBanner && (
          <div className="animate-fade-in" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(72,199,142,0.1)",
            border: "1px solid rgba(72,199,142,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13, color: "var(--eligible)", fontWeight: 500,
          }}>
            <CheckCircle size={15} />
            Profile updated — running a fresh entitlement check based on your new details…
            <button
              onClick={() => setProfileBanner(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--eligible)", fontSize: 16, lineHeight: 1, padding: 0 }}
            >×</button>
          </div>
        )}

        {/* Header — centred */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(26,92,58,0.08)", border: "1px solid rgba(26,92,58,0.15)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 20,
          }}>
            <Sparkles style={{ width: 13, height: 13, color: "var(--primary)" }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Instant entitlement lookup
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.025em", marginBottom: 12, lineHeight: 1.15 }}>
            Find your benefits in 3 taps
          </h1>
          <p style={{ fontSize: 15, color: "var(--ink-mute)", maxWidth: 460, margin: "0 auto", lineHeight: 1.6 }}>
            No forms, no waiting. Tap your situation and see every government benefit you qualify for — instantly.
          </p>
        </div>

        {/* Situation builder — no current-situation banner */}
        <div style={{
          background: "var(--paper)",
          border: "0.5px solid var(--line)",
          borderRadius: 14,
          padding: "28px 28px 24px",
          marginBottom: 32,
        }}>
          <SituationBuilder
            onSubmit={handleSubmit}
            loading={loading}
            prefillCountry={citizenCtx?.country}
            prefillLifeEvent={citizenCtx?.lifeEvent}
            prefillEmployment={citizenCtx?.employment}
          />
        </div>

        {/* Results */}
        {result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }} className="animate-fade-in">

            {/* Summary bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-mute)", marginBottom: 4 }}>
                  <MapPin style={{ width: 13, height: 13 }} />
                  {situation && `${countryFlag(situation.country)} ${situation.country}`}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
                  {result.services.length} benefit{result.services.length !== 1 ? "s" : ""} found
                  {result.totalValue && (
                    <span style={{ color: "var(--primary)", marginLeft: 8 }}>· up to {result.totalValue}</span>
                  )}
                </h2>
              </div>
              <Link
                href="/plan"
                onClick={() => {
                  if (situation) {
                    localStorage.setItem("ca_services", JSON.stringify(result.services));
                    localStorage.setItem("ca_situation", JSON.stringify(situation));
                  }
                }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--primary)", color: "#fff",
                  padding: "10px 20px", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(26,92,58,0.25)",
                  transition: "background var(--dur-fast)",
                  flexShrink: 0,
                }}
              >
                Generate action plan
                <ArrowRight style={{ width: 15, height: 15 }} />
              </Link>
            </div>

            {/* Refinement chips */}
            <RefinementChips
              assumptions={result.assumptions}
              refinements={result.refinements}
              onRefine={handleRefine}
            />

            {/* Services by urgency */}
            {Object.entries(byWeek).map(([week, services]) => (
              <div key={week}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11, fontWeight: 700,
                    color: weekColor[Number(week)] ?? "var(--ink-mute)",
                    background: "var(--paper)",
                    border: `0.5px solid ${weekColor[Number(week)] ?? "var(--line)"}`,
                    borderRadius: 4,
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}>
                    {weekLabel[Number(week)]}
                  </span>
                  <div style={{ flex: 1, height: "0.5px", background: "var(--line)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
                    {services.length} benefit{services.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {services.map((svc, i) => (
                    <EntitlementCard key={svc.id} service={svc} index={i} />
                  ))}
                </div>
              </div>
            ))}

            {/* Chat CTA */}
            <div style={{
              background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12,
              padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Have a question about any of these?</p>
                <p style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}>Our AI advisor can help you understand your options and next steps.</p>
              </div>
              <Link
                href="/chat/open"
                style={{
                  flexShrink: 0, fontSize: 12, fontWeight: 600,
                  color: "var(--primary)", border: "1px solid rgba(26,92,58,0.25)",
                  borderRadius: 8, padding: "8px 16px", textDecoration: "none",
                  transition: "background var(--dur-fast)",
                }}
              >
                Ask a question
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && (
          <p style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: 13, marginTop: 16 }}>
            Select your situation above to see your entitlements.
          </p>
        )}
      </div>
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverPageInner />
    </Suspense>
  );
}
