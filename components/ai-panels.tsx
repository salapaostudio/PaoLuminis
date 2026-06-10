"use client";

import { useState, useTransition } from "react";
import { ReflectionView } from "@/components/ui";

type ApiState = {
  reading?: { id: string; content: Record<string, unknown>; title?: string };
  card?: { name: string; archetype: string };
  reflection?: { id: string; content: Record<string, unknown> };
  error?: string;
};

async function postJson(url: string, body?: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as ApiState;
  if (!response.ok) throw new Error(data.error ?? "เกิดข้อผิดพลาด");
  return data;
}

export function DailyLightPanel() {
  const [state, setState] = useState<ApiState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4">
      <button
        className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-cream shadow-glow disabled:opacity-60"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              setState(await postJson("/api/ai/daily-light"));
            } catch (error) {
              setState({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
            }
          })
        }
      >
        {pending ? "กำลังเปิดแสง..." : "Generate Daily Light"}
      </button>
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reading ? <ReflectionView content={state.reading.content} /> : null}
      {state.reading ? <SaveReadingForm readingId={state.reading.id} /> : null}
    </div>
  );
}

export function AskPanel() {
  const [state, setState] = useState<ApiState>({});
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          try {
            setState(
              await postJson("/api/ai/ask", {
                category: formData.get("category"),
                question: formData.get("question"),
              })
            );
          } catch (error) {
            setState({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
          }
        });
      }}
    >
      <select name="category" className="rounded-[8px] border border-midnight/10 bg-white/80 px-4 py-3">
        {["love", "career", "money", "self", "decision", "timing"].map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <textarea name="question" required rows={5} className="rounded-[8px] border border-midnight/10 bg-white/80 px-4 py-3" placeholder="ถามสิ่งที่อยากสะท้อนใจ..." />
      <button className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-cream shadow-glow disabled:opacity-60" disabled={pending}>
        {pending ? "กำลังสะท้อน..." : "Ask AI"}
      </button>
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reading ? <ReflectionView content={state.reading.content} /> : null}
      {state.reading ? <SaveReadingForm readingId={state.reading.id} /> : null}
    </form>
  );
}

export function TarotPanel() {
  const [intention, setIntention] = useState("");
  const [state, setState] = useState<ApiState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4">
      <input value={intention} onChange={(event) => setIntention(event.target.value)} className="rounded-[8px] border border-midnight/10 bg-white/80 px-4 py-3" placeholder="ความตั้งใจในการจั่วใบนี้..." />
      <button
        className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-cream shadow-glow disabled:opacity-60"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              setState(await postJson("/api/ai/tarot", { intention }));
            } catch (error) {
              setState({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
            }
          })
        }
      >
        {pending ? "กำลังจั่ว..." : "Draw Symbol Card"}
      </button>
      {state.card ? <p className="rounded-[8px] bg-mist p-4 font-semibold text-midnight">{state.card.name} · {state.card.archetype}</p> : null}
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reading ? <ReflectionView content={state.reading.content} /> : null}
      {state.reading ? <SaveReadingForm readingId={state.reading.id} /> : null}
    </div>
  );
}

export function JournalReflectButton({ journalId, body }: { journalId: string; body: string }) {
  const [state, setState] = useState<ApiState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 grid gap-3">
      <button
        className="w-fit rounded-full border border-midnight/15 bg-white/70 px-4 py-2 text-sm font-semibold text-midnight"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              setState(await postJson("/api/ai/journal-reflect", { journalId, body }));
            } catch (error) {
              setState({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
            }
          })
        }
      >
        {pending ? "กำลังสะท้อน..." : "Reflect with AI"}
      </button>
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reflection ? <ReflectionView content={state.reflection.content} /> : null}
    </div>
  );
}

function SaveReadingForm({ readingId }: { readingId: string }) {
  return (
    <form action="/saved" method="get">
      <input type="hidden" name="reading_id" value={readingId} />
      <a className="inline-flex rounded-full border border-midnight/15 bg-white/70 px-4 py-2 text-sm font-semibold text-midnight" href={`/saved?reading_id=${readingId}`}>
        ไปบันทึก insight นี้
      </a>
    </form>
  );
}
