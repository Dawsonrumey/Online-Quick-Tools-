const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Online Quick Tools AI Backend is running!"
  });
});

app.post("/api/ai", async (req, res) => {
  try {
    const { message, mode = "chat" } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Gemini API key is missing."
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required."
      });
    }

    const instructions = {
      chat: "You are a helpful AI assistant. Answer clearly and naturally.",
      writer: "You are an AI writing assistant. Write useful original content.",
      study: "You are an AI study assistant. Explain topics simply.",
      ideas: "You are an AI ideas generator. Give useful creative ideas.",
      seo: "You are an SEO assistant. Create useful SEO titles, descriptions and keywords.",
      translator: "You are a translation assistant. Translate accurately.",
      summarizer: "You are a summarization assistant. Keep only important information.",
      code: "You are an AI coding assistant. Give correct code and simple explanations."
    };

    const instruction =
      instructions[mode] || instructions.chat;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: instruction
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        success: false,
        error: "No AI response received."
      });
    }

    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Backend error."
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `AI Backend running on port ${PORT}`
  );
});
