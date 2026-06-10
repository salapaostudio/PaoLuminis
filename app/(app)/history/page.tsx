import { Card, ReflectionView } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatThaiDate } from "@/lib/utils";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: readings } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">History</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">ประวัติคำสะท้อน</h1>
      </div>
      <div className="grid gap-4">
        {readings?.map((reading) => (
          <Card key={reading.id}>
            <p className="text-sm font-semibold text-gold">{reading.type} · {formatThaiDate(reading.created_at)}</p>
            <h2 className="mt-1 text-xl font-semibold text-midnight">{reading.title ?? "Reflection"}</h2>
            <div className="mt-4">
              <ReflectionView content={reading.content as Record<string, unknown>} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
