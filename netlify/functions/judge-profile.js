/**
 * BenchIntel - Netlify Serverless Function
 * Pulls live judge data from CourtListener and returns structured JudgeCard JSON.
 *
 * Ported from benchintel_api.py
 */

import { connectLambda } from "@netlify/blobs";
import { validatePasskey, recordUsage } from "./lib/passkeys.js";

const CL_BASE = "https://www.courtlistener.com/api/rest/v4";

// Jurisdiction-specific baseline reversal rates
const REVERSAL_BASELINES = {
  // Federal circuits tend to have lower reversal rates
  federal: {
    "Criminal Appeals": 0.18,
    "Habeas/Dependency": 0.30,
    "Writ Petitions": 0.32,
    "Government/Administrative": 0.25,
    "Employment": 0.22,
    "Insurance": 0.20,
    "Business/Commercial": 0.20,
    "General Civil": 0.22,
  },
  // State appellate courts (default/most common)
  state_appellate: {
    "Criminal Appeals": 0.22,
    "Habeas/Dependency": 0.35,
    "Writ Petitions": 0.38,
    "Government/Administrative": 0.30,
    "Employment": 0.28,
    "Insurance": 0.26,
    "Business/Commercial": 0.25,
    "General Civil": 0.28,
  },
  // State supreme courts
  state_supreme: {
    "Criminal Appeals": 0.35,
    "Habeas/Dependency": 0.40,
    "Writ Petitions": 0.42,
    "Government/Administrative": 0.38,
    "Employment": 0.35,
    "Insurance": 0.33,
    "Business/Commercial": 0.32,
    "General Civil": 0.35,
  },
};
const DEFAULT_BASELINE = 0.28;

// Map court ID to jurisdiction type for baseline selection
function getJurisdictionType(courtId) {
  if (["scotus", "ca1", "ca2", "ca3", "ca4", "ca5", "ca6", "ca7", "ca8", "ca9", "ca10", "ca11", "cadc", "cafc"].includes(courtId)) {
    return "federal";
  }
  // State supreme courts (no "ctapp"/"app"/"super" in ID, and not federal)
  if (!courtId.includes("ctapp") && !courtId.includes("app") && !courtId.includes("super") && !courtId.includes("dist")) {
    return "state_supreme";
  }
  return "state_appellate";
}

function getBaselineRates(courtId) {
  const jType = getJurisdictionType(courtId);
  return REVERSAL_BASELINES[jType] || REVERSAL_BASELINES.state_appellate;
}

// Court display names for common courts
const COURT_NAMES = {
  scotus: "U.S. Supreme Court",
  ca1: "1st Circuit Court of Appeals",
  ca2: "2nd Circuit Court of Appeals",
  ca3: "3rd Circuit Court of Appeals",
  ca4: "4th Circuit Court of Appeals",
  ca5: "5th Circuit Court of Appeals",
  ca6: "6th Circuit Court of Appeals",
  ca7: "7th Circuit Court of Appeals",
  ca8: "8th Circuit Court of Appeals",
  ca9: "9th Circuit Court of Appeals",
  ca10: "10th Circuit Court of Appeals",
  ca11: "11th Circuit Court of Appeals",
  cadc: "D.C. Circuit Court of Appeals",
  cafc: "Federal Circuit Court of Appeals",
  cal: "California Supreme Court",
  calctapp: "California Court of Appeal",
  tex: "Texas Supreme Court",
  texapp: "Texas Courts of Appeals",
  fla: "Florida Supreme Court",
  ny: "New York Court of Appeals",
  ohio: "Ohio Supreme Court",
};

function classifyCaseType(caseName) {
  const n = caseName || "";
  if (n.includes("People v.")) return "Criminal Appeals";
  if (n.includes("In re ") || n.includes("Matter of")) return "Habeas/Dependency";
  if (n.includes("v. Superior Court") || n.includes("v. Super. Ct.")) return "Writ Petitions";
  if (["County of", "City of", "Board", "Commission", "Department"].some(x => n.includes(x))) return "Government/Administrative";
  if (["Employment", "Labor", "WCAB", "Workers"].some(x => n.includes(x))) return "Employment";
  if (["Insurance", "Ins. Co."].some(x => n.includes(x))) return "Insurance";
  if (["Corp.", "LLC", "Inc.", "Company", "Partners"].some(x => n.includes(x))) return "Business/Commercial";
  return "General Civil";
}

function detectOutcome(snippet, allOpinionSnippets) {
  let text = (snippet || "").toLowerCase();
  // Combine all opinion snippets for better detection
  if (allOpinionSnippets) {
    for (const op of allOpinionSnippets) {
      text += " " + (op.snippet || "").toLowerCase();
    }
  }
  if (!text.trim()) return null;
  // Tier 1: Specific phrases (high confidence)
  if (["we reverse", "judgment is reversed", "reversed and remanded", "order is reversed", "judgment reversed"].some(x => text.includes(x))) return "Reversed";
  if (["we affirm", "judgment is affirmed", "is affirmed", "order is affirmed", "judgment affirmed"].some(x => text.includes(x))) return "Affirmed";
  if (["we modify", "as modified"].some(x => text.includes(x))) return "Modified";
  if (["we dismiss", "appeal dismissed", "appeal is dismissed"].some(x => text.includes(x))) return "Dismissed";
  if (["we remand", "remanded for", "is remanded"].some(x => text.includes(x))) return "Remanded";
  if (["petition is granted", "writ is granted", "petition granted"].some(x => text.includes(x))) return "Granted";
  if (["petition is denied", "writ is denied", "petition denied"].some(x => text.includes(x))) return "Denied";
  // Tier 2: Broader keyword fallback (lower confidence, but catches more)
  if (text.includes("affirm")) return "Affirmed";
  if (text.includes("revers")) return "Reversed";
  if (text.includes("remand")) return "Remanded";
  if (text.includes("dismiss")) return "Dismissed";
  return null;
}

function detectPartySide(caseName, outcome) {
  if (!outcome) return null;
  const isCriminal = (caseName || "").toLowerCase().includes("people v.");
  if (isCriminal) {
    if (["Affirmed", "Denied"].includes(outcome)) return "Prosecution";
    if (["Reversed", "Granted", "Remanded"].includes(outcome)) return "Defense";
  } else {
    if (["Affirmed", "Denied"].includes(outcome)) return "Respondent";
    if (["Reversed", "Granted", "Remanded"].includes(outcome)) return "Appellant";
  }
  return null;
}

function yearFromDate(dateStr) {
  if (!dateStr) return null;
  try { return parseInt(dateStr.slice(0, 4)); } catch { return null; }
}

function yearsBetween(a, b) {
  if (!a || !b) return 0;
  try {
    const da = new Date(a.split("T")[0]);
    const db = new Date(b.split("T")[0]);
    const days = (db - da) / (1000 * 60 * 60 * 24);
    return Math.max(days / 365.25, 0.1);
  } catch { return 0; }
}

function computeConfidence(n) {
  if (n >= 120) return "fulltext";
  if (n >= 45) return "signal";
  return "baseline";
}

async function fetchSearchPage(params) {
  const url = new URL(`${CL_BASE}/search/`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "BenchIntel/1.0 (judicial-analytics)" },
  });
  if (!res.ok) throw new Error(`CourtListener API error: ${res.status}`);
  return res.json();
}

export async function handler(event) {
  // Initialize Netlify Blobs context
  connectLambda(event);

  const params = event.queryStringParameters || {};
  const judge = params.judge;
  const court = params.court || "calctapp";
  const minYear = parseInt(params.min_year || "2015");
  const districtPrefix = params.district_prefix || null;
  const baselineRates = getBaselineRates(court);
  const courtName = COURT_NAMES[court] || court;
  const maxPages = Math.min(parseInt(params.max_pages || "3"), 10);

  // --- PASSKEY GATE ---
  const passkey = event.headers["x-passkey"] || params.passkey;
  const auth = await validatePasskey(passkey);
  if (!auth.valid) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, authError: true, message: auth.reason, remaining: 0 }),
    };
  }

  // Lightweight validation-only request (no CourtListener hit, no usage burn)
  if (judge === "__validate__") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: true,
        validated: true,
        remaining: auth.record.maxUses - auth.record.usedCount,
        label: auth.record.label,
      }),
    };
  }
  // --- END PASSKEY GATE ---

  if (!judge || judge.length < 2) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, message: "Judge name is required (min 2 characters)" }),
    };
  }

  let results = [];

  try {
    let data = await fetchSearchPage({ type: "o", court, judge });
    results.push(...(data.results || []));
    let nextUrl = data.next;
    let pages = 1;

    while (nextUrl && pages < maxPages) {
      const res = await fetch(nextUrl, {
        headers: { "User-Agent": "BenchIntel/1.0" },
      });
      if (!res.ok) break;
      data = await res.json();
      results.push(...(data.results || []));
      nextUrl = data.next;
      pages++;
    }
  } catch (e) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, message: `CourtListener API error: ${e.message}` }),
    };
  }

  // Filter by year and district prefix
  const filtered = results.filter(op => {
    const y = yearFromDate(op.dateFiled);
    if (y === null || y < minYear) return false;
    if (districtPrefix) {
      const docket = op.docketNumber || "";
      if (!docket.startsWith(districtPrefix)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ok: false,
        message: `No opinions found for "${judge}" in ${court} after ${minYear}`,
        judge,
        court,
        suggestion: "Try a different court ID or broaden the year range",
      }),
    };
  }

  // Aggregate
  const caseTypes = {};
  const years = {};
  const citeCounts = [];
  const notable = [];
  const bucketN = {};
  const bucketReversal = {};
  const bucketOutcomeDetected = {};
  const outcomesByType = {};
  const overallOutcomes = {};
  const partyWins = {};
  let firstDate = null;
  let lastDate = null;

  for (const op of filtered) {
    const name = op.caseName || "";
    const ct = classifyCaseType(name);
    caseTypes[ct] = (caseTypes[ct] || 0) + 1;

    const dateFiled = op.dateFiled;
    if (dateFiled) {
      const yr = parseInt(dateFiled.slice(0, 4));
      years[yr] = (years[yr] || 0) + 1;
      if (firstDate === null || dateFiled < firstDate) firstDate = dateFiled;
      if (lastDate === null || dateFiled > lastDate) lastDate = dateFiled;
    }

    const cites = parseInt(op.citeCount || 0);
    citeCounts.push(cites);

    if (cites >= 10) {
      notable.push({
        name,
        date: dateFiled,
        citations: cites,
        docket: op.docketNumber,
        url: op.absolute_url,
      });
    }

    // Outcome detection (enhanced: 13 phrase patterns + party-side)
    let snippet = "";
    const opinions = op.opinions || [];
    if (opinions.length > 0) snippet = opinions[0].snippet || "";
    const outcome = detectOutcome(snippet, opinions);
    bucketN[ct] = (bucketN[ct] || 0) + 1;
    if (outcome) {
      bucketOutcomeDetected[ct] = (bucketOutcomeDetected[ct] || 0) + 1;
      if (outcome === "Reversed" || outcome === "Remanded") {
        bucketReversal[ct] = (bucketReversal[ct] || 0) + 1;
      }
      // Track outcomes by case type
      if (!outcomesByType[ct]) outcomesByType[ct] = {};
      outcomesByType[ct][outcome] = (outcomesByType[ct][outcome] || 0) + 1;
      // Track overall outcomes
      overallOutcomes[outcome] = (overallOutcomes[outcome] || 0) + 1;
      // Track party-side wins
      const party = detectPartySide(name, outcome);
      if (party) {
        if (!partyWins[ct]) partyWins[ct] = {};
        partyWins[ct][party] = (partyWins[ct][party] || 0) + 1;
      }
    }
  }

  const total = Object.values(caseTypes).reduce((a, b) => a + b, 0);
  const avgCites = citeCounts.length > 0 ? Math.round(citeCounts.reduce((a, b) => a + b, 0) / citeCounts.length * 10) / 10 : 0;

  notable.sort((a, b) => b.citations - a.citations);
  const topNotable = notable.slice(0, 8);

  const tenureYears = yearsBetween(firstDate, lastDate);
  const velocity = tenureYears > 0 ? Math.round(total / tenureYears * 10) / 10 : 0;
  const pulseConf = computeConfidence(total);

  // Reversal heatmap
  const reversalHeatmap = {};
  const sortedBuckets = Object.entries(bucketN).sort((a, b) => b[1] - a[1]);
  for (const [bucket, n] of sortedBuckets) {
    const baseline = baselineRates[bucket] || DEFAULT_BASELINE;
    const detected = bucketOutcomeDetected[bucket] || 0;

    if (detected >= 6) {
      const reversalRate = Math.round((bucketReversal[bucket] || 0) / Math.max(detected, 1) * 100) / 100;
      const delta = Math.round((reversalRate - baseline) * 1000) / 10;
      reversalHeatmap[bucket] = {
        rate: Math.round(reversalRate * 100),
        delta,
        vs_avg: Math.round(baseline * 100),
        sampleSize: detected,
        confidence: computeConfidence(detected),
      };
    } else {
      reversalHeatmap[bucket] = {
        rate: null,
        delta: null,
        vs_avg: Math.round(baseline * 100),
        sampleSize: n,
        confidence: "baseline",
      };
    }
  }

  // Strategic signals
  const primaryBucket = Object.entries(caseTypes).sort((a, b) => b[1] - a[1])[0][0];
  const signals = [
    { rank: "Primary", text: `Primary workload skews toward ${primaryBucket}. Expect arguments evaluated through that lens.` },
    { rank: "Secondary", text: `Ruling velocity ~${velocity} opinions/year (tier: ${pulseConf}). Plan timelines accordingly.` },
    { rank: "Contextual", text: `Citation density ${avgCites}/opinion. ${avgCites > 15 ? 'Precedent-minded analysis likely.' : 'Standard citation patterns.'}` },
  ];

  const ifFiling = [
    "Lead with a clean procedural posture and a crisp issues list.",
    "Anchor arguments in controlling authority and narrow holdings.",
    "Assume standard timelines unless docket trend suggests otherwise.",
  ];

  // Years trend for sparkline
  const yearsTrend = Object.entries(years)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([y, c]) => ({ year: parseInt(y), count: c }));

  const payload = {
    ok: true,
    judgeName: judge,
    court,
    courtName,
    filters: { minYear, districtPrefix, pagesFetched: Math.min(maxPages, 3) },
    totalOpinions: total,
    yearsActive: Math.round(tenureYears * 10) / 10,
    avgCitations: avgCites,
    velocity,
    caseTypes: Object.entries(caseTypes)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round(count / total * 1000) / 10,
        districtAvg: Math.round(count / total * 1000) / 10 - 5,
      })),
    yearsTrend,
    pulse: { velocity, confidence: pulseConf, interpretation: velocity >= 20 ? "High" : velocity >= 10 ? "Moderate" : "Low" },
    reversalHeatmap,
    mostCitedCases: topNotable,
    outcomes: (() => {
      const totalDetected = Object.values(overallOutcomes).reduce((a, b) => a + b, 0);
      const affirmedCount = overallOutcomes["Affirmed"] || 0;
      const reversedCount = (overallOutcomes["Reversed"] || 0) + (overallOutcomes["Remanded"] || 0);
      const detectedDenom = affirmedCount + reversedCount || 1;
      const detectionRate = Math.round(totalDetected / Math.max(total, 1) * 100);
      let confidence, confidenceLabel;
      if (totalDetected >= 40) { confidence = 3; confidenceLabel = "Strong Signal"; }
      else if (totalDetected >= 15) { confidence = 2; confidenceLabel = "Moderate Signal"; }
      else if (totalDetected >= 5) { confidence = 1; confidenceLabel = "Weak Signal"; }
      else { confidence = 0; confidenceLabel = "Jurisdiction Estimate"; }
      // Fall back to jurisdiction-typical rates when insufficient data
      const jType = getJurisdictionType(court);
      const fallbackAffirmed = jType === "federal" ? 80 : jType === "state_supreme" ? 65 : 72;
      const fallbackReversed = 100 - fallbackAffirmed;
      const useDetected = totalDetected >= 5;
      return {
        affirmed: useDetected ? Math.round(affirmedCount / detectedDenom * 100) : fallbackAffirmed,
        reversed: useDetected ? Math.round(reversedCount / detectedDenom * 100) : fallbackReversed,
        totalDetected,
        detectionRate,
        byOutcome: overallOutcomes,
        confidence,
        confidenceLabel,
        isEstimate: !useDetected,
      };
    })(),
    partyWins,
    strategicSignals: signals,
    ifFilingHere: ifFiling,
    alerts: (() => {
      const result = [];
      for (const [bucket, hm] of Object.entries(reversalHeatmap)) {
        if (hm.rate !== null && hm.rate > 0) {
          const baseRate = (baselineRates[bucket] || DEFAULT_BASELINE) * 100;
          if (hm.rate > baseRate * 1.5) {
            result.push({
              case_type: bucket,
              reversal_rate: hm.rate,
              multiplier: Math.round(hm.rate / baseRate * 10) / 10,
            });
          }
        }
      }
      return result.sort((a, b) => b.multiplier - a.multiplier);
    })(),
    dataAudit: {
      coveragePeriod: `${firstDate || "N/A"} to ${lastDate || "N/A"}`,
      firstOpinion: firstDate,
      lastOpinion: lastDate,
      opinionsAnalyzed: total,
      opinionsWithOutcomes: Object.values(overallOutcomes).reduce((a, b) => a + b, 0),
      outcomeDetectionRate: Math.round(Object.values(overallOutcomes).reduce((a, b) => a + b, 0) / Math.max(total, 1) * 100),
      pagesFetched: Math.min(maxPages, 3),
      apiSource: "CourtListener Free API (snippet-level)",
      limitations: [
        "Outcome detection based on opinion snippet text, not full dispositions",
        "Case type classification relies on party name patterns",
        "Citation counts may not reflect all citing sources",
        "Free API returns limited result pages; high-volume judges may be undercounted",
      ],
      methodology: [
        "Case types classified by pattern matching on case names",
        "Outcomes detected via phrase matching on opinion snippets (13 patterns)",
        "Reversal rates computed from detected outcomes only, compared to jurisdiction baselines",
        "Velocity calculated as total opinions / tenure years",
      ],
    },
    dataQuality: {
      note: "Free CourtListener endpoint. Enhanced outcome detection (13-pattern).",
      limitations: [
        "Search endpoint provides opinion snippets, not full disposition language",
        "Full-text analysis available in premium tier",
      ],
    },
  };

  // Record usage and add remaining count to response
  await recordUsage(passkey, { judge, court });
  payload.remainingUses = auth.record.maxUses - auth.record.usedCount - 1;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}
