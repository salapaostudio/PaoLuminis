import { NextResponse } from "next/server";
import { generateStructuredReflection } from "@/lib/ai/gemini";
import { apiError } from "@/lib/api";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkSafety } from "@/lib/safety/check";
import { checkUsageLimit, recordUsage } from "@/lib/usage";
import { journalReflectSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = journalReflectSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });

    const { journalId } = parsed.data;
    const { supabase, user } = await getUserOrThrow();
    const usage = await checkUsageLimit(user.id, "journal_reflection");
    if (!usage.allowed) return NextResponse.json({ error: "วันนี้ใช้ AI สะท้อน journal ครบแล้ว ลองกลับมาใหม่พรุ่งนี้นะ" }, { status: 429 });

    const { data: journal, error: journalError } = await supabase
      .from("journals")
      .select("id,body,prompt,mood,created_at")
      .eq("id", journalId)
      .eq("user_id", user.id)
      .single();
    if (journalError || !journal) return NextResponse.json({ error: "ไม่พบ journal ที่เป็นของคุณ" }, { status: 404 });

    const journalBody = String(journal.body ?? "").trim();

    const safety = checkSafety(journalBody);
    if (safety.status === "block") {
      await supabase.from("safety_logs").insert({ user_id: user.id, input_text: journalBody, risk_type: safety.riskType, severity: safety.severity, action_taken: "blocked" });
      return NextResponse.json({ error: safety.message, safety }, { status: 400 });
    }
    if (safety.status === "caution") {
      await supabase.from("safety_logs").insert({ user_id: user.id, input_text: journalBody, risk_type: safety.riskType, severity: safety.severity, action_taken: "caution_reflective_only" });
    }

    const context = await getReflectionContext(user.id);
    const { content, modelUsed } = await generateStructuredReflection({
      task: "journal_reflection",
      userContext: { ...context, safety },
      prompt: `สะท้อน journal นี้อย่างอ่อนโยนและไม่วินิจฉัย:\nPrompt: ${journal.prompt ?? "-"}\nMood: ${journal.mood ?? "-"}\nBody:\n${journalBody}`,
    });

    const { data, error } = await supabase
      .from("journal_reflections")
      .insert({ user_id: user.id, journal_id: journal.id, content, model_used: modelUsed })
      .select("*")
      .single();
    if (error) throw error;

    const { data: reading, error: readingError } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        type: "journal_reflection",
        title: "สะท้อนบันทึกใจ",
        content,
        model_used: modelUsed,
        safety_status: safety.status,
      })
      .select("*")
      .single();
    if (readingError) throw readingError;

    await recordUsage(user.id, "journal_reflection", { reflection_id: data.id, reading_id: reading.id, journal_id: journal.id });
    return NextResponse.json({ reflection: data, reading });
  } catch (error) {
    return apiError(error);
  }
}
