"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";

function AuthPageInner() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to start session");
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #ffffff 0%, #6aa6d8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", marginBottom: 6,
          }}>
            Modveon
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Citizen Assist
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Welcome
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.6 }}>
              Find every government benefit you qualify for — in under a minute.
            </p>
          </div>

          {/* Name input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--ink-mute)",
              display: "block", marginBottom: 8,
            }}>
              Your first name <span style={{ color: "var(--ink-faint)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
              placeholder="e.g. Amara"
              autoFocus
              style={{
                width: "100%", height: 46,
                padding: "0 14px",
                background: "var(--bg-alt)",
                border: "1px solid var(--line-strong)",
                borderRadius: 8,
                color: "var(--ink)",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line-strong)"; }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "var(--ineligible)", marginBottom: 14 }}>{error}</p>
          )}

          <button
            onClick={handleStart}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%", height: 46,
              borderRadius: 8, fontSize: 14, fontWeight: 600,
              justifyContent: "center",
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading ? "Starting…" : "Get started"}
            {!loading && <ArrowRight size={15} />}
          </button>
        </div>

        {/* Trust signal */}
        <div style={{
          marginTop: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, fontSize: 11, color: "var(--ink-faint)",
        }}>
          <Shield size={11} />
          No account needed · No data sold · Free to use
        </div>

      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}
