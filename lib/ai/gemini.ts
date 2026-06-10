import { GoogleGenAI } from "@google/genai";
import { BRAND_SYSTEM_PROMPT, responseShapes, type ReflectionTask } from "@/lib/prompts/system";

type GenerateInput = {
  task: ReflectionTask;
  prompt: string;
  userContext?: Record<string, unknown>;
  model?: string;
};

const modelByTask: Record<ReflectionTask, string> = {
  daily_light: process.env.GEMINI_DAILY_MODEL ?? "gemini-2.5-flash-lite",
  ask_ai: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  tarot: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  journal_reflection: process.env.GEMINI_JOURNAL_MODEL ?? "gemini-2.5-flash",
};

export async function generateStructuredReflection({ task, prompt, userContext, model }: GenerateInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  const selectedModel = model ?? modelByTask[task];

  if (!apiKey) {
    return {
      content: fallbackContent(task, "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ระบบจึงใช้ข้อความตัวอย่างสำหรับการทดสอบ"),
      modelUsed: "fallback",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${BRAND_SYSTEM_PROMPT}

รูปแบบ JSON ที่ต้องตอบ:
${JSON.stringify(responseShapes[task])}

บริบทผู้ใช้:
${JSON.stringify(userContext ?? {})}

โจทย์:
${prompt}`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.75,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";
  return { content: parseJsonOrFallback(task, text), modelUsed: selectedModel };
}

function parseJsonOrFallback(task: ReflectionTask, text: string) {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const shape = responseShapes[task];
    return Object.fromEntries(
      Object.keys(shape).map((key) => [key, typeof parsed[key] === "string" ? parsed[key] : fallbackContent(task)[key]])
    );
  } catch {
    return fallbackContent(task);
  }
}

function fallbackContent(task: ReflectionTask, reason?: string): Record<string, string> {
  const base = reason ? `${reason} ` : "";

  if (task === "journal_reflection") {
    return {
      emotion_summary: `${base}ข้อความนี้อาจสะท้อนอารมณ์หลายชั้นที่กำลังขอพื้นที่รับฟัง`,
      recurring_theme: "ธีมที่เห็นคือความต้องการความชัดเจนและความเมตตาต่อตัวเอง",
      hidden_need: "อาจมีความต้องการพักใจและได้รับการยืนยันว่าความรู้สึกนี้สำคัญ",
      gentle_reframe: "ลองมองว่านี่ไม่ใช่ความอ่อนแอ แต่เป็นสัญญาณว่าคุณกำลังดูแลใจอย่างจริงจัง",
      one_question: "ลองถามตัวเองว่า วันนี้ฉันต้องการความอ่อนโยนแบบไหนมากที่สุด",
      one_micro_action: "เขียนหนึ่งประโยคที่อยากบอกตัวเองด้วยน้ำเสียงของเพื่อนที่ใจดี",
    };
  }

  return {
    gentle_opening: `${base}วันนี้ขอให้คุณเข้าหาตัวเองด้วยความนุ่มนวลก่อนคำตอบใด ๆ`,
    symbolic_insight: "แสงเล็ก ๆ อาจสะท้อนว่าคุณกำลังเห็นทางเลือกที่ละเอียดกว่าเดิม",
    emotional_reflection: "ความรู้สึกตอนนี้อาจไม่ได้ต้องการคำตัดสิน แต่อาจต้องการพื้นที่ให้หายใจ",
    psychological_lens: "เมื่อใจอยากได้คำตอบเร็ว ๆ การกลับมาดูคุณค่าและขอบเขตของตัวเองอาจช่วยให้ชัดขึ้น",
    grounded_action: "เลือกทำหนึ่งสิ่งเล็ก ๆ ที่ทำให้ร่างกายรู้สึกปลอดภัยขึ้นในวันนี้",
    journal_prompt: "ลองถามตัวเองว่า สิ่งใดกำลังเรียกร้องความซื่อสัตย์จากฉันอย่างอ่อนโยน",
    micro_action: "พักหายใจลึกสามครั้ง แล้วจดสิ่งที่ควบคุมได้หนึ่งอย่าง",
    gentle_disclaimer: "นี่คือพื้นที่สะท้อนใจ ไม่ใช่คำทำนายหรือคำแนะนำเฉพาะทาง",
  };
}
