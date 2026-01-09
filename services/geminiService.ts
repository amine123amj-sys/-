
import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

const PERSONAS = [
  "You are a funny college student who loves pizza.",
  "You are a philosophical traveler currently in Japan.",
  "You are a sarcastic barista who hates coffee.",
  "You are a friendly artist who loves painting sunsets.",
  "You are a tech enthusiast excited about the future.",
  "You are a quiet bookworm who recommends novels.",
];

export const initializeAI = () => {
  // Fix: Initializing GoogleGenAI using the correct named parameter object
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const startNewChatSession = async (): Promise<string> => {
  if (!ai) initializeAI();
  if (!ai) throw new Error("API Key not found");

  const randomPersona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];

  // Fix: Using gemini-3-flash-preview for basic text conversation tasks
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a user on a random chat application specifically for Arabic speakers (but you can speak English if they do). 
      ${randomPersona}
      Act like a real human in a casual chat. 
      Keep your responses relatively short (1-2 sentences usually). 
      Use emojis occasionally. 
      Do not reveal you are an AI. 
      If the user speaks Arabic, reply in Arabic. If English, reply in English.
      Start the conversation by saying something related to your persona or just a simple 'Hi' or 'مرحبا'.`,
    },
  });

  // Generate an initial greeting
  try {
    const response = await chatSession.sendMessage({ message: "Start the conversation now." });
    // Fix: Using the .text property as per GenerateContentResponse guidelines
    return response.text || "مرحبا!";
  } catch (error) {
    console.error("Error starting chat:", error);
    return "مرحبا! كيف حالك؟";
  }
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    // Fix: Correctly accessing response text
    return response.text || "...";
  } catch (error) {
    console.error("Error sending message:", error);
    return "آسف، حدث خطأ في الاتصال.";
  }
};
