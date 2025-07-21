# AYAW (Are You Actually Winning?)

## Vision & Mission

AYAW is a privacy-first, defensive sports betting tracker designed for serious bettors who want honest, audit-ready analytics and self-reflection tools. Unlike social betting platforms, AYAW is built for private record-keeping, tax preparation, and disciplined betting habits—without social features, influencer content, or data exploitation.

**Mission:**
- Empower users to answer: “Am I Actually Winning?” with honest, data-driven clarity.
- Provide tools for disciplined, tax-compliant, and self-aware betting.
- Offer a professional, private alternative to social betting apps.
- Evolve based on real user needs and feedback, not social trends.

**Philosophy:**
- No social pressure, no “streak theater.”
- Audit-ready, privacy-first, and offline-friendly.
- Honest analytics, not hype or influencer-driven content.
- User empowerment and community-driven evolution.

## Features
- **Bet Entry:** Log both straight bets and parlays with a dynamic, mobile-friendly form.
- **Bet History:** Professional, sortable table (desktop) or card view (mobile), always in sync with analytics.
- **Summary Statistics:** Real-time analytics on betting performance, including profit/loss, ROI, and success rates.
- **Advanced Filtering:** Filter by date range, bet type, and search for specific props or players.
- **Data Export/Import:** CSV/JSON export for tax/audit purposes and CSV import for onboarding existing data.
- **Privacy & Local Storage:** In Basic Mode, all data is stored locally in the browser. No server-side storage unless the user opts in for advanced features.

## Data Privacy
- All bet data in Basic Mode is stored locally in the browser using a dedicated storage utility.
- No data is sent to the server unless the user opts in for advanced features.
- All import/export, deletion, and modification operations go through this utility for auditability and privacy.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, shadcn/ui, Radix UI, Wouter, React Query, React Hook Form + Zod
- **Backend:** Node.js + Express, RESTful API, Drizzle ORM, PostgreSQL (planned), in-memory storage (current)
- **Monorepo:** Unified client/server/shared codebase for type safety and rapid development

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
- The site will be available at `http://localhost:3000` (or the port shown in your terminal).

### 3. Run Automated Tests (Optional)
```bash
npx vitest run
```

## Deployment
- Connect your GitHub repo to Vercel, Railway, or Netlify for one-click deployment.
- The repo is organized for easy CI/CD and cloud deployment.
- All code and config needed for deployment is included; no extra files or assets required.

## Developer Experience
- All types, constants, and schemas are centralized in `shared/types.ts` and `shared/schema.ts`.
- Filtering and analytics logic is shared and documented in `shared/filters.ts`.
- UI components are modular, accessible, and follow the shadcn/ui + Tailwind design system.
- Scripts:
  - `npm run dev` — Start the development server
  - `npm run build` — Build for production
  - `npm run start` — Start the production server
  - `npm run check` — Type-check the codebase
  - `npm run db:push` — Run Drizzle ORM migrations

## Contributing
- Fork the repo, create a branch, and submit a pull request.
- All contributions should follow the privacy-first, audit-ready philosophy of AYAW.

## License
MIT