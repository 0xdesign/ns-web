# Repository Guidelines

## Project Structure & Module Organization
The Next.js 15 App Router lives in `app/`, covering layouts, route segments, server actions, and `app/api/*`. Global CSS sits in `app/globals.css`. Feature components belong in `components/`, while shared primitives and effects go under `components/ui/`. Service clients and cross-cutting helpers live in `lib/` (e.g., `lib/stripe.ts`, `lib/supabase.ts`). Database work is tracked in `migrations/`, build artifacts land in `.next/`, and configuration stays in `next.config.js`, `tailwind.config.ts`, and `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev` — Launches the dev server at `http://localhost:3000` with hot reload.
- `npm run build` — Produces the production bundle and runs type checks.
- `npm start` — Serves the output of the latest `npm run build`.
- `npm run lint` — Applies the Next.js ESLint ruleset; resolve findings before committing.

## Coding Style & Naming Conventions
All code is TypeScript with ESLint and Prettier defaults enforced by Next.js. Use PascalCase for React components (`components/MemberSidebar.tsx`) and kebab-case for utilities in `lib/` (`lib/bot-api.ts`). Prefer server components; add `'use client'` only for browser APIs or event handlers. Style with Tailwind CSS utilities colocated with markup; avoid bespoke CSS unless global.

## Testing Guidelines
A formal test harness is not yet configured. When adding coverage, reach for Vitest or Jest plus React Testing Library for units (`Component.test.tsx`) and Playwright for end-to-end specs in `e2e/`. Target critical flows such as authentication, applications, and payments. Document any unique setup steps inside the relevant test directory.

## Commit & Pull Request Guidelines
Write commits as short, imperative statements (e.g., "Add member avatars"). Before pushing, run `npm run lint` and `npm run build`, and confirm `.env.local` mirrors `.env.example`. Pull requests should include a clear summary, linked issues, screenshots for UI changes, and notes on environment or config updates. Highlight migration or API changes prominently in the PR description.

## Security & Configuration Tips
Never commit secrets. Copy `.env.example` to `.env.local` and supply Supabase, Discord OAuth, Stripe, Bot API, and NextAuth credentials. Keep third-party clients isolated in `lib/` and reuse them instead of duplicating credentials or request logic.

## Agent-Specific Notes
- Keep changes minimal and focused; avoid unrelated refactors.
- Do not add dependencies or alter build config without prior discussion.
