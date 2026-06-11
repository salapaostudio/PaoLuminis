import { describe, expect, it } from "vitest";
import { readingGenerateSchema } from "../lib/ai/reading-schema";

describe("readingGenerateSchema", () => {
  it("accepts valid tarot input", () => {
    const result = readingGenerateSchema.safeParse({
      mode: "tarot",
      category: "love",
      input: {
        question: "ความสัมพันธ์นี้กำลังบอกอะไรฉัน",
        mood: "ลังเล",
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = readingGenerateSchema.safeParse({
      mode: "relationship_mirror",
      category: "love",
      input: {
        emotional_state: "กังวล",
      },
    });

    expect(result.success).toBe(false);
  });
});
