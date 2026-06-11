import { NextResponse } from "next/server";
import { generateStructuredReflection } from "@/lib/ai/gemini";
import { apiError } from "@/lib/api";
import { getReflectionContext, getUserOrThrow } from "@/lib/context";
import { checkSafety } from "@/lib/safety/check";
import { checkUsageLimit, recordUsage } from "@/lib/usage";
import { tarotSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const parsed = tarotSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });

    const { cardId, intention } = parsed.data;
    const { supabase, user } = await getUserOrThrow();
    const usage = await checkUsageLimit(user.id, "tarot");
    if (!usage.allowed) return NextResponse.json({ error: "วันนี้จั่วการ์ดสัญลักษณ์ครบ 3 ครั้งแล้ว ลองอยู่กับการ์ดใบล่าสุดก่อนนะ" }, { status: 429 });

    const safety = checkSafety(intention);
    if (safety.status === "block") {
      await supabase.from("safety_logs").insert({ user_id: user.id, input_text: intention, risk_type: safety.riskType, severity: safety.severity, action_taken: "blocked" });
      return NextResponse.json({ error: safety.message, safety }, { status: 400 });
    }
    if (safety.status === "caution") {
      await supabase.from("safety_logs").insert({ user_id: user.id, input_text: intention, risk_type: safety.riskType, severity: safety.severity, action_taken: "caution_reflective_only" });
    }

    const cardQuery = supabase.from("tarot_cards").select("*");
    const { data: cards, error: cardError } = cardId ? await cardQuery.eq("id", cardId).limit(1) : await cardQuery;
    if (cardError) throw cardError;
    const card = cards?.[Math.floor(Math.random() * cards.length)];
    if (!card) return NextResponse.json({ error: "ยังไม่มี symbolic cards ในฐานข้อมูล กรุณารัน migration seed ก่อน" }, { status: 400 });

    const context = await getReflectionContext(user.id);
    const { content, modelUsed } = await generateStructuredReflection({
      task: "tarot",
      userContext: { ...context, card, safety },
      prompt: `ผู้ใช้จั่วการ์ด ${card.name} (${card.archetype}) ความตั้งใจ: ${intention || "เปิดรับสิ่งที่ใจต้องเห็น"} สร้าง reflection ที่ไม่ใช่คำทำนาย`,
    });

    const { data: reading, error } = await supabase
      .from("readings")
      .insert({ user_id: user.id, type: "tarot", title: card.name, content, model_used: modelUsed, safety_status: safety.status })
      .select("*")
      .single();
    if (error) throw error;

    const { data: draw, error: drawError } = await supabase
      .from("tarot_draws")
      .insert({ user_id: user.id, card_id: card.id, intention, reading_id: reading.id })
      .select("*")
      .single();
    if (drawError) throw drawError;
    await recordUsage(user.id, "tarot", { reading_id: reading.id, card_id: card.id });
    return NextResponse.json({ reading, draw, card });
  } catch (error) {
    return apiError(error);
  }
}
