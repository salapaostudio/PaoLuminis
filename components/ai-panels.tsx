"use client";

import { useEffect, useState, useTransition } from "react";
import { ReflectionView } from "@/components/ui";
import { readingCategoryIds, readingModeMap, readingModes, type ReadingCategory, type ReadingModeId } from "@/lib/ai/reading-modes";
import { readingCategoryLabel } from "@/lib/ai/reading-schema";
import { toneProfiles } from "@/lib/ai/reading-style";
import { Field, inputClass } from "@/components/ui";

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
        {pending ? "กำลังเปิดแสง..." : "สร้างแสงวันนี้"}
      </button>
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reading ? <ReflectionView content={state.reading.content} /> : null}
      {state.reading ? <SaveReadingButton readingId={state.reading.id} /> : null}
    </div>
  );
}

export function AskPanel() {
  const [mode, setMode] = useState<ReadingModeId>("tarot");
  const modeConfig = readingModeMap[mode];
  const [category, setCategory] = useState<ReadingCategory>("self");
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<ApiState>({});
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setValues((current) => {
      const next: Record<string, string> = {};
      modeConfig.inputFields.forEach((field) => {
        next[field.name] = current[field.name] ?? "";
      });
      return next;
    });
  }, [mode, modeConfig]);

  const modeTone = toneProfiles[modeConfig.toneProfile];
  const selectedFields = modeConfig.inputFields;

  function updateField(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          try {
            const input = Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim().length > 0));
            setState(await postJson("/api/readings/generate", { mode, category, input }));
          } catch (error) {
            setState({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
          }
        });
      }}
    >
      <div className="grid gap-3">
        <div>
          <p className="text-sm font-semibold text-gold">เลือกโหมดคำอ่าน</p>
          <p className="mt-1 text-sm leading-6 text-midnight/65">คำอ่านนี้เป็นแนวสะท้อนใจ ไม่ใช่คำตัดสินอนาคตแบบตายตัว</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {readingModes.map((item) => {
            const selected = item.id === mode;
            const tone = toneProfiles[item.toneProfile];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`rounded-[8px] border p-4 text-left transition ${
                  selected ? "border-midnight bg-midnight text-cream shadow-glow" : "border-midnight/10 bg-white/70 text-midnight hover:bg-white"
                }`}
              >
                <p className="text-sm font-semibold">{item.labelTh}</p>
                <p className={`mt-1 text-xs leading-5 ${selected ? "text-cream/80" : "text-midnight/60"}`}>{item.descriptionTh}</p>
                <p className={`mt-2 text-xs ${selected ? "text-cream/70" : "text-gold"}`}>{tone.labelTh}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Field label="เลือกหัวข้อ">
        <select
          name="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as ReadingCategory)}
          className={inputClass}
        >
          {readingCategoryIds.map((value) => (
            <option key={value} value={value}>
              {readingCategoryLabel(value)}
            </option>
          ))}
        </select>
      </Field>

      <div className="rounded-[8px] border border-gold/20 bg-gold/10 p-4 text-sm leading-6 text-midnight/75">
        <p className="font-semibold text-midnight">{modeConfig.labelTh}</p>
        <p className="mt-1">โทนหลัก: {modeTone.labelTh}</p>
        <p className="mt-1">คำแนะนำ: {modeTone.exampleStyleGuidance.join(" · ")}</p>
      </div>

      <div className="grid gap-4">
        {selectedFields.map((field) => (
          <Field key={field.name} label={field.labelTh}>
            {field.type === "textarea" ? (
              <textarea
                className={inputClass}
                rows={field.name === "question" ? 5 : 3}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) => updateField(field.name, event.target.value)}
              />
            ) : field.type === "select" ? (
              <select
                className={inputClass}
                required={field.required}
                value={values[field.name] ?? ""}
                onChange={(event) => updateField(field.name, event.target.value)}
              >
                <option value="">เลือก...</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.labelTh}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={inputClass}
                type={field.type === "number" ? "number" : field.type === "tel" ? "tel" : field.type === "date" ? "date" : "text"}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(event) => updateField(field.name, event.target.value)}
              />
            )}
          </Field>
        ))}
      </div>

      <button className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-cream shadow-glow disabled:opacity-60" disabled={pending}>
        {pending ? "กำลังฟังคำถามของคุณ..." : "เปิดคำอ่าน"}
      </button>

      <p className="text-xs leading-5 text-midnight/55">
        {modeConfig.safetyNotes[0] ?? "คำอ่านนี้ใช้เพื่อการสะท้อนตัวเอง ไม่ใช่คำแนะนำทางการแพทย์ กฎหมาย การเงิน หรือการตัดสินใจแทนคุณ"}
      </p>

      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reading ? (
        <div className="grid gap-4">
          <ReflectionView content={state.reading.content} />
          <SaveReadingButton readingId={state.reading.id} />
        </div>
      ) : null}
    </form>
  );
}

export function TarotPanel() {
  const [intention, setIntention] = useState("");
  const [state, setState] = useState<ApiState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-4">
      <input value={intention} onChange={(event) => setIntention(event.target.value)} className={inputClass} placeholder="ความตั้งใจในการจั่วใบนี้..." />
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
        {pending ? "กำลังจั่ว..." : "จั่วการ์ดสัญลักษณ์"}
      </button>
      {state.card ? <p className="rounded-[8px] bg-mist p-4 font-semibold text-midnight">{state.card.name} · {state.card.archetype}</p> : null}
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reading ? <ReflectionView content={state.reading.content} /> : null}
      {state.reading ? <SaveReadingButton readingId={state.reading.id} /> : null}
    </div>
  );
}

export function JournalReflectButton({ journalId }: { journalId: string }) {
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
              setState(await postJson("/api/ai/journal-reflect", { journalId }));
            } catch (error) {
              setState({ error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
            }
          })
        }
      >
        {pending ? "กำลังสะท้อน..." : "ให้ AI สะท้อนความรู้สึก"}
      </button>
      {state.error ? <p className="rounded-[8px] bg-white/70 p-3 text-sm text-red-700">{state.error}</p> : null}
      {state.reflection ? <ReflectionView content={state.reflection.content} /> : null}
      {state.reading ? <SaveReadingButton readingId={state.reading.id} /> : null}
    </div>
  );
}

function SaveReadingButton({ readingId }: { readingId: string }) {
  return (
    <a
      className="inline-flex w-fit rounded-full border border-midnight/15 bg-white/70 px-4 py-2 text-sm font-semibold text-midnight"
      href={`/saved?reading_id=${readingId}`}
    >
      เก็บคำอ่านนี้
    </a>
  );
}
