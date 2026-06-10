export type SafetyStatus = "ok" | "caution" | "block";

export type SafetyResult = {
  status: SafetyStatus;
  riskType?: string;
  severity?: "low" | "medium" | "high";
  message?: string;
};

const patterns = [
  {
    riskType: "self_harm",
    severity: "high" as const,
    status: "block" as const,
    terms: ["ฆ่าตัวตาย", "อยากตาย", "ทำร้ายตัวเอง", "suicide", "kill myself", "self harm"],
    message:
      "ขอบคุณที่บอกความรู้สึกนี้นะ ตอนนี้ความปลอดภัยของคุณสำคัญที่สุด กรุณาติดต่อคนที่ไว้ใจได้หรือบริการฉุกเฉินในพื้นที่ทันที หากอยู่ในไทยโทร 1323 สายด่วนสุขภาพจิต หรือ 1669 ในเหตุฉุกเฉิน ฉันอยู่ตรงนี้เพื่อช่วยสะท้อนใจ แต่จะไม่ทำนายหรือให้คำตอบเชิงจิตวิญญาณกับเรื่องเสี่ยงนี้",
  },
  {
    riskType: "violence",
    severity: "high" as const,
    status: "block" as const,
    terms: ["ทำร้าย", "ฆ่าเขา", "วางยา", "hurt them", "kill him", "kill her"],
    message:
      "ฉันไม่สามารถช่วยวางแผนทำร้ายใครได้ หากตอนนี้อารมณ์รุนแรงมาก ลองถอยออกจากสถานการณ์และติดต่อคนที่ไว้ใจได้หรือบริการฉุกเฉินเพื่อความปลอดภัยก่อนนะ",
  },
  {
    riskType: "medical_legal_financial",
    severity: "medium" as const,
    status: "caution" as const,
    terms: ["วินิจฉัย", "ยาอะไร", "ตั้งครรภ์", "ฟ้อง", "สัญญา", "ลงทุน", "หุ้นตัวไหน", "crypto", "pregnant", "diagnose", "lawsuit"],
  },
  {
    riskType: "abuse_or_manipulation",
    severity: "medium" as const,
    status: "caution" as const,
    terms: ["ควบคุมเขา", "ทำให้เขากลับมา", "สะกดจิต", "บังคับ", "manipulate", "curse"],
  },
  {
    riskType: "fatalistic_prediction",
    severity: "medium" as const,
    status: "caution" as const,
    terms: ["จะตายไหม", "คำสาป", "เคราะห์ร้าย", "ดวงตก", "ตายวันไหน", "definitely happen"],
  },
];

export function checkSafety(input: string): SafetyResult {
  const text = input.toLowerCase();
  const found = patterns.find((pattern) => pattern.terms.some((term) => text.includes(term.toLowerCase())));

  if (!found) return { status: "ok" };

  return {
    status: found.status,
    riskType: found.riskType,
    severity: found.severity,
    message:
      found.message ??
      "หัวข้อนี้อาจต้องใช้ความระมัดระวัง ฉันจะช่วยสะท้อนใจในเชิงทั่วไปเท่านั้น และแนะนำให้ปรึกษาผู้เชี่ยวชาญที่เกี่ยวข้องสำหรับคำแนะนำเฉพาะทาง",
  };
}
