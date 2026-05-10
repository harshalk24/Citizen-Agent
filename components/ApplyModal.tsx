"use client";

import { useState, useEffect, useRef } from "react";
import { X, ExternalLink, Copy, Check, Info, ChevronRight } from "lucide-react";
import { GovernmentService } from "@/lib/knowledge-base";
import { applyEnrichment, type PrefillField } from "@/lib/apply-enrichment";

interface ApplyModalProps {
  service: GovernmentService;
  onClose: () => void;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: "var(--r-sm)",
        color: copied ? "var(--eligible)" : "var(--ink-faint)",
        display: "inline-flex",
        alignItems: "center",
        transition: "color var(--dur-fast) var(--ease-out)",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function FieldRow({ field, index }: { field: PrefillField; index: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        borderBottom: "1px solid var(--line)",
        animationDelay: `${index * 40}ms`,
      }}
      className="fade-in-up"
    >
      <span style={{
        width: 20, height: 20, borderRadius: "50%",
        background: "var(--primary-soft)",
        color: "var(--primary)",
        fontSize: 10, fontWeight: 600,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        {index + 1}
      </span>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
            {field.label}
          </span>
          {field.example && (
            <CopyButton value={field.example} />
          )}
        </div>
        {field.hint && (
          <p style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2, lineHeight: 1.5 }}>
            {field.hint}
          </p>
        )}
        {field.example && (
          <code style={{
            fontSize: 11,
            color: "var(--primary)",
            background: "var(--primary-soft)",
            padding: "1px 6px",
            borderRadius: "var(--r-sm)",
            marginTop: 3,
            display: "inline-block",
            fontFamily: "var(--font-mono)",
          }}>
            e.g. {field.example}
          </code>
        )}
      </div>
    </div>
  );
}

export default function ApplyModal({ service, onClose }: ApplyModalProps) {
  const enrichment = applyEnrichment[service.id];
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const applyUrl = enrichment?.applyUrl ?? service.agencyUrl;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0 0",
      }}
      className="fade-in"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-2xl) var(--r-2xl) 0 0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
        }}
        className="slide-up"
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <p className="eyebrow" style={{ marginBottom: 4 }}>How to apply</p>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
              {service.name}
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 2 }}>{service.agency}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-alt)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-md)",
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "var(--ink-mute)",
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>

          {/* Auth note */}
          {enrichment?.authNote && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              background: "var(--info-bg)",
              border: "0.5px solid rgba(26,92,58,0.18)",
              borderRadius: "var(--r-md)",
              padding: "10px 12px",
              margin: "16px 0 4px",
            }}>
              <Info size={13} color="var(--info)" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
                {enrichment.authNote}
              </p>
            </div>
          )}

          {/* What you need */}
          {enrichment?.prefillFields && enrichment.prefillFields.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="eyebrow" style={{ marginBottom: 2 }}>What to have ready</p>
              <p style={{ fontSize: 11, color: "var(--ink-faint)", marginBottom: 4 }}>
                Gather these before clicking Apply — the form will ask for them in order.
              </p>
              <div>
                {enrichment.prefillFields.map((field, i) => (
                  <FieldRow key={i} field={field} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback for services without enrichment */}
          {!enrichment && service.documents.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>Documents needed</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {service.documents.map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)" }}>
                    <ChevronRight size={12} color="var(--primary)" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deadline reminder */}
          {service.deadline && (
            <div style={{
              background: "var(--partial-bg)",
              border: "1px solid rgba(214,163,90,0.2)",
              borderRadius: "var(--r-md)",
              padding: "8px 12px",
              marginTop: 16,
              fontSize: 12,
              color: "var(--partial)",
            }}>
              ⏰ <strong>Deadline:</strong> {service.deadline}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{
          padding: "14px 20px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          gap: 10,
          flexShrink: 0,
          background: "var(--paper)",
        }}>
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ flex: 1, textDecoration: "none" }}
            >
              <ExternalLink size={14} />
              Go to official application
            </a>
          ) : (
            <div className="btn" style={{ flex: 1, opacity: 0.5, cursor: "default" }}>
              No direct link available — contact {service.agency}
            </div>
          )}
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
