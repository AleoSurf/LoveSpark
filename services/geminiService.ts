import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
const getAiClient = () => {
  // Support both VITE_GEMINI_API_KEY (Vite standard) and GEMINI_API_KEY (.env.local format)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  
  if (!apiKey) {
    console.warn("API Key is missing! Ensure VITE_GEMINI_API_KEY or GEMINI_API_KEY is set in .env file.");
  }
  // Passing the key even if undefined to let the SDK handle the error gracefully or use default if applicable
  return new GoogleGenAI({ apiKey });
};

export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: 'Gemini 2.5 Flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return chat.sendMessageStream({ message });
};

export const generateDateIdea = async (mood: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Generate a unique, cute, and romantic dating idea based on this mood/theme: "${mood}". 
  Format it as a small JSON-like text (but just plain text is fine) with Title, Description, Estimated Cost, and Time. 
  Keep it fun and briefly explain why it's a good idea.`;

  try {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
    return response.text || "Could not generate an idea right now. Try again with a smile! 😊";
  } catch (error) {
    console.error("Error generating date idea:", error);
    return "Oops! Cupid's arrows missed the target💘 Please try again.";
  }
};