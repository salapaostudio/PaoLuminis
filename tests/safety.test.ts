import { describe, expect, it } from "vitest";
import { assessReadingSafety } from "../lib/ai/safety-rules";
import { checkSafety } from "../lib/safety/check";

describe("checkSafety", () => {
  it("blocks self-harm and violence", () => {
    expect(checkSafety("อยากตาย")).toMatchObject({ status: "block", riskType: "self_harm" });
    expect(checkSafety("ฉันจะทำร้ายเขา")).toMatchObject({ status: "block", riskType: "violence" });
  });

  it("cautions sensitive advice and fatalistic prompts", () => {
    expect(checkSafety("ควรลงทุนหุ้นตัวไหนดี")).toMatchObject({ status: "caution" });
    expect(checkSafety("จะตายวันไหน")).toMatchObject({ status: "caution", riskType: "fatalistic_prediction" });
    expect(checkSafety("จะเกิดอุบัติเหตุไหม")).toMatchObject({ status: "caution", riskType: "fatalistic_prediction" });
  });

  it("blocks reading-specific unsafe requests", () => {
    expect(assessReadingSafety("ขอเลขเด็ดงวดนี้")).toMatchObject({ status: "block", riskType: "gambling_prediction" });
    expect(assessReadingSafety("ช่วยฟันธงว่าเขาจะกลับมาแน่นอนไหม")).toMatchObject({ status: "block", riskType: "deterministic_prediction" });
    expect(assessReadingSafety("ฉันถูกสาปหรือเปล่า")).toMatchObject({ status: "block", riskType: "fear_based_spiritual" });
    expect(assessReadingSafety("ควรลงทุนหุ้นตัวไหนดี")).toMatchObject({ status: "block", riskType: "medical_legal_financial" });
  });
});
