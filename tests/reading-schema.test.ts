import { describe, expect, it } from "vitest";
import { readingGenerateSchema, readingResponseSchema } from "../lib/ai/reading-schema";

describe("readingGenerateSchema", () => {
  it("accepts valid tarot input", () => {
    const result = readingGenerateSchema.safeParse({
      mode: "tarot",
      category: "love",
      input: {
        question: "ความสัมพันธ์นี้กำลังบอกอะไรฉัน",
        mood: "ลังเล",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = readingGenerateSchema.safeParse({
      mode: "relationship_mirror",
      category: "love",
      input: {
        emotional_state: "กังวล",
      },
    });

    expect(result.success).toBe(false);
  });

  it("accepts name and number modes without optional questions", () => {
    const numerology = readingGenerateSchema.safeParse({
      mode: "numerology",
      category: "self",
      input: { birth_date: "1992-04-18" },
    });
    const nameAnalysis = readingGenerateSchema.safeParse({
      mode: "name_analysis",
      category: "self",
      input: { name: "ศาลาเปา ลูมินิส" },
    });
    const thaiTaksa = readingGenerateSchema.safeParse({
      mode: "thai_taksa",
      category: "self",
      input: { name: "ปาวลูมินิส" },
    });

    expect(numerology.success).toBe(true);
    expect(nameAnalysis.success).toBe(true);
    expect(thaiTaksa.success).toBe(true);
  });

  it("accepts a mock structured AI reading output", () => {
    const result = readingResponseSchema.safeParse({
      title: "ไพ่สะท้อนใจ",
      opening: "คำอ่านนี้เป็นเพียงกระจกหนึ่งบาน ไม่ใช่คำตัดสินอนาคตแบบตายตัว",
      symbolicMessage: "สัญลักษณ์นี้อาจสะท้อนว่าคุณกำลังต้องการพื้นที่หายใจมากขึ้น",
      emotionalReflection: "คุณอาจกำลังรู้สึกทั้งหวังและกลัวในเวลาเดียวกัน",
      psychologicalLens: "คำถามนี้อาจเกี่ยวกับความต้องการความมั่นคงและการยืนยันคุณค่า",
      gentleAdvice: "ลองค่อย ๆ แยกสิ่งที่รู้จริงออกจากสิ่งที่ใจกำลังกังวล",
      reflectionQuestions: ["ถ้าคุณยังมีสิทธิ์เลือก คุณอยากดูแลตัวเองอย่างไร"],
      microAction: "เขียนหนึ่งประโยคว่า วันนี้ฉันต้องการความมั่นคงจากอะไร",
      closing: "คุณยังเป็นคนถือสิทธิ์ในการเลือกชีวิตของตัวเอง",
      safetyNote: "ใช้คำอ่านนี้เพื่อการสะท้อนใจ ไม่ใช่คำแนะนำเฉพาะทาง",
      modeDetails: {
        mainSymbol: "The Lantern",
        numberPattern: "",
        spaceObservation: "",
        decisionFrame: "",
      },
    });

    expect(result.success).toBe(true);
  });
});
