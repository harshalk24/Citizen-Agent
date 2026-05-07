"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";

function AuthPageInner() {
  const router  = useRouter();
  const [loading, setLoading] = useState(true); // start true — checking session
  const [error,   setError]   = useState("");

  // If user already has a valid session → skip straight to dashboard
  useEffect(() => {
    fetch("/api/citizen")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const c = data?.citizen ?? data;
        if (c?.id) {
          // Logged in — go to dashboard if onboarded, else onboarding
          router.replace(c.onboarded ? "/dashboard" : "/onboarding");
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  async function handleStart() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login" }),
      });
      if (!res.ok) throw new Error("Failed to start session");
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="typing-dot" style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--primary)", display: "inline-block",
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
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
          background: "var(--paper)", border: "1px solid var(--line)",
          borderRadius: 16, padding: "36px 28px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.3)",
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 10, letterSpacing: "-0.02em" }}>
            Find your benefits
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.65, marginBottom: 28 }}>
            Every government benefit you qualify for — surfaced in under a minute. No forms. No jargon.
          </p>

          {error && (
            <p style={{ fontSize: 12, color: "var(--ineligible)", marginBottom: 14 }}>{error}</p>
          )}

          <button
            onClick={handleStart}
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%", height: 48,
              borderRadius: 10, fontSize: 15, fontWeight: 600,
              justifyContent: "center",
            }}
          >
            Get started <ArrowRight size={16} />
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
