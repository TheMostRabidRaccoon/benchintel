# BenchIntel — Demo Access

**Live demo:** https://benchintel-rri.netlify.app

## What it does

Enter a judge's name, select a court, and BenchIntel generates a full strategic profile — a "JudgeCard" — pulled from CourtListener opinion data.

## What you'll see

- **Judge Profile** — Total opinions, years active, average citations, opinions/year
- **Case Type Classification** — Criminal, Habeas, Employment, Insurance, Business/Commercial, etc. with district comparisons
- **Ruling Patterns** — Affirmance/reversal rates with baseline comparisons
- **Reversal Heatmap** — Color-coded risk by case type, delta vs. district baseline
- **Judge's Pulse** — Caseload velocity with sparklines and pace interpretation
- **Strategic Signals** — Priority-ranked observations with filing guidance
- **Vulnerability Alerts** — Flags case types where reversal rates exceed baseline

## Coverage

- U.S. Supreme Court
- All 13 Federal Circuit Courts
- State appellate courts (CA, TX, and expanding)

## How to run locally

```bash
cd projects/benchintel-app
npm install
npm run dev
```

App runs at `http://localhost:5173`. Requires the Netlify functions backend for CourtListener API access.

## Contact

kad@rabidraccoonintelligence.org
