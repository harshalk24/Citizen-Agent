import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
}

export function deadlineUrgency(deadline: string): "critical" | "warning" | "ok" | "none" {
  const lower = deadline.toLowerCase();

  // Relative date strings produced by formatRelativeDate
  if (lower === "overdue" || lower === "today" || lower === "tomorrow") return "critical";
  const daysMatch = lower.match(/^(\d+)\s*days?$/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    if (days <= 7)  return "critical";
    if (days <= 30) return "warning";
    return "ok";
  }
  const weeksMatch = lower.match(/^(\d+)\s*weeks?$/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    if (weeks <= 1)  return "critical";
    if (weeks <= 4)  return "warning";
    return "ok";
  }
  if (lower.match(/^\d+\s*months?$/)) return "ok";

  // Knowledge-base deadline strings
  if (lower.includes("day 1") || lower.includes("immediately") || lower.includes("within 1 week")) return "critical";
  if (lower.includes("6 week") || lower.includes("30 day") || lower.includes("1 month")) return "warning";
  if (lower.includes("year") || lower.includes("month")) return "ok";
  return "none";
}

export function countryFlag(country: string): string {
  const flags: Record<string, string> = {
    IE: "🇮🇪", UAE: "🇦🇪", AE: "🇦🇪", RW: "🇷🇼",
    IN: "🇮🇳", "CA-US": "🇺🇸",
  };
  return flags[country] ?? "🌍";
}

export function countryName(code: string): string {
  const names: Record<string, string> = {
    IE: "Ireland", UAE: "UAE", AE: "UAE", RW: "Rwanda",
    IN: "India", "CA-US": "California",
  };
  return names[code] ?? code;
}
