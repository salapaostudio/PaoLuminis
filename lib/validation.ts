import { z } from "zod";

export const askSchema = z.object({
  category: z.enum(["love", "career", "money", "self", "decision", "timing"]),
  question: z.string().trim().min(3, "กรุณาใส่คำถามอย่างน้อย 3 ตัวอักษร").max(1200, "คำถามยาวเกินไป"),
});

export const tarotSchema = z.object({
  cardId: z.string().uuid().optional(),
  intention: z.string().trim().max(500, "ความตั้งใจยาวเกินไป").optional().default(""),
});

export const journalReflectSchema = z.object({
  journalId: z.string().uuid("ไม่พบ journal ที่ถูกต้อง"),
});

export const saveInsightSchema = z.object({
  reading_id: z.string().uuid("ไม่พบ insight ที่ถูกต้อง"),
  label: z.string().trim().max(80).optional(),
  note: z.string().trim().max(500).optional(),
});

export const journalSchema = z.object({
  prompt: z.string().trim().max(300).optional(),
  mood: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1, "กรุณาเขียน journal ก่อนบันทึก").max(5000, "journal ยาวเกินไป"),
});

export const onboardingSchema = z.object({
  nickname: z.string().trim().min(1, "กรุณาใส่ชื่อเล่น").max(80),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "วันเกิดไม่ถูกต้อง"),
  birth_time: z.string().regex(/^\d{2}:\d{2}$/, "เวลาเกิดไม่ถูกต้อง").optional().or(z.literal("")),
  main_intention: z.enum(["love", "career", "money", "self", "decision", "healing", "other"]),
  current_mood: z.string().trim().min(1, "กรุณาใส่อารมณ์ตอนนี้").max(160),
  current_life_question: z.string().trim().min(3, "กรุณาใส่คำถามชีวิตอย่างน้อย 3 ตัวอักษร").max(1200),
});

export function zodErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง";
}
