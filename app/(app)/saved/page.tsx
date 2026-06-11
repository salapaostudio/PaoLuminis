import { Card, Field, inputClass, ReflectionView, SubmitButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatThaiDate } from "@/lib/utils";
import { saveInsight } from "../actions";

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ reading_id?: string; message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: saved } = await supabase
    .from("saved_insights")
    .select("*, readings(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">ที่บันทึกไว้</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">แสงที่อยากเก็บไว้กลับมาอ่าน</h1>
      </div>
      {params.message ? <p className="rounded-[8px] bg-mist p-3 text-sm text-midnight/75">{params.message}</p> : null}
      {params.reading_id ? (
        <Card>
          <form action={saveInsight} className="grid gap-4">
            <input type="hidden" name="reading_id" value={params.reading_id} />
            <Field label="ชื่อคำสะท้อน">
              <input className={inputClass} name="label" defaultValue="แสงที่อยากเก็บไว้" />
            </Field>
            <Field label="โน้ตส่วนตัว">
              <textarea className={inputClass} name="note" rows={3} />
            </Field>
            <SubmitButton>บันทึกคำสะท้อน</SubmitButton>
          </form>
        </Card>
      ) : null}
      <div className="grid gap-4">
        {saved && saved.length > 0 ? saved.map((item) => (
          <Card key={item.id}>
            <p className="text-sm font-semibold text-gold">{item.label ?? "แสงที่บันทึกไว้"} · {formatThaiDate(item.created_at)}</p>
            {item.note ? <p className="mt-2 text-sm text-midnight/60">{item.note}</p> : null}
            {item.readings?.content ? <div className="mt-4"><ReflectionView content={item.readings.content as Record<string, unknown>} /></div> : null}
          </Card>
        )) : (
          <Card>
            <p className="text-sm leading-6 text-midnight/70">ยังไม่มีคำสะท้อนที่บันทึกไว้ เมื่อเจอข้อความที่อยากกลับมาอ่าน ให้กดบันทึกจากแสงวันนี้ ถาม Luminis หรือการ์ดสัญลักษณ์ได้เลย</p>
          </Card>
        )}
      </div>
    </div>
  );
}
