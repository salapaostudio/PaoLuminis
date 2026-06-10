import { NextResponse } from "next/server";
import { generateStructuredReflection } from "@/lib/ai/gemini";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkSafety } from "@/lib/safety/check";
import { checkUsageLimit, recordUsage } from "@/lib/usage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { category?: string; question?: string };
    const question = String(body.question ?? "").trim();
    const category = String(body.category ?? "self");
    const { supabase, user } = await getUserOrThrow();

    const safety = checkSafety(`${category}\n${question}`);
    if (safety.status === "block") {
      await supabase.from("safety_logs").insert({
        user_id: user.id,
        input_text: question,
        risk_type: safety.riskType,
        severity: safety.severity,
        action_taken: "blocked",
      });
      return NextResponse.json({ error: safety.message, safety }, { status: 400 });
    }

    const usage = await checkUsageLimit(user.id, "ask_ai");
    if (!usage.allowed) return NextResponse.json({ error: "วันนี้ใช้ Ask AI ครบ 3 ครั้งแล้ว ลองพักใจแล้วกลับมาใหม่พรุ่งนี้นะ" }, { status: 429 });

    const { data: savedQuestion, error: questionError } = await supabase
      .from("questions")
      .insert({ user_id: user.id, category, question_text: question })
      .select("*")
      .single();
    if (questionError) throw questionError;

    const context = await getReflectionContext(user.id);
    const { content, modelUsed } = await generateStructuredReflection({
      task: "ask_ai",
      userContext: { ...context, safety },
      prompt: `หมวด: ${category}\nคำถาม: ${question}\nตอบแบบสะท้อนใจ ไม่ทำนาย ไม่ให้คำแนะนำเฉพาะทาง`,
    });

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        question_id: savedQuestion.id,
        type: "ask_ai",
        title: `Ask AI: ${category}`,
        content,
        model_used: modelUsed,
        safety_status: safety.status,
      })
      .select("*")
      .single();
    if (error) throw error;
    await recordUsage(user.id, "ask_ai", { reading_id: reading.id, question_id: savedQuestion.id });
    return NextResponse.json({ reading, question: savedQuestion });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
