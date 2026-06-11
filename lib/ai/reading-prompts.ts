import { readingModeMap, type ReadingCategory, type ReadingModeId } from "@/lib/ai/reading-modes";
import { readingResponseShape } from "@/lib/ai/reading-schema";
import { readingSafetyRules } from "@/lib/ai/safety-rules";
import { toneProfiles, type ToneProfileId } from "@/lib/ai/reading-style";

type BuildReadingPromptInput = {
  mode: ReadingModeId;
  category: ReadingCategory;
  toneProfile: ToneProfileId;
  userInput: Record<string, unknown>;
  userProfile?: Record<string, unknown> | null;
  recentContext?: Record<string, unknown> | null;
};

function formatObjectLines(value: Record<string, unknown> | null | undefined) {
  if (!value) return "ไม่มี";
  return Object.entries(value)
    .map(([key, item]) => `- ${key}: ${typeof item === "string" ? item : JSON.stringify(item)}`)
    .join("\n");
}

function normalizeQuestion(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isRepeatedQuestion(category: ReadingCategory, userInput: Record<string, unknown>, recentContext?: Record<string, unknown> | null) {
  const question = typeof userInput.question === "string" ? userInput.question.trim() : "";
  if (!question || !recentContext) return false;

  const recentQuestions = Array.isArray(recentContext.recentQuestions) ? recentContext.recentQuestions : [];
  const normalizedQuestion = normalizeQuestion(question);

  return recentQuestions.some((item) => {
    const recentText = typeof item?.question_text === "string" ? item.question_text : "";
    const recentCategory = typeof item?.category === "string" ? item.category : "";
    return normalizeQuestion(recentText) === normalizedQuestion || (recentCategory === category && normalizedQuestion.length > 16);
  });
}

export function buildReadingPrompt({ mode, category, toneProfile, userInput, userProfile, recentContext }: BuildReadingPromptInput) {
  const modeConfig = readingModeMap[mode];
  const tone = toneProfiles[toneProfile];
  const repeated = isRepeatedQuestion(category, userInput, recentContext);
  const repeatedNote = repeated ? `\n${readingSafetyRules.repeatedQuestionGuidance}` : "";

  return `
คุณคือ PaoLuminis, AI Spiritual Reflection Companion
คุณใช้สัญลักษณ์เป็นกระจกเพื่อการสะท้อนตัวเอง ไม่ใช่คำทำนายแบบตายตัว
คุณเป็น Thai-first, อบอุ่น, นุ่มนวล, มีเหตุผล และคืนอำนาจการเลือกให้ผู้ใช้เสมอ
ห้ามใช้ภาษาที่ทำให้กลัว ห้ามฟันธงอนาคต ห้ามวินิจฉัย ห้ามรับประกันผลลัพธ์${repeatedNote}

โหมดคำอ่าน:
- id: ${modeConfig.id}
- label_th: ${modeConfig.labelTh}
- purpose: ${modeConfig.descriptionTh}
- sections: ${modeConfig.responseSections.join(" / ")}
- safety_notes: ${modeConfig.safetyNotes.join(" / ")}

หัวข้อหลัก: ${category}

โทนเสียง:
- label_th: ${tone.labelTh}
- preferred_vocabulary: ${tone.preferredVocabulary.join(", ")}
- banned_vocabulary: ${tone.bannedVocabulary.join(", ")}
- sentence_length: ${tone.sentenceLength}
- emotional_intensity: ${tone.emotionalIntensity}
- style_guidance:
${tone.exampleStyleGuidance.map((item) => `  - ${item}`).join("\n")}
- safety_caution: ${tone.safetyCaution}
- additional_safety: ${readingSafetyRules.crisisGuidance}

ข้อมูลผู้ใช้:
${formatObjectLines(userProfile ?? null)}

บริบทล่าสุด:
${formatObjectLines(recentContext ?? null)}

อินพุตผู้ใช้:
${formatObjectLines(userInput)}

ข้อกำหนดคำตอบ:
1. ใช้ภาษาไทยเป็นหลัก
2. เริ่มด้วย Opening Line ที่อ่อนโยนและเคารพอิสระของผู้ใช้
3. ตามด้วย Symbolic Message, Emotional Reflection, Psychological Lens, Gentle Advice, Reflection Questions, Micro Action และ Closing Reassurance
4. ให้มีคำถามสะท้อนใจ 1-3 ข้อใน array reflectionQuestions
5. หากโหมดต้องการ ให้ใส่ modeDetails ที่สัมพันธ์กับโหมดนั้นอย่างน้อย 1 ช่อง
6. ห้ามพูดว่าผลลัพธ์จะเกิดขึ้นแน่นอน
7. ห้ามใช้คำขู่ คำสาป หรือการขายแบบกลัว
8. ห้ามให้คำแนะนำทางการแพทย์ กฎหมาย การเงิน หรือการลงทุนแบบเฉพาะเจาะจง
9. ปิดท้ายด้วยการคืนสิทธิ์การเลือกให้ผู้ใช้

ส่วนที่ต้องกรอกเป็น JSON เท่านั้น ตามโครงสร้างนี้:
${JSON.stringify(readingResponseShape)}
`.trim();
}
