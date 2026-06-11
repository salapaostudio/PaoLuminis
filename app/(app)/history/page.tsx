import { Card, ReflectionView } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatThaiDate } from "@/lib/utils";
import { formatReadingTitle, readingTypeLabels } from "@/lib/labels";

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

  const groupedReadings = (readings ?? []).reduce<Record<string, typeof readings>>((groups, reading) => {
    const key = formatThaiDate(reading.created_at);
    groups[key] = [...(groups[key] ?? []), reading];
    return groups;
  }, {});

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">ประวัติ</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">ประวัติคำสะท้อน</h1>
      </div>
      <div className="grid gap-4">
        {readings && readings.length > 0 ? Object.entries(groupedReadings).map(([dateLabel, dateReadings]) => (
          <section key={dateLabel} className="grid gap-3">
            <h2 className="px-1 text-sm font-semibold text-midnight/60">{dateLabel}</h2>
            <div className="grid gap-4">
              {dateReadings?.map((reading) => (
                <Card key={reading.id}>
                  <p className="text-sm font-semibold text-gold">{readingTypeLabels[reading.type] ?? reading.type}</p>
                  <h3 className="mt-1 text-xl font-semibold text-midnight">{formatReadingTitle(reading.type, reading.title)}</h3>
                  <div className="mt-4">
                    <ReflectionView content={reading.content as Record<string, unknown>} />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )) : (
          <Card>
            <p className="text-sm leading-6 text-midnight/70">ยังไม่มีประวัติคำสะท้อน ลองเริ่มจากแสงวันนี้ หรือถาม Luminis ด้วยคำถามที่ใจอยากสำรวจ</p>
          </Card>
        )}
      </div>
    </div>
  );
}
