# PaoLuminis

PaoLuminis is an AI Spiritual Reflection Companion. It combines symbolic reflection, tarot-like archetypes, numerology/astrology-inspired language, positive psychology, and journaling without deterministic predictions or fear-based selling.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, and RLS
- Gemini API through server-side route handlers only
- pnpm
- Vercel-ready deployment

## Local setup

1. Install dependencies:

```bash
corepack enable
pnpm install
```

2. Create `.env.local` from `.env.example` and fill values:

```bash
cp .env.example .env.local
```

3. Create a Supabase project and run the migration in `supabase/migrations/20260610120000_initial_schema.sql`.

4. Configure Supabase Auth:

- Enable email magic links.
- Add `http://localhost:3000/auth/callback` to redirect URLs.
- For production, add `https://your-domain.vercel.app/auth/callback`.

5. Run the app:

```bash
pnpm dev
```

## Environment variables

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe browser variables. `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` must stay server-side only.

`ADMIN_EMAILS` is a comma-separated allowlist, for example:

```bash
ADMIN_EMAILS=founder@example.com,admin@example.com
```

## Supabase notes

The migration creates:

- user-owned tables with RLS policies
- authenticated read access for symbolic cards
- 22 original tarot-like symbolic cards
- usage event tracking for AI rate limits
- safety logs for blocked or cautious inputs

The service role key is used only by `/admin` after checking `ADMIN_EMAILS` server-side.

## Vercel deployment

1. Import the GitHub repo in Vercel.
2. Set framework preset to Next.js.
3. Add the same environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed URL.
5. Add the production auth callback URL in Supabase.
6. Deploy.

## AI safety

All AI calls go through server-side route handlers under `app/api/ai/*`. The client never sees `GEMINI_API_KEY`.

The safety checker blocks or cautions self-harm, violence, medical/legal/financial advice, pregnancy, abuse/manipulation, fatalistic predictions, curses, and fear-based content. Responses are instructed to stay Thai-first, reflective, non-deterministic, and empowering.

## Useful commands

```bash
pnpm lint
pnpm typecheck
pnpm build
```
