import { redirect } from "next/navigation";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "./actions";

const intentions = [
  ["love", "ความรัก"],
  ["career", "งาน"],
  ["money", "เงิน"],
  ["self", "ตัวเอง"],
  ["decision", "การตัดสินใจ"],
  ["healing", "เยียวยา"],
  ["other", "อื่น ๆ"],
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <h1 className="text-3xl font-semibold text-midnight">เริ่มรู้จักแสงของคุณ</h1>
        <p className="mt-3 text-sm leading-6 text-midnight/70">ข้อมูลนี้ช่วยให้คำสะท้อนนุ่มนวลและเข้ากับบริบทชีวิตของคุณมากขึ้น</p>
        {params.message ? <p className="mt-4 rounded-[8px] bg-mist p-3 text-sm text-midnight/75">{params.message}</p> : null}
        <form action={completeOnboarding} className="mt-6 grid gap-4">
          <Field label="ชื่อเล่น">
            <input className={inputClass} name="nickname" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="วันเกิด">
              <input className={inputClass} name="birth_date" type="date" required />
            </Field>
            <Field label="เวลาเกิด (ไม่บังคับ)">
              <input className={inputClass} name="birth_time" type="time" />
            </Field>
          </div>
          <Field label="ความตั้งใจหลัก">
            <select className={inputClass} name="main_intention" defaultValue="self">
              {intentions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="อารมณ์ตอนนี้">
            <input className={inputClass} name="current_mood" placeholder="เช่น เหนื่อย แต่ยังมีหวัง" required />
          </Field>
          <Field label="คำถามชีวิตที่อยู่กับคุณตอนนี้">
            <textarea className={inputClass} name="current_life_question" rows={4} required />
          </Field>
          <SubmitButton>บันทึกและไป Daily Light</SubmitButton>
        </form>
      </Card>
    </main>
  );
}
