"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, MessageCircle, Compass, ChevronRight, Check, Circle, ExternalLink } from "lucide-react";
import { formatRelativeDate, deadlineUrgency, countryFlag, countryName } from "@/lib/utils";
import { applyEnrichment } from "@/lib/apply-enrichment";

interface LocationService {
  id: string;
  name: string;
  agency: string;
  amount: string | null;
  weekToApply: number;
}

interface SavedService {
  id: string;
  serviceId: string;
  serviceName: string;
  agency: string;
  amount: string | null;
  status: string;
  priority: string;
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  description: string | null;
  completed: boolean;
}

interface ActionPlan {
  summary: string;
}

interface Props {
  citizen: {
    name: string | null;
    country: string;
    lifeEvent: string | null;
    employment: string | null;
  };
  savedServices: SavedService[];
  deadlines: Deadline[];
  actionPlan: ActionPlan | null;
  hasProfile: boolean;
  locationServices: LocationService[];
}

const STATUS_CYCLE: Record<string, string> = {
  not_started: "in_progress",
  in_progress:  "completed",
  completed:    "not_started",
};
const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed:   "Completed",
};
const STATUS_COLOR: Record<string, string> = {
  not_started: "var(--ink-faint)",
  in_progress: "var(--partial)",
  completed:   "var(--eligible)",
};
const URGENCY_COLOR: Record<string, string> = {
  critical: "var(--ineligible)",
  warning:  "var(--partial)",
  ok:       "var(--eligible)",
  none:     "var(--ink-mute)",
};

// Human-readable life event labels
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

export default function DashboardClient({ citizen, savedServices: initial, deadlines: initialDeadlines, actionPlan, hasProfile, locationServices }: Props) {
  const [services, setServices]   = useState(initial);
  const [deadlines, setDeadlines] = useState(initialDeadlines);

  const totalServices = services.length;
  const completed     = services.filter((s) => s.status === "completed").length;
  const inProgress    = services.filter((s) => s.status === "in_progress").length;
  const notStarted    = services.filter((s) => s.status === "not_started").length;
  const urgentCount   = deadlines.filter((d) => {
    const u = deadlineUrgency(formatRelativeDate(new Date(d.dueDate)));
    return u === "critical" || u === "warning";
  }).length;

  async function cycleStatus(svc: SavedService) {
    const nextStatus = STATUS_CYCLE[svc.status] ?? "not_started";
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, status: nextStatus } : s));
    try {
      await fetch(`/api/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, status: svc.status } : s));
    }
  }

  async function toggleDeadline(dl: Deadline) {
    const next = !dl.completed;
    setDeadlines((prev) => prev.map((d) => d.id === dl.id ? { ...d, completed: next } : d));
    try {
      await fetch(`/api/deadlines/${dl.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: next }),
      });
    } catch {
      setDeadlines((prev) => prev.map((d) => d.id === dl.id ? { ...d, completed: dl.completed } : d));
    }
  }

  const activeDeadlines = deadlines.filter((d) => !d.completed);
  const lifeEventLabel  = citizen.lifeEvent ? (LIFE_EVENT_LABEL[citizen.lifeEvent] ?? citizen.lifeEvent.replace(/-/g, " ")) : null;
  const employmentLabel = citizen.employment ? (EMPLOYMENT_LABEL[citizen.employment] ?? citizen.employment) : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--ink-mute)", marginBottom: 6,
            }}>
              {countryFlag(citizen.country)} {countryName(citizen.country)} · Citizen Dashboard
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {citizen.name ? `Welcome back, ${citizen.name}` : "Your dashboard"}
            </h1>
            {hasProfile && lifeEventLabel && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 12, color: "var(--primary)",
                  background: "rgba(26,92,58,0.07)",
                  border: "1px solid rgba(26,92,58,0.15)",
                  borderRadius: 6, padding: "3px 10px", fontWeight: 500,
                }}>
                  {lifeEventLabel}
                </span>
                {employmentLabel && (
                  <span style={{
                    fontSize: 12, color: "var(--ink-mute)",
                    background: "var(--bg-alt)",
                    border: "1px solid var(--line)",
                    borderRadius: 6, padding: "3px 10px",
                  }}>
                    {employmentLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 2 }}>
            <Link href="/update-situation" className="btn btn-outline btn-sm" style={{ borderRadius: 6 }}>
              <Compass size={13} /> Update details
            </Link>
            <Link href="/chat/open" className="btn btn-primary btn-sm" style={{ borderRadius: 6 }}>
              <MessageCircle size={13} /> Ask a question
            </Link>
          </div>
        </div>

        {/* ── Empty state ──────────────────────────────────────── */}
        {!hasProfile && (
          <div style={{
            background: "var(--paper)", border: "0.5px solid var(--line)",
            borderRadius: 14, padding: "48px 32px", textAlign: "center", marginBottom: 28,
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", marginBottom: 12 }}>
              Get started
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 10, letterSpacing: "-0.02em" }}>
              What&apos;s happening in your life?
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.65, maxWidth: 400, margin: "0 auto 28px" }}>
              Three taps and we show every benefit you qualify for — with a plan to claim them.
            </p>
            <Link href="/discover" className="btn btn-primary" style={{ borderRadius: 8, height: 44, fontSize: 14 }}>
              Find my benefits <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* ── Summary sentence ────────────────────────────────── */}
        {hasProfile && totalServices > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)", lineHeight: 1.5 }}>
              You have{" "}
              <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                {totalServices} benefit{totalServices !== 1 ? "s" : ""}
              </span>{" "}
              to claim
              {completed > 0 && <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}> · {completed} done</span>}
              {notStarted > 0 && <span style={{ color: "var(--ink-mute)", fontWeight: 400 }}> · {notStarted} to start</span>}
              {inProgress > 0 && <span style={{ color: "var(--partial)", fontWeight: 400 }}> · {inProgress} in progress</span>}
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }}>

          {/* ── Left: benefits list ───────────────────────────── */}
          <div>

            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--primary)", borderRadius: 8,
                padding: "6px 14px", flexShrink: 0,
              }}>
                <FileText size={13} color="#fff" />
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                  What you can claim
                </h2>
                {services.length > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--primary)",
                    background: "#fff", borderRadius: 999, padding: "0px 7px",
                    fontFamily: "var(--font-mono)", lineHeight: "18px", display: "inline-block",
                  }}>
                    {services.length}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, height: "0.5px", background: "var(--line)" }} />
              {hasProfile && (
                <Link
                  href="/discover"
                  style={{
                    fontSize: 12, color: "var(--primary)", textDecoration: "none",
                    fontWeight: 600, flexShrink: 0, display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  Refresh →
                </Link>
              )}
            </div>

            {services.length === 0 ? (
              <div style={{
                background: "var(--paper)", border: "0.5px solid var(--line)",
                borderRadius: 10, padding: "28px 20px", textAlign: "center",
              }}>
                <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 10 }}>No benefits saved yet.</p>
                <Link href="/discover" style={{
                  fontSize: 12, color: "var(--primary)", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 500,
                }}>
                  Discover your entitlements <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {services.map((svc) => {
                  const applyUrl = applyEnrichment[svc.serviceId]?.applyUrl;
                  return (
                    <div key={svc.id} style={{
                      background: "var(--paper)",
                      border: "0.5px solid var(--line)",
                      borderRadius: 10,
                      padding: "11px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "border-color var(--dur-fast)",
                    }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,92,58,0.2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--line)"; }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {svc.serviceName}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 1 }}>{svc.agency}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                        {svc.amount && (
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{svc.amount}</span>
                        )}
                        <button
                          onClick={() => cycleStatus(svc)}
                          title="Click to update status"
                          style={{
                            fontSize: 10, color: STATUS_COLOR[svc.status], fontWeight: 500,
                            background: "none", border: "none", cursor: "pointer",
                            padding: "2px 6px", borderRadius: 4,
                            fontFamily: "inherit",
                            transition: "background var(--dur-fast)",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-alt)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                        >
                          {STATUS_LABEL[svc.status] ?? svc.status}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                        <Link
                          href={`/chat/entitlement-${svc.serviceId}`}
                          title="Ask about this"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 3,
                            fontSize: 11, fontWeight: 500,
                            color: "var(--ink-mute)",
                            background: "var(--bg-alt)",
                            border: "0.5px solid var(--line)",
                            borderRadius: 6, padding: "4px 8px",
                            textDecoration: "none", whiteSpace: "nowrap",
                            transition: "all var(--dur-fast)",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(26,92,58,0.2)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-mute)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--line)"; }}
                        >
                          <MessageCircle size={10} /> Ask
                        </Link>
                        {applyUrl && (
                          <a
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 3,
                              fontSize: 11, fontWeight: 600,
                              color: "var(--primary)",
                              background: "var(--primary-soft)",
                              border: "0.5px solid rgba(26,92,58,0.2)",
                              borderRadius: 6, padding: "4px 8px",
                              textDecoration: "none", whiteSpace: "nowrap",
                              transition: "background var(--dur-fast)",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(26,92,58,0.15)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--primary-soft)"; }}
                          >
                            <ExternalLink size={10} /> Apply
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* What's New ── only shown when location services exist */}
            {locationServices.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "var(--primary)", borderRadius: 8,
                    padding: "6px 14px", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{countryFlag(citizen.country)}</span>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                      New in {countryName(citizen.country)}
                    </h2>
                  </div>
                  <div style={{ flex: 1, height: "0.5px", background: "var(--line)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink-mute)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>Recently added</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {locationServices.map((svc) => (
                    <div key={svc.id} style={{
                      background: "var(--paper)",
                      border: "0.5px solid var(--line)",
                      borderRadius: 10, padding: "11px 14px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {svc.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 1 }}>{svc.agency}</div>
                      </div>
                      {svc.amount && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", flexShrink: 0 }}>
                          {svc.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column ─────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Deadlines */}
            <div style={{ background: "var(--paper)", border: "0.5px solid var(--line)", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>Upcoming deadlines</h2>
                {urgentCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: "var(--ineligible)",
                    background: "rgba(185,28,28,0.07)",
                    border: "1px solid rgba(185,28,28,0.15)",
                    borderRadius: 4, padding: "2px 8px",
                  }}>
                    {urgentCount} urgent
                  </span>
                )}
              </div>
              {activeDeadlines.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5 }}>
                  {deadlines.length > 0
                    ? "All deadlines completed!"
                    : "Generate an action plan to track deadlines automatically."}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeDeadlines.map((d) => {
                    const rel     = formatRelativeDate(new Date(d.dueDate));
                    const urgency = deadlineUrgency(rel);
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <button
                          onClick={() => toggleDeadline(d)}
                          title="Mark complete"
                          style={{
                            flexShrink: 0,
                            marginTop: 3,
                            background: "none", border: "none", cursor: "pointer",
                            color: URGENCY_COLOR[urgency], padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 16, height: 16,
                          }}
                        >
                          <Circle size={14} strokeWidth={1.5} />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4 }}>{d.title}</div>
                          <div style={{ fontSize: 11, color: URGENCY_COLOR[urgency], marginTop: 2, fontWeight: 500 }}>
                            {rel} · {new Date(d.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {deadlines.length > activeDeadlines.length && (
                    <p style={{ fontSize: 11, color: "var(--eligible)", marginTop: 2 }}>
                      <Check size={10} style={{ display: "inline", marginRight: 4 }} />
                      {deadlines.length - activeDeadlines.length} completed
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action plan */}
            <div style={{ background: "var(--paper)", border: "0.5px solid var(--line)", borderRadius: 12, padding: "16px 18px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.01em" }}>Action plan</h2>
              {actionPlan ? (
                <>
                  <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 12, lineHeight: 1.55 }}>
                    {actionPlan.summary}
                  </p>
                  <Link href="/plan" style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 500,
                  }}>
                    View full plan <ChevronRight size={12} />
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 14, lineHeight: 1.55 }}>
                    Get a week-by-week plan for everything you qualify for.
                  </p>
                  <Link
                    href="/plan"
                    className="btn btn-primary btn-sm"
                    style={{ borderRadius: 6, display: "flex", justifyContent: "center" }}
                  >
                    Generate plan <ArrowRight size={12} />
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
