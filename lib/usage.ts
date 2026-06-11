import { createClient } from "@/lib/supabase/server";
import { getTimeZoneDayRange } from "@/lib/timezone";

const limits: Record<string, number> = {
  daily_light: 1,
  ask_ai: 3,
  journal_reflection: 1,
  tarot: 3,
};

export const appTimeZone = process.env.APP_TIMEZONE ?? "Asia/Bangkok";

export async function checkUsageLimit(userId: string, eventType: keyof typeof limits) {
  const supabase = await createClient();
  const { start, end } = getTimeZoneDayRange(new Date(), appTimeZone);

  const { count, error } = await supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) throw error;

  const used = count ?? 0;
  return {
    allowed: used < limits[eventType],
    used,
    limit: limits[eventType],
  };
}

export async function recordUsage(userId: string, eventType: keyof typeof limits, metadata: Record<string, unknown> = {}) {
  const supabase = await createClient();
  const { error } = await supabase.from("usage_events").insert({ user_id: userId, event_type: eventType, metadata });
  if (error) throw error;
}
