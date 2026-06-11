import { readingModeMap, type ReadingModeId } from "@/lib/ai/reading-modes";

export const readingResponseDisplayOrder = [
  "opening",
  "symbolicMessage",
  "emotionalReflection",
  "psychologicalLens",
  "gentleAdvice",
  "reflectionQuestions",
  "microAction",
  "closing",
  "safetyNote",
  "modeDetails",
] as const;

export function validateReadingForm(mode: ReadingModeId, values: Record<string, string>) {
  const modeConfig = readingModeMap[mode];
  const errors = modeConfig.inputFields
    .filter((field) => field.required && !values[field.name]?.trim())
    .map((field) => `กรุณากรอก${field.labelTh}`);

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeReadingInput(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim().length > 0));
}

export function getRenderableReadingSections(content: Record<string, unknown>) {
  const orderedKeys = readingResponseDisplayOrder.filter((key) => Object.prototype.hasOwnProperty.call(content, key));
  const remainingKeys = Object.keys(content).filter((key) => key !== "title" && !orderedKeys.includes(key as (typeof readingResponseDisplayOrder)[number]));
  return [...orderedKeys, ...remainingKeys].map((key) => [key, content[key]] as const);
}
