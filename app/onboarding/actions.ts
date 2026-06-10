"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema, zodErrorMessage } from "@/lib/validation";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = onboardingSchema.safeParse({
    nickname: formData.get("nickname"),
    birth_date: formData.get("birth_date"),
    birth_time: formData.get("birth_time"),
    main_intention: formData.get("main_intention"),
    current_mood: formData.get("current_mood"),
    current_life_question: formData.get("current_life_question"),
  });
  if (!parsed.success) redirect(`/onboarding?message=${encodeURIComponent(zodErrorMessage(parsed.error))}`);

  const mood = parsed.data.current_mood;
  const profile = {
    id: user.id,
    email: user.email,
    nickname: parsed.data.nickname,
    birth_date: parsed.data.birth_date,
    birth_time: parsed.data.birth_time || null,
    main_intention: parsed.data.main_intention,
    current_life_question: parsed.data.current_life_question,
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
