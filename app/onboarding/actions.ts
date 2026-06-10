"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const mood = String(formData.get("current_mood") ?? "").trim();
  const profile = {
    id: user.id,
    email: user.email,
    nickname: String(formData.get("nickname") ?? "").trim(),
    birth_date: String(formData.get("birth_date") ?? ""),
    birth_time: String(formData.get("birth_time") ?? "") || null,
    main_intention: String(formData.get("main_intention") ?? "self"),
    current_life_question: String(formData.get("current_life_question") ?? "").trim(),
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(profile);
  if (error) redirect(`/onboarding?message=${encodeURIComponent(error.message)}`);

  if (mood) {
    await supabase.from("mood_checkins").insert({ user_id: user.id, mood });
  }

  redirect("/today");
}
