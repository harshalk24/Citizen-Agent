import Link from "next/link";
import { ArrowRight, ShieldCheck, ListChecks, Sparkles, ChevronRight } from "lucide-react";

const stats = [
  { value: "€2.4B", label: "Benefits surfaced" },
  { value: "<500ms", label: "Time to results" },
  { value: "80+", label: "Services mapped" },
  { value: "3", label: "Countries live" },
];

const howItWorks = [
  {
    n: "01",
    icon: ShieldCheck,
    title: "Build your situation",
    desc: "Three taps — life event, employment status, country. No forms, no jargon. Edit anytime.",
  },
  {
    n: "02",
    icon: ListChecks,
    title: "See every entitlement",
    desc: "A ranked list of programs you qualify for, with eligibility logic, deadlines, and estimated values.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Follow your action plan",
    desc: "Week-by-week guidance on what to apply for, what documents you need, and when to act.",
  },
];

const coverage = [
  { cat: "Family & children",  n: 24, eg: "Maternity · Child Benefit · Parental Leave" },
  { cat: "Health",             n: 18, eg: "Medical Card · GP Visit · Health Insurance" },
  { cat: "Housing",            n: 12, eg: "Housing Supplement · Rent Support" },
  { cat: "Work & employment",  n: 16, eg: "Jobseeker · Back to Work · Retraining" },
  { cat: "Business & startup", n: 8,  eg: "Enterprise Grant · LEO · Tax Relief" },
  { cat: "Social welfare",     n: 14, eg: "One-Parent · Carer · Disability" },
];

const heroCards = [
  { title: "Maternity Benefit",       sub: "€262/wk · 26 weeks",  status: "eligible" },
  { title: "Child Benefit",           sub: "€140/month per child", status: "eligible" },
  { title: "GP Visit Card",           sub: "Free GP care",         status: "eligible" },
  { title: "Housing Supplement",      sub: "Partial eligibility",  status: "partial"  },
];

function EligDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    eligible:   "var(--eligible)",
    partial:    "var(--partial)",
    ineligible: "var(--ineligible)",
  };
  return (
    <span
      style={{
        width: 8, height: 8, borderRadius: "50%",
        background: colors[status] ?? "var(--line-strong)",
        display: "inline-block", flexShrink: 0,
      }}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 32px 80px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div className="fade-in-up">
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px", borderRadius: 9999,
              background: "var(--paper)", border: "1px solid var(--line)",
              fontSize: 12, fontWeight: 500, marginBottom: 28, color: "var(--ink-2)",
            }}>
              <span className="verified-dot" />
              Live in Ireland · UAE · Rwanda
            </div>

            <h1 style={{
              fontSize: 64, fontWeight: 500, lineHeight: 1.04,
              letterSpacing: "-0.035em", marginBottom: 24, color: "var(--ink)",
            }}>
              Every benefit{" "}
              <span className="serif" style={{ color: "var(--primary)" }}>you&apos;re owed</span>
              <br />in one place.
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.55, color: "var(--ink-mute)",
              maxWidth: 500, marginBottom: 36,
            }}>
              Tell us about your situation once. We map you against every government
              program you qualify for — with a clear week-by-week plan to claim them all.
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
              <Link href="/discover" className="btn btn-primary btn-lg" style={{ borderRadius: 8 }}>
                Build my situation
                <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="btn btn-outline btn-lg" style={{ borderRadius: 8 }}>
                See sample dashboard
              </Link>
            </div>

            {/* Stats row */}
            <div style={{
              display: "flex", gap: 36,
              paddingTop: 28, borderTop: "1px solid var(--line)",
            }}>
              {stats.map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>
                    {s.value}
                  </div>
                  <div className="eyebrow" style={{ marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — eligibility card artifact */}
          <div style={{ position: "relative", height: 460 }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden",
            }}>
              {/* Card header */}
              <div style={{
                padding: "14px 18px", borderBottom: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="verified-dot" />
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>Citizen Profile</span>
                  <span style={{ fontSize: 11, color: "var(--ink-faint)" }}>· Having a baby · Ireland</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>modveon.os</span>
              </div>

              {/* Total value */}
              <div style={{ padding: "24px 22px 18px" }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Estimated annual entitlement</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <div style={{
                    fontSize: 52, fontWeight: 500, letterSpacing: "-0.035em",
                    lineHeight: 1, color: "var(--ink)",
                  }}>€9,840</div>
                  <span className="pill pill-eligible">4 programs confirmed</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 6 }}>
                  1 partial · updated just now
                </div>
              </div>

              {/* Entitlement rows */}
              <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                {heroCards.map((c, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px",
                    border: "1px solid var(--line)", borderRadius: 8,
                    background: "var(--bg)",
                  }}>
                    <EligDot status={c.status} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>{c.sub}</div>
                    </div>
                    <ChevronRight size={14} color="var(--ink-faint)" />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating chip */}
            <div style={{
              position: "absolute", top: -14, right: -14,
              padding: "9px 14px",
              background: "var(--bg-alt)", border: "1px solid var(--line)",
              borderRadius: 9999, fontSize: 12, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "var(--shadow-md)", color: "var(--ink-2)",
            }}>
              <Sparkles size={13} color="var(--brand-cream)" />
              AI plan ready in 3 sec
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section style={{
        padding: "72px 32px",
        borderTop: "1px solid var(--line)",
        background: "var(--bg-alt)",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>How it works</div>
          <h2 style={{
            fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em",
            maxWidth: 680, marginBottom: 52, color: "var(--ink)",
          }}>
            Tell us once. Get a complete map of what you qualify for,{" "}
            <span className="serif">with a plan attached.</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {howItWorks.map((s) => (
              <div key={s.n} style={{
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 16, padding: 28,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <s.icon size={22} color="var(--primary)" strokeWidth={1.75} />
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 8, color: "var(--ink)" }}>{s.title}</h3>
                <p style={{ color: "var(--ink-mute)", fontSize: 14, lineHeight: 1.55 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Coverage ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 32px", borderTop: "1px solid var(--line)" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 80,
        }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Coverage</div>
            <h2 style={{
              fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em",
              marginBottom: 16, color: "var(--ink)",
            }}>
              Federal, national, and local — under one roof.
            </h2>
            <p style={{ color: "var(--ink-mute)", lineHeight: 1.6, marginBottom: 28 }}>
              Citizen Assist covers 80+ government services across Ireland, UAE, and Rwanda.
              Each rule is citation-backed and kept up to date with policy changes.
            </p>
            <Link href="/discover" className="btn btn-outline" style={{ borderRadius: 8 }}>
              Explore all services <ArrowRight size={14} />
            </Link>
          </div>

          {/* Coverage grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1, background: "var(--line)",
            border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden",
          }}>
            {coverage.map((c) => (
              <div key={c.cat} style={{ background: "var(--paper)", padding: 20 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", marginBottom: 6,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)" }}>{c.cat}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>{c.n}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{c.eg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: "56px 32px",
        borderTop: "1px solid var(--line)",
        background: "var(--paper)",
      }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 32,
        }}>
          <div>
            <h2 style={{
              fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em",
              marginBottom: 8, color: "var(--ink)",
            }}>
              Find what you&apos;re owed in under a minute.
            </h2>
            <p style={{ color: "var(--ink-mute)" }}>Free for citizens. No account required. Your data never leaves.</p>
          </div>
          <Link href="/discover" className="btn btn-primary btn-lg" style={{ borderRadius: 8, flexShrink: 0 }}>
            Build my situation <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        padding: "36px 32px",
        borderTop: "1px solid var(--line)",
        maxWidth: 1180, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        color: "var(--ink-mute)", fontSize: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>Citizen Assist</span>
          <span style={{ color: "var(--line-strong)" }}>·</span>
          <span>Powered by Modveon</span>
          <span style={{ color: "var(--line-strong)" }}>·</span>
          <span>© 2026</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Security", "Accessibility"].map((l) => (
            <a key={l} href="#" style={{ color: "inherit", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
