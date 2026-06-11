import { readingModeMap, type ReadingModeId } from "@/lib/ai/reading-modes";
import type { ToneProfileId } from "@/lib/ai/reading-style";

export const readingSafetyRules = {
  bannedTopics: [
    "death prediction",
    "accident prediction",
    "curse confirmation",
    "guaranteed illness",
    "pregnancy certainty",
    "gambling outcome",
    "stock decision",
    "crypto decision",
    "legal decision",
    "medical diagnosis",
    "self-harm",
    "harming others",
    "stalking",
    "controlling another person",
  ],
  repeatedQuestionGuidance:
    "ฉันสังเกตว่าคำถามนี้อาจวนกลับมาเพราะใจคุณยังไม่รู้สึกปลอดภัยพอ ไม่เป็นไรเลย แต่แทนที่จะถามคำตอบเดิมซ้ำ วันนี้เราลองถามอีกแบบไหมว่า ‘ฉันต้องการอะไรเพื่อรู้สึกมั่นคงขึ้น แม้ยังไม่มีคำตอบจากเขา’",
  crisisGuidance:
    "ถ้าเรื่องนี้เกี่ยวกับความปลอดภัยของคุณหรือมีความเสี่ยงเร่งด่วน กรุณาติดต่อคนที่ไว้ใจได้หรือบริการฉุกเฉินในพื้นที่ทันที ฉันจะไม่ให้คำอ่านเชิงจิตวิญญาณกับเรื่องที่เสี่ยงอันตราย",
} as const;

export function getModeSafetyNotes(modeId: ReadingModeId) {
  return readingModeMap[modeId].safetyNotes;
}

export function getToneSafetyCaution(toneProfile: ToneProfileId) {
  switch (toneProfile) {
    case "warm_mystic":
      return "อย่าใช้ความลึกลับมาปิดการตัดสินใจของผู้ใช้";
    case "grounded_reflective":
      return "อย่าแปลงการสะท้อนให้กลายเป็นคำสั่ง";
    case "poetic_spiritual":
      return "ความสวยของภาษาต้องไม่ทำให้เกิดความกลัว";
    case "direct_but_kind":
      return "ตรงได้ แต่ห้ามตัดสินแทนผู้ใช้";
    case "practical_calm":
      return "คำแนะนำต้องเรียบง่าย จับต้องได้ และไม่รับประกันผล";
  }
}

