import { describe, expect, it } from "vitest";
import { getRenderableReadingSections, validateReadingForm } from "../lib/ai/reading-ui";

describe("reading form validation", () => {
  it("accepts numerology with only a birth date", () => {
    const result = validateReadingForm("numerology", { birth_date: "1992-04-18", question: "" });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("requires a full name for name analysis", () => {
    const missing = validateReadingForm("name_analysis", { name: "", nickname: "เปา", question: "" });
    const valid = validateReadingForm("name_analysis", { name: "ศาลาเปา ลูมินิส", nickname: "", question: "" });

    expect(missing.valid).toBe(false);
    expect(missing.errors[0]).toContain("ชื่อเต็ม");
    expect(valid.valid).toBe(true);
  });

  it("accepts thai taksa with only a name", () => {
    const result = validateReadingForm("thai_taksa", { name: "ปาวลูมินิส", birth_date: "", question: "" });

    expect(result.valid).toBe(true);
  });
});

describe("reading response display order", () => {
  it("returns all structured response sections in the expected order", () => {
    const sections = getRenderableReadingSections({
      title: "เลขศาสตร์ชีวิต",
      safetyNote: "ใช้เป็นกระจกสะท้อนใจเท่านั้น",
      closing: "คุณยังมีสิทธิ์เลือก",
      microAction: "เขียน 3 คำที่อยากพาตัวเองไปต่อ",
      reflectionQuestions: ["ตอนนี้ตัวเลขนี้ชวนให้ฉันเห็นอะไร"],
      gentleAdvice: "ลองเริ่มจากก้าวเล็ก ๆ",
      psychologicalLens: "คำถามนี้อาจเกี่ยวกับความต้องการความมั่นคง",
      emotionalReflection: "คุณอาจกำลังต้องการความชัดเจน",
      symbolicMessage: "รูปแบบตัวเลขอาจสะท้อนจังหวะของการกลับมาฟังใจ",
      opening: "คำอ่านนี้ไม่ได้บอกอนาคตแบบตายตัว",
      modeDetails: { numberPattern: "1 + 9 + 9 + 2" },
    }).map(([key]) => key);

    expect(sections).toEqual([
      "opening",
      "symbolicMessage",
      "emotionalReflection",
      "psychologicalLens",
      "gentleAdvice",
      "reflectionQuestions",
      "microAction",
      "closing",
      "safetyNote",
      "modeDetails",
    ]);
  });
});
