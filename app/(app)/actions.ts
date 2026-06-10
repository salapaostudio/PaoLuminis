"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { journalSchema, saveInsightSchema } from "@/lib/validation";

export async function saveInsight(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = saveInsightSchema.safeParse({
    reading_id: formData.get("reading_id"),
    label: formData.get("label"),
    note: formData.get("note"),
  });
  if (!parsed.success) redirect("/saved?message=ไม่สามารถบันทึก insight นี้ได้");

  const { data: reading } = await supabase.from("readings").select("id").eq("id", parsed.data.reading_id).eq("user_id", user.id).single();
  if (!reading) redirect("/saved?message=ไม่พบ insight ที่เป็นของคุณ");

  const { error } = await supabase.from("saved_insights").insert({
    user_id: user.id,
    reading_id: parsed.data.reading_id,
    label: parsed.data.label || "แสงที่อยากเก็บไว้",
    note: parsed.data.note || null,
  });
  if (error) redirect(`/saved?message=${encodeURIComponent(error.message)}`);
  revalidatePath("/saved");
  redirect("/saved?message=บันทึก insight แล้ว");
}

export async function createJournal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = journalSchema.safeParse({
    prompt: formData.get("prompt"),
    mood: formData.get("mood"),
    body: formData.get("body"),
  });
  if (!parsed.success) redirect(`/journal?message=${encodeURIComponent(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง")}`);

  const { error } = await supabase.from("journals").insert({
    user_id: user.id,
    prompt: parsed.data.prompt || null,
    mood: parsed.data.mood || null,
    body: parsed.data.body,
  });
  if (error) redirect(`/journal?message=${encodeURIComponent(error.message)}`);
  revalidatePath("/journal");
  redirect("/journal?message=บันทึก journal แล้ว");
}
