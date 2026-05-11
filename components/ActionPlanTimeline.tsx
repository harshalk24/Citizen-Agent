"use client";

import Link from "next/link";
import { CheckCircle, Clock, FileText, ExternalLink, MessageSquare } from "lucide-react";
import { applyEnrichment } from "@/lib/apply-enrichment";

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

interface ActionPlanTimelineProps {
  items:               ActionItem[];
  summary?:            string;
  totalEstimatedValue?: string;
}

const COLUMNS: { week: 1 | 2 | 4 | 12; label: string; sublabel: string; color: string; bg: string }[] = [
  { week: 1,  label: "Do immediately", sublabel: "Start right away",   color: "var(--ineligible)", bg: "rgba(185,28,28,0.06)" },
  { week: 2,  label: "Next priority",  sublabel: "Within 2 weeks",     color: "var(--partial)",    bg: "rgba(214,163,90,0.06)" },
  { week: 4,  label: "This month",     sublabel: "Within 4 weeks",     color: "var(--primary)",    bg: "rgba(26,92,58,0.06)" },
  { week: 12, label: "When ready",     sublabel: "Within 3 months",    color: "var(--ink-mute)",   bg: "rgba(0,0,0,0.03)" },
];

export default function ActionPlanTimeline({ items, summary, totalEstimatedValue }: ActionPlanTimelineProps) {
  const activeColumns = COLUMNS.filter((col) => items.some((i) => i.weekToApply === col.week));
  const cols = activeColumns.length > 0 ? activeColumns : COLUMNS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Summary card */}
      {(summary || totalEstimatedValue) && (
        <div style={{
          background: "var(--paper)",
          border: "0.5px solid var(--line)",
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24,
        }}>
          {summary && (
            <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.65, flex: 1 }}>
              {summary}
            </p>
          )}
          {totalEstimatedValue && (
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--ink-mute)", marginBottom: 4,
              }}>
                Est. total value
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.02em" }}>
                {totalEstimatedValue}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Timeline columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
        gap: 14,
        alignItems: "start",
      }}>
        {cols.map(({ week, label, sublabel, color, bg }) => {
          const columnItems = items.filter((i) => i.weekToApply === week);
          if (columnItems.length === 0) return null;

          return (
            <div key={week} style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: bg,
                  border: `1px solid ${color}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
                    {week}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{label}</p>
                  <p style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 1 }}>{sublabel}</p>
                </div>
              </div>

              {/* Items */}
              {columnItems.map((item) => {
                const applyUrl = applyEnrichment[item.serviceId]?.applyUrl;
                return (
                  <div
                    key={item.serviceId}
                    style={{
                      background: "var(--paper)",
                      border: "0.5px solid var(--line)",
                      borderTop: `2px solid ${color}`,
                      borderRadius: 10,
                      padding: "14px 14px 12px",
                      display: "flex", flexDirection: "column", gap: 10,
                    }}
                  >
                    {/* Name + agency */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", lineHeight: 1.35 }}>
                        {item.serviceName}
                      </p>
                      <p style={{ fontSize: 10, color: "var(--ink-mute)", marginTop: 2 }}>{item.agency}</p>
                    </div>

                    {/* Action */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
                      <CheckCircle size={11} color="var(--eligible)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.45 }}>{item.action}</span>
                    </div>

                    {/* Amount */}
                    {item.amount && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>
                        {item.amount}
                      </p>
                    )}

                    {/* Deadline */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={10} color="var(--partial)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: "var(--partial)", lineHeight: 1.4 }}>{item.deadline}</span>
                    </div>

                    {/* Documents */}
                    {item.documents.length > 0 && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
                          <FileText size={10} color="var(--ink-faint)" />
                          <span style={{ fontSize: 10, color: "var(--ink-mute)", fontWeight: 500 }}>Docs needed</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {item.documents.slice(0, 3).map((d) => (
                            <span key={d} style={{
                              fontSize: 10,
                              background: "var(--bg-alt)",
                              color: "var(--ink-mute)",
                              border: "0.5px solid var(--line)",
                              borderRadius: 4,
                              padding: "2px 7px",
                            }}>
                              {d}
                            </span>
                          ))}
                          {item.documents.length > 3 && (
                            <span style={{ fontSize: 10, color: "var(--ink-faint)" }}>
                              +{item.documents.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tip */}
                    {item.tips.length > 0 && (
                      <div style={{
                        background: "var(--primary-soft)",
                        border: "1px solid rgba(26,92,58,0.15)",
                        borderRadius: 7,
                        padding: "7px 10px",
                      }}>
                        <p style={{ fontSize: 11, color: "var(--primary)", lineHeight: 1.5 }}>
                          {item.tips[0]}
                        </p>
                      </div>
                    )}

                    {/* Ask + Apply buttons */}
                    <div style={{ display: "flex", gap: 6, paddingTop: 2 }}>
                      <Link
                        href={`/chat/entitlement-${item.serviceId}`}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                          fontSize: 11, fontWeight: 600, color: "var(--ink-mute)",
                          background: "var(--bg-alt)",
                          border: "0.5px solid var(--line)",
                          borderRadius: 6, padding: "6px 0",
                          textDecoration: "none",
                          transition: "color var(--dur-fast), border-color var(--dur-fast)",
                        }}
                        onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--primary)"; el.style.borderColor = "rgba(26,92,58,0.25)"; }}
                        onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.color = "var(--ink-mute)"; el.style.borderColor = "var(--line)"; }}
                      >
                        <MessageSquare size={10} /> Ask
                      </Link>

                      {applyUrl ? (
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                            fontSize: 11, fontWeight: 600, color: "var(--primary)",
                            background: "var(--primary-soft)",
                            border: "0.5px solid rgba(26,92,58,0.2)",
                            borderRadius: 6, padding: "6px 0",
                            textDecoration: "none",
                            transition: "background var(--dur-fast)",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(26,92,58,0.15)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--primary-soft)"; }}
                        >
                          <ExternalLink size={10} /> Apply
                        </a>
                      ) : (
                        <Link
                          href={`/chat/entitlement-${item.serviceId}`}
                          style={{
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                            fontSize: 11, fontWeight: 600, color: "var(--ink-mute)",
                            background: "var(--bg-alt)",
                            border: "0.5px solid var(--line)",
                            borderRadius: 6, padding: "6px 0",
                            textDecoration: "none",
                          }}
                        >
                          <ExternalLink size={10} /> Apply
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
