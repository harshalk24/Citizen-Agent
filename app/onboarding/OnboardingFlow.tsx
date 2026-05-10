"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, ChevronLeft, ArrowRight, Check } from "lucide-react";

const COUNTRIES = [
  { id: "IE",    label: "Ireland",       flag: "🇮🇪" },
  { id: "UAE",   label: "UAE",           flag: "🇦🇪" },
  { id: "RW",    label: "Rwanda",        flag: "🇷🇼" },
  { id: "IN",    label: "India",         flag: "🇮🇳" },
  { id: "CA-US", label: "California",   flag: "🇺🇸" },
  { id: "SV",    label: "El Salvador",   flag: "🇸🇻" },
  { id: "other", label: "Somewhere else", flag: "🌍" },
];

const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

// Slide direction variants
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir * -56 }),
};

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

interface Props {
  citizenId: string;
  prefillCountry: string;
}

export default function OnboardingFlow({ citizenId, prefillCountry }: Props) {

  const [step, setStep]   = useState(1); // start at name step directly
  const [dir,  setDir]    = useState(1);   // 1=forward, -1=back
  const [done, setDone]   = useState(false);

  const [firstName, setFirstName]       = useState("");
  const [country, setCountry]           = useState(prefillCountry);
  const [customCountry, setCustomCountry] = useState("");
  const [email, setEmail]               = useState("");

  const nameRef  = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Auto-focus text inputs when screen appears
  useEffect(() => {
    if (step === 1) setTimeout(() => nameRef.current?.focus(),  300);
    if (step === 3) setTimeout(() => emailRef.current?.focus(), 300);
  }, [step]);

  function advance() {
    setDir(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    if (step <= 1) return;
    setDir(-1);
    setStep((s) => s - 1);
  }

  async function finish(selectedGender: string) {
    setDone(true);

    const finalCountry = country === "other" ? customCountry : country;

    try {
      await fetch("/api/identity", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenId,
          ...(firstName.trim()        && { firstName: firstName.trim() }),
          ...(finalCountry            && { country: finalCountry }),
          ...(email.trim()            && { email: email.trim() }),
          ...(selectedGender          && { gender: selectedGender }),
        }),
      });
    } catch {
      // Non-fatal — dashboard still loads
    }

    setTimeout(() => { window.location.href = "/dashboard"; }, 1200);
  }

  // ── Completion screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 20, padding: 32,
      }}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "var(--eligible-bg)",
            border: "2px solid var(--eligible)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Check size={30} color="var(--eligible)" strokeWidth={2.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          style={{ textAlign: "center" }}
        >
          <h1 style={{
            fontSize: 26, fontWeight: 600, color: "var(--ink)",
            margin: "0 0 8px", letterSpacing: "-0.02em",
          }}>
            You&apos;re all set{firstName.trim() ? `, ${firstName.trim()}` : ""}.
          </h1>
          <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: 0 }}>
            Here&apos;s everything we found for you.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Main layout ────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "48px 24px",
      overflow: "hidden",
    }}>
      {/* Back arrow — screens 2, 3, 4 only */}
      {step >= 2 && step <= 4 && !done && (
        <button
          onClick={goBack}
          style={{
            position: "fixed", top: 24, left: 24,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-faint)", padding: 6, borderRadius: 8,
            display: "flex", alignItems: "center",
            transition: "color var(--dur-fast)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-faint)"; }}
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Progress dots — screens 1–4 */}
      {step >= 1 && step <= 4 && (
        <div style={{
          display: "flex", justifyContent: "center", gap: 8,
          marginBottom: 56,
        }}>
          {[1, 2, 3, 4].map((dot) => (
            <motion.div
              key={dot}
              animate={{
                width:      dot === step ? 10 : 7,
                height:     dot === step ? 10 : 7,
                background: dot <= step ? "var(--primary)" : "transparent",
              }}
              style={{
                borderRadius: "50%",
                border: `2px solid ${dot <= step ? "var(--primary)" : "var(--line-strong)"}`,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: 400, overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%" }}
          >

            {/* ════════════════ SCREEN 0 — WELCOME ════════════════ */}
            {step === 0 && (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 20,
                minHeight: 120, justifyContent: "center",
              }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ShieldCheck size={52} color="var(--primary)" strokeWidth={1.5} />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  style={{ fontSize: 30, fontWeight: 500, color: "var(--ink)", margin: 0 }}
                >
                  Verified.
                </motion.h1>
              </div>
            )}

            {/* ════════════════ SCREEN 1 — NAME ════════════════ */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    What should we call you?
                  </h1>
                  <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: 0 }}>
                    Just your first name is fine.
                  </p>
                </div>

                <input
                  ref={nameRef}
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && firstName.trim().length >= 2) advance(); }}
                  placeholder="First name"
                  style={{
                    width: "100%", height: 52, padding: "0 16px",
                    fontSize: 18, color: "var(--ink)",
                    background: "var(--paper)",
                    border: "1px solid var(--line-strong)",
                    borderRadius: 12, outline: "none", fontFamily: "inherit",
                    transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(26,92,58,0.12)";
                  }}
                  onBlur={(e)  => {
                    e.currentTarget.style.borderColor = "var(--line-strong)";
                    e.currentTarget.style.boxShadow   = "none";
                  }}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={advance}
                    disabled={firstName.trim().length < 2}
                    style={{
                      height: 48, borderRadius: 12, border: "none",
                      cursor: firstName.trim().length >= 2 ? "pointer" : "not-allowed",
                      background: firstName.trim().length >= 2 ? "var(--primary)" : "var(--line-strong)",
                      color: "var(--on-primary)",
                      fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: firstName.trim().length >= 2 ? 1 : 0.55,
                      transition: "all var(--dur-fast)",
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => { setFirstName(""); advance(); }}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13, color: "var(--ink-faint)", fontFamily: "inherit",
                      padding: "4px 0", textAlign: "center",
                      transition: "color var(--dur-fast)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-mute)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--ink-faint)"; }}
                  >
                    Skip for now →
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════ SCREEN 2 — COUNTRY ════════════════ */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    Where are you based?
                  </h1>
                  <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: 0 }}>
                    We&apos;ll show you the right benefits for your location.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {COUNTRIES.map((c) => {
                    const selected = country === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCountry(c.id)}
                        style={{
                          padding: "14px 12px",
                          borderRadius: 12,
                          border: `2px solid ${selected ? "var(--primary)" : "var(--line)"}`,
                          background: selected ? "var(--primary-soft)" : "var(--paper)",
                          color: selected ? "var(--ink)" : "var(--ink-2)",
                          fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                          display: "flex", alignItems: "center", gap: 8,
                          transition: "all var(--dur-fast) var(--ease-out)",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{c.flag}</span>
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {/* Free-text for "Somewhere else" */}
                {country === "other" && (
                  <input
                    type="text"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    placeholder="Your country"
                    autoFocus
                    style={{
                      width: "100%", height: 48, padding: "0 14px",
                      fontSize: 15, color: "var(--ink)",
                      background: "var(--paper)", border: "1px solid var(--primary)",
                      borderRadius: 12, outline: "none", fontFamily: "inherit",
                      boxSizing: "border-box",
                      boxShadow: "0 0 0 3px rgba(26,92,58,0.12)",
                    }}
                  />
                )}

                {country && (
                  <button
                    onClick={advance}
                    style={{
                      height: 48, borderRadius: 12, border: "none", cursor: "pointer",
                      background: "var(--primary)", color: "var(--on-primary)",
                      fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    {country === prefillCountry ? "That’s right →" : "Confirm →"}
                  </button>
                )}
              </div>
            )}

            {/* ════════════════ SCREEN 3 — EMAIL ════════════════ */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    Want deadline reminders by email?
                  </h1>
                  <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: 0, lineHeight: 1.55 }}>
                    We&apos;ll only send you deadline alerts — nothing else. Ever.
                  </p>
                </div>

                <div>
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && isValidEmail(email)) advance(); }}
                    placeholder="your@email.com"
                    style={{
                      width: "100%", height: 52, padding: "0 16px",
                      fontSize: 16, color: "var(--ink)",
                      background: "var(--paper)", border: "1px solid var(--line-strong)",
                      borderRadius: 12, outline: "none", fontFamily: "inherit",
                      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(26,92,58,0.12)";
                    }}
                    onBlur={(e)  => {
                      e.currentTarget.style.borderColor = "var(--line-strong)";
                      e.currentTarget.style.boxShadow   = "none";
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
                    <Lock size={11} color="var(--ink-faint)" />
                    <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                      No marketing. Unsubscribe anytime.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={advance}
                    disabled={!isValidEmail(email)}
                    style={{
                      height: 48, borderRadius: 12, border: "none",
                      cursor: isValidEmail(email) ? "pointer" : "not-allowed",
                      background: isValidEmail(email) ? "var(--primary)" : "var(--line-strong)",
                      color: "var(--on-primary)",
                      fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      opacity: isValidEmail(email) ? 1 : 0.5,
                      transition: "all var(--dur-fast)",
                    }}
                  >
                    Send me reminders →
                  </button>
                  <button
                    onClick={() => { setEmail(""); advance(); }}
                    style={{
                      height: 48, borderRadius: 12,
                      background: "none", border: "1px solid var(--line-strong)",
                      color: "var(--ink-mute)", fontSize: 14, fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "border-color var(--dur-fast)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ink-mute)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line-strong)"; }}
                  >
                    Skip — I&apos;ll check the app
                  </button>
                </div>
              </div>
            )}

            {/* ════════════════ SCREEN 4 — GENDER ════════════════ */}
            {step === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 500, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    Any gender-specific benefits?
                  </h1>
                  <p style={{ fontSize: 14, color: "var(--ink-mute)", margin: 0, lineHeight: 1.55 }}>
                    Some benefits like maternity pay, paternity leave, and carer&apos;s support depend on this. We won&apos;t use it for anything else.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => finish(g)}
                      style={{
                        padding: "20px 12px",
                        borderRadius: 12,
                        border: "1px solid var(--line)",
                        background: "var(--paper)",
                        color: "var(--ink)",
                        fontSize: 15, fontWeight: 500,
                        cursor: "pointer", fontFamily: "inherit",
                        textAlign: "center",
                        minHeight: 68,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all var(--dur-fast) var(--ease-out)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                        (e.currentTarget as HTMLButtonElement).style.background  = "var(--primary-soft)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--line)";
                        (e.currentTarget as HTMLButtonElement).style.background  = "var(--paper)";
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
