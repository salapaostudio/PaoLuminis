import { JournalReflectButton } from "@/components/ai-panels";
import { Card, Field, inputClass, SubmitButton } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatThaiDate } from "@/lib/utils";
import { createJournal } from "../actions";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: journals } = await supabase
    .from("journals")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">บันทึกใจ</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">เขียนเพื่อได้ยินเสียงของตัวเอง</h1>
      </div>
      <Card>
        <form action={createJournal} className="grid gap-4">
          <Field label="guided prompt หรือเว้นว่างเพื่อ free writing">
            <input className={inputClass} name="prompt" placeholder="วันนี้ใจของฉันกำลังขออะไร..." />
          </Field>
          <Field label="อารมณ์">
            <input className={inputClass} name="mood" placeholder="สงบ, สับสน, เหนื่อย, มีหวัง..." />
          </Field>
          <Field label="บันทึก">
            <textarea className={inputClass} name="body" rows={7} required />
          </Field>
          <SubmitButton>บันทึกใจ</SubmitButton>
        </form>
        {params.message ? <p className="mt-4 rounded-[8px] bg-mist p-3 text-sm text-midnight/75">{params.message}</p> : null}
      </Card>
      <div className="grid gap-4">
        {journals && journals.length > 0 ? journals.map((journal) => (
          <Card key={journal.id}>
            <p className="text-sm font-semibold text-gold">{formatThaiDate(journal.created_at)}</p>
            {journal.prompt ? <p className="mt-2 text-sm text-midnight/60">{journal.prompt}</p> : null}
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-midnight/75">{journal.body}</p>
            <JournalReflectButton journalId={journal.id} />
          </Card>
        )) : (
          <Card>
            <p className="text-sm leading-6 text-midnight/70">ยังไม่มี journal แรก ลองเขียนสั้น ๆ ว่าวันนี้ใจของคุณกำลังถืออะไรอยู่ก็พอ</p>
          </Card>
        )}
      </div>
    </div>
  );
}
