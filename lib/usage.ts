import { createClient } from "@/lib/supabase/server";

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

export function getTimeZoneDayRange(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  const start = zonedDateTimeToUtc(year, month, day, timeZone);
  const endDate = new Date(Date.UTC(year, month - 1, day + 1));
  const end = zonedDateTimeToUtc(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, endDate.getUTCDate(), timeZone);

  return { start, end };
}

function zonedDateTimeToUtc(year: number, month: number, day: number, timeZone: string) {
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  let utc = localAsUtc;

  for (let index = 0; index < 3; index += 1) {
    utc = localAsUtc - getTimeZoneOffsetMs(new Date(utc), timeZone);
  }

  return new Date(utc);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return zonedAsUtc - date.getTime();
}
