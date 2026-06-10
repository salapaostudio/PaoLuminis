"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveInsight(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const readingId = String(formData.get("reading_id") ?? "");
  if (!readingId) return;

  await supabase.from("saved_insights").insert({
    user_id: user.id,
    reading_id: readingId,
    label: String(formData.get("label") ?? "แสงที่อยากเก็บไว้"),
    note: String(formData.get("note") ?? "") || null,
  });
  revalidatePath("/saved");
}

export async function createJournal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("journals").insert({
    user_id: user.id,
    prompt: String(formData.get("prompt") ?? "") || null,
    mood: String(formData.get("mood") ?? "") || null,
    body: String(formData.get("body") ?? "").trim(),
  });
  if (error) redirect(`/journal?message=${encodeURIComponent(error.message)}`);
  revalidatePath("/journal");
  redirect("/journal?message=บันทึก journal แล้ว");
}
