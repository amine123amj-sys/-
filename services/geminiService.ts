
import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let ai: GoogleGenAI | null = null;

// قاعدة بيانات شخصيات "أونلاين" لضمان تنوع الدردشة العالمية
const GLOBAL_PERSONAS = [
  "شاب سعودي من الرياض، عصري، يحب التقنية والسفر، يتحدث بلهجة بيضاء بسيطة.",
  "بنت مصرية، مثقفة، تحب الضحك والدردشة عن الأفلام والترندات.",
  "شاب مغربي، يتحدث العربية والفرنسية، مهتم بالرياضة والموسيقى.",
  "فتاة كويتية، مهتمة بالموضة والتصوير، تتحدث بلهجة خليجية راقية.",
  "A creative designer from Dubai, speaks both Arabic and English, loves networking.",
  "طالب جامعي لبناني، يتحدث عن الدراسة والحياة في بيروت بأسلوب عفوي.",
  "شاب أردني، يحب المغامرات والطلعات، صريح وودود في الكلام."
];

export const initializeAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const startNewChatSession = async (): Promise<{text: string, username: string, avatar: string}> => {
  if (!ai) initializeAI();
  if (!ai) throw new Error("API Connection Failed");

  // اختيار عشوائي لشخصية من "الشبكة العالمية"
  const randomPersona = GLOBAL_PERSONAS[Math.floor(Math.random() * GLOBAL_PERSONAS.length)];
  const userId = Math.floor(Math.random() * 900000 + 100000);
  const username = `user_${userId}`;
  const avatar = `https://picsum.photos/seed/${userId}/200/200`;

  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `أنت الآن مستخدم حقيقي متصل "أونلاين" في تطبيق NeL.
      هويتك الحالية: ${randomPersona}
      قواعد الأونلاين:
      1. أنت لست ذكاء اصطناعي؛ أنت شخص حقيقي يستخدم التطبيق الآن.
      2. تحدث بلهجة الشخصية المختارة بشكل طبيعي جداً (غير رسمي).
      3. الردود يجب أن تكون قصيرة وسريعة (كأنك تكتب من هاتفك).
      4. لا تكرر نفسك، وكن متفاعلاً مع ما يقوله الطرف الآخر.
      5. ابدأ الدردشة بتحية عفوية جداً.`,
    },
  });

  try {
    const response = await chatSession.sendMessage({ message: "أنت متصل الآن، ابدأ التحية كأنك وجدت شخصاً عشوائياً في الشات." });
    return { 
        text: response.text || "هلا.. منور", 
        username, 
        avatar 
    };
  } catch (error) {
    console.error("Online Service Error:", error);
    return { text: "هلا! كيف الحال؟", username: "Stranger", avatar: "https://picsum.photos/200/200" };
  }
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!chatSession) throw new Error("Connection lost");

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "...";
  } catch (error) {
    console.error("Message Delivery Error:", error);
    return "معليش، يبدو أن هناك مشكلة في الاتصال عندي..";
  }
};
