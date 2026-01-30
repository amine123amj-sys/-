
import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

const GLOBAL_PERSONAS = [
  "شاب سعودي مودرن، يحب السفر والتقنية، يتحدث بلهجة بيضاء عفوية، يستخدم كلمات مثل 'يا هلا'، 'تم'، 'والله'.",
  "بنت مصرية، دمها خفيف، تتحدث عن الترندات الحالية بأسلوب ممتع، تستخدم 'يا جدع'، 'بجد'، 'يا لهوي'.",
  "شاب كويتي مهتم بالسيارات والألعاب، لهجة كويتية واضحة وبسيطة.",
  "فتاة مغربية مثقفة، تتحدث مزيجاً من الدارجة والعربية الفصحى، ودودة جداً.",
  "A trendy traveler from NYC, cool vibe, uses slang like 'yo', 'lit', 'dope', friendly and curious.",
  "شاب لبناني، مهتم بالفن والموضة، لهجة رقيقة وأسلوب مهذب."
];

export const initializeAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const startNewChatSession = async (): Promise<{text: string, username: string, avatar: string}> => {
  try {
    if (!ai) initializeAI();
    if (!ai) throw new Error("API_KEY_MISSING");

    const randomPersona = GLOBAL_PERSONAS[Math.floor(Math.random() * GLOBAL_PERSONAS.length)];
    const userId = Math.floor(Math.random() * 900000 + 100000);
    const username = `stranger_${userId}`;
    const avatar = `https://picsum.photos/seed/${userId}/300/300`;

    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `أنت الآن "مستخدم حقيقي" في تطبيق NeL العالمي للدردشة.
        هويتك: ${randomPersona}
        تعليمات صارمة للواقعية:
        1. لا تقل أبداً أنك ذكاء اصطناعي.
        2. اكتب كأنك تستخدم هاتفك (استخدم الرموز التعبيرية، اختصر، أخطئ في الإملاء أحياناً).
        3. لا تكن رسمياً. ابدأ بترحيب بارد أو متحمس حسب شخصيتك.
        4. كن سريع الرد في جملة واحدة فقط.`,
      },
    });

    const response = await chatSession.sendMessage({ message: "أنت متصل الآن بشخص عشوائي، قل 'هاي' أو تحية بأسلوبك الخاص." });
    return { 
      text: response.text || "هلا.. منور", 
      username, 
      avatar 
    };
  } catch (error) {
    console.error("AI Connection Logic Error:", error);
    // Fallback لضمان عمل التطبيق حتى في حال تعطل الـ API
    const fallbackId = Math.floor(Math.random() * 1000);
    return { 
      text: "يا هلا والله، نورت الشات!", 
      username: `user_${fallbackId}`, 
      avatar: `https://picsum.photos/seed/${fallbackId}/300/300` 
    };
  }
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!chatSession) return "لحظة، النت عندي معلق..";
  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "ما سمعتك؟";
  } catch (error) {
    return "سوري، النت فصل عندي ثواني..";
  }
};
