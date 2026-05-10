"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleQuestion } from "lucide-react";

const navLinks = [
  { href: "/dashboard",          label: "Dashboard" },
  { href: "/discover",           label: "My situation" },
  { href: "/update-situation",   label: "My profile" },
  { href: "/plan",               label: "Action plan" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header style={{
      height: 60,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      background: "rgba(245,244,239,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "0.5px solid var(--line)",
      position: "sticky",
      top: 0,
      zIndex: 30,
    }}>
      {/* Brand */}
      <Link href="/" style={{
        display: "inline-flex", alignItems: "center",
        textDecoration: "none", background: "none", border: 0, cursor: "pointer",
      }}>
        <span style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--primary)",
          fontFamily: "var(--font-sans)",
          userSelect: "none",
        }}>
          Modveon
        </span>
      </Link>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 2, marginLeft: 8 }}>
        {navLinks.map(({ href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              background: active ? "var(--bg-alt)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-mute)",
              border: "0.5px solid transparent",
              borderColor: active ? "var(--line)" : "transparent",
              padding: "6px 12px",
              borderRadius: "var(--r-md)",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              textDecoration: "none",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}>
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Verified chip */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 12px",
        background: "var(--paper)",
        border: "0.5px solid var(--line)",
        borderRadius: "var(--r-pill)",
        fontFamily: "var(--font-mono)",
        fontSize: 11, fontWeight: 500, color: "var(--ink-2)",
      }}>
        <span className="verified-dot" />
        <span>Citizen Portal</span>
        <span style={{ color: "var(--ink-faint)", fontWeight: 400 }}>· IE · UAE · RW · IN · CA · SV</span>
      </div>

      {/* Chat icon */}
      <Link href="/chat/open" title="Ask AI" style={{
        width: 36, height: 36, borderRadius: "var(--r-md)",
        border: "0.5px solid var(--line)",
        background: "var(--paper)",
        cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "var(--ink-mute)",
        textDecoration: "none",
        transition: "all var(--dur-fast) var(--ease-out)",
      }}>
        <MessageCircleQuestion size={16} />
      </Link>
    </header>
  );
}
