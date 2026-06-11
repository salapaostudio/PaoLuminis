export const toneProfileIds = ["warm_mystic", "grounded_reflective", "poetic_spiritual", "direct_but_kind", "practical_calm"] as const;

export type ToneProfileId = (typeof toneProfileIds)[number];

export type ToneProfile = {
  id: ToneProfileId;
  labelTh: string;
  preferredVocabulary: string[];
  bannedVocabulary: string[];
  sentenceLength: string;
  emotionalIntensity: string;
  exampleStyleGuidance: string[];
  safetyCaution: string;
};

export const toneProfiles: Record<ToneProfileId, ToneProfile> = {
  warm_mystic: {
    id: "warm_mystic",
    labelTh: "ละมุน ลึกลับ อบอุ่น",
    preferredVocabulary: ["อาจสะท้อนว่า", "จังหวะนี้", "แสงเล็ก ๆ", "ลองถามตัวเองว่า", "นี่เป็นเพียงกระจกหนึ่งบาน"],
    bannedVocabulary: ["ต้อง", "ฟันธง", "แน่นอน", "คงหนีไม่พ้น", "คำสาป", "ดวงตก"],
    sentenceLength: "สั้นถึงกลาง",
    emotionalIntensity: "นุ่ม อุ่น ลึก",
    exampleStyleGuidance: ["เริ่มด้วยประโยคที่ค่อย ๆ เปิดใจ", "ใช้ภาพเชิงสัญลักษณ์แบบเบา ๆ", "จบด้วยการคืนอำนาจการเลือกให้ผู้ใช้"],
    safetyCaution: "หลีกเลี่ยงคำที่ทำให้ผู้ใช้รู้สึกถูกตัดสินหรือถูกผูกมัดกับอนาคต",
  },
  grounded_reflective: {
    id: "grounded_reflective",
    labelTh: "นุ่มลึก มีเหตุผล",
    preferredVocabulary: ["อาจสะท้อนว่า", "ประเด็นสำคัญ", "ลองสังเกต", "สิ่งที่ใจต้องการ", "ขอบเขต"],
    bannedVocabulary: ["ต้องรีบ", "ชัวร์", "รับประกัน", "ผิดแน่", "ต้องเป็นแบบนี้เท่านั้น"],
    sentenceLength: "สั้นกระชับ",
    emotionalIntensity: "สงบ ชัดเจน",
    exampleStyleGuidance: ["เชื่อมความรู้สึกกับพฤติกรรม", "ใช้คำที่ช่วยเห็นแพทเทิร์น", "ไม่เร่งสรุปแทนผู้ใช้"],
    safetyCaution: "อย่าทำให้คำอ่านดูเหมือนคำสั่งหรือข้อสรุปสุดท้าย",
  },
  poetic_spiritual: {
    id: "poetic_spiritual",
    labelTh: "ภาษาสวย เชิงสัญลักษณ์",
    preferredVocabulary: ["พลังงานของช่วงนี้", "สัญลักษณ์นี้สะท้อนว่า", "จังหวะนี้อาจชวนให้", "ม่านหมอก", "ประตู"],
    bannedVocabulary: ["แน่นอน", "เคราะห์ร้าย", "คำทำนายตายตัว", "ต้องแก้กรรม", "ห้าม"],
    sentenceLength: "กลาง",
    emotionalIntensity: "ละเมียด ลึก",
    exampleStyleGuidance: ["ใช้ภาพเปรียบเชิงธรรมชาติ", "คงความอ่อนโยนและไม่ดราม่า", "ไม่ให้สัญญาอนาคต"],
    safetyCaution: "ความสวยของภาษาไม่ควรกลบความชัดเจนเรื่องความไม่แน่นอน",
  },
  direct_but_kind: {
    id: "direct_but_kind",
    labelTh: "ตรง แต่ไม่ตัดสิน",
    preferredVocabulary: ["ข้อสังเกต", "ถ้าพูดตรง ๆ", "ลองดูว่า", "สิ่งที่ยากคือ", "คุณยังเลือกได้"],
    bannedVocabulary: ["คุณผิด", "ต้องทำแบบนี้", "ห้าม", "ไปต่อไม่ได้", "แน่นอนว่าเขาจะ"],
    sentenceLength: "สั้น",
    emotionalIntensity: "นิ่ง ชัด",
    exampleStyleGuidance: ["พูดตรงแต่ไม่กดทับ", "เน้นสิ่งที่ผู้ใช้ควบคุมได้", "หลีกเลี่ยงการวิเคราะห์คนอื่นแบบฟันธง"],
    safetyCaution: "ตรงได้ แต่ห้ามกลายเป็นคำตัดสินหรือการบังคับทางอารมณ์",
  },
  practical_calm: {
    id: "practical_calm",
    labelTh: "สงบ ใช้ได้จริง",
    preferredVocabulary: ["ลองเริ่มจาก", "สิ่งเล็ก ๆ", "ปรับทีละจุด", "สังเกตสภาพแวดล้อม", "ทำได้ทันที"],
    bannedVocabulary: ["พิธีใหญ่", "เปลี่ยนทั้งหมด", "ต้องทุ่มเงิน", "ถ้าไม่ทำจะ", "รับประกันผล"],
    sentenceLength: "สั้นถึงกลาง",
    emotionalIntensity: "นิ่ง มั่นคง",
    exampleStyleGuidance: ["โยงคำอ่านกับการกระทำจริง", "ทำให้คำแนะนำจับต้องได้", "เน้นความง่ายและความต่อเนื่อง"],
    safetyCaution: "ความเป็นประโยชน์ต้องไม่ล้ำเส้นไปเป็นคำสั่งหรือคำรับประกัน",
  },
};

