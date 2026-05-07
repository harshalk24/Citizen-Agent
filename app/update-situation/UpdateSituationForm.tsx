"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FormState {
  country: string;
  city: string;
  recentlyMoved: boolean;
  salaryRange: string;
  employmentType: string;
  maritalStatus: string;
  dependents: number;
  housingStatus: string;
  goals: string[];
}

interface Props {
  citizenId: string;
  initial: FormState;
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Business owner", "Student", "Retired"];
const SALARY_RANGES = [
  "Under ₹25k / Under €1,500",
  "₹25k–75k / €1.5k–4k",
  "₹75k–2L / €4k–8k",
  "Above ₹2L / Above €8k",
  "Prefer not to say",
];
const MARITAL_STATUSES = ["Single", "Married/partnered", "Separated", "Widowed"];
const HOUSING_STATUSES = ["Renting", "Own home", "Living with family", "Student accommodation", "Other"];
const GOALS = [
  "Find benefits I qualify for",
  "Plan my finances",
  "Job search support",
  "Start or grow a business",
  "Family & childcare support",
  "Tax & legal guidance",
];

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        border: active ? "1px solid var(--primary)" : "1px solid var(--line-strong)",
        background: active ? "var(--primary-soft)" : "var(--bg-alt)",
        color: active ? "var(--primary)" : "var(--ink-mute)",
        transition: "all 0.15s ease",
        fontFamily: "inherit",
      }}
    >
      {label}
    </button>
  );
}

export default function UpdateSituationForm({ initial }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGoal(goal: string) {
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/citizen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileContext: JSON.stringify(form) }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => {
        router.push("/discover?from=profile");
      }, 800);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--ink-mute)",
    marginBottom: 10,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--line-strong)",
    background: "var(--bg-alt)",
    color: "var(--ink)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const chipGroupStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 32px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Back link */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--ink-mute)",
            textDecoration: "none",
            marginBottom: 28,
          }}
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Update your situation
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-mute)" }}>
            Help us personalise your benefits and recommendations.
          </p>
        </div>

        {/* Section 1 — Location */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 20 }}>Location</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Country</label>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 20,
              background: "var(--bg-alt)",
              border: "1px solid var(--line)",
              fontSize: 13,
              color: "var(--ink-faint)",
            }}>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>{form.country}</span>
              <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>· Change in settings</span>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>City / region</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Bengaluru, Dublin..."
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Recently moved to this country</label>
            <div style={chipGroupStyle}>
              <ChipButton label="Yes" active={form.recentlyMoved === true} onClick={() => setField("recentlyMoved", true)} />
              <ChipButton label="No" active={form.recentlyMoved === false} onClick={() => setField("recentlyMoved", false)} />
            </div>
          </div>
        </div>

        {/* Section 2 — Employment */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 20 }}>Employment details</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Employment type</label>
            <div style={chipGroupStyle}>
              {EMPLOYMENT_TYPES.map((type) => (
                <ChipButton
                  key={type}
                  label={type}
                  active={form.employmentType === type}
                  onClick={() => setField("employmentType", type)}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Monthly salary range</label>
            <div style={chipGroupStyle}>
              {SALARY_RANGES.map((range) => (
                <ChipButton
                  key={range}
                  label={range}
                  active={form.salaryRange === range}
                  onClick={() => setField("salaryRange", range)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section 3 — Family */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 20 }}>Family</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Marital status</label>
            <div style={chipGroupStyle}>
              {MARITAL_STATUSES.map((status) => (
                <ChipButton
                  key={status}
                  label={status}
                  active={form.maritalStatus === status}
                  onClick={() => setField("maritalStatus", status)}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Children or dependents under your care</label>
            <input
              type="number"
              min={0}
              max={10}
              value={form.dependents}
              onChange={(e) => setField("dependents", Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
              style={{ ...inputStyle, width: 100 }}
            />
          </div>
        </div>

        {/* Section 4 — Housing */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 20 }}>Housing</h2>
          <label style={labelStyle}>Housing status</label>
          <div style={chipGroupStyle}>
            {HOUSING_STATUSES.map((status) => (
              <ChipButton
                key={status}
                label={status}
                active={form.housingStatus === status}
                onClick={() => setField("housingStatus", status)}
              />
            ))}
          </div>
        </div>

        {/* Section 5 — Goals */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Goals</h2>
          <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 16 }}>Select all that apply.</p>
          <div style={chipGroupStyle}>
            {GOALS.map((goal) => (
              <ChipButton
                key={goal}
                label={goal}
                active={form.goals.includes(goal)}
                onClick={() => toggleGoal(goal)}
              />
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: 13, color: "var(--ineligible)", marginBottom: 16 }}>{error}</p>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="btn btn-primary"
          style={{
            width: "100%",
            borderRadius: 10,
            padding: "14px 0",
            fontSize: 15,
            fontWeight: 600,
            justifyContent: "center",
          }}
        >
          {saved ? "✓ Saved · Refreshing your entitlements…" : saving ? "Saving…" : "Save & refresh my entitlements"}
        </button>
      </div>
    </div>
  );
}
