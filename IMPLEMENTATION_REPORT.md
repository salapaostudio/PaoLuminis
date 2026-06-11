# PaoLuminis Implementation Report

## 1. Executive Summary

The latest PaoLuminis update added a centralized Reading Mode system and connected it to a new server-side AI generation flow. The app now supports multiple reflective reading styles, richer Thai-first response structures, mode-specific input fields, tone profiles, stronger safety language, and improved UI labels.

Current project status: the codebase is clean, the latest implementation is committed as `bd98360 Add reflective reading mode system`, and `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass.

## 2. Main Goal of This Update

The purpose of this update was to make PaoLuminis feel more like a warm AI Spiritual Reflection Companion and less like a generic chatbot or deterministic fortune-telling site.

Main goals:

- Improve reading modes so users can choose a reading style that matches their current question.
- Improve Thai AI response language so answers feel warm, reflective, and brand-aligned.
- Make readings more empowering, non-fear-based, and non-deterministic.
- Align the product with the core direction: "ให้ดวงเป็นกระจก ไม่ใช่กรงขัง".
- Keep Gemini API calls server-side only.
- Keep generated readings saved through the existing Supabase-backed reading system.

## 3. Files Changed

| File | Type of Change | Summary |
| ---- | -------------- | ------- |
| `app/api/readings/generate/route.ts` | New file | Adds server-side reading generation route for mode-based AI readings. |
| `lib/ai/reading-modes.ts` | New file | Central static configuration for reading modes, categories, input fields, labels, tone profile mapping, and safety notes. |
| `lib/ai/reading-prompts.ts` | New file | Adds centralized prompt builder for mode-aware Thai reflective readings. |
| `lib/ai/reading-schema.ts` | New file | Adds zod validation for reading generation input and structured AI response output. |
| `lib/ai/reading-style.ts` | New file | Defines tone profiles such as warm mystic, grounded reflective, poetic spiritual, direct but kind, and practical calm. |
| `lib/ai/safety-rules.ts` | New file | Adds shared safety guidance, banned topic categories, and repeated-question guidance text. |
| `tests/reading-schema.test.ts` | New file | Adds lightweight validation tests for the new reading schema. |
| `components/ai-panels.tsx` | Modified | Rebuilds the Ask panel with reading mode selector, category selector, dynamic fields, Thai loading copy, safety note, and new API call. |
| `components/ui.tsx` | Modified | Improves `ReflectionView` to render new camelCase structured response fields, arrays, and nested objects. |
| `components/nav.tsx` | Modified | Updates visible navigation labels to more Thai-first, brand-aligned copy. |
| `app/(app)/ask/page.tsx` | Modified | Updates Ask page copy to introduce the reading mode experience. |
| `app/(app)/history/page.tsx` | Modified | Adjusts empty state copy to match new "แสงนำทาง" wording. |
| `app/admin/page.tsx` | Modified | Maps reading type labels to Thai in recent admin reading metadata. |
| `lib/ai/gemini.ts` | Modified | Adds `generateReadingResponse`, mode-based model selection, structured JSON parsing, and mode-specific fallback responses. |
| `lib/context.ts` | Modified | Adds recent questions to AI context for repeated-question handling. |
| `lib/labels.ts` | Modified | Adds Thai display labels for new reading modes and expanded categories. |
| `lib/safety/check.ts` | Modified | Expands keyword-based safety detection for self-harm, violence, medical/legal/financial, manipulation, curses, death, accident, and guaranteed-outcome prompts. |
| `tests/safety.test.ts` | Modified | Adds coverage for accident/fatalistic safety caution. |
| `README.md` | Modified | Documents the new reading mode system and new server route. |
| `AGENTS.md` | Modified | Adds contributor guidance for keeping reading modes centralized and Thai-first. |

## 4. New Features Added

### Reading Mode Selector

- Route/page/component involved: `/ask`, `components/ai-panels.tsx`.
- What the user can do: choose a reading style such as ไพ่สะท้อนใจ, เลขศาสตร์ชีวิต, วิเคราะห์ชื่อ, วิเคราะห์เบอร์, ฮวงจุ้ยเชิงบรรยากาศ, or กระจกความสัมพันธ์.
- Backend/API involved: `app/api/readings/generate/route.ts`.
- Current completion status: implemented.

### Dynamic Reading Inputs

- Route/page/component involved: `/ask`, `components/ai-panels.tsx`, `lib/ai/reading-modes.ts`.
- What the user can do: see mode-specific fields, such as birth date for numerology, name for name analysis, phone number for lucky phone, space description for feng shui, and relationship status for relationship mirror.
- Backend/API involved: `lib/ai/reading-schema.ts` validates required fields.
- Current completion status: implemented.

### Server-Side Reading Generation API

- Route/page/component involved: `app/api/readings/generate/route.ts`.
- What the user can do: submit a reading mode request and receive a structured AI-generated reflection.
- Backend/API involved: Supabase auth, safety check, usage limit, Gemini generation, `questions` insert, `readings` insert, `usage_events` insert.
- Current completion status: implemented.

### Structured Reading Output

- Route/page/component involved: `lib/ai/reading-schema.ts`, `lib/ai/gemini.ts`, `components/ui.tsx`.
- What the user can do: read responses separated into opening, symbolic message, emotional reflection, psychological lens, gentle advice, reflection questions, micro action, closing, safety note, and optional mode details.
- Backend/API involved: Gemini output parsing and fallback response handling.
- Current completion status: implemented.

### Tone Profiles

- Route/page/component involved: `lib/ai/reading-style.ts`, `lib/ai/reading-prompts.ts`.
- What the user can do: indirectly receive different response styles depending on mode, such as warm mystical, practical calm, or direct but kind.
- Backend/API involved: prompt builder uses mode tone profile.
- Current completion status: implemented.

### Repeated-Question Context

- Route/page/component involved: `lib/context.ts`, `lib/ai/reading-prompts.ts`.
- What the user can do: receive gentler redirection when similar emotional questions repeat.
- Backend/API involved: recent questions are fetched from Supabase and passed into prompt context.
- Current completion status: implemented at prompt level.

## 5. Reading Mode System

| Mode ID | Thai Label | Purpose | Status |
| ------- | ---------- | ------- | ------ |
| `daily_light` | แสงนำทางวันนี้ | Daily reflection for mood, energy, and one small action. | implemented |
| `tarot` | ไพ่สะท้อนใจ | Symbolic card-style reading for love, work, self, decisions, and timing. | implemented |
| `oracle` | Oracle Message | Gentle spiritual message for inner guidance. | implemented |
| `astrology` | โหราศาสตร์สะท้อนตัวตน | Symbolic reflection from birth data and life themes. No full chart engine yet. | config only / symbolic implementation |
| `numerology` | เลขศาสตร์ชีวิต | Symbolic reflection from birth date and number patterns. No full numerology calculator yet. | implemented, symbolic |
| `name_analysis` | วิเคราะห์ชื่อเชิงความหมาย | Reflective meaning and identity reading from name/nickname. | implemented |
| `thai_taksa` | ทักษาปกรณ์ | Thai-style symbolic name/day reflection. No full traditional taksa calculation yet. | config only / symbolic implementation |
| `lucky_phone` | วิเคราะห์เบอร์เชิงพลังงาน | Reflective phone number pattern reading without guaranteed outcomes. | implemented, symbolic |
| `feng_shui` | ฮวงจุ้ยเชิงบรรยากาศ | Practical space/room/desk reflection using light, clutter, airflow, focus, and rest. | implemented |
| `i_ching` | I Ching Reflection | Reflection on change, timing, waiting, and decisions. No hexagram engine yet. | config only / symbolic implementation |
| `human_design` | Human Design Reflection | Reflection on energy style and decision style. No full chart engine yet. | config only / symbolic implementation |
| `decision_companion` | เพื่อนช่วยตัดสินใจ | Helps users reflect on difficult choices without deciding for them. | implemented |
| `relationship_mirror` | กระจกความสัมพันธ์ | Love, attachment, boundaries, and emotional pattern reflection. | implemented |
| `career_reflection` | เข็มทิศเรื่องงาน | Career uncertainty, strengths, pressure, and next-step reflection. | implemented |
| `money_reflection` | ความสัมพันธ์กับเงิน | Money anxiety, spending patterns, and financial self-reflection without financial advice. | implemented |

## 6. AI Prompt System Changes

Prompt-related files:

- `lib/ai/reading-prompts.ts`
- `lib/ai/reading-modes.ts`
- `lib/ai/reading-style.ts`
- `lib/ai/reading-schema.ts`
- `lib/ai/safety-rules.ts`
- Existing legacy prompt file: `lib/prompts/system.ts`

How prompts are built:

- `buildReadingPrompt()` accepts mode, category, tone profile, user input, user profile, and recent context.
- The prompt identifies PaoLuminis as an AI Spiritual Reflection Companion.
- It tells the model to use spiritual symbols as mirrors, not deterministic predictions.
- It includes mode purpose, response sections, safety notes, tone vocabulary, banned vocabulary, style guidance, profile context, recent context, and user input.
- It requires structured JSON output matching `readingResponseShape`.

How reading mode affects the prompt:

- Each mode provides its own label, purpose, allowed categories, input fields, response sections, safety notes, and tone profile.
- The selected mode controls the prompt's reading purpose and safety framing.

How tone profile affects the response:

- Tone profiles define preferred vocabulary, banned vocabulary, sentence length, emotional intensity, example style guidance, and safety caution.
- Examples: tarot/oracle use `warm_mystic`; feng shui/money/career use `practical_calm`; relationship/decision use `direct_but_kind`.

Structured output expected:

- `title`
- `opening`
- `symbolicMessage`
- `emotionalReflection`
- `psychologicalLens`
- `gentleAdvice`
- `reflectionQuestions`
- `microAction`
- `closing`
- `safetyNote`
- `modeDetails`

Gemini model configuration:

- `GEMINI_DAILY_MODEL` is used for `daily_light`.
- `GEMINI_ASK_MODEL` is used for reading modes such as tarot, oracle, astrology, numerology, name analysis, feng shui, decision, relationship, career, and money.
- `GEMINI_JOURNAL_MODEL` remains used by journal reflection.
- No API keys are exposed in code.

## 7. Thai Language and Brand Voice Improvements

The update improves Thai wording by shifting the product from "Ask AI" toward a warmer "แสงนำทาง" and "คำอ่านนี้เป็นแนวสะท้อนใจ" experience.

Brand-aligned language now appears in prompts, fallbacks, and UI:

- "อาจสะท้อนว่า..."
- "นี่เป็นเพียงกระจกหนึ่งบาน"
- "คุณยังมีสิทธิ์เลือก"
- "คำอ่านนี้เป็นแนวสะท้อนใจ ไม่ใช่คำตัดสินอนาคตแบบตายตัว"
- "ใช้ไพ่เป็นกระจก ไม่ใช่กรงขัง"

The app now explicitly avoids:

- deterministic fortune telling
- fear-based language
- curse/karma pressure
- guaranteed predictions
- medical/legal/financial claims
- telling users what will happen with certainty
- telling users to rely on readings instead of their own judgment

## 8. UI / UX Changes

Ask page:

- `/ask` now introduces the experience as "แสงนำทาง".
- Copy tells users to choose the reading mode that matches their current question.

Reading mode selector:

- `components/ai-panels.tsx` displays reading mode cards.
- Cards show Thai label, short description, and tone profile label.
- The layout uses a mobile-first grid with a two-column layout on larger screens.

Dynamic input fields:

- Inputs are driven by `lib/ai/reading-modes.ts`.
- Modes can require text, textarea, date, telephone, select, or number fields.

Response display:

- `ReflectionView` now supports camelCase reading sections.
- Arrays such as reflection questions are rendered as separate list items.
- Nested `modeDetails` render as grouped detail blocks.

Save insight flow:

- Generated readings still show a "เก็บคำอ่านนี้" button.
- The save flow continues to use `/saved?reading_id=...` and the existing `saved_insights` table.

Empty states:

- History empty copy now references "เปิดแสงนำทาง".
- Existing saved/journal empty states remain in place.

Thai labels:

- Navigation labels now use "แสงนำทาง", "ไพ่สะท้อนใจ", and "สิ่งที่เก็บไว้".
- Admin recent readings now show Thai reading type labels where available.
- History uses `readingTypeLabels` from `lib/labels.ts`.

Loading text:

- Ask flow loading text is now "กำลังฟังคำถามของคุณ...".

Safety note:

- The Ask form displays the selected mode's safety note under the submit button.

## 9. Backend / API Changes

API routes added:

- `POST /api/readings/generate`

API routes still present:

- `POST /api/ai/ask`
- `POST /api/ai/daily-light`
- `POST /api/ai/journal-reflect`
- `POST /api/ai/tarot`

Input validation:

- `readingGenerateSchema` validates mode, category, and input payload.
- Required fields are checked per reading mode.
- Categories are checked against the selected mode's allowed categories.

Authentication checks:

- `getUserOrThrow()` is used by the new API route.
- Unauthenticated users receive the existing API error response.

Usage limit checks:

- `daily_light` mode maps to `daily_light` usage limits.
- All other reading modes currently map to `ask_ai` usage limits.
- Usage is recorded in `usage_events`.

AI generation flow:

1. Validate request body with zod.
2. Authenticate user.
3. Run safety checker.
4. Enforce usage limit.
5. Fetch reflection context, including recent questions.
6. Save request context into `questions`.
7. Build mode-aware prompt.
8. Call Gemini server-side through `generateReadingResponse()`.
9. Parse/validate structured JSON response.
10. Save generated reading into `readings`.
11. Record usage event.
12. Return reading JSON to the client.

Supabase insert/select/update flow:

- Reads user/profile/context through server-side Supabase client.
- Inserts into `questions`.
- Inserts into `readings`.
- Inserts into `usage_events`.
- Inserts into `safety_logs` when caution/block is detected.

Error handling:

- Invalid JSON request returns "รูปแบบ JSON ไม่ถูกต้อง".
- Unauthorized access returns "กรุณาเข้าสู่ระบบก่อน".
- Validation failures return Thai user-facing messages.
- Gemini missing key or Gemini failure falls back to safe sample reading content.

## 10. Database / Supabase Changes

No database migration was added in this update.

Tables changed:

- None.

New columns:

- None.

RLS policy changes:

- None.

Migration requirement:

- No new migration has to be manually run for this specific update.
- The existing migration `supabase/migrations/20260610120000_initial_schema.sql` still defines the required tables, RLS, and tarot card seed data.

Important implementation note:

- New reading modes are stored using the existing `readings.type` text column.
- New structured AI output is stored in the existing `readings.content` jsonb column.
- This keeps the update lightweight and avoids unnecessary schema churn.

## 11. Safety Improvements

Self-harm:

- Self-harm and suicidal terms are blocked.
- The app returns a crisis-safe supportive message and avoids spiritual prediction.

Death prediction:

- Death-related prompts are flagged as `fatalistic_prediction` with caution.
- Prompts instruct the AI not to make death claims or deterministic predictions.

Accident prediction:

- Accident-related prompts are flagged as `fatalistic_prediction` with caution.
- A safety test now covers "จะเกิดอุบัติเหตุไหม".

Curse/fear-based questions:

- Curse, bad luck, heavy karma, guaranteed outcomes, and fear-based language are detected as caution-level or included in banned prompt guidance.
- Prompts and fallbacks avoid curse/karma pressure.

Medical/legal/financial advice:

- Keywords for diagnosis, pregnancy, lawsuits, contracts, investment, stocks, crypto, and finance trigger caution.
- Prompts instruct Gemini not to provide specific medical, legal, financial, or investment instructions.

Gambling or investment decisions:

- Investment-related prompts are caught by financial keyword safety.
- Gambling-specific terms are included in `lib/ai/safety-rules.ts` as banned topics, but the keyword checker is still limited and should be expanded for Thai gambling terms.

Repeated emotional dependency questions:

- Recent questions are fetched into AI context.
- The prompt builder adds repeated-question redirection guidance when similar questions recur.
- This is a prompt-level mitigation, not a hard block.

Current safety limitations:

- Safety detection is still primarily keyword-based.
- It may miss indirect, slang, misspelled, or highly contextual unsafe prompts.
- It does not yet use a dedicated safety classifier model.
- Repeated-question handling is simple and may over-trigger when category matches and the question is long.

## 12. Testing Results

| Check | Result | Notes |
| ----- | ------ | ----- |
| `pnpm lint` | pass | `next lint` completed with no ESLint warnings or errors. Next.js reports `next lint` is deprecated for future Next.js versions. |
| `pnpm typecheck` | pass | `tsc --noEmit` completed successfully. |
| `pnpm build` | pass | `next build` compiled successfully and generated 19 app routes, including `/api/readings/generate` and `/ask`. |

Automated tests do exist in the repository:

- `tests/safety.test.ts`
- `tests/timezone.test.ts`
- `tests/validation.test.ts`
- `tests/reading-schema.test.ts`

The user-requested checks for this report were lint, typecheck, and build.

## 13. Manual QA Checklist

- [ ] Create account / login with Google OAuth.
- [ ] Create account / login with email magic link.
- [ ] Complete onboarding.
- [ ] Generate Daily Light at `/today`.
- [ ] Confirm Daily Light only generates once per Thailand day.
- [ ] Open `/ask`.
- [ ] Select ไพ่สะท้อนใจ and generate a reading.
- [ ] Select Oracle Message and generate a reading.
- [ ] Select เลขศาสตร์ชีวิต and test required birth date validation.
- [ ] Select วิเคราะห์ชื่อเชิงความหมาย and test name/question fields.
- [ ] Select วิเคราะห์เบอร์เชิงพลังงาน and test phone number input.
- [ ] Select ฮวงจุ้ยเชิงบรรยากาศ and test room/space fields.
- [ ] Select กระจกความสัมพันธ์ and test relationship status field.
- [ ] Save an insight from a generated reading.
- [ ] Confirm saved insight appears at `/saved`.
- [ ] Confirm generated reading appears at `/history`.
- [ ] Write a journal entry at `/journal`.
- [ ] Request journal AI reflection.
- [ ] Draw tarot card at `/tarot`.
- [ ] Confirm logout clears session.
- [ ] Visit `/admin` as non-admin and confirm access is blocked/redirected.
- [ ] Visit `/admin` as admin and confirm metrics show without full journal body exposure.
- [ ] Check mobile layout on small phone width.
- [ ] Ask a self-harm question and confirm it is blocked supportively.
- [ ] Ask a medical/legal/financial question and confirm it is redirected cautiously.
- [ ] Ask a fatalistic question about death/accident/curse and confirm no fear-based prediction is generated.

## 14. Known Limitations

- Some modes are symbolic only and do not perform full traditional calculation.
- There is no full astrology birth chart engine yet.
- There is no full Human Design chart engine yet.
- There is no full Thai taksa calculation engine yet.
- There is no I Ching hexagram engine yet.
- Numerology is currently prompt-driven/symbolic, not a deterministic calculator.
- Lucky phone reading is reflective and does not calculate traditional commercial phone-number formulas.
- Safety detection is still keyword-based.
- Repeated-question handling is prompt-level and simple.
- There is no payment system.
- There is no marketplace.
- There is no human reader booking.
- There is no full moderation dashboard.

## 15. Environment Variables

Required environment variable names used by the project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_DAILY_MODEL`
- `GEMINI_ASK_MODEL`
- `GEMINI_JOURNAL_MODEL`
- `GEMINI_SAFETY_MODEL`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_SITE_URL`
- `APP_TIMEZONE`

No real values, tokens, or secrets are included in this report.

## 16. Deployment Notes

Before deploying or testing on Vercel Preview, check:

- Vercel environment variables are set for Supabase, Gemini, admin emails, site URL, and timezone.
- Supabase migration `20260610120000_initial_schema.sql` has been run in the target Supabase project.
- Supabase RLS policies are present after migration.
- Supabase Auth redirect URLs include the Vercel Preview URL and production URL.
- Google OAuth callback URL is configured in Google Cloud and Supabase Auth provider settings.
- `NEXT_PUBLIC_SITE_URL` matches the deployed site URL for auth redirects.
- Gemini API key is valid and only stored as a server-side environment variable.
- Production build passes locally or in CI.
- Custom domain is connected before public launch.
- Cloudflare DNS points to the correct Vercel target if Cloudflare is used.

## 17. Recommended Next Steps

### P0

Critical items before public launch:

1. Run full manual QA on Vercel Preview, especially login, onboarding, Ask/Reading Mode, save, history, journal, and safety flows.
2. Confirm Supabase production migration and RLS policies are applied exactly once.
3. Verify all production environment variables are set in Vercel and no secrets are exposed to the browser.

### P1

Important improvements after staging works:

1. Add browser/end-to-end tests for auth, onboarding, Ask mode generation, save insight, and history.
2. Expand safety detection beyond keyword matching, especially for gambling, stalking, self-harm variants, and Thai slang.
3. Add lightweight deterministic helpers for simple numerology calculations while keeping language non-fatalistic.

### P2

Future product improvements:

1. Add optional calculation engines for astrology, Thai taksa, I Ching, or Human Design, with clear disclaimers about symbolic interpretation.
2. Add admin moderation workflows for safety logs and reading quality review.
3. Add analytics dashboards for mode usage, retention, and saved insight patterns without exposing private journal content.

## 18. Final Status

Ready for staging testing.

Reason: the latest reading mode implementation is committed, the workspace is clean, no database migration is required for this update, and `pnpm lint`, `pnpm typecheck`, and `pnpm build` all pass.

