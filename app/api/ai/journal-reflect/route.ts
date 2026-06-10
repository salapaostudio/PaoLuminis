import { NextResponse } from "next/server";
import { generateStructuredReflection } from "@/lib/ai/gemini";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkSafety } from "@/lib/safety/check";
import { checkUsageLimit, recordUsage } from "@/lib/usage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { journalId?: string; body?: string };
    const journalBody = String(body.body ?? "").trim();
    const { supabase, user } = await getUserOrThrow();
    const usage = await checkUsageLimit(user.id, "journal_reflection");
    if (!usage.allowed) return NextResponse.json({ error: "วันนี้ใช้ AI สะท้อน journal ครบแล้ว ลองกลับมาใหม่พรุ่งนี้นะ" }, { status: 429 });

    const safety = checkSafety(journalBody);
    if (safety.status === "block") {
      await supabase.from("safety_logs").insert({ user_id: user.id, input_text: journalBody, risk_type: safety.riskType, severity: safety.severity, action_taken: "blocked" });
      return NextResponse.json({ error: safety.message, safety }, { status: 400 });
    }

    const context = await getReflectionContext(user.id);
    const { content, modelUsed } = await generateStructuredReflection({
      task: "journal_reflection",
      userContext: { ...context, safety },
      prompt: `สะท้อน journal นี้อย่างอ่อนโยนและไม่วินิจฉัย:\n${journalBody}`,
    });

    const { data, error } = await supabase
      .from("journal_reflections")
      .insert({ user_id: user.id, journal_id: body.journalId, content, model_used: modelUsed })
      .select("*")
      .single();
    if (error) throw error;
    await recordUsage(user.id, "journal_reflection", { reflection_id: data.id, journal_id: body.journalId });
    return NextResponse.json({ reflection: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
