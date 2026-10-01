# SmartKarobar — Base44 Dev Environment

## Overview
SmartKarobar is a digital khata (ledger) and business management platform for Nepali businesses. Built with Next.js 14 (App Router), Prisma, PostgreSQL, and Tailwind CSS.

## Setup
- `docker compose -f docker-compose.base44.yml up -d --build` starts the app.
- The web service installs deps, runs Prisma migrations (db push), seeds sample data, then starts `next dev` on port 3000.
- PostgreSQL runs as a `db` service with database `smartkarobar`.

## Key Details
- **DATABASE_URL** is set inline in compose `environment:` (local infra credential, not a user secret).
- **No external secrets required** — the app runs entirely on local infrastructure.
- **Bikram Sambat dates**: conversion utility at `src/lib/bs-date.ts`. Transactions store both AD (`dateAd`) and BS (`dateBs`) dates.
- **Balance calculation**: Customer balance = sum(CREDIT_SALE) - sum(PAYMENT). Vendor balance = sum(PURCHASE) - sum(PAYMENT). Positive = outstanding.
- **WhatsApp reminders**: generated as `wa.me` links with pre-filled message (no API integration needed).
- **Data export**: CSV and JSON export handled via API route at `/api/export`.

## Verification
- Health check: `curl http://localhost:3000/` — should return the dashboard HTML.
- The app is mobile-first but works at desktop viewport.
- Seed data includes 6 customers, 3 vendors, and ~20 transactions.
