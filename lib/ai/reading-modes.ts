import { toneProfileIds, type ToneProfileId } from "@/lib/ai/reading-style";

export const readingCategoryIds = ["love", "career", "money", "family", "self", "decision", "future", "space", "timing"] as const;
export type ReadingCategory = (typeof readingCategoryIds)[number];

export const readingModeIds = [
  "daily_light",
  "tarot",
  "oracle",
  "astrology",
  "numerology",
  "name_analysis",
  "thai_taksa",
  "lucky_phone",
  "feng_shui",
  "i_ching",
  "human_design",
  "decision_companion",
  "relationship_mirror",
  "career_reflection",
  "money_reflection",
] as const;

export type ReadingModeId = (typeof readingModeIds)[number];

export type ReadingFieldType = "text" | "textarea" | "date" | "tel" | "select" | "number";

export type ReadingInputOption = {
  value: string;
  labelTh: string;
};

export type ReadingInputField = {
  name: string;
  labelTh: string;
  labelEn: string;
  type: ReadingFieldType;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: ReadingInputOption[];
};

export type ReadingMode = {
  id: ReadingModeId;
  labelTh: string;
  internalName: string;
  descriptionTh: string;
  iconName: string;
  allowedCategories: ReadingCategory[];
  inputFields: ReadingInputField[];
  responseSections: string[];
  safetyNotes: string[];
  toneProfile: ToneProfileId;
  examplePlaceholders: Record<string, string>;
};

export const readingModes = [
  {
    id: "daily_light",
    labelTh: "แสงนำทางวันนี้",
    internalName: "daily_light",
    descriptionTh: "คำสะท้อนรายวันสำหรับอารมณ์ พลังงาน และก้าวเล็ก ๆ",
    iconName: "sunrise",
    allowedCategories: ["self", "decision", "future"],
    inputFields: [
      { name: "mood", labelTh: "อารมณ์ตอนนี้", labelEn: "Current mood", type: "text", placeholder: "เช่น เหนื่อย ลังเล โล่งใจ" },
      { name: "intention", labelTh: "ความตั้งใจวันนี้", labelEn: "Intention", type: "textarea", placeholder: "อยากให้แสงวันนี้ช่วยเรื่องอะไร" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ใช้เพื่อสะท้อนอารมณ์และจังหวะของวัน ไม่ใช่คำทำนายเด็ดขาด"],
    toneProfile: "warm_mystic",
    examplePlaceholders: { mood: "เช่น กังวลเบา ๆ", intention: "เช่น อยากกลับมาฟังใจตัวเอง" },
  },
  {
    id: "tarot",
    labelTh: "ไพ่สะท้อนใจ",
    internalName: "tarot",
    descriptionTh: "คำอ่านเชิงสัญลักษณ์สำหรับความรัก งาน การตัดสินใจ และตัวตน",
    iconName: "sparkles",
    allowedCategories: ["love", "career", "money", "self", "decision", "future", "timing"],
    inputFields: [
      { name: "question", labelTh: "คำถาม", labelEn: "Question", type: "textarea", required: true, placeholder: "ถามสิ่งที่อยู่ในใจ" },
      { name: "mood", labelTh: "อารมณ์ตอนนี้", labelEn: "Mood", type: "text", placeholder: "เช่น ลังเล เหนื่อย อยากชัดเจน" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["อย่าฟันธงอนาคตจากไพ่ใบเดียว", "ใช้ไพ่เป็นกระจก ไม่ใช่กรงขัง"],
    toneProfile: "warm_mystic",
    examplePlaceholders: { question: "เช่น ความสัมพันธ์นี้กำลังบอกอะไรฉัน", mood: "เช่น ใจไม่ค่อยนิ่ง" },
  },
  {
    id: "oracle",
    labelTh: "Oracle Message",
    internalName: "oracle",
    descriptionTh: "ข้อความอ่อนโยนที่ช่วยฟังเสียงภายในและการนำทางเงียบ ๆ",
    iconName: "moon-star",
    allowedCategories: ["self", "decision", "future", "love"],
    inputFields: [
      { name: "question", labelTh: "สิ่งที่อยากฟัง", labelEn: "What you want guidance on", type: "textarea", required: true, placeholder: "เล่าประเด็นที่อยากได้ข้อความสะท้อน" },
      { name: "mood", labelTh: "อารมณ์ตอนนี้", labelEn: "Mood", type: "text", placeholder: "เช่น สับสน เบาใจ เงียบ" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["รักษาน้ำเสียงสงบและไม่ดึงผู้ใช้ไปสู่ความเชื่อแบบผูกมัด"],
    toneProfile: "warm_mystic",
    examplePlaceholders: { question: "เช่น ฉันควรฟังอะไรจากช่วงนี้", mood: "เช่น เหมือนกำลังรอฟังอะไรบางอย่าง" },
  },
  {
    id: "astrology",
    labelTh: "โหราศาสตร์สะท้อนตัวตน",
    internalName: "astrology",
    descriptionTh: "การสะท้อนธีมชีวิตและอารมณ์จากข้อมูลเกิดที่ผู้ใช้ให้มา",
    iconName: "orbit",
    allowedCategories: ["self", "career", "love", "decision", "future"],
    inputFields: [
      { name: "birth_date", labelTh: "วันเกิด", labelEn: "Birth date", type: "date", required: true },
      { name: "birth_time", labelTh: "เวลาเกิด", labelEn: "Birth time", type: "text", placeholder: "เช่น 08:30 (ถ้าจำได้)" },
      { name: "question", labelTh: "ประเด็นที่อยากสะท้อน", labelEn: "Question", type: "textarea", required: true, placeholder: "เรื่องที่อยากดูธีมหรือจังหวะ" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["หากไม่มีการคำนวณแผนผังจริง ให้บอกชัดว่าเป็นการสะท้อนเชิงสัญลักษณ์"],
    toneProfile: "poetic_spiritual",
    examplePlaceholders: { question: "เช่น ช่วงนี้งานกำลังพาอะไรเข้ามา", birth_time: "ไม่ทราบเวลาก็สะท้อนแบบกว้างได้" },
  },
  {
    id: "numerology",
    labelTh: "เลขศาสตร์ชีวิต",
    internalName: "numerology",
    descriptionTh: "การอ่านตัวเลขชีวิตและรูปแบบเชิงสัญลักษณ์อย่างอ่อนโยน",
    iconName: "hash",
    allowedCategories: ["self", "career", "money", "decision", "future", "timing"],
    inputFields: [
      { name: "birth_date", labelTh: "วันเกิด", labelEn: "Birth date", type: "date", required: true },
      { name: "question", labelTh: "คำถามเพิ่มเติม (ถ้ามี)", labelEn: "Optional question", type: "textarea", placeholder: "อยากให้เลขช่วยสะท้อนเรื่องอะไร" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["สื่อความหมายเชิงสัญลักษณ์เท่านั้น ไม่รับประกันโชคหรือผลลัพธ์"],
    toneProfile: "poetic_spiritual",
    examplePlaceholders: { birth_date: "ใช้วันเกิดเพื่อสะท้อนเลขชีวิตแบบกว้าง ๆ", question: "เช่น พลังปีนี้กำลังสอนอะไรฉัน" },
  },
  {
    id: "name_analysis",
    labelTh: "วิเคราะห์ชื่อเชิงความหมาย",
    internalName: "name_analysis",
    descriptionTh: "สะท้อนความหมาย ภาพจำ และบุคลิกที่ชื่ออาจชวนให้เห็น",
    iconName: "badge",
    allowedCategories: ["self", "family", "career", "love"],
    inputFields: [
      { name: "name", labelTh: "ชื่อเต็ม", labelEn: "Full name", type: "text", required: true, placeholder: "ชื่อจริงหรือชื่อที่ใช้ประจำ" },
      { name: "nickname", labelTh: "ชื่อเล่น", labelEn: "Nickname", type: "text", placeholder: "ถ้าต้องการ" },
      { name: "question", labelTh: "คำถามเพิ่มเติม (ถ้ามี)", labelEn: "Optional question", type: "textarea", placeholder: "อยากให้ชื่อสะท้อนเรื่องอะไร" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ไม่บอกว่าชื่อดีหรือร้ายแบบเด็ดขาด", "หลีกเลี่ยงการผลักให้ต้องเปลี่ยนชื่อ"],
    toneProfile: "grounded_reflective",
    examplePlaceholders: { question: "เช่น ชื่อนี้สะท้อนวิธีที่คนมองฉันอย่างไร" },
  },
  {
    id: "thai_taksa",
    labelTh: "ทักษาปกรณ์",
    internalName: "thai_taksa",
    descriptionTh: "การสะท้อนเชิงสัญลักษณ์จากชื่อ วันเกิด และบรรยากาศแบบไทย",
    iconName: "scroll-text",
    allowedCategories: ["self", "career", "family", "decision"],
    inputFields: [
      { name: "name", labelTh: "ชื่อ", labelEn: "Name", type: "text", required: true, placeholder: "ชื่อที่ต้องการสะท้อน" },
      { name: "birth_date", labelTh: "วันเกิดหรือวันในสัปดาห์ (ถ้ามี)", labelEn: "Birth day", type: "text", placeholder: "เช่น วันจันทร์ หรือ 1995-08-12" },
      { name: "question", labelTh: "คำถามเพิ่มเติม (ถ้ามี)", labelEn: "Optional question", type: "textarea", placeholder: "อยากให้สะท้อนจุดไหนของตัวตน" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["หากไม่ได้คำนวณทักษะครบ ให้ระบุว่าเป็นการสะท้อนพื้นฐานเชิงสัญลักษณ์"],
    toneProfile: "warm_mystic",
    examplePlaceholders: { question: "เช่น ชื่อนี้ชวนให้คนรับรู้ฉันแบบไหน" },
  },
  {
    id: "lucky_phone",
    labelTh: "วิเคราะห์เบอร์เชิงพลังงาน",
    internalName: "lucky_phone",
    descriptionTh: "อ่านรูปแบบเบอร์โทรอย่างระมัดระวังและไม่รับประกันผลลัพธ์",
    iconName: "phone",
    allowedCategories: ["career", "money", "love", "self", "decision"],
    inputFields: [
      { name: "phone_number", labelTh: "เบอร์โทร", labelEn: "Phone number", type: "tel", required: true, placeholder: "เช่น 08x-xxx-xxxx" },
      { name: "usage_context", labelTh: "ใช้เบอร์นี้กับอะไร", labelEn: "Context", type: "text", placeholder: "งาน ส่วนตัว ธุรกิจ" },
      { name: "question", labelTh: "คำถาม", labelEn: "Question", type: "textarea", required: true, placeholder: "อยากรู้เรื่องอะไรจากเบอร์นี้" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ไม่รับประกันความร่ำรวย ความรัก หรือความสำเร็จจากตัวเลข"],
    toneProfile: "practical_calm",
    examplePlaceholders: { question: "เช่น เบอร์นี้สะท้อนจังหวะการสื่อสารแบบไหน" },
  },
  {
    id: "feng_shui",
    labelTh: "ฮวงจุ้ยเชิงบรรยากาศ",
    internalName: "feng_shui",
    descriptionTh: "สะท้อนพลังของพื้นที่ด้วยสิ่งที่จับต้องได้ เช่น แสง ลม ความรก และการพัก",
    iconName: "home",
    allowedCategories: ["space", "career", "self", "decision", "money"],
    inputFields: [
      {
        name: "room_type",
        labelTh: "พื้นที่",
        labelEn: "Room type",
        type: "select",
        required: true,
        options: [
          { value: "home", labelTh: "บ้าน" },
          { value: "bedroom", labelTh: "ห้องนอน" },
          { value: "desk", labelTh: "โต๊ะทำงาน" },
          { value: "office", labelTh: "ออฟฟิศ" },
          { value: "living_room", labelTh: "ห้องนั่งเล่น" },
        ],
      },
      { name: "space_description", labelTh: "เล่าพื้นที่คร่าว ๆ", labelEn: "Space description", type: "textarea", required: true, placeholder: "มีแสงน้อย รก เครียด หรืออยากปรับอะไร" },
      { name: "question", labelTh: "คำถาม", labelEn: "Question", type: "textarea", required: true, placeholder: "อยากให้พื้นที่ช่วยเรื่องอะไร" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["เน้นเรื่องแสง ลม ความรก การใช้งาน และการพัก มากกว่าความเชื่อเชิงรับประกัน"],
    toneProfile: "practical_calm",
    examplePlaceholders: { question: "เช่น โต๊ะนี้กำลังส่งผลต่อสมาธิอย่างไร" },
  },
  {
    id: "i_ching",
    labelTh: "I Ching Reflection",
    internalName: "i_ching",
    descriptionTh: "สะท้อนการเปลี่ยนผ่าน จังหวะ และการรออย่างมีสติ",
    iconName: "yin-yang",
    allowedCategories: ["decision", "future", "timing", "self"],
    inputFields: [
      { name: "situation", labelTh: "สถานการณ์", labelEn: "Situation", type: "textarea", required: true, placeholder: "เล่าว่ากำลังเจออะไร" },
      { name: "options", labelTh: "ทางเลือกที่มี", labelEn: "Options", type: "textarea", placeholder: "ถ้ามีสองทางหรือหลายทาง" },
      { name: "question", labelTh: "คำถามก่อนตัดสินใจ", labelEn: "Question", type: "textarea", required: true, placeholder: "อยากให้สะท้อนอะไรเกี่ยวกับจังหวะนี้" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ใช้น้ำเสียงสงบและเชิงปรัชญา ไม่ควรทำให้ผู้ใช้กลัวการเปลี่ยนแปลง"],
    toneProfile: "poetic_spiritual",
    examplePlaceholders: { question: "เช่น ตอนนี้ควรรอหรือขยับ" },
  },
  {
    id: "human_design",
    labelTh: "Human Design Reflection",
    internalName: "human_design",
    descriptionTh: "สะท้อนรูปแบบพลังงานและวิธีตัดสินใจอย่างอ่อนโยน",
    iconName: "radar",
    allowedCategories: ["self", "decision", "career", "love"],
    inputFields: [
      { name: "birth_date", labelTh: "วันเกิด", labelEn: "Birth date", type: "date", required: true },
      { name: "birth_time", labelTh: "เวลาเกิด", labelEn: "Birth time", type: "text", placeholder: "ถ้าจำได้" },
      { name: "birth_place", labelTh: "สถานที่เกิด", labelEn: "Birth place", type: "text", placeholder: "เมืองหรือจังหวัด" },
      { name: "question", labelTh: "คำถาม", labelEn: "Question", type: "textarea", required: true, placeholder: "อยากสะท้อนเรื่องพลังงานแบบไหน" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["หากไม่ได้คำนวณชาร์ตเต็ม ให้บอกว่าเป็นการสะท้อนเชิงรูปแบบ ไม่ใช่แผนผังจริง"],
    toneProfile: "grounded_reflective",
    examplePlaceholders: { question: "เช่น วิธีตัดสินใจแบบไหนที่ทำให้ฉันเหนื่อยน้อยลง" },
  },
  {
    id: "decision_companion",
    labelTh: "เพื่อนช่วยตัดสินใจ",
    internalName: "decision_companion",
    descriptionTh: "ช่วยมองทางเลือกอย่างอ่อนโยนโดยไม่รีบสรุปแทนคุณ",
    iconName: "gavel",
    allowedCategories: ["decision", "career", "love", "money", "family", "future"],
    inputFields: [
      { name: "decision_a", labelTh: "ทางเลือก A", labelEn: "Option A", type: "textarea", required: true, placeholder: "เล่าทางเลือกแรก" },
      { name: "decision_b", labelTh: "ทางเลือก B", labelEn: "Option B", type: "textarea", required: true, placeholder: "เล่าทางเลือกที่สอง" },
      { name: "context", labelTh: "บริบท", labelEn: "Context", type: "textarea", placeholder: "มีอะไรสำคัญที่ควรรู้เพิ่มไหม" },
      { name: "question", labelTh: "คำถาม", labelEn: "Question", type: "textarea", required: true, placeholder: "อยากให้ช่วยมองอะไรเป็นพิเศษ" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["หลีกเลี่ยงการตัดสินแทนผู้ใช้ว่าต้องเลือกอะไร", "ช่วยทำให้ความชัดเจนเพิ่มขึ้นทีละน้อย"],
    toneProfile: "direct_but_kind",
    examplePlaceholders: { question: "เช่น ถ้าต้องเลือกตอนนี้ ฉันควรมองอะไรเพิ่ม" },
  },
  {
    id: "relationship_mirror",
    labelTh: "กระจกความสัมพันธ์",
    internalName: "relationship_mirror",
    descriptionTh: "ช่วยมองแพตเทิร์นความรัก ขอบเขต และความต้องการลึก ๆ",
    iconName: "heart-handshake",
    allowedCategories: ["love", "self", "decision", "future"],
    inputFields: [
      {
        name: "relationship_status",
        labelTh: "สถานะความสัมพันธ์",
        labelEn: "Relationship status",
        type: "select",
        required: true,
        options: [
          { value: "single", labelTh: "โสด" },
          { value: "dating", labelTh: "คุยกันอยู่" },
          { value: "relationship", labelTh: "คบกันแล้ว" },
          { value: "complicated", labelTh: "ซับซ้อน" },
          { value: "separated", labelTh: "ห่างกัน" },
        ],
      },
      { name: "emotional_state", labelTh: "ความรู้สึกตอนนี้", labelEn: "Emotional state", type: "text", placeholder: "เช่น กังวล ผูกพัน เหนื่อย" },
      { name: "question", labelTh: "คำถาม", labelEn: "Question", type: "textarea", required: true, placeholder: "อยากเข้าใจอะไรเกี่ยวกับความสัมพันธ์นี้" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ไม่สนับสนุนการควบคุม บงการ หรือสืบเช็กอีกฝ่าย", "คืนอำนาจการเลือกกลับมาที่ผู้ใช้"],
    toneProfile: "direct_but_kind",
    examplePlaceholders: { question: "เช่น ความสัมพันธ์นี้กำลังขออะไรจากฉัน" },
  },
  {
    id: "career_reflection",
    labelTh: "เข็มทิศเรื่องงาน",
    internalName: "career_reflection",
    descriptionTh: "ช่วยมองทิศทางงาน จุดแข็ง และก้าวถัดไปที่จับต้องได้",
    iconName: "briefcase-business",
    allowedCategories: ["career", "decision", "future", "money", "self"],
    inputFields: [
      { name: "current_role", labelTh: "บทบาทงานตอนนี้", labelEn: "Current role", type: "text", placeholder: "เช่น พนักงาน ทีมลีด ฟรีแลนซ์" },
      { name: "question", labelTh: "คำถามเรื่องงาน", labelEn: "Career question", type: "textarea", required: true, placeholder: "อยากให้ช่วยมองอะไรเกี่ยวกับงาน" },
      { name: "mood", labelTh: "อารมณ์ตอนนี้", labelEn: "Mood", type: "text", placeholder: "เช่น กดดัน เบื่อ อยากโต" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ไม่ชี้นำเรื่องงานแบบเด็ดขาด", "ช่วยให้เห็นแรงกดดันกับความต้องการที่แท้จริง"],
    toneProfile: "practical_calm",
    examplePlaceholders: { question: "เช่น ฉันควรขยับงานไหม", mood: "เช่น ล้าแต่ยังอยากไปต่อ" },
  },
  {
    id: "money_reflection",
    labelTh: "ความสัมพันธ์กับเงิน",
    internalName: "money_reflection",
    descriptionTh: "สะท้อนความกังวลด้านเงิน รูปแบบการใช้จ่าย และความรู้สึกปลอดภัย",
    iconName: "wallet",
    allowedCategories: ["money", "decision", "self", "future"],
    inputFields: [
      { name: "money_pattern", labelTh: "พฤติกรรมเรื่องเงิน", labelEn: "Money pattern", type: "textarea", placeholder: "เช่น ใช้เงินตามอารมณ์ เก็บไม่อยู่" },
      { name: "question", labelTh: "คำถามเรื่องเงิน", labelEn: "Money question", type: "textarea", required: true, placeholder: "อยากสะท้อนเรื่องเงินแบบไหน" },
      { name: "mood", labelTh: "ความรู้สึกตอนนี้", labelEn: "Mood", type: "text", placeholder: "เช่น กังวล ไม่มั่นคง อยากจัดระเบียบ" },
    ],
    responseSections: ["opening", "symbolicMessage", "emotionalReflection", "psychologicalLens", "gentleAdvice", "reflectionQuestions", "microAction", "closing"],
    safetyNotes: ["ไม่ให้คำแนะนำลงทุนหรือการเงินเฉพาะทาง", "ไม่รับประกันโชคหรือผลลัพธ์ทางทรัพย์สิน"],
    toneProfile: "practical_calm",
    examplePlaceholders: { question: "เช่น ฉันควรเข้าใกล้เงินแบบไหนถึงจะไม่เครียด" },
  },
] as const satisfies readonly ReadingMode[];

export const readingModeMap = Object.fromEntries(readingModes.map((mode) => [mode.id, mode])) as unknown as Record<ReadingModeId, ReadingMode>;

export const readingModesByTone = toneProfileIds.reduce<Record<ToneProfileId, ReadingModeId[]>>(
  (groups, toneProfile) => {
    groups[toneProfile] = readingModes.filter((mode) => mode.toneProfile === toneProfile).map((mode) => mode.id);
    return groups;
  },
  {} as Record<ToneProfileId, ReadingModeId[]>
);
