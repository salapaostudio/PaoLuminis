"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl) {
    redirect("/login?message=กรุณาตั้งค่า NEXT_PUBLIC_SITE_URL ก่อนเข้าสู่ระบบ");
  }
  return siteUrl;
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const siteUrl = getSiteUrl();

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

export async function signInWithGoogle() {
  const siteUrl = getSiteUrl();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?message=${encodeURIComponent("เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}`);
  }

  redirect(data.url);
}
