# AGENTS.md

## Product principles

PaoLuminis is an AI Spiritual Reflection Companion, not a fortune-telling product. Keep every feature warm, non-deterministic, consent-respecting, and grounded.

Never add:

- fear-based selling
- guaranteed predictions
- curses, death claims, accident claims, or fatalistic language
- medical, legal, financial, or investment advice
- manipulation guidance
- advice to abandon professional help

Prefer Thai copy with phrases like:

- `อาจสะท้อนว่า...`
- `ลองถามตัวเองว่า...`
- `นี่เป็นพื้นที่สะท้อนใจ ไม่ใช่คำทำนาย`

## Engineering rules

- Use Next.js App Router and TypeScript.
- Keep Gemini calls server-side only.
- Never expose `GEMINI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Preserve Supabase RLS for every user-owned table.
- Keep admin features server-side and gated by `ADMIN_EMAILS`.
- Add migrations for database changes.
- Run `pnpm lint` and `pnpm typecheck` before shipping.
- Keep reading modes centralized in `lib/ai/reading-*.ts` and route generation through server-side handlers only.
- Keep responses structured, Thai-first, and explicitly non-deterministic.

## UI direction

Mobile-first, warm cream, soft purple, midnight blue, and gold accent. The experience should feel reflective and modern, not like traditional fortune telling.
