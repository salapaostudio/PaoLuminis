import { z } from "zod";
import { readingCategoryIds, readingModeIds, readingModeMap, type ReadingCategory, type ReadingModeId } from "@/lib/ai/reading-modes";

const inputValueSchema = z.string().trim().max(4000);
const requiredFieldLabels: Record<string, string> = {
  question: "คำถาม",
  mood: "อารมณ์",
  intention: "ความตั้งใจ",
  birth_date: "วันเกิด",
  birth_time: "เวลาเกิด",
  name: "ชื่อ",
  nickname: "ชื่อเล่น",
  phone_number: "เบอร์โทร",
  usage_context: "บริบทการใช้งาน",
  room_type: "พื้นที่",
  space_description: "รายละเอียดพื้นที่",
  situation: "สถานการณ์",
  options: "ทางเลือก",
  decision_a: "ทางเลือก A",
  decision_b: "ทางเลือก B",
  context: "บริบท",
  relationship_status: "สถานะความสัมพันธ์",
  emotional_state: "ความรู้สึกตอนนี้",
  current_role: "บทบาทงานตอนนี้",
  money_pattern: "พฤติกรรมเรื่องเงิน",
};

export const readingGenerateSchema = z
  .object({
    mode: z.enum(readingModeIds),
    category: z.enum(readingCategoryIds),
    input: z.record(inputValueSchema).default({}),
  })
  .superRefine((data, ctx) => {
    const mode = data.mode;
    const requiredFieldsByMode: Record<ReadingModeId, string[]> = {
      daily_light: [],
      tarot: ["question"],
      oracle: ["question"],
      astrology: ["birth_date", "question"],
      numerology: ["birth_date", "question"],
      name_analysis: ["name", "question"],
      thai_taksa: ["name", "question"],
      lucky_phone: ["phone_number", "question"],
      feng_shui: ["room_type", "space_description", "question"],
      i_ching: ["situation", "question"],
      human_design: ["birth_date", "question"],
      decision_companion: ["decision_a", "decision_b", "question"],
      relationship_mirror: ["relationship_status", "question"],
      career_reflection: ["question"],
      money_reflection: ["question"],
    };

    for (const field of requiredFieldsByMode[mode]) {
      if (!data.input[field]?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["input", field],
          message: `กรุณาใส่${requiredFieldLabels[field] ?? field}`,
        });
      }
    }

    if (!readingModeMap[mode].allowedCategories.includes(data.category)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: "หมวดนี้ยังไม่รองรับสำหรับโหมดที่เลือก",
      });
    }
  });

const modeDetailsSchema = z
  .object({
    mainSymbol: z.string().trim().max(500).optional(),
    numberPattern: z.string().trim().max(500).optional(),
    spaceObservation: z.string().trim().max(500).optional(),
    decisionFrame: z.string().trim().max(500).optional(),
    theme: z.string().trim().max(500).optional(),
    caution: z.string().trim().max(500).optional(),
    practicalNote: z.string().trim().max(500).optional(),
  })
  .partial()
  .default({});

export const readingResponseSchema = z.object({
  title: z.string().trim().min(1).max(200),
  opening: z.string().trim().min(1),
  symbolicMessage: z.string().trim().min(1),
  emotionalReflection: z.string().trim().min(1),
  psychologicalLens: z.string().trim().min(1),
  gentleAdvice: z.string().trim().min(1),
  reflectionQuestions: z.array(z.string().trim().min(1).max(240)).min(1).max(3),
  microAction: z.string().trim().min(1),
  closing: z.string().trim().min(1),
  safetyNote: z.string().trim().min(1),
  modeDetails: modeDetailsSchema.optional().default({}),
});

export type ReadingGenerateInput = z.infer<typeof readingGenerateSchema>;
export type ReadingGenerateMode = ReadingGenerateInput["mode"];
export type ReadingGenerateCategory = ReadingGenerateInput["category"];
export type ReadingResponse = z.infer<typeof readingResponseSchema>;

export const readingResponseShape = {
  title: "string",
  opening: "string",
  symbolicMessage: "string",
  emotionalReflection: "string",
  psychologicalLens: "string",
  gentleAdvice: "string",
  reflectionQuestions: ["string"],
  microAction: "string",
  closing: "string",
  safetyNote: "string",
  modeDetails: {
    mainSymbol: "string",
    numberPattern: "string",
    spaceObservation: "string",
    decisionFrame: "string",
    theme: "string",
    caution: "string",
    practicalNote: "string",
  },
} as const;

export function readingCategoryLabel(category: ReadingCategory) {
  switch (category) {
    case "love":
      return "ความรัก";
    case "career":
      return "งาน";
    case "money":
      return "เงิน";
    case "family":
      return "ครอบครัว";
    case "self":
      return "ตัวเอง";
    case "decision":
      return "การตัดสินใจ";
    case "future":
      return "อนาคตใกล้ ๆ";
    case "space":
      return "พื้นที่";
    case "timing":
      return "จังหวะเวลา";
  }
}
