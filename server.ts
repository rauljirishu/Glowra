import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // API Route: AI Fashion/Beauty analysis
  app.post("/api/glowra/analyze", async (req, res) => {
    const { task, data } = req.body;
    
    try {
      let prompt = "";
      switch (task) {
        case "color-analysis":
          prompt = "Act as an expert Korean beauty consultant. Analyze these coordinates/skin-tone preferences and provide a seasonal color palette (Spring, Summer, Autumn, Winter) with specific makeup and clothing color recommendations. Format as JSON with fields: season, subType, description, colors (array).";
          break;
        case "hair-stylist":
          prompt = "Act as a luxury AI hair stylist. Based on the user's facial shape (describe or provide features), suggest 3 trending hairstyles (e.g., Butterfly Cut, Hush Cut, Block Cut) that would suit them. Provide styling tips. Format as JSON with fields: styles (array of objects {name, description, tip}).";
          break;
        case "makeup-advisor":
          prompt = "Act as a top K-beauty makeup artist. Suggest a makeup look for a special occasion. Focus on skin finish, eye look, and lip products. Use 'Glowra' aesthetic vocabulary. Format as JSON with fields: lookName, skinTip, eyeTip, lipTip.";
          break;
        default:
          prompt = "Provide a general beauty-tech insight for the Glowra app.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Glowra AI is currently resting. Please try again soon." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Glowra Server running at http://localhost:${PORT}`);
  });
}

startServer();
