export const readingTypeLabels: Record<string, string> = {
  daily_light: "แสงประจำวัน",
  ask_ai: "ถาม Luminis",
  tarot: "การ์ดสัญลักษณ์",
  journal_reflection: "สะท้อนบันทึกใจ",
};

export const askCategoryLabels: Record<string, string> = {
  love: "ความรัก",
  career: "งาน",
  money: "เงิน",
  self: "ตัวเอง",
  decision: "การตัดสินใจ",
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
