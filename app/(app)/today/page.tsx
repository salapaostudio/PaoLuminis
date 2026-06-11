import { redirect } from "next/navigation";
import Link from "next/link";
import { DailyLightPanel } from "@/components/ai-panels";
import { Card, ReflectionView } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { formatThaiDate } from "@/lib/utils";

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("onboarding_completed,nickname").eq("id", user.id).maybeSingle();
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data: daily } = await supabase
    .from("readings")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", "daily_light")
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-gold">{formatThaiDate(new Date())}</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">แสงวันนี้ของ{profile.nickname ?? "คุณ"}</h1>
      </div>
      <Card>
        {daily ? (
          <div className="grid gap-4">
            <ReflectionView content={daily.content as Record<string, unknown>} />
            <Link className="w-fit rounded-full border border-midnight/15 bg-white/70 px-4 py-2 text-sm font-semibold text-midnight" href={`/saved?reading_id=${daily.id}`}>
              บันทึก insight นี้
            </Link>
          </div>
        ) : (
          <DailyLightPanel />
        )}
      </Card>
    </div>
  );
}
