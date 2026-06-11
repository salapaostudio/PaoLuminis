import { describe, expect, it } from "vitest";
import { onboardingSchema } from "../lib/validation";

describe("onboardingSchema", () => {
  it("accepts valid onboarding data", () => {
    const result = onboardingSchema.safeParse({
      nickname: "Pao",
      birth_date: "1995-06-27",
      birth_time: "08:30",
      main_intention: "self",
      current_mood: "สงบ",
      current_life_question: "ฉันควรดูแลใจตัวเองอย่างไร",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid onboarding data", () => {
    const result = onboardingSchema.safeParse({
      nickname: "",
      birth_date: "not-a-date",
      birth_time: "99:99",
      main_intention: "invalid",
      current_mood: "",
      current_life_question: "",
    });

    expect(result.success).toBe(false);
  });
});
