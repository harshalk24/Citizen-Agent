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
  dueDate: string; // ISO string from server
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
  in_progress: "completed",
  completed: "not_started",
};
const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};
const STATUS_COLOR: Record<string, string> = {
  not_started: "var(--ink-faint)",
  in_progress: "var(--partial)",
  completed: "var(--eligible)",
};
const PRIORITY_DOT: Record<string, string> = {
  high:   "var(--ineligible)",
  medium: "var(--partial)",
  low:    "var(--primary)",
};
const URGENCY_COLOR: Record<string, string> = {
  critical: "var(--ineligible)",
  warning:  "var(--partial)",
  ok:       "var(--eligible)",
  none:     "var(--ink-mute)",
};

export default function DashboardClient({ citizen, savedServices: initial, deadlines: initialDeadlines, actionPlan, hasProfile, locationServices }: Props) {
  const [services, setServices]   = useState(initial);
  const [deadlines, setDeadlines] = useState(initialDeadlines);

  // Stats derived from live state
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
    // Optimistic update
    setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, status: nextStatus } : s));
    try {
      await fetch(`/api/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Roll back on error
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {countryFlag(citizen.country)} {countryName(citizen.country)} · Citizen Dashboard
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>
              {citizen.name ? `Welcome back, ${citizen.name}` : "Your citizen dashboard"}
            </h1>
            {hasProfile && (
              <p style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 6 }}>
                {citizen.lifeEvent?.replace(/-/g, " ")} · {citizen.employment}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/update-situation" className="btn btn-outline btn-sm" style={{ borderRadius: 6 }}>
              <Compass size={13} /> Update situation
            </Link>
            <Link href="/chat/open" className="btn btn-primary btn-sm" style={{ borderRadius: 6 }}>
              <MessageCircle size={13} /> Ask agent
            </Link>
          </div>
        </div>

        {/* Empty state — get started prompt (full width, above grid) */}
        {!hasProfile && (
          <div style={{
            background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: 16, padding: "48px 32px", textAlign: "center", marginBottom: 28,
          }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Get started</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
              Tell your agent your situation
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-mute)", marginBottom: 24, maxWidth: 440, margin: "0 auto 24px" }}>
              Three taps and your agent maps every government benefit you qualify for — with a week-by-week plan to claim them.
            </p>
            <Link href="/discover" className="btn btn-primary" style={{ borderRadius: 8 }}>
              Build my situation <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Stats */}
        {hasProfile && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Services found", value: totalServices, color: "var(--primary)" },
              { label: "Not started",    value: notStarted,    color: "var(--ink-mute)" },
              { label: "In progress",    value: inProgress,    color: "var(--partial)" },
              { label: "Completed",      value: completed,     color: "var(--eligible)" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
                <div className="eyebrow" style={{ marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>

          {/* Services list */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 14, paddingBottom: 12,
              borderBottom: "2px solid var(--primary)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(106,166,216,0.15)",
                  border: "1px solid rgba(106,166,216,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={15} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                  Your Entitlements
                </h2>
                {services.length > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "var(--primary)",
                    background: "rgba(106,166,216,0.12)", border: "1px solid rgba(106,166,216,0.25)",
                    borderRadius: 999, padding: "2px 10px",
                  }}>
                    {services.length} found
                  </span>
                )}
              </div>
              {hasProfile && (
                <Link href="/discover" style={{
                  fontSize: 12, color: "var(--primary)", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontWeight: 600,
                }}>
                  Refresh <ArrowRight size={11} style={{ display: "inline", verticalAlign: "middle" }} />
                </Link>
              )}
            </div>

            {services.length === 0 ? (
              <div style={{
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 12, padding: "32px 24px", textAlign: "center",
              }}>
                <FileText size={24} color="var(--ink-faint)" style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: "var(--ink-mute)" }}>No services saved yet.</p>
                <Link href="/discover" style={{
                  fontSize: 12, color: "var(--primary)", textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8,
                }}>
                  Discover your entitlements <ArrowRight size={11} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {services.map((svc) => {
                  const applyUrl = applyEnrichment[svc.serviceId]?.applyUrl;
                  return (
                  <div key={svc.id} style={{
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    borderLeft: `3px solid ${PRIORITY_DOT[svc.priority] ?? "var(--line-strong)"}`,
                    borderRadius: 10, padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: 12,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {svc.serviceName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{svc.agency}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      {svc.amount && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{svc.amount}</span>
                      )}
                      {/* Clickable status badge cycles through states */}
                      <button
                        onClick={() => cycleStatus(svc)}
                        title="Click to update status"
                        style={{
                          fontSize: 10, color: STATUS_COLOR[svc.status], fontWeight: 500,
                          background: "none", border: "none", cursor: "pointer",
                          padding: "2px 6px", borderRadius: 4,
                          transition: "background var(--dur-fast)",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--line)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        {STATUS_LABEL[svc.status] ?? svc.status}
                      </button>
                    </div>
                    {/* Ask + Apply buttons */}
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      {/* Ask agent about this scheme */}
                      <Link
                        href={`/chat/entitlement-${svc.serviceId}`}
                        title="Ask agent about this scheme"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 600,
                          color: "var(--ink-mute)",
                          background: "var(--bg-alt)",
                          border: "1px solid var(--line-strong)",
                          borderRadius: "var(--r-md)",
                          padding: "4px 8px",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          transition: "all var(--dur-fast) var(--ease-out)",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--primary)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--line-strong)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-mute)"; }}
                      >
                        <MessageCircle size={10} />
                        Ask
                      </Link>
                      {/* Apply now — direct link to portal */}
                      {applyUrl && (
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Apply now — official portal"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            fontSize: 11, fontWeight: 600,
                            color: "var(--primary)",
                            background: "var(--primary-soft)",
                            border: "1px solid rgba(106,166,216,0.25)",
                            borderRadius: "var(--r-md)",
                            padding: "4px 8px",
                            textDecoration: "none",
                            transition: "background var(--dur-fast) var(--ease-out)",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(106,166,216,0.22)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--primary-soft)"; }}
                        >
                          <ExternalLink size={10} />
                          Apply
                        </a>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* What's New — always shown when location services exist */}
            {locationServices.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 14, paddingBottom: 12,
                  borderBottom: "2px solid rgba(106,166,216,0.4)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "rgba(106,166,216,0.15)",
                      border: "1px solid rgba(106,166,216,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      {countryFlag(citizen.country)}
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: "-0.01em" }}>
                      What&apos;s New in {countryName(citizen.country)}
                    </h2>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 500 }}>Recently available</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {locationServices.map(svc => (
                    <div key={svc.id} style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderLeft: '3px solid rgba(106,166,216,0.5)',
                      borderRadius: 10, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {svc.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{svc.agency}</div>
                      </div>
                      {svc.amount && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{svc.amount}</span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: 'var(--primary)',
                        background: 'rgba(106,166,216,0.1)',
                        border: '1px solid rgba(106,166,216,0.2)',
                        borderRadius: 4, padding: '2px 8px', flexShrink: 0
                      }}>
                        Week {svc.weekToApply}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Deadlines */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Upcoming deadlines</h2>
                {urgentCount > 0 && (
                  <span className="pill pill-ineligible" style={{ fontSize: 10 }}>{urgentCount} urgent</span>
                )}
              </div>
              {activeDeadlines.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-mute)" }}>
                  {deadlines.length > 0
                    ? "All deadlines completed!"
                    : "No deadlines tracked yet. Generate an action plan to add them automatically."}
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {activeDeadlines.map((d) => {
                    const rel     = formatRelativeDate(new Date(d.dueDate));
                    const urgency = deadlineUrgency(rel);
                    return (
                      <div key={d.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        {/* Tick button */}
                        <button
                          onClick={() => toggleDeadline(d)}
                          title="Mark complete"
                          style={{
                            flexShrink: 0, marginTop: 1,
                            background: "none", border: "none", cursor: "pointer",
                            color: URGENCY_COLOR[urgency], padding: 0, lineHeight: 1,
                          }}
                        >
                          <Circle size={13} />
                        </button>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{d.title}</div>
                          <div style={{ fontSize: 11, color: URGENCY_COLOR[urgency], marginTop: 2 }}>
                            {rel} · {new Date(d.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </div>
                          {d.description && (
                            <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 1 }}>{d.description}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {deadlines.length > activeDeadlines.length && (
                    <p style={{ fontSize: 11, color: "var(--eligible)", marginTop: 4 }}>
                      <Check size={10} style={{ display: "inline", marginRight: 4 }} />
                      {deadlines.length - activeDeadlines.length} completed
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action plan */}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Action plan</h2>
              {actionPlan ? (
                <>
                  <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 14, lineHeight: 1.5 }}>
                    {actionPlan.summary}
                  </p>
                  <Link href="/plan" style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 500,
                  }}>
                    View full plan <ChevronRight size={13} />
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 14 }}>
                    Generate a week-by-week plan for everything you qualify for.
                  </p>
                  <Link href="/plan" className="btn btn-primary btn-sm" style={{ borderRadius: 6, display: "flex", justifyContent: "center" }}>
                    Generate plan <ArrowRight size={13} />
                  </Link>
                </>
              )}
            </div>

            {/* Chat CTA */}
            <div style={{ background: "var(--primary-soft)", border: "1px solid rgba(106,166,216,0.22)", borderRadius: 12, padding: "18px 20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Ask your agent</h2>
              <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 14 }}>
                Questions about any benefit, document, or deadline — answered instantly.
              </p>
              <Link href="/chat/open" className="btn btn-outline btn-sm" style={{ borderRadius: 6, display: "flex", justifyContent: "center" }}>
                <MessageCircle size={13} /> Open chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
