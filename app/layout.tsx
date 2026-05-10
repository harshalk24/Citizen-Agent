import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display, DM_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
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
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSerifDisplay.variable} ${dmMono.variable}`}
      style={{ background: "#f5f4ef", color: "#0f1117" }}
    >
      <body
        className="antialiased min-h-screen"
        style={{ fontFamily: "var(--font-sans)", background: "var(--bg, #f5f4ef)", color: "var(--ink, #0f1117)" }}
      >
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
