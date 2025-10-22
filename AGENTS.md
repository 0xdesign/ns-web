# Repository Guidelines

## Project Structure & Module Organization
- Next.js 15 (App Router) lives in `app/` (`layout.tsx`, `page.tsx`, route segments, and `app/api/*`). Global styles in `app/globals.css`.
- UI components in `components/` (feature components) and `components/ui/` (primitives/effects). Prefer small, composable pieces.
- Shared utilities in `lib/` (`stripe.ts`, `supabase.ts`, `bot-api.ts`, etc.). Keep external-service logic here.
- Config in `next.config.js`, `tailwind.config.ts`, `tsconfig.json`. Build output in `.next/`.

## Build, Test, and Development Commands
- `npm run dev` — Start local dev server on `http://localhost:3000`.
- `npm run build` — Production build (checks types and tree-shakes).
- `npm start` — Run the built app locally.
- `npm run lint` — ESLint with Next.js config.

## Coding Style & Naming Conventions
- Language: TypeScript. Follow ESLint (Next) rules; fix before committing (`npm run lint`).
- Components: PascalCase filenames (e.g., `MemberSidebar.tsx`).
- Utilities: kebab-case filenames in `lib/` (e.g., `bot-api.ts`).
- Server-first: Use React Server Components by default; add `'use client'` only when needed (event handlers, browser APIs).
- Tailwind CSS 4 for styling; prefer utility classes close to markup.

## Testing Guidelines
- No test runner is configured yet. If adding tests:
  - Unit: Vitest/Jest + React Testing Library; name files `*.test.tsx` and co-locate or use `__tests__/`.
  - E2E: Playwright; place under `e2e/` with `*.spec.ts`.
  - Aim for critical-path coverage (auth, applications, payments, webhooks).

## Commit & Pull Request Guidelines
- Commits: short, imperative summaries (e.g., "Add member avatars"), optional body for rationale or migration notes.
- PRs must include: clear description, linked issues, screenshots for UI changes, and notes for env/config changes.
- Before opening a PR: run `npm run lint` and `npm run build`; ensure `.env.local` is configured locally.

## Security & Configuration Tips
- Copy `.env.example` to `.env.local`; never commit secrets. Key vars: Supabase URL/keys, Discord OAuth, Stripe keys/webhook secret, Bot API URL/key, NextAuth secret.
- Keep third-party clients and secrets isolated in `lib/` and import where needed.

## Agent-Specific Notes
- Keep changes minimal and focused; avoid unrelated refactors.
- Do not add dependencies or alter build config without prior discussion.
