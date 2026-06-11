import Link from "next/link";
import { cn } from "@/lib/utils";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-midnight text-cream shadow-glow hover:-translate-y-0.5"
          : "border border-midnight/15 bg-white/50 text-midnight hover:bg-white"
      )}
    >
      {children}
    </Link>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[8px] border border-white/70 bg-white/70 p-5 shadow-glow backdrop-blur", className)}>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-midnight/80">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[8px] border border-midnight/10 bg-white/80 px-4 py-3 text-base text-midnight outline-none ring-gold/40 transition placeholder:text-midnight/35 focus:ring-4";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex w-full items-center justify-center rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-cream shadow-glow transition hover:-translate-y-0.5 sm:w-auto">
      {children}
    </button>
  );
}

export const reflectionLabels: Record<string, string> = {
  title: "ชื่อคำอ่าน",
  opening: "คำเปิดอย่างอ่อนโยน",
  gentle_opening: "คำเปิดอย่างอ่อนโยน",
  symbolicMessage: "ข้อความจากสัญลักษณ์",
  symbolic_insight: "สัญลักษณ์ที่สะท้อนใจ",
  emotionalReflection: "สิ่งที่ใจอาจกำลังรู้สึก",
  emotional_reflection: "ภาพสะท้อนอารมณ์",
  psychologicalLens: "มุมมองทางใจ",
  gentleAdvice: "คำแนะนำอย่างอ่อนโยน",
  reflectionQuestions: "คำถามสะท้อนใจ",
  microAction: "ก้าวเล็ก ๆ วันนี้",
  closing: "การย้ำเตือนท้ายคำอ่าน",
  safetyNote: "หมายเหตุด้านความปลอดภัย",
  journal_prompt: "คำถามบันทึกใจ",
  micro_action: "ก้าวเล็ก ๆ วันนี้",
  psychological_lens: "มุมมองทางใจ",
  grounded_action: "การลงมือแบบมั่นคง",
  gentle_disclaimer: "ข้อชวนระลึก",
  emotion_summary: "สรุปอารมณ์",
  recurring_theme: "ธีมที่วนกลับมา",
  hidden_need: "ความต้องการที่ซ่อนอยู่",
  gentle_reframe: "การมองใหม่อย่างอ่อนโยน",
  one_question: "หนึ่งคำถามกับตัวเอง",
  one_micro_action: "หนึ่งก้าวเล็ก ๆ",
  modeDetails: "รายละเอียดเชิงโหมด",
  mainSymbol: "สัญลักษณ์หลัก",
  numberPattern: "รูปแบบตัวเลข",
  spaceObservation: "ข้อสังเกตพื้นที่",
  decisionFrame: "กรอบการตัดสินใจ",
  theme: "ธีม",
  caution: "ข้อควรระวัง",
  practicalNote: "บันทึกเชิงปฏิบัติ",
};

export function ReflectionView({ content }: { content: Record<string, unknown> }) {
  const renderValue = (value: unknown) => {
    if (Array.isArray(value)) {
      return (
        <ul className="mt-2 grid gap-2">
          {value.map((item, index) => (
            <li key={index} className="rounded-[8px] bg-white/60 px-3 py-2 text-sm leading-6 text-midnight/75">
              {String(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) {
        return <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-midnight/55">ไม่มีรายละเอียดเพิ่มเติม</p>;
      }

      return (
        <div className="mt-2 grid gap-2">
          {entries.map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="rounded-[8px] bg-white/60 px-3 py-2">
              <p className="text-xs font-semibold text-midnight/55">{reflectionLabels[nestedKey] ?? nestedKey}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-midnight/75">{String(nestedValue)}</p>
            </div>
          ))}
        </div>
      );
    }

    return <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-midnight/75">{String(value)}</p>;
  };

  return (
    <div className="grid gap-3">
      {Object.entries(content)
        .filter(([key]) => key !== "title")
        .map(([key, value]) => (
        <div key={key} className="rounded-[8px] bg-cream/70 p-4">
          <h3 className="text-sm font-semibold text-midnight">{reflectionLabels[key] ?? key}</h3>
          {renderValue(value)}
        </div>
      ))}
    </div>
  );
}
