# Rivlet CRM — Agent Guidelines & Architecture

Rivlet CRM is a lightweight, serverless Next.js 14 application backed by Supabase Postgres. It manages activewear creator seeding, B2B wholesale studio accounts, and pre-launch VIP relations.

## UI/UX Design Standards (Highest Priority)
- Strictly follow the UI/UX craft guidelines in `.agents/rules/ui-ux-standards.md` and the `ui-ux-craft` skill in `.agents/skills/ui-ux-craft/SKILL.md`.
- Keep the aesthetic clean, minimalist, neat, and professional (inspired by Twenty CRM, Linear, and Vercel).
- Use subtle borders (`border-[#e4e4e7]`), high-contrast text (`text-[#09090b]`), neutral surfaces (`bg-white`, `bg-[#fbfbfb]`), and purposeful status pills.
- All detail views must use the Slide-Over Drawer pattern (`AthleteDrawer`, `WholesaleDrawer`).

## Tech Stack
- **Framework**: Next.js 14 App Router (React 18, TypeScript).
- **Styling**: Tailwind CSS with custom CRM tokens (`tailwind.config.js`).
- **Database**: PostgreSQL (Supabase) via Supavisor connection pooling (port `6543`).
- **Icons**: `lucide-react`.
- **Deployment**: Serverless on Vercel ($0/month, edge-optimized).
