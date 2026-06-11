import { readingModeMap, type ReadingModeId } from "@/lib/ai/reading-modes";
import type { ToneProfileId } from "@/lib/ai/reading-style";
import { checkSafety, type SafetyResult } from "@/lib/safety/check";

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

const readingBlockPatterns = [
  {
    riskType: "gambling_prediction",
    terms: ["พนัน", "แทงบอล", "บาคาร่า", "สล็อต", "หวย", "เลขเด็ด", "lottery", "gambling", "casino", "bet"],
    message:
      "ฉันไม่สามารถทำนายผลการพนัน หวย หรือเกมเสี่ยงโชคได้ เพราะอาจทำให้ตัดสินใจเสี่ยงเกินไปได้ หากอยากสะท้อนเรื่องเงินหรือความกังวล เราลองคุยแบบดูแลใจและไม่ชี้นำการเสี่ยงโชคแทนนะ",
  },
  {
    riskType: "deterministic_prediction",
    terms: ["ฟันธง", "แน่นอนใช่ไหม", "รับประกัน", "จะเกิดแน่ไหม", "ต้องเกิด", "guarantee", "100%"],
    message:
      "ฉันไม่สามารถฟันธงหรือรับประกันอนาคตแบบตายตัวได้ แต่ช่วยสะท้อนสิ่งที่คำถามนี้อาจกำลังบอกใจคุณ และชวนมองทางเลือกที่คุณยังถืออยู่ได้",
  },
  {
    riskType: "fear_based_spiritual",
    terms: ["ถูกสาป", "แก้กรรม", "ทำพิธีแล้วจะดี", "ดวงตกหนัก", "เคราะห์แรง", "curse removal"],
    message:
      "ฉันไม่อยากใช้ความกลัว คำสาป หรือเคราะห์กรรมมากดดันคุณ หากเรื่องนี้ทำให้ใจไม่ปลอดภัย เราสามารถเปลี่ยนเป็นการสะท้อนว่าอะไรทำให้คุณกังวล และก้าวเล็ก ๆ ที่ช่วยให้มั่นคงขึ้นคืออะไร",
  },
];

export function assessReadingSafety(input: string): SafetyResult {
  const base = checkSafety(input);
  if (base.status === "block") return base;

  const text = input.toLowerCase();
  const found = readingBlockPatterns.find((pattern) => pattern.terms.some((term) => text.includes(term.toLowerCase())));
  if (found) {
    return {
      status: "block",
      riskType: found.riskType,
      severity: "high",
      message: found.message,
    };
  }

  if (base.status === "caution" && ["fatalistic_prediction", "medical_legal_financial"].includes(base.riskType ?? "")) {
    return {
      ...base,
      status: "block",
      severity: base.severity ?? "medium",
      message:
        base.riskType === "medical_legal_financial"
          ? "หัวข้อนี้เกี่ยวกับคำแนะนำเฉพาะทางด้านแพทย์ กฎหมาย หรือการเงิน ฉันจึงไม่ควรให้คำตอบแทนผู้เชี่ยวชาญ หากต้องการ เราสามารถสะท้อนความรู้สึกและคำถามที่ควรเตรียมไปคุยกับผู้เชี่ยวชาญได้"
          : "ฉันไม่สามารถทำนายความตาย อุบัติเหตุ เคราะห์ร้าย หรือผลลัพธ์แบบตายตัวได้ แต่ช่วยสะท้อนความกังวลและสิ่งที่คุณควรดูแลอย่างอ่อนโยนได้",
    };
  }

  return base;
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
