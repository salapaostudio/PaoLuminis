import { describe, expect, it } from "vitest";
import { getTimeZoneDayRange } from "../lib/timezone";

describe("getTimeZoneDayRange", () => {
  it("uses Asia/Bangkok midnight boundaries", () => {
    const { start, end } = getTimeZoneDayRange(new Date("2026-06-11T03:00:00.000Z"), "Asia/Bangkok");
    expect(start.toISOString()).toBe("2026-06-10T17:00:00.000Z");
    expect(end.toISOString()).toBe("2026-06-11T17:00:00.000Z");
  });
});
