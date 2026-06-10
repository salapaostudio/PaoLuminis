import { NextResponse } from "next/server";
import { generateStructuredReflection } from "@/lib/ai/gemini";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkUsageLimit, recordUsage } from "@/lib/usage";

export async function POST() {
  try {
    const { supabase, user } = await getUserOrThrow();
    const usage = await checkUsageLimit(user.id, "daily_light");
    if (!usage.allowed) return NextResponse.json({ error: "วันนี้คุณรับ Daily Light แล้ว กลับมาใหม่พรุ่งนี้นะ" }, { status: 429 });

    const context = await getReflectionContext(user.id);
    const { content, modelUsed } = await generateStructuredReflection({
      task: "daily_light",
      userContext: context,
      prompt: "สร้าง Daily Light รายวันหนึ่งชุดที่อบอุ่น ไม่ฟันธง และช่วยให้ผู้ใช้สะท้อนใจวันนี้",
    });

    const { data, error } = await supabase
      .from("readings")
      .insert({ user_id: user.id, type: "daily_light", title: "Daily Light", content, model_used: modelUsed, safety_status: "ok" })
      .select("*")
      .single();
    if (error) throw error;
    await recordUsage(user.id, "daily_light", { reading_id: data.id });
    return NextResponse.json({ reading: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
