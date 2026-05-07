"use client";

interface RefinementChipsProps {
  assumptions: string[];
  refinements: string[];
  onRefine: (label: string) => void;
}

export default function RefinementChips({ assumptions, refinements, onRefine }: RefinementChipsProps) {
  if (assumptions.length === 0 && refinements.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* What we assumed */}
      {assumptions.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-tx-secondary">Showing results for:</span>
          {assumptions.map((a) => (
            <span
              key={a}
              className="text-xs bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-2.5 py-1 rounded-full"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Alternative situations */}
      {refinements.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-tx-secondary">Not quite right?</span>
          {refinements.map((r) => (
            <button
              key={r}
              onClick={() => onRefine(r)}
              className="text-xs text-tx-secondary border border-[#1E2D4A] px-2.5 py-1 rounded-full hover:border-accent-blue/40 hover:text-tx-primary transition-all"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
