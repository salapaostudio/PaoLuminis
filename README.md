# PaoLuminis MVP

PaoLuminis is an **AI Spiritual Reflection Companion**. It is not a traditional fortune-telling website. The product uses symbolic systems such as tarot-like archetypes, numerology-inspired language, and astrology-inspired language as mirrors for self-reflection, then combines them with positive psychology, journaling, and grounded micro-actions.

The tone should always be warm, gentle, reflective, empowering, and non-judgmental. PaoLuminis must never use fear-based selling, deterministic predictions, or harmful advice.

## 1. Project Overview

The MVP helps users pause, reflect, and understand their current emotional landscape through a Thai-first web experience.

Users can:

- Sign in with email magic link.
- Complete a short onboarding profile.
- Generate one personalized **Daily Light** per day.
- Ask AI reflective questions.
- Draw one symbolic card and receive a gentle reflection.
- Write journal entries and ask AI to reflect on them.
- Save meaningful insights.
- View past readings and reflections.

The app is designed for deployment on Vercel with Supabase for authentication and data storage. Gemini is used only through secure server-side route handlers.

## 2. Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth with email magic links
- **Database:** Supabase PostgreSQL
- **Security:** Supabase Row Level Security
- **AI:** Google Gemini API through server-side route handlers only
- **Package manager:** pnpm via Corepack
- **Deployment:** Vercel
- **Validation:** zod
- **Linting:** ESLint / Next lint

## 3. Features

### Landing Page

Route: `/`

- Introduces PaoLuminis as an AI Spiritual Reflection Companion.
- Includes a Start Reflection CTA.
- Presents three pillars: Daily Light, Ask AI, and Reflection Journal.

### Auth

Route: `/login`

- Supabase email magic link login.
- Auth callback at `/auth/callback`.

### Onboarding

Route: `/onboarding`

Collects:

- nickname
- birth date
- optional birth time
- main intention
- current mood
- current life question

The profile is saved in the `profiles` table.

### Daily Light

Route: `/today`

- Generates one Daily Light per user per day.
- Saves the result in `readings` with `type = daily_light`.
- Includes gentle opening, symbolic insight, emotional reflection, journal prompt, and micro action.

### Ask AI

Route: `/ask`

- User chooses a category and asks a question.
- Server validates input, checks safety, retrieves user context, calls Gemini, and saves the response.
- Saves the question in `questions`.
- Saves the answer in `readings` with `type = ask_ai`.

### Symbol Card

Route: `/tarot`

- Uses 22 original tarot-like symbolic cards.
- Avoids copyrighted tarot card names.
- Saves draws in `tarot_draws`.
- Saves generated reflections in `readings`.

### Journal

Route: `/journal`

- Users write guided or free-form journal entries.
- Entries are saved in `journals`.
- Users can request an AI reflection.
- Reflections are saved in `journal_reflections` and also as `readings` so they can be saved as insights.

### Saved Insights

Route: `/saved`

- Users can save meaningful readings.
- Saved rows are stored in `saved_insights`.

### History

Route: `/history`

- Shows previous readings grouped visually by date and type.

### Admin

Route: `/admin`

- Protected by `ADMIN_EMAILS`.
- Uses the Supabase service role key only on the server.
- Shows basic counts and recent reading metadata without exposing full private journal content.

## 4. Folder Structure

```text
app/
  (app)/
    ask/
    history/
    journal/
    saved/
    tarot/
    today/
    actions.ts
    layout.tsx
  admin/
  api/
    ai/
      ask/
      daily-light/
      journal-reflect/
      tarot/
  auth/
    callback/
  login/
  onboarding/
  globals.css
  layout.tsx
  page.tsx

components/
  ai-panels.tsx
  nav.tsx
  ui.tsx

lib/
  ai/
    gemini.ts
  prompts/
    system.ts
  safety/
    check.ts
  supabase/
    admin.ts
    middleware.ts
    server.ts
  api.ts
  context.ts
  usage.ts
  utils.ts
  validation.ts

supabase/
  migrations/
    20260610120000_initial_schema.sql

AGENTS.md
README.md
.env.example
```

## 5. Environment Variables

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_DAILY_MODEL=gemini-2.5-flash-lite
GEMINI_ASK_MODEL=gemini-2.5-flash
GEMINI_JOURNAL_MODEL=gemini-2.5-flash
GEMINI_SAFETY_MODEL=gemini-2.5-flash-lite
ADMIN_EMAILS=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are allowed in the browser.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.
- `GEMINI_API_KEY` must never be exposed to the browser.
- `ADMIN_EMAILS` is a comma-separated list, for example `founder@example.com,admin@example.com`.
- `.env.local` is ignored by git.
- `.env.example` must contain placeholders only, never real secrets.

## 6. Local Development Setup

Install Node.js 22 or a recent LTS version.

Enable pnpm through Corepack:

```bash
corepack enable
```

If your system blocks `corepack enable`, you can still run pnpm through Corepack:

```bash
corepack pnpm install
corepack pnpm dev
```

Install dependencies:

```bash
corepack pnpm install
```

Start the development server:

```bash
corepack pnpm dev
```

Open:

```text
http://localhost:3000
```

Useful checks:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

## 7. Supabase Setup

Create a Supabase project:

1. Go to Supabase.
2. Create a new project.
3. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`.

Important: the service role key is powerful. Keep it only in `.env.local` and Vercel server environment variables.

### Auth Setup

In Supabase Auth settings:

1. Enable email login / magic link.
2. Add local redirect URL:

```text
http://localhost:3000/auth/callback
```

3. Add production redirect URL after Vercel deployment:

```text
https://your-vercel-domain.vercel.app/auth/callback
```

4. If you use a custom domain, add that callback URL too.

## 8. Running Migrations

The database schema is in:

```text
supabase/migrations/20260610120000_initial_schema.sql
```

This migration creates:

- `profiles`
- `mood_checkins`
- `questions`
- `readings`
- `journals`
- `journal_reflections`
- `saved_insights`
- `tarot_cards`
- `tarot_draws`
- `usage_events`
- `safety_logs`
- `reports`

It also:

- Enables Row Level Security.
- Adds user-owned RLS policies.
- Adds stricter ownership checks for linked records.
- Seeds 22 original symbolic cards.

To run manually:

1. Open the Supabase dashboard.
2. Go to SQL Editor.
3. Paste the migration file.
4. Run it.

A developer can also run it with the Supabase CLI if the project is linked.

## 9. Gemini API Setup

Create a Gemini API key in Google AI Studio or the Google Cloud setup your team uses.

Add it to `.env.local`:

```bash
GEMINI_API_KEY=your_real_key_here
```

The app uses these model variables:

```bash
GEMINI_DAILY_MODEL=gemini-2.5-flash-lite
GEMINI_ASK_MODEL=gemini-2.5-flash
GEMINI_JOURNAL_MODEL=gemini-2.5-flash
GEMINI_SAFETY_MODEL=gemini-2.5-flash-lite
```

All Gemini calls happen in:

```text
app/api/ai/*
lib/ai/gemini.ts
```

The browser never receives the Gemini API key.

If `GEMINI_API_KEY` is missing or Gemini fails, the MVP returns safe fallback reflections so the UI can still be tested.

## 10. Vercel Deployment

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Choose the Next.js framework preset.
4. Add all environment variables from `.env.example`.
5. Set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

6. In Supabase Auth settings, add:

```text
https://your-vercel-domain.vercel.app/auth/callback
```

7. Deploy.

After deploy:

- Test magic-link login.
- Complete onboarding.
- Generate Daily Light.
- Ask AI.
- Draw Symbol Card.
- Write a journal entry.
- Reflect with AI.
- Save an insight.
- Check history.
- Visit `/admin` with an email listed in `ADMIN_EMAILS`.

## 11. Security Notes

Current security posture:

- `GEMINI_API_KEY` is used server-side only.
- `SUPABASE_SERVICE_ROLE_KEY` is used server-side only.
- Admin access is checked against `ADMIN_EMAILS`.
- Supabase RLS is enabled on all user data tables.
- Users can only select, insert, update, or delete their own rows.
- Symbol cards are readable by authenticated users.
- `.env.local` is ignored by git.
- `.env.example` contains placeholders only.
- AI usage events are tracked in `usage_events`.

Free MVP usage limits:

- `daily_light`: 1 per day
- `ask_ai`: 3 per day
- `journal_reflection`: 1 per day
- `tarot`: 3 per day

Recommended production additions:

- Add CAPTCHA or bot protection to auth entry points if abuse appears.
- Add stronger rate limiting at the edge or API gateway.
- Add monitoring for safety logs and API errors.
- Rotate keys if any secret is accidentally exposed.

## 12. AI Safety Policy

PaoLuminis is a reflection tool, not a prediction engine and not professional advice.

The AI must:

- Speak gently and non-judgmentally.
- Use Thai by default.
- Use reflective language such as `อาจสะท้อนว่า...` and `ลองถามตัวเองว่า...`.
- Avoid deterministic claims like `สิ่งนี้จะเกิดขึ้นแน่นอน`.
- Avoid fear-based, fatalistic, curse-based, or manipulative language.
- Encourage user agency and grounded next steps.
- Include gentle disclaimers for sensitive questions.

The AI must not:

- Diagnose medical or mental health conditions.
- Give legal, financial, investment, or medical instructions.
- Tell users to ignore doctors, therapists, lawyers, or financial professionals.
- Predict death, accidents, curses, guaranteed outcomes, or unavoidable misfortune.
- Help users manipulate, control, stalk, or harm another person.
- Provide spiritual predictions for self-harm or violence-related prompts.

Safety checking is implemented in:

```text
lib/safety/check.ts
```

Prompt rules are implemented in:

```text
lib/prompts/system.ts
```

Blocked or cautious safety events are logged in:

```text
safety_logs
```

For self-harm risk, the app returns a crisis-safe supportive message and does not generate a spiritual reading.

## 13. MVP Limitations

This is a first MVP, so some parts are intentionally simple:

- No paid plans or subscription system yet.
- No full admin dashboard moderation workflow yet.
- No advanced analytics yet.
- No email template customization included in the repo.
- No automated Supabase CLI workflow required; migration can be run manually.
- No real-time notifications.
- No mobile app.
- No multi-language toggle; Thai UX is the default.
- No deep astrology or numerology calculations yet.
- Basic usage limits are database-count based, not edge-rate-limited.
- Safety detection is keyword/rule based and should be reviewed before scale.

## 14. Roadmap

Near-term:

- Improve admin dashboard for reviewing aggregate safety trends.
- Add user settings and profile editing.
- Add richer mood check-ins.
- Add saved insight notes editing.
- Add better grouping and filters in history.
- Add automated migration instructions with Supabase CLI.

Product:

- Add deeper personalized reports while keeping the non-deterministic safety policy.
- Add optional Thai/English language preference.
- Add weekly or monthly reflection summaries.
- Add more symbolic card spreads that remain reflective rather than predictive.
- Add shareable but privacy-safe reflection snippets.

Safety and trust:

- Add stronger semantic safety classification.
- Add abuse monitoring for high-risk categories.
- Add human-readable safety review documentation.
- Add clearer crisis resources by country or locale.

Business:

- Add payments for premium reports.
- Add plan-based usage limits.
- Add onboarding analytics.
- Add retention emails that are supportive, never fear-based.
