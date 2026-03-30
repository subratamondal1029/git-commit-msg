import type { GenerateContentParameters } from "@google/genai";

export const APP_NAME = "git-commit-msg" as const;
export const SUPPORTED_TOOLS = ["git"] as const;

export const SYSTEM_INSTRUCTION = `You are a git commit message generator.
Output a single line conventional commit message.
Format: type(scope): description
Rules: max 72 chars, no body, no explanation, no quotes, no markdown.` as const;

export const MODEL_CONFIG: Omit<GenerateContentParameters, "contents"> = {
  model: "gemini-2.5-flash",
  config: {
    systemInstruction: SYSTEM_INSTRUCTION,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    temperature: 0.2,
    topP: 0.3,
    maxOutputTokens: 50,
  },
} as const;
