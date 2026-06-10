"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!email) redirect("/login?message=กรุณากรอกอีเมล");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/today`,
    },
  });

  if (error) redirect(`/login?message=${encodeURIComponent(error.message)}`);
  redirect("/login?message=ส่งลิงก์เข้าสู่ระบบไปที่อีเมลแล้ว");
}
