import { createClient } from "@/lib/supabase/server";

export async function getUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function getReflectionContext(userId: string) {
  const supabase = await createClient();
  const [{ data: profile }, { data: moods }, { data: readings }, { data: journals }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("mood_checkins").select("mood,note,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("readings").select("type,title,content,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
    supabase.from("journals").select("prompt,mood,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(3),
  ]);

  return {
    profile,
    latestMood: moods?.[0] ?? null,
    recentReadings: readings ?? [],
    recentJournals: journals ?? [],
  };
}
