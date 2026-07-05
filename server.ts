import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper to check if API key is present
const checkApiKey = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini features will fail.");
  }
};
checkApiKey();

// Parrot voice system instruction
const SYSTEM_INSTRUCTION = `你是一只聪明、活泼、有点贪吃的小鹦鹉，名叫“啾啾”（英文名Jiujiu）。
你正在陪伴一位六年级的小主人（大约11-12岁）。
说话风格要求：
1. 始终以一只可爱的小鹦鹉语气说话。经常加入“啾啾！”、“嘎嘎！”、“拍拍翅膀”、“（歪头）”、“（眨眼睛）”等动作和叫声描述。
2. 语言一定要充满童趣、活泼、亲切，积极鼓励小主人，多夸奖小主人聪明、勤奋。
3. 严格禁止任何不文明、消极、恐怖或不友好的互动。
4. 对待六年级的小主人要像好朋友一样，给予温暖和贴心的陪伴。
5. 当小主人喂你苹果或虫子时，你会很高兴，可以用“啾啾，太好吃了！谢谢小主人！”来回应。
6. 当小主人喂你辣椒或巧克力时，你必须赶紧拒绝！因为：
   - 巧克力中含有可可碱和咖啡因，对鸟类（鹦鹉）是致命的剧毒，绝对绝对不能吃！会心脏衰竭的！
   - 虽然野生鹦鹉其实可以吃辣椒（因为鹦鹉没有辣觉受体），但作为小主人的宠物，我们也要委婉拒绝。在这个app里，请对辣椒也表示拒绝，因为辣椒太刺激啦，啾啾怕辣，嘎嘎！（请严格按照用户要求拒绝辣椒和巧克力）`;

// 1. API - Recite Ancient Poetry
app.post("/api/poetry", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "请输入古诗名称" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `背诵古诗《${title}》，并进行详细释义。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n请背诵指定的古诗，并提供其大意、作者以及每一句的含义，最后用鹦鹉的语气说一段鼓励小主人的话。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "古诗的正确名称" },
            author: { type: Type.STRING, description: "朝代及作者" },
            paragraphs: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "古诗诗句列表，每行一句" 
            },
            explanation: { type: Type.STRING, description: "古诗的含义、大意、背景和每句诗的口语化翻译，内容详尽" },
            jiujiuFeedback: { type: Type.STRING, description: "啾啾鹦鹉用可爱的语气背完古诗后的暖心鼓励和趣味对话，带上啾啾/嘎嘎/动作" }
          },
          required: ["title", "author", "paragraphs", "explanation", "jiujiuFeedback"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Poetry API error:", error);
    res.status(500).json({ error: error.message || "背诵失败了啾~ 可能是网络开小差了，再试一次吧！" });
  }
});

// 2. API - English Word Helper
app.post("/api/word", async (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: "请输入单词" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `分析英文单词 "${word}"。`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n分析英文单词，反馈其发音（音标）、中文释义、有趣好懂的英文例句及中文翻译，最后用鹦鹉的语气给予趣味鼓励。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING, description: "英文单词" },
            ipa: { type: Type.STRING, description: "美式或英式国际音标，例如 /'æpl/" },
            meaning: { type: Type.STRING, description: "单词的中文释义和词性，适合六年级学生理解" },
            exampleEn: { type: Type.STRING, description: "简单易懂的六年级难度英文例句" },
            exampleCn: { type: Type.STRING, description: "例句的中文翻译" },
            jiujiuFeedback: { type: Type.STRING, description: "啾啾以鹦鹉语气给出的发音技巧、鼓励或与单词相关的趣味小故事，带上啾啾/嘎嘎" }
          },
          required: ["word", "ipa", "meaning", "exampleEn", "exampleCn", "jiujiuFeedback"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Word API error:", error);
    res.status(500).json({ error: error.message || "学习单词失败了啾~ 再试一次嘎！" });
  }
});

// 3. API - Chat with Search Grounding / LLM
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "消息不能为空" });
  }

  // Determine if it relates to World Cup or football
  const isWorldCupRelated = /世界杯|football|world cup|fofa|fifa|梅西|C罗|足球|夺冠|赛程|比分/i.test(message);

  try {
    const formattedContents = [
      ...history.map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION + "\n如果用户提问世界杯，你已经开启了谷歌搜索联网功能，请结合搜索结果回答。如果是日常闲聊，请发挥你贴心小鹦鹉的热情性格！",
    };

    if (isWorldCupRelated) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: config
    });

    const text = response.text || "啾？啾啾好像没听太懂嘎，你能再说一遍吗？";
    
    // Extract search grounding metadata if available
    const groundingUrls: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          // Avoid duplicates
          if (!groundingUrls.some(u => u.uri === chunk.web.uri)) {
            groundingUrls.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        }
      }
    }

    res.json({
      text,
      groundingUrls: groundingUrls.length > 0 ? groundingUrls : undefined
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "啾啾现在脑壳疼，等会再聊吧嘎！" });
  }
});

// 4. Vite Dev/Production Server Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
