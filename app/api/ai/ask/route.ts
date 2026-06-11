import { NextResponse } from "next/server";
import { generateStructuredReflection } from "@/lib/ai/gemini";
import { apiError } from "@/lib/api";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkSafety } from "@/lib/safety/check";
import { checkUsageLimit, recordUsage } from "@/lib/usage";
import { askSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = askSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });

    const { category, question } = parsed.data;
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
    if (safety.status === "caution") {
      await supabase.from("safety_logs").insert({
        user_id: user.id,
        input_text: question,
        risk_type: safety.riskType,
        severity: safety.severity,
        action_taken: "caution_reflective_only",
      });
    }

    const usage = await checkUsageLimit(user.id, "ask_ai");
    if (!usage.allowed) return NextResponse.json({ error: "วันนี้ถาม Luminis ครบ 3 ครั้งแล้ว ลองพักใจแล้วกลับมาใหม่พรุ่งนี้นะ" }, { status: 429 });

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
        title: `ถาม Luminis: ${category}`,
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
    return apiError(error);
  }
}
