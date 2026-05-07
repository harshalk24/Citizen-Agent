"use client";

import Link from "next/link";
import { CheckCircle, Clock, FileText, ExternalLink, MessageSquare } from "lucide-react";
import { applyEnrichment } from "@/lib/apply-enrichment";

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

interface ActionPlanTimelineProps {
  items: ActionItem[];
  summary?: string;
  totalEstimatedValue?: string;
}

const COLUMNS: { week: 1 | 2 | 4 | 12; label: string; sublabel: string }[] = [
  { week: 1, label: "This Week",  sublabel: "Do immediately" },
  { week: 2, label: "Week 2",     sublabel: "Next priority" },
  { week: 4, label: "Month 1",    sublabel: "Within 4 weeks" },
  { week: 12, label: "Month 3",   sublabel: "Within 3 months" },
];

export default function ActionPlanTimeline({ items, summary, totalEstimatedValue }: ActionPlanTimelineProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      {(summary || totalEstimatedValue) && (
        <div className="card p-5 flex items-start justify-between gap-4">
          <p className="text-tx-secondary text-sm leading-relaxed flex-1">{summary}</p>
          {totalEstimatedValue && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-tx-secondary uppercase tracking-wider">Est. total value</p>
              <p className="text-accent-blue font-bold text-lg">{totalEstimatedValue}</p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic-column timeline */}
      {(() => {
        const activeColumns = COLUMNS.filter(col => items.some(i => i.weekToApply === col.week));
        const columnsToRender = activeColumns.length > 0 ? activeColumns : COLUMNS;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnsToRender.length}, 1fr)`, gap: 16 }}>
            {columnsToRender.map(({ week, label, sublabel }) => {
              const columnItems = items.filter((i) => i.weekToApply === week);
              if (columnItems.length === 0) return null;
              return (
                <div key={week} className="space-y-3">
                  {/* Column header */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center shrink-0">
                      <span className="text-accent-blue text-xs font-bold">{week}</span>
                    </div>
                    <div>
                      <p className="text-tx-primary font-semibold text-sm">{label}</p>
                      <p className="text-tx-secondary text-[10px]">{sublabel}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {columnItems.map((item) => (
                    <div
                      key={item.serviceId}
                      className={`card p-4 space-y-3 ${
                        week === 1 ? "priority-high" : week === 2 ? "priority-medium" : "priority-low"
                      }`}
                    >
                      <div>
                        <p className="text-tx-primary font-semibold text-xs leading-snug">{item.serviceName}</p>
                        <p className="text-tx-secondary text-[11px] mt-0.5">{item.agency}</p>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-tx-secondary">
                        <CheckCircle className="w-3 h-3 text-accent-blue shrink-0" />
                        <span>{item.action}</span>
                      </div>

                      {item.amount && (
                        <p className="text-accent-blue font-bold text-xs">{item.amount}</p>
                      )}

                      <div className="flex items-center gap-1 text-[11px] text-warning">
                        <Clock className="w-3 h-3 shrink-0" />
                        {item.deadline}
                      </div>

                      {item.documents.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1 text-[10px] text-tx-secondary mb-1">
                            <FileText className="w-3 h-3" />
                            Docs needed
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.documents.slice(0, 3).map((d) => (
                              <span key={d} className="text-[10px] bg-bg-tertiary text-tx-secondary px-1.5 py-0.5 rounded border border-[#1E2D4A]">
                                {d}
                              </span>
                            ))}
                            {item.documents.length > 3 && (
                              <span className="text-[10px] text-tx-secondary">+{item.documents.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {item.tips.length > 0 && (
                        <div className="bg-accent-blue/5 border border-accent-blue/15 rounded-lg p-2">
                          <p className="text-[11px] text-accent-blue leading-snug">{item.tips[0]}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-1">
                        <Link
                          href={`/chat/entitlement-${item.serviceId}`}
                          className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-tx-secondary border border-[#1E2D4A] rounded-lg py-1.5 hover:border-accent-blue/30 hover:text-accent-blue transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Ask
                        </Link>
                        {applyEnrichment[item.serviceId]?.applyUrl ? (
                          <a
                            href={applyEnrichment[item.serviceId].applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-accent-blue border border-accent-blue/30 rounded-lg py-1.5 hover:bg-accent-blue/10 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Apply
                          </a>
                        ) : (
                          <Link
                            href={`/chat/entitlement-${item.serviceId}`}
                            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-tx-secondary border border-[#1E2D4A] rounded-lg py-1.5 hover:border-accent-blue/30 hover:text-accent-blue transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Apply
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
