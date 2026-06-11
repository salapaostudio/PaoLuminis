import { GoogleGenAI } from "@google/genai";
import { buildReadingPrompt } from "@/lib/ai/reading-prompts";
import { readingModeMap, type ReadingCategory, type ReadingModeId } from "@/lib/ai/reading-modes";
import { readingResponseSchema, type ReadingResponse } from "@/lib/ai/reading-schema";
import { BRAND_SYSTEM_PROMPT, responseShapes, type ReflectionTask } from "@/lib/prompts/system";

type GenerateInput = {
  task: ReflectionTask;
  prompt: string;
  userContext?: Record<string, unknown>;
  model?: string;
};

type GenerateReadingInput = {
  mode: ReadingModeId;
  category: ReadingCategory;
  userInput: Record<string, unknown>;
  userProfile?: Record<string, unknown> | null;
  recentContext?: Record<string, unknown> | null;
  model?: string;
};

const modelByTask: Record<ReflectionTask, string> = {
  daily_light: process.env.GEMINI_DAILY_MODEL ?? "gemini-2.5-flash-lite",
  ask_ai: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  tarot: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  journal_reflection: process.env.GEMINI_JOURNAL_MODEL ?? "gemini-2.5-flash",
};

const modelByReadingMode: Record<ReadingModeId, string> = {
  daily_light: process.env.GEMINI_DAILY_MODEL ?? "gemini-2.5-flash-lite",
  tarot: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  oracle: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  astrology: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  numerology: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  name_analysis: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  thai_taksa: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  lucky_phone: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  feng_shui: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  i_ching: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  human_design: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  decision_companion: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  relationship_mirror: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  career_reflection: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
  money_reflection: process.env.GEMINI_ASK_MODEL ?? "gemini-2.5-flash",
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

  try {
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
  } catch {
    return {
      content: fallbackContent(task, "ระบบ AI ขัดข้องชั่วคราว จึงใช้ข้อความสะท้อนใจแบบปลอดภัยแทน"),
      modelUsed: "fallback-error",
    };
  }
}

export async function generateReadingResponse({ mode, category, userInput, userProfile, recentContext, model }: GenerateReadingInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  const selectedModel = model ?? modelByReadingMode[mode];
  const toneProfile = readingModeMap[mode].toneProfile;
  const prompt = buildReadingPrompt({ mode, category, toneProfile, userInput, userProfile, recentContext });

  if (!apiKey) {
    return {
      content: fallbackReading(mode, "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ระบบจึงใช้ข้อความตัวอย่างสำหรับการทดสอบ"),
      modelUsed: "fallback",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    return { content: parseReadingJsonOrFallback(mode, text), modelUsed: selectedModel };
  } catch {
    return {
      content: fallbackReading(mode, "ระบบ AI ขัดข้องชั่วคราว จึงใช้ข้อความสะท้อนใจแบบปลอดภัยแทน"),
      modelUsed: "fallback-error",
    };
  }
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

function parseReadingJsonOrFallback(mode: ReadingModeId, text: string): ReadingResponse {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const merged = {
      ...fallbackReading(mode),
      ...parsed,
      reflectionQuestions: Array.isArray(parsed.reflectionQuestions)
        ? parsed.reflectionQuestions.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 3)
        : fallbackReading(mode).reflectionQuestions,
      modeDetails:
        parsed.modeDetails && typeof parsed.modeDetails === "object" && !Array.isArray(parsed.modeDetails)
          ? { ...fallbackReading(mode).modeDetails, ...(parsed.modeDetails as Record<string, unknown>) }
          : fallbackReading(mode).modeDetails,
    };

    const validated = readingResponseSchema.safeParse(merged);
    if (validated.success) return validated.data;
  } catch {
    // fall through to fallback
  }

  return fallbackReading(mode);
}

function fallbackReading(mode: ReadingModeId, reason?: string): ReadingResponse {
  const base = reason ? `${reason} ` : "";
  const modeLabel = readingModeMap[mode].labelTh;

  switch (mode) {
    case "daily_light":
      return {
        title: modeLabel,
        opening: `${base}คำอ่านนี้อยากช่วยให้คุณเริ่มวันด้วยความนุ่มนวล ไม่ใช่ความกดดัน`,
        symbolicMessage: "พลังงานของวันนี้อาจกำลังชวนให้คุณมองเห็นสิ่งเล็ก ๆ ที่ดูแลใจได้",
        emotionalReflection: "คุณอาจกำลังต้องการความมั่นคงมากกว่าคำตอบที่เร็ว",
        psychologicalLens: "เมื่อใจอยากรีบสรุป การกลับมาดูจังหวะของตัวเองจะช่วยให้เห็นชัดขึ้น",
        gentleAdvice: "ลองเริ่มจากหนึ่งสิ่งเล็ก ๆ ที่ทำให้เช้านี้เบาลงสักนิด",
        reflectionQuestions: ["ตอนนี้ใจคุณกำลังต้องการอะไรที่สุด", "ถ้าคุณไม่เร่งตัวเอง วันนี้จะต่างไปอย่างไร"],
        microAction: "หายใจลึก 3 รอบ แล้วเลือกทำ 1 อย่างที่ช่วยให้รู้สึกอุ่นขึ้น",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน สุดท้ายคุณยังเป็นคนถือสิทธิ์ในการเลือกวันของตัวเอง",
        safetyNote: "ใช้เพื่อการสะท้อนใจ ไม่ใช่คำทำนายหรือคำสั่ง",
        modeDetails: {},
      };
    case "tarot":
    case "oracle":
      return {
        title: modeLabel,
        opening: `${base}คำอ่านนี้ไม่ได้บอกให้คุณหยุดเลือกเอง แต่อยากช่วยให้คุณฟังสิ่งที่ใจพยายามบอก`,
        symbolicMessage: "สัญลักษณ์ตรงหน้านี้อาจกำลังสะท้อนจังหวะที่คุณต้องการความอ่อนโยนกับตัวเอง",
        emotionalReflection: "ลึก ๆ แล้ว คุณอาจไม่ได้ต้องการคำตอบทันที แต่ต้องการความชัดเจนที่ไม่กดทับ",
        psychologicalLens: "อาจมีทั้งความหวัง ความกลัว และความอยากมั่นใจปนกันอยู่ในคำถามนี้",
        gentleAdvice: "ลองค่อย ๆ ดูว่าความจริงที่คุณรู้แล้วมีอะไรบ้าง โดยไม่ต้องเร่งสรุป",
        reflectionQuestions: ["ถ้าคุณไม่กลัวการเลือกผิด คุณจะมองเรื่องนี้ต่างไปอย่างไร", "สิ่งไหนในใจคุณยังไม่ได้รับฟัง"],
        microAction: "เขียน 3 บรรทัดว่าอะไรคือสิ่งที่คุณรู้แน่แล้วในตอนนี้",
        closing: "คำอ่านนี้เป็นเพียงกระจกหนึ่งบาน คุณยังมีสิทธิ์เลือกทางเดินของตัวเองเสมอ",
        safetyNote: "อย่าใช้คำอ่านนี้แทนการตัดสินใจทั้งหมดของชีวิต",
        modeDetails: { mainSymbol: "สัญลักษณ์เด่นกำลังขอให้คุณชะลอและฟังตัวเอง" },
      };
    case "astrology":
      return {
        title: modeLabel,
        opening: `${base}นี่คือการสะท้อนเชิงสัญลักษณ์จากข้อมูลเกิด ไม่ใช่แผนผังดวงแบบละเอียดครบถ้วน`,
        symbolicMessage: "ธีมพลังงานช่วงนี้อาจกำลังพาคุณกลับมาดูรูปแบบเดิมที่อยากเติบโตต่อ",
        emotionalReflection: "คุณอาจกำลังสลับกันระหว่างอยากขยับกับอยากพัก",
        psychologicalLens: "สิ่งที่เด่นขึ้นมาอาจเป็นเรื่องการฟังจังหวะตัวเองมากกว่าพยายามเอาชนะทุกอย่าง",
        gentleAdvice: "ลองเลือกหนึ่งพื้นที่ในชีวิตที่ไม่ต้องเร่งสรุปทันที",
        reflectionQuestions: ["คุณกำลังแบกความคาดหวังจากใครอยู่หรือเปล่า", "จังหวะไหนที่ทำให้คุณหายใจได้มากขึ้น"],
        microAction: "จด 1 จุดแข็งและ 1 จุดที่อยากดูแลในสัปดาห์นี้",
        closing: "คำอ่านนี้เป็นเพียงกระจกหนึ่งบาน จังหวะสุดท้ายยังอยู่ในมือคุณ",
        safetyNote: "ใช้เป็นการสะท้อนตัวตน ไม่ใช่คำทำนายดวงแบบตายตัว",
        modeDetails: { theme: "ธีมหลักคือการจัดสมดุลระหว่างแรงผลักและการพัก" },
      };
    case "numerology":
      return {
        title: modeLabel,
        opening: `${base}เลขในที่นี้ใช้เพื่อสะท้อนรูปแบบชีวิต ไม่ได้รับประกันโชคหรือผลลัพธ์`,
        symbolicMessage: "รูปแบบตัวเลขอาจกำลังชวนให้คุณเห็นนิสัยประจำที่พาไปสู่เส้นทางบางแบบ",
        emotionalReflection: "คุณอาจอยากรู้ว่าชีวิตกำลังพาไปทางไหน แต่ส่วนลึกกว่านั้นอาจอยากรู้ว่าตัวเองเป็นใคร",
        psychologicalLens: "อาจมีความต้องการความมั่นใจและความหมายซ่อนอยู่ในคำถามนี้",
        gentleAdvice: "ลองเอาความหมายของตัวเลขมาใช้เป็นภาษาสะท้อนใจ ไม่ใช่คำสั่ง",
        reflectionQuestions: ["รูปแบบไหนในชีวิตที่คุณเห็นซ้ำบ่อย", "อะไรคือจุดแข็งที่คุณมองข้ามไป"],
        microAction: "เขียน 1 ประโยคว่า ‘ฉันอยากใช้พลังนี้แบบไหนในชีวิตจริง’",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังเลือกวิธีเดินของตัวเองได้",
        safetyNote: "ไม่รับประกันความสำเร็จ ความรัก หรือความมั่งคั่ง",
        modeDetails: { numberPattern: "เลขที่เด่นอาจสะท้อนนิสัยการคิดและการตัดสินใจ" },
      };
    case "name_analysis":
    case "thai_taksa":
      return {
        title: modeLabel,
        opening: `${base}การอ่านชื่อนี้เป็นการสะท้อนความหมายเชิงตัวตน ไม่ใช่การตัดสินชะตา`,
        symbolicMessage: "ชื่อของคุณอาจกำลังพาให้คนรอบตัวรับรู้บางอย่างก่อนที่คุณจะพูดเสียอีก",
        emotionalReflection: "คุณอาจอยากรู้ว่าโลกมองคุณแบบไหน และคุณอยากเป็นแบบนั้นจริงหรือไม่",
        psychologicalLens: "คำถามนี้อาจเกี่ยวกับตัวตน ภาพจำ และการอยากได้รับการมองเห็นอย่างถูกต้อง",
        gentleAdvice: "ลองดูว่าชื่อนี้ช่วยส่งเสริมหรือกดทับความเป็นคุณตรงไหน",
        reflectionQuestions: ["ชื่อของคุณทำให้คุณรู้สึกอย่างไร", "คุณอยากให้คนอื่นเห็นอะไรจากตัวตนคุณมากที่สุด"],
        microAction: "เขียน 1 คำที่อยากให้ชื่อของคุณชวนคนนึกถึง",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน ไม่จำเป็นต้องใช้มันตัดสินทั้งชีวิต",
        safetyNote: "ไม่บอกว่าชื่อดีหรือร้ายแบบเด็ดขาด",
        modeDetails: { theme: "ชื่ออาจสะท้อนภาพจำและบุคลิกที่ค่อย ๆ ก่อตัว" },
      };
    case "lucky_phone":
      return {
        title: modeLabel,
        opening: `${base}ตัวเลขของเบอร์นี้ใช้เพื่อสะท้อนบรรยากาศการสื่อสารและความรู้สึกปลอดภัย`,
        symbolicMessage: "รูปแบบตัวเลขอาจสะท้อนจังหวะการสื่อสาร ความต่อเนื่อง และความสบายใจ",
        emotionalReflection: "คุณอาจอยากได้เบอร์ที่ทำให้รู้สึกมั่นใจมากขึ้น",
        psychologicalLens: "บางครั้งความอยากเปลี่ยนเบอร์ก็สะท้อนความอยากเปลี่ยนความรู้สึกของตัวเองด้วย",
        gentleAdvice: "ลองมองว่าเบอร์นี้ช่วยชีวิตจริงอย่างไร มากกว่าความคาดหวังที่วางไว้กับมัน",
        reflectionQuestions: ["เบอร์นี้ทำให้คุณรู้สึกอย่างไรจริง ๆ", "คุณอยากให้การสื่อสารของตัวเองมีคุณภาพแบบไหน"],
        microAction: "จดว่าเบอร์นี้ใช้ในบริบทไหน แล้วสิ่งที่ต้องการจากมันคืออะไร",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน ผลลัพธ์จริงยังขึ้นอยู่กับการเลือกและการลงมือของคุณ",
        safetyNote: "ไม่รับประกันเงิน งาน หรือความรักจากตัวเลข",
        modeDetails: { numberPattern: "เน้นความหมายเชิงพลังงาน ไม่ใช่การทำนายโชค" },
      };
    case "feng_shui":
      return {
        title: modeLabel,
        opening: `${base}พื้นที่ที่อยู่รอบตัวคุณอาจกำลังคุยกับใจมากกว่าที่คิด`,
        symbolicMessage: "บรรยากาศของพื้นที่นี้อาจสะท้อนระดับการหายใจ ความล้า และพื้นที่พักของคุณ",
        emotionalReflection: "บางทีความอึดอัดที่รู้สึกไม่ได้มาจากตัวคุณอย่างเดียว แต่อาจมาจากสภาพแวดล้อมด้วย",
        psychologicalLens: "เมื่อพื้นที่รกหรืออึมครึม ใจมักเหนื่อยง่ายขึ้นโดยไม่รู้ตัว",
        gentleAdvice: "ลองปรับแสง ลม ความรก หรือมุมพักให้เบาขึ้นหนึ่งจุด",
        reflectionQuestions: ["จุดไหนในพื้นที่นี้ทำให้คุณหายใจยากที่สุด", "ถ้าปรับได้เพียง 1 อย่าง วันนี้จะเลือกอะไร"],
        microAction: "เก็บของ 1 มุม หรือเปิดหน้าต่าง 10 นาที",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังเป็นคนออกแบบพื้นที่ของตัวเองได้",
        safetyNote: "เน้นสิ่งที่จับต้องได้ เช่น แสง ลม ความรก และความสบาย",
        modeDetails: { spaceObservation: "พื้นที่อาจกำลังขอความเรียบง่ายและการไหลเวียนมากขึ้น" },
      };
    case "i_ching":
      return {
        title: modeLabel,
        opening: `${base}จังหวะนี้อาจไม่ได้ต้องการคำตอบเร็ว แต่อาจต้องการความนิ่งพอที่จะเห็นการเปลี่ยน`,
        symbolicMessage: "สถานการณ์ตรงหน้านี้อาจกำลังอยู่ระหว่างการเปลี่ยนทิศทางทีละน้อย",
        emotionalReflection: "คุณอาจต้องการทั้งความแน่ใจและความสงบในเวลาเดียวกัน",
        psychologicalLens: "การรอที่มีสติบางครั้งสำคัญพอ ๆ กับการขยับ",
        gentleAdvice: "ลองดูว่าตอนนี้ควรรอ ปรับ หรือวางมือจากอะไรสักพัก",
        reflectionQuestions: ["อะไรคือสิ่งที่ยังไม่ควรเร่ง", "ถ้าฟังจังหวะมากกว่าความกลัว คุณจะเห็นอะไร"],
        microAction: "หยุด 1 นาทีแล้วถามตัวเองว่า ‘ตอนนี้ฉันควรขยับหรือควรพัก’",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังเป็นผู้ตัดสินใจสุดท้ายของชีวิตตัวเอง",
        safetyNote: "ใช้น้ำเสียงสงบ ไม่ดึงให้กลัวการเปลี่ยนแปลง",
        modeDetails: { decisionFrame: "สถานการณ์กำลังขอให้คุณมองทั้งจังหวะและขอบเขต" },
      };
    case "human_design":
      return {
        title: modeLabel,
        opening: `${base}นี่คือการสะท้อนรูปแบบพลังงาน ไม่ใช่การอ้างว่าคำนวณชาร์ตเต็มครบถ้วน`,
        symbolicMessage: "คุณอาจมีวิธีใช้พลังงานของตัวเองที่แตกต่างจากคนอื่นอย่างมีนัยสำคัญ",
        emotionalReflection: "บางครั้งความเหนื่อยไม่ได้แปลว่าคุณไม่เก่ง แต่อาจแปลว่าคุณใช้จังหวะไม่ตรงกับตัวเอง",
        psychologicalLens: "การรู้จังหวะตัดสินใจของตัวเองอาจช่วยลดการฝืนและความล้า",
        gentleAdvice: "ลองสังเกตว่าอะไรทำให้คุณค่อย ๆ กลับมาเป็นตัวเองได้ง่ายที่สุด",
        reflectionQuestions: ["คุณเหนื่อยกับรูปแบบไหนซ้ำ ๆ", "ถ้าใช้จังหวะของตัวเองมากขึ้น วันจะเบาลงอย่างไร"],
        microAction: "จด 1 อย่างที่อยากหยุดฝืนในสัปดาห์นี้",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังมีสิทธิ์เลือกวิธีใช้พลังงานของตัวเอง",
        safetyNote: "ไม่ควรอ้างว่าคำนวณชาร์ตจริงหากไม่มีข้อมูลครบ",
        modeDetails: { theme: "ให้ความสำคัญกับจังหวะการตัดสินใจและการพัก" },
      };
    case "decision_companion":
      return {
        title: modeLabel,
        opening: `${base}คำอ่านนี้ไม่ได้เลือกแทนคุณ แต่อยากช่วยให้เห็นสิ่งที่ใจลังเลอยู่`,
        symbolicMessage: "ทางเลือกทั้งสองอาจสะท้อนความต้องการที่ต่างกัน ไม่ใช่แค่ผลลัพธ์ที่ต่างกัน",
        emotionalReflection: "ลึก ๆ แล้วคุณอาจกลัวพลาด มากพอ ๆ กับที่อยากเดินต่อ",
        psychologicalLens: "ความลังเลมักมาจากความต้องการความปลอดภัยและความมั่นใจที่ยังไม่พอ",
        gentleAdvice: "ลองเทียบว่าแต่ละทางเลือกดูแลคุณค่าหรือขอบเขตของคุณได้มากน้อยแค่ไหน",
        reflectionQuestions: ["ถ้าไม่มีใครตัดสิน คุณจะเอนเอียงไปทางไหน", "สิ่งที่คุณกลัวเสียที่สุดคืออะไร"],
        microAction: "เขียนข้อดีข้อเสียของแต่ละทางเลือกแบบสั้น ๆ 3 ข้อ",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังเป็นคนถือกุญแจตัดสินใจอยู่เสมอ",
        safetyNote: "ช่วยให้เห็นความชัด แต่ไม่ตัดสินแทนคุณ",
        modeDetails: { decisionFrame: "มองทั้งความต้องการ ความเสี่ยง และพลังงานที่ต้องใช้" },
      };
    case "relationship_mirror":
      return {
        title: modeLabel,
        opening: `${base}คำอ่านนี้อยากช่วยให้คุณเห็นความสัมพันธ์เป็นกระจก ไม่ใช่บทพิพากษา`,
        symbolicMessage: "ความสัมพันธ์นี้อาจสะท้อนเรื่องขอบเขต ความคาดหวัง หรือความอยากได้รับการยืนยัน",
        emotionalReflection: "คุณอาจกำลังหาความมั่นคงมากกว่าคำตอบโรแมนติก",
        psychologicalLens: "แพตเทิร์นการผูกพันอาจกำลังมีบทบาทมากกว่าที่เห็นตอนแรก",
        gentleAdvice: "ลองเช็กว่าคุณกำลังมองหาความรัก หรือกำลังมองหาความปลอดภัยทางใจ",
        reflectionQuestions: ["คุณต้องการอะไรจากความสัมพันธ์นี้จริง ๆ", "อะไรคือสิ่งที่คุณไม่อยากเสียตัวเองไปเพื่อมัน"],
        microAction: "เขียน 1 ประโยคว่า ‘ขอบเขตที่ฉันอยากรักษาคือ…’",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังมีสิทธิ์เลือกวิธีรักและดูแลตัวเอง",
        safetyNote: "ไม่สนับสนุนการควบคุม บงการ หรือไล่ตามอีกฝ่าย",
        modeDetails: { theme: "ความต้องการความปลอดภัยและการได้รับการเห็นอาจเด่นขึ้น" },
      };
    case "career_reflection":
      return {
        title: modeLabel,
        opening: `${base}คำอ่านนี้อยากช่วยให้คุณเห็นทิศงานอย่างสงบ ไม่ใช่ดันให้ตัดสินใจเร็ว`,
        symbolicMessage: "งานช่วงนี้อาจกำลังชวนให้คุณกลับมาดูคุณค่าและพลังที่ใช้จริง",
        emotionalReflection: "คุณอาจเหนื่อยเพราะอยากไปต่อ แต่ก็ไม่อยากฝืนเกินไป",
        psychologicalLens: "ความกดดันเรื่องผลงานหรือการเติบโตอาจกำลังกินพื้นที่ในใจ",
        gentleAdvice: "ลองเลือก 1 เรื่องที่ช่วยให้วันทำงานชัดขึ้นโดยไม่ต้องเปลี่ยนทั้งหมด",
        reflectionQuestions: ["สิ่งไหนในงานทำให้คุณรู้สึกมีคุณค่าที่สุด", "อะไรคือก้าวเล็กที่สุดที่ทำได้ในสัปดาห์นี้"],
        microAction: "จด 1 จุดแข็งที่ใช้งานได้จริงในงานตอนนี้",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังเป็นคนออกแบบเส้นทางงานของตัวเอง",
        safetyNote: "ไม่ใช่คำสั่งลาออกหรือรับงานใหม่แบบตายตัว",
        modeDetails: { practicalNote: "มุ่งที่ก้าวเล็กและพลังงานที่ใช้ได้จริง" },
      };
    case "money_reflection":
      return {
        title: modeLabel,
        opening: `${base}คำอ่านนี้ช่วยมองความสัมพันธ์กับเงินอย่างสงบ ไม่ใช่การทำนายผลลัพธ์ทางการเงิน`,
        symbolicMessage: "เงินในที่นี้อาจสะท้อนความปลอดภัย การควบคุม และความกังวลที่ซ่อนอยู่",
        emotionalReflection: "บางครั้งความเครียดเรื่องเงินคือความกลัวไม่พอ ไม่ใช่ตัวเลขอย่างเดียว",
        psychologicalLens: "รูปแบบการใช้จ่ายหรือการเก็บอาจเกี่ยวกับการปลอบใจตัวเองมากพอ ๆ กับความจำเป็นจริง",
        gentleAdvice: "ลองดูว่าตอนนี้คุณต้องการความชัดเจนหรือความอุ่นใจมากกว่ากัน",
        reflectionQuestions: ["เงินกำลังทำให้คุณรู้สึกอะไรอยู่", "ถ้าเริ่มจาก 1 เรื่องเล็ก ๆ วันนี้ คุณจะเลือกอะไร"],
        microAction: "จดรายจ่ายหรือเงินก้อนที่คิดถึง 1 อย่างอย่างไม่ตัดสินตัวเอง",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน การเปลี่ยนแปลงจริงเริ่มจากก้าวเล็กที่คุณเลือกได้",
        safetyNote: "ไม่ให้คำแนะนำลงทุนหรือผลตอบแทนเฉพาะทาง",
        modeDetails: { practicalNote: "โฟกัสความชัดและความสบายใจมากกว่าการคาดหวังผลลัพธ์" },
      };
    default:
      return {
        title: modeLabel,
        opening: base,
        symbolicMessage: "คำอ่านนี้อาจกำลังชวนให้คุณหยุด ฟัง และดูใจตัวเองอย่างนุ่มนวล",
        emotionalReflection: "คุณอาจต้องการความชัดเจนที่ไม่กดทับ",
        psychologicalLens: "สิ่งสำคัญอาจไม่ใช่คำตอบทันที แต่เป็นการเห็นความต้องการลึก ๆ",
        gentleAdvice: "ลองให้เวลาตัวเองอีกนิดก่อนสรุป",
        reflectionQuestions: ["ตอนนี้ใจคุณต้องการอะไร", "คุณอยากดูแลตัวเองอย่างไรต่อจากนี้"],
        microAction: "เขียนสิ่งที่ควบคุมได้ 1 อย่าง",
        closing: "นี่เป็นเพียงกระจกหนึ่งบาน คุณยังมีสิทธิ์เลือกชีวิตของตัวเอง",
        safetyNote: "ใช้เพื่อสะท้อนใจ ไม่ใช่คำตัดสินสุดท้าย",
        modeDetails: {},
      };
  }
}
