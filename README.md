# BenchIntel ⚖️

**Rabid Raccoon Intelligence, LLC** — Judicial Intelligence Platform

A web-based judicial profiling system providing national judge analytics with passkey-gated access. Built for attorneys, researchers, and legal professionals who need data-driven insight into judicial behavior patterns.

---

## What It Does

- **Judge profiling** — Aggregated behavioral data on judicial decision-making patterns
- **National coverage** — Federal and state court judges
- **Passkey-gated access** — Secure authentication for sensitive legal intelligence
- **Search and filter** — Find judges by jurisdiction, court, appointment, and behavioral metrics

---

## Tech Stack

JavaScript · Vite · Tailwind CSS · PostCSS · Netlify Functions (serverless backend)

---

## Architecture

```
┌─────────────────────────────┐
│      Frontend (Vite)        │
│  Tailwind CSS · SPA         │
├─────────────────────────────┤
│   Netlify Serverless API    │
│   Passkey authentication    │
│   Data retrieval functions  │
├─────────────────────────────┤
│      Data Layer             │
│   Judge profiles · Metrics  │
└─────────────────────────────┘
```

---

## Setup

```bash
git clone https://github.com/TheMostRabidRaccoon/benchintel.git
cd benchintel
npm install
npm run dev
```

For deployment details, see `netlify.toml`. For demo access credentials, see `DEMO_ACCESS.md`.

---

## License

Proprietary — Rabid Raccoon Intelligence, LLC.

---

*Data over intuition. Patterns over reputation.* ⚖️
