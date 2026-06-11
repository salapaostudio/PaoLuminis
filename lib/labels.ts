export const readingTypeLabels: Record<string, string> = {
  daily_light: "แสงนำทางวันนี้",
  ask_ai: "ถามแสงนำทาง",
  tarot: "ไพ่สะท้อนใจ",
  oracle: "Oracle Message",
  astrology: "โหราศาสตร์สะท้อนตัวตน",
  numerology: "เลขศาสตร์ชีวิต",
  name_analysis: "วิเคราะห์ชื่อเชิงความหมาย",
  thai_taksa: "ทักษาปกรณ์",
  lucky_phone: "วิเคราะห์เบอร์เชิงพลังงาน",
  feng_shui: "ฮวงจุ้ยเชิงบรรยากาศ",
  i_ching: "I Ching Reflection",
  human_design: "Human Design Reflection",
  decision_companion: "เพื่อนช่วยตัดสินใจ",
  relationship_mirror: "กระจกความสัมพันธ์",
  career_reflection: "เข็มทิศเรื่องงาน",
  money_reflection: "ความสัมพันธ์กับเงิน",
  journal_reflection: "สะท้อนบันทึกใจ",
};

export const askCategoryLabels: Record<string, string> = {
  love: "ความรัก",
  career: "งาน",
  money: "เงิน",
  family: "ครอบครัว",
  self: "ตัวเอง",
  decision: "การตัดสินใจ",
  future: "อนาคตใกล้ ๆ",
  space: "พื้นที่",
  timing: "จังหวะเวลา",
};

export function formatReadingTitle(type: string, title: string | null | undefined) {
  if (!title) return "คำสะท้อน";

  if (type === "ask_ai") {
    const match = title.match(/^ถาม Luminis:\s*(.+)$/i);
    if (match) {
      const category = match[1].trim();
      return `ถาม Luminis: ${askCategoryLabels[category] ?? category}`;
    }
  }

  return title;
}
