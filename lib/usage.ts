import { createClient } from "@/lib/supabase/server";

const limits: Record<string, number> = {
  daily_light: 1,
  ask_ai: 3,
  journal_reflection: 1,
  tarot: 3,
};

export async function checkUsageLimit(userId: string, eventType: keyof typeof limits) {
  const supabase = await createClient();
  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .gte("created_at", since.toISOString());

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
