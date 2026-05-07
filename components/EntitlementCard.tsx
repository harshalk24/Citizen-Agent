"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Clock, AlertCircle, FileText, MessageCircle } from "lucide-react";
import { GovernmentService } from "@/lib/knowledge-base";
import { deadlineUrgency } from "@/lib/utils";
import { applyEnrichment } from "@/lib/apply-enrichment";
import Link from "next/link";
import ApplyModal from "@/components/ApplyModal";

interface EntitlementCardProps {
  service: GovernmentService;
  index: number;
}

const URGENCY_COLOR: Record<string, string> = {
  critical: "var(--ineligible)",
  warning:  "var(--partial)",
  ok:       "var(--ink-mute)",
  none:     "var(--ink-faint)",
};

const PRIORITY_BORDER: Record<string, string> = {
  high:   "var(--ineligible)",
  medium: "var(--partial)",
  low:    "var(--primary)",
};

export default function EntitlementCard({ service, index }: EntitlementCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const urgency = deadlineUrgency(service.deadline);
  const hasEnrichment = !!applyEnrichment[service.id];

  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderLeft: `3px solid ${PRIORITY_BORDER[service.priority] ?? "var(--line)"}`,
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-xs)",
        cursor: "pointer",
        animation: "fadeInUp var(--dur-base) var(--ease-out) both",
        animationDelay: `${index * 60}ms`,
        transition: "border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
      }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Week + deadline row */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="pill" style={{ fontSize: 10, padding: "1px 8px" }}>
                Week {service.weekToApply}
              </span>
              {service.deadline && (
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  color: URGENCY_COLOR[urgency] ?? "var(--ink-faint)",
                }}>
                  {service.deadline}
                </span>
              )}
            </div>

            <h3 style={{
              fontSize: 13, fontWeight: 600,
              color: "var(--ink)", lineHeight: 1.35, marginBottom: 2,
            }}>
              {service.name}
            </h3>
            <p style={{ fontSize: 11, color: "var(--ink-mute)" }}>{service.agency}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            {service.amount && (
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: "var(--primary)", whiteSpace: "nowrap",
              }}>
                {service.amount}
              </span>
            )}
            <span style={{ color: "var(--ink-faint)" }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
        </div>

        {!expanded && (
          <p style={{
            fontSize: 11, color: "var(--ink-mute)", marginTop: 8,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
          }}>
            {service.description}
          </p>
        )}
      </div>

      {/* Expanded */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--line)",
            padding: "14px 16px 16px",
            display: "flex", flexDirection: "column", gap: 12,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ fontSize: 12, color: "var(--ink-mute)", lineHeight: 1.6 }}>
            {service.description}
          </p>

          {/* Documents */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <FileText size={11} color="var(--ink-faint)" />
              <span className="eyebrow" style={{ fontSize: 10 }}>Documents needed</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {service.documents.map((doc) => (
                <span key={doc} style={{
                  fontSize: 11,
                  background: "var(--bg-alt)",
                  color: "var(--ink-mute)",
                  padding: "2px 8px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--line)",
                }}>
                  {doc}
                </span>
              ))}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "var(--ink-mute)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} />
              {service.processingTime}
            </span>
            {urgency !== "none" && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: URGENCY_COLOR[urgency] }}>
                <AlertCircle size={11} />
                {service.deadline}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, paddingTop: 4 }} onClick={(e) => e.stopPropagation()}>
            <Link
              href={`/chat/entitlement-${service.id}`}
              style={{
                flex: 1, textAlign: "center",
                fontSize: 12, fontWeight: 600,
                color: "var(--primary)",
                border: "1px solid rgba(106,166,216,0.3)",
                borderRadius: "var(--r-md)",
                padding: "8px 12px",
                textDecoration: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                transition: "background var(--dur-fast) var(--ease-out)",
              }}
            >
              <MessageCircle size={12} />
              Ask about this
            </Link>
            <button
              onClick={() => setApplyOpen(true)}
              style={{
                fontSize: 12, fontWeight: 600,
                color: hasEnrichment ? "#fff" : "var(--ink-mute)",
                background: hasEnrichment ? "var(--primary)" : "none",
                border: `1px solid ${hasEnrichment ? "var(--primary)" : "var(--line)"}`,
                borderRadius: "var(--r-md)",
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
                fontFamily: "inherit",
                transition: "all var(--dur-fast) var(--ease-out)",
              }}
            >
              <ExternalLink size={11} />
              Apply
            </button>
          </div>
        </div>
      )}

      {applyOpen && (
        <ApplyModal service={service} onClose={() => setApplyOpen(false)} />
      )}
    </div>
  );
}
