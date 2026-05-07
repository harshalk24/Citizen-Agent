import type { Metadata } from "next";
import { Inter_Tight, Fraunces } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Citizen Assist — Powered by Modveon",
  description:
    "Your government. Finally on your side. AI-powered navigation of government services, benefits, and entitlements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interTight.variable} ${fraunces.variable}`} style={{ background: "#0b0d10", color: "#f4f5f7" }}>
      <body className="antialiased min-h-screen" style={{ fontFamily: "var(--font-sans)", background: "var(--bg, #0b0d10)", color: "var(--ink, #f4f5f7)" }}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
