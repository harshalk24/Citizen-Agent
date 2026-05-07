"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Phone, Shield, RotateCcw } from "lucide-react";

type Step = "phone" | "otp" | "name";

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("from") ?? "/discover";

  const [step, setStep]       = useState<Step>("phone");
  const [phone, setPhone]     = useState("");
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(""); // shown in dev for convenience

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first OTP box when step changes
  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRefs.current[0]?.focus(), 80);
  }, [step]);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.code) setDevCode(data.code); // dev convenience
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length < 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: phone.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Always go to onboarding — it checks `onboarded` flag and skips if already done
      router.push("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } finally {
      setLoading(false);
    }
  }

  // ── Save name ────────────────────────────────────────────────────────────
  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (name.trim()) {
        await fetch("/api/citizen", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        });
      }
    } finally {
      setLoading(false);
      router.push(redirect);
    }
  }

  // ── OTP input handlers ────────────────────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[index] = cleaned;
    setOtp(next);
    if (cleaned && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d !== "") && next.join("").length === 6) {
      setTimeout(() => handleVerifyOtp(), 80);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      setTimeout(() => handleVerifyOtp(), 80);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
              <rect x={1} y={1} width={30} height={30} rx={7} stroke="var(--ink)" strokeWidth={1.5} />
              <path d="M8 22 V10 L12.5 16 L16 10 L19.5 16 L24 10 V22"
                stroke="var(--ink)" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" fill="none" />
              <circle cx={26} cy={6} r={2.5} fill="var(--primary)" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em", color: "var(--ink)" }}>
              modveon
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Citizen Assist</div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--paper)", border: "1px solid var(--line)",
          borderRadius: 16, padding: "32px 28px",
          boxShadow: "var(--shadow-lg)",
        }}>

          {/* ── Step: Phone ── */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Identity verification</div>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                  Enter your phone number
                </h1>
                <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.55 }}>
                  We&apos;ll send a one-time code to verify your identity. No password required.
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-mute)", display: "block", marginBottom: 6 }}>
                  Phone number
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={14} color="var(--ink-faint)" style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
                  }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+353 87 123 4567"
                    autoFocus
                    style={{
                      width: "100%", height: 44, paddingLeft: 36, paddingRight: 14,
                      background: "var(--bg-alt)", border: "1px solid var(--line-strong)",
                      borderRadius: 8, color: "var(--ink)", fontSize: 14,
                      fontFamily: "inherit", outline: "none",
                    }}
                  />
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "var(--ineligible)", marginBottom: 12 }}>{error}</p>
              )}

              <button type="submit" disabled={!phone.trim() || loading}
                className="btn btn-primary"
                style={{ width: "100%", height: 44, borderRadius: 8, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending…" : "Send verification code"}
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          {/* ── Step: OTP ── */}
          {step === "otp" && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Verification code</div>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                  Check your phone
                </h1>
                <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.55 }}>
                  Enter the 6-digit code sent to{" "}
                  <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>{phone}</span>
                </p>
                {devCode && (
                  <div style={{
                    marginTop: 10, padding: "6px 10px",
                    background: "var(--partial-bg)", borderRadius: 6,
                    fontSize: 12, color: "var(--partial)",
                    fontFamily: "var(--font-mono)",
                  }}>
                    Dev mode — code: <strong>{devCode}</strong>
                  </div>
                )}
              </div>

              {/* 6-box OTP input */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    style={{
                      width: "100%", height: 52, textAlign: "center",
                      fontSize: 22, fontWeight: 600, fontFamily: "var(--font-mono)",
                      background: digit ? "var(--primary-soft)" : "var(--bg-alt)",
                      border: `1px solid ${digit ? "var(--primary)" : "var(--line-strong)"}`,
                      borderRadius: 8, color: "var(--ink)", outline: "none",
                      transition: "all var(--dur-fast) var(--ease-out)",
                    }}
                  />
                ))}
              </div>

              {error && (
                <p style={{ fontSize: 12, color: "var(--ineligible)", marginBottom: 12 }}>{error}</p>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={otp.join("").length < 6 || loading}
                className="btn btn-primary"
                style={{ width: "100%", height: 44, borderRadius: 8, fontSize: 14, marginBottom: 14, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Verifying…" : "Verify code"}
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setDevCode(""); setError(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, color: "var(--ink-mute)", padding: 0,
                  fontFamily: "inherit",
                }}
              >
                <RotateCcw size={12} /> Change number
              </button>
            </div>
          )}

          {/* ── Step: Name ── */}
          {step === "name" && (
            <form onSubmit={handleSaveName}>
              <div style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>One last thing</div>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
                  What should we call you?
                </h1>
                <p style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.55 }}>
                  Your agent will use this to personalise your experience.
                </p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  autoFocus
                  style={{
                    width: "100%", height: 44, padding: "0 14px",
                    background: "var(--bg-alt)", border: "1px solid var(--line-strong)",
                    borderRadius: 8, color: "var(--ink)", fontSize: 14,
                    fontFamily: "inherit", outline: "none",
                  }}
                />
              </div>

              <button type="submit" disabled={loading}
                className="btn btn-primary"
                style={{ width: "100%", height: 44, borderRadius: 8, fontSize: 14 }}>
                {loading ? "Saving…" : name.trim() ? "Continue" : "Skip"}
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        {/* Trust signal */}
        <div style={{
          marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, fontSize: 11, color: "var(--ink-faint)",
        }}>
          <Shield size={11} />
          Verified identity · Sovereign infrastructure · No data sold
        </div>
      </div>
    </div>
  );
}
