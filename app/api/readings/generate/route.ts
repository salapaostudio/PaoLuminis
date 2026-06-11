import { NextResponse } from "next/server";
import { generateReadingResponse } from "@/lib/ai/gemini";
import { assessReadingSafety } from "@/lib/ai/safety-rules";
import { apiError } from "@/lib/api";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkUsageLimit, recordUsage } from "@/lib/usage";
import { readingCategoryLabel, readingGenerateSchema } from "@/lib/ai/reading-schema";
import { readingModeMap } from "@/lib/ai/reading-modes";

function summarizeInput(input: Record<string, string>) {
  return Object.entries(input)
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function flattenInputText(input: Record<string, string>) {
  return Object.values(input)
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const parsed = readingGenerateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
    }

    const { mode, category, input } = parsed.data;
    const { supabase, user } = await getUserOrThrow();
    const modeConfig = readingModeMap[mode];

    const safety = assessReadingSafety(`${mode}\n${category}\n${flattenInputText(input)}`);
    if (safety.status === "block") {
      await supabase.from("safety_logs").insert({
        user_id: user.id,
        input_text: flattenInputText(input),
        risk_type: safety.riskType,
        severity: safety.severity,
        action_taken: "blocked",
      });
      return NextResponse.json({ error: safety.message, safety }, { status: 400 });
    }

    if (safety.status === "caution") {
      await supabase.from("safety_logs").insert({
        user_id: user.id,
        input_text: flattenInputText(input),
        risk_type: safety.riskType,
        severity: safety.severity,
        action_taken: "caution_reflective_only",
      });
    }

    const usageType = mode === "daily_light" ? "daily_light" : "ask_ai";
    const usage = await checkUsageLimit(user.id, usageType);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: usageType === "daily_light" ? "วันนี้คุณรับแสงประจำวันแล้ว กลับมาใหม่พรุ่งนี้นะ" : "วันนี้คุณใช้โหมดอ่านใจครบแล้ว ลองพักใจแล้วกลับมาใหม่พรุ่งนี้นะ" },
        { status: 429 }
      );
    }

    const context = await getReflectionContext(user.id);
    const questionText = summarizeInput(input);

    const { data: savedQuestion, error: questionError } = await supabase
      .from("questions")
      .insert({
        user_id: user.id,
        category,
        question_text: `${modeConfig.labelTh}\n${readingCategoryLabel(category)}\n${questionText}`,
      })
      .select("*")
      .single();
    if (questionError) throw questionError;

    const { content, modelUsed } = await generateReadingResponse({
      mode,
      category,
      userInput: input,
      userProfile: context.profile,
      recentContext: context,
    });

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({
        user_id: user.id,
        question_id: savedQuestion.id,
        type: mode,
        title: `${modeConfig.labelTh} · ${readingCategoryLabel(category)}`,
        content,
        model_used: modelUsed,
        safety_status: safety.status,
      })
      .select("*")
      .single();
    if (error) throw error;

    await recordUsage(user.id, usageType, { reading_id: reading.id, question_id: savedQuestion.id, mode, category });

    return NextResponse.json({ reading, question: savedQuestion, mode, category });
  } catch (error) {
    return apiError(error);
  }
}
