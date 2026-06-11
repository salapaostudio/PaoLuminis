import { describe, expect, it } from "vitest";
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
});
