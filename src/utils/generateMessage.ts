import { MODEL_CONFIG } from "@/constants";
import { GoogleGenAI, ApiError } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateMessage = async (diff: string): Promise<string> => {
  try {
    if (!diff) {
      throw new Error("Diff is not provided");
    }

    const response = await ai.models.generateContent({
      ...MODEL_CONFIG,
      contents: diff,
    });

    const message = response.text
      ?.trim()
      .replace(/^```[\w]*\n?/, "")
      .replace(/```$/, "")
      .trim();

    if (!message) {
      throw new Error("Message generation failed");
    }

    return message;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Error generating commit message");
    }
  }
};
