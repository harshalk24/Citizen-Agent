/**
 * Portal scraper — checks government websites for updated amounts, deadlines,
 * and document requirements against what's stored in the knowledge base.
 *
 * Run with: npx tsx scripts/scrape-portals.ts
 * Or: npx tsx scripts/scrape-portals.ts --service ie-maternity-benefit
 *
 * Output: a diff report to stdout + writes results/scrape-YYYY-MM-DD.json
 */

import { load } from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { services, type GovernmentService } from "../lib/knowledge-base";
import { applyEnrichment } from "../lib/apply-enrichment";

const OUTPUT_DIR = path.join(process.cwd(), "scripts", "results");

// ── Patterns to extract from page HTML ────────────────────────────────────────
const AMOUNT_PATTERNS = [
  /€[\d,]+(?:\.?\d+)?(?:\s*\/\s*(?:week|month|year))?/gi,
  /AED\s*[\d,]+/gi,
  /RWF\s*[\d,]+/gi,
  /up\s+to\s+€[\d,]+/gi,
];

const DEADLINE_PATTERNS = [
  /within\s+\d+\s+(?:days?|weeks?|months?)/gi,
  /apply\s+(?:before|by|within)\s+[^.]+/gi,
  /deadline[:\s]+[^.\n]+/gi,
];

interface ScrapeResult {
  serviceId: string;
  serviceName: string;
  url: string;
  scrapedAt: string;
  status: "ok" | "changed" | "unreachable" | "skipped";
  httpStatus?: number;
  foundAmounts: string[];
  foundDeadlines: string[];
  pageTitle?: string;
  diffs: Array<{ field: string; current: string; found: string }>;
  applyUrlStatus?: number;
  notes: string[];
}

async function fetchPage(url: string): Promise<{ html: string; status: number } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; CitizenAssist-Scraper/1.0; +https://modveon.com/scraper)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });
    const html = await res.text();
    return { html, status: res.status };
  } catch {
    return null;
  }
}

function extractAmounts(text: string): string[] {
  const found = new Set<string>();
  for (const pattern of AMOUNT_PATTERNS) {
    const matches = text.match(pattern) ?? [];
    matches.forEach((m) => found.add(m.trim().replace(/\s+/g, " ")));
  }
  return Array.from(found).slice(0, 8);
}

function extractDeadlines(text: string): string[] {
  const found = new Set<string>();
  for (const pattern of DEADLINE_PATTERNS) {
    const matches = text.match(pattern) ?? [];
    matches.forEach((m) => found.add(m.trim().replace(/\s+/g, " ").slice(0, 80)));
  }
  return Array.from(found).slice(0, 5);
}

function detectDiffs(service: GovernmentService, foundAmounts: string[]): Array<{ field: string; current: string; found: string }> {
  const diffs: Array<{ field: string; current: string; found: string }> = [];

  if (!service.amount) return diffs;

  // Check if the current amount appears anywhere in scraped content
  const currentAmountNum = service.amount.replace(/[^0-9]/g, "");
  const amountFoundOnPage = foundAmounts.some((a) => a.replace(/[^0-9]/g, "").includes(currentAmountNum));

  if (!amountFoundOnPage && foundAmounts.length > 0) {
    diffs.push({
      field: "amount",
      current: service.amount,
      found: foundAmounts[0],
    });
  }

  return diffs;
}

async function scrapeService(service: GovernmentService): Promise<ScrapeResult> {
  const enrichment = applyEnrichment[service.id];
  const url = enrichment?.applyUrl ?? service.agencyUrl;

  const base: ScrapeResult = {
    serviceId: service.id,
    serviceName: service.name,
    url: url ?? "(no URL)",
    scrapedAt: new Date().toISOString(),
    status: "skipped",
    foundAmounts: [],
    foundDeadlines: [],
    diffs: [],
    notes: [],
  };

  if (!url) {
    base.notes.push("No URL configured — add agencyUrl or applyUrl");
    return base;
  }

  const page = await fetchPage(url);
  if (!page) {
    return { ...base, status: "unreachable", notes: ["Request failed or timed out"] };
  }

  base.httpStatus = page.status;

  if (page.status >= 400) {
    return { ...base, status: "unreachable", notes: [`HTTP ${page.status}`] };
  }

  const $ = load(page.html);

  // Remove nav/header/footer noise
  $("nav, header, footer, script, style, .cookie-banner").remove();

  const bodyText = $("body").text().replace(/\s+/g, " ");
  base.pageTitle = $("title").text().trim().slice(0, 100);
  base.foundAmounts = extractAmounts(bodyText);
  base.foundDeadlines = extractDeadlines(bodyText);
  base.diffs = detectDiffs(service, base.foundAmounts);

  // Also check the apply URL separately if different from agencyUrl
  if (enrichment?.applyUrl && service.agencyUrl && enrichment.applyUrl !== service.agencyUrl) {
    const applyPage = await fetchPage(enrichment.applyUrl);
    base.applyUrlStatus = applyPage?.status ?? 0;
    if (!applyPage || applyPage.status >= 400) {
      base.notes.push(`⚠ Apply URL unreachable (${base.applyUrlStatus}) — may need updating`);
    }
  }

  base.status = base.diffs.length > 0 ? "changed" : "ok";
  return base;
}

function printReport(results: ScrapeResult[]) {
  const unreachable = results.filter((r) => r.status === "unreachable");
  const changed     = results.filter((r) => r.status === "changed");
  const ok          = results.filter((r) => r.status === "ok");
  const skipped     = results.filter((r) => r.status === "skipped");

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║       Citizen Assist — Portal Scrape Report         ║");
  console.log(`║  ${new Date().toLocaleString().padEnd(51)}║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log(`  ✅ OK:          ${ok.length}`);
  console.log(`  ⚠  Possible Δ: ${changed.length}`);
  console.log(`  ❌ Unreachable: ${unreachable.length}`);
  console.log(`  ⏭  Skipped:    ${skipped.length}`);
  console.log(`  ─────────────────`);
  console.log(`  Total:         ${results.length}\n`);

  if (changed.length > 0) {
    console.log("─── POSSIBLE CHANGES DETECTED ───────────────────────────\n");
    for (const r of changed) {
      console.log(`  [${r.serviceId}] ${r.serviceName}`);
      for (const d of r.diffs) {
        console.log(`    ${d.field}: current="${d.current}" | found on page="${d.found}"`);
      }
      if (r.foundAmounts.length) console.log(`    All amounts found: ${r.foundAmounts.join(", ")}`);
      console.log();
    }
  }

  if (unreachable.length > 0) {
    console.log("─── UNREACHABLE URLS ─────────────────────────────────────\n");
    for (const r of unreachable) {
      console.log(`  [${r.serviceId}] ${r.url}`);
      console.log(`    ${r.notes.join(", ")}\n`);
    }
  }

  if (skipped.length > 0) {
    console.log("─── NO URL CONFIGURED ────────────────────────────────────\n");
    for (const r of skipped) {
      console.log(`  [${r.serviceId}] ${r.serviceName}`);
    }
    console.log();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const serviceIdx = args.indexOf("--service");
  const filterService =
    args.find((a) => a.startsWith("--service="))?.replace("--service=", "") ??
    (serviceIdx !== -1 ? args[serviceIdx + 1] : undefined);
  const dryRun = args.includes("--dry-run");

  const targets = filterService
    ? services.filter((s) => s.id === filterService)
    : services;

  if (targets.length === 0) {
    console.error(`No service found with id: ${filterService}`);
    process.exit(1);
  }

  console.log(`\n🔍 Scraping ${targets.length} service(s)${dryRun ? " [DRY RUN — no fetch]" : ""}...`);

  const results: ScrapeResult[] = [];

  for (const service of targets) {
    if (dryRun) {
      const enrichment = applyEnrichment[service.id];
      const url = enrichment?.applyUrl ?? service.agencyUrl ?? "(none)";
      console.log(`  ⏭  [dry] ${service.id} → ${url}`);
      results.push({
        serviceId: service.id,
        serviceName: service.name,
        url,
        scrapedAt: new Date().toISOString(),
        status: "skipped",
        foundAmounts: [],
        foundDeadlines: [],
        diffs: [],
        notes: ["dry run"],
      });
      continue;
    }

    process.stdout.write(`  Scraping [${service.id}]... `);
    const result = await scrapeService(service);
    const icon = result.status === "ok" ? "✅" : result.status === "changed" ? "⚠" : result.status === "unreachable" ? "❌" : "⏭";
    console.log(`${icon} ${result.status}${result.httpStatus ? ` (${result.httpStatus})` : ""}`);
    results.push(result);

    // Small delay between requests — be polite to government servers
    await new Promise((r) => setTimeout(r, 800));
  }

  printReport(results);

  // Write JSON output
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const dateStr = new Date().toISOString().split("T")[0];
  const outFile = path.join(OUTPUT_DIR, `scrape-${dateStr}.json`);
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log(`\n📄 Full report saved to: ${outFile}\n`);
}

main().catch((e) => {
  console.error("Scraper failed:", e);
  process.exit(1);
});
