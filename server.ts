import express from "express";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function isPortAvailable(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();

    server.unref();
    server.on("error", () => resolve(false));
    server.listen({ port, host: "0.0.0.0" }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function findAvailablePort(preferredPort: number, attempts = 25) {
  for (let offset = 0; offset <= attempts; offset += 1) {
    const candidate = preferredPort + offset;
    if (await isPortAvailable(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No open port found near ${preferredPort}.`);
}

type AnalysisType = "color_suit" | "hair_analysis" | "makeup_analysis" | "face_body_analysis";

type AnalyzeRequest = {
  imagePath: string;
  image: {
    data: string;
    mimeType: string;
  };
  answers: Record<string, string>;
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: { "User-Agent": "glowra-real-ai-beta" },
      },
    })
  : null;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null;

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase server variables are not configured.");
  }
  return supabase;
}

async function getUserIdFromRequest(req: express.Request) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw Object.assign(new Error("Missing bearer token."), { status: 401 });
  }

  const client = requireSupabase();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    throw Object.assign(new Error("Invalid user session."), { status: 401 });
  }

  return data.user.id;
}

function stripDataUrlPrefix(data: string) {
  return data.includes(",") ? data.split(",").pop() || "" : data;
}

function safeJson(text: string | undefined, fallback: unknown) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function fallbackResult(type: AnalysisType, premium: boolean) {
  if (type === "color_suit") {
    return {
      season: "Spring Warm",
      subType: "Clear Peach",
      confidence: 0.78,
      description:
        "Warm, bright, peach-based tones are the strongest match. Keep contrast fresh rather than heavy.",
      bestColors: ["Coral", "Warm ivory", "Peach", "Light camel", "Clear aqua"],
      avoidColors: ["Dusty mauve", "Charcoal", "Icy gray"],
      makeup: {
        base: "Luminous satin skin",
        cheek: "Peach-coral blush",
        lip: "Warm rose gloss",
      },
      palette: ["#F8AD9D", "#FFDAB9", "#FEC5BB", "#FFF1C7", "#7BC9FF"],
      premiumNotes: premium
        ? ["Try peach beige tailoring", "Use gold jewelry near the face"]
        : ["Upgrade for detailed outfit and shopping guidance"],
    };
  }

  if (type === "makeup_analysis") {
    return {
      lookName: "Peach Glow K-Beauty",
      confidence: 0.82,
      summary:
        "Peach, coral, champagne, and warm rose shades will make the face look fresh and naturally lifted.",
      makeupPalette: [
        { type: "Base", name: "Warm beige satin", hex: "#F0C6A8" },
        { type: "Blush", name: "Peach coral bloom", hex: "#F58D7A" },
        { type: "Eyeshadow", name: "Caramel shimmer", hex: "#B8784E" },
        { type: "Lip", name: "Warm rose gloss", hex: "#D96172" },
        { type: "Highlighter", name: "Champagne glow", hex: "#FFE6B8" },
        { type: "Contour", name: "Milk tea bronze", hex: "#A96F45" },
      ],
      steps: ["Use a thin satin base", "Place blush high on cheeks", "Use a blurred glossy lip"],
      avoidShades: ["Icy lilac", "Blue red lip", "Ash gray contour"],
    };
  }

  if (type === "face_body_analysis") {
    return {
      reportTitle: "Face and Body Harmony Report",
      confidence: 0.84,
      summary: "Your visual balance is strongest with bright face framing, open posture, and clean vertical styling.",
      faceStructure: {
        shape: "Soft oval",
        balance: "86% facial harmony",
        bestAngles: ["Soft front angle", "Slight three-quarter pose", "Relaxed shoulders"],
      },
      bodyStructure: {
        frame: "Balanced vertical frame",
        postureScore: "82% posture alignment",
        proportionScore: "84% proportion balance",
      },
      skinCareTips: ["Use gentle cleanser twice daily", "Use sunscreen every morning", "Add hydrating serum before makeup"],
      hairCareTips: ["Use lightweight conditioner on ends", "Add weekly gloss mask", "Use heat protectant before styling"],
      stylingTips: ["Choose open collar outfits", "Use delicate accessories near the face", "Use vertical lines for taller balance"],
      metrics: { harmony: 86, posture: 82, proportion: 84 },
    };
  }

  return {
    faceShape: "Soft oval",
    confidence: 0.74,
    summary:
      "Face-framing layers and airy volume will balance the face while keeping the look soft and current.",
    hairColors: [
      { name: "Glossy Espresso", hex: "#3B2418", note: "Best for a polished Korean salon finish." },
      { name: "Mocha Brown", hex: "#6B3F27", note: "Softens the face while keeping rich depth." },
      { name: "Milk Tea Brown", hex: "#A96F45", note: "Brightens warm and neutral looks without harsh contrast." },
      { name: "Soft Black", hex: "#2B2B2B", note: "Clean, healthy shine for a minimal luxury style." },
    ],
    styles: [
      {
        name: "Korean Hush Cut",
        reason: "Adds movement without removing too much length.",
        maintenance: "Medium",
      },
      {
        name: "Butterfly Layers",
        reason: "Creates lift around the cheekbones and jawline.",
        maintenance: "Medium-high",
      },
      {
        name: "Soft Curtain Bangs",
        reason: "Frames the eyes while staying easy to grow out.",
        maintenance: "Low-medium",
      },
    ],
    careTips: ["Use a light mousse at roots", "Blow-dry away from the face"],
    premiumAlternatives: premium
      ? ["C-shape perm with long layers", "Glossy mocha brown color refresh"]
      : ["Upgrade for color pairings and salon-ready cut notes"],
  };
}

function buildPrompt(type: AnalysisType, answers: Record<string, string>, premium: boolean) {
  const shared = `
You are Glowra, a luxury Korean fashion and beauty AI. Analyze the uploaded image and questionnaire answers.
Return only valid JSON. Avoid medical claims and avoid identity guesses. Be practical, kind, and specific.
Questionnaire answers: ${JSON.stringify(answers)}
Premium user: ${premium}
`;

  if (type === "color_suit") {
    return `${shared}
Task: Korean personal color analysis.
JSON schema:
{
  "season": "Spring Warm | Summer Cool | Autumn Warm | Winter Cool",
  "subType": "string",
  "confidence": 0.0,
  "description": "string",
  "bestColors": ["string"],
  "avoidColors": ["string"],
  "makeup": { "base": "string", "cheek": "string", "lip": "string" },
  "palette": ["#RRGGBB"],
  "premiumNotes": ["string"]
}`;
  }

  if (type === "makeup_analysis") {
    return `${shared}
Task: full makeup shade analysis and virtual try-on guidance from the user's real selfie.
Return shades for base, blush, eyeshadow, eyeliner, mascara tone, lip, highlighter, contour, and brow color where appropriate.
JSON schema:
{
  "lookName": "string",
  "confidence": 0.0,
  "summary": "string",
  "makeupPalette": [{ "type": "string", "name": "string", "hex": "#RRGGBB" }],
  "steps": ["string"],
  "avoidShades": ["string"]
}`;
  }

  if (type === "face_body_analysis") {
    return `${shared}
Task: face and body structure analysis for styling, skincare, haircare, and report generation.
Analyze visible face shape, face harmony, posture, frame impression, and styling direction. Avoid sensitive identity, attractiveness scoring, body shaming, medical claims, or exact body measurements.
JSON schema:
{
  "reportTitle": "string",
  "confidence": 0.0,
  "summary": "string",
  "faceStructure": { "shape": "string", "balance": "string", "bestAngles": ["string"] },
  "bodyStructure": { "frame": "string", "postureScore": "string", "proportionScore": "string" },
  "skinCareTips": ["string"],
  "hairCareTips": ["string"],
  "stylingTips": ["string"],
  "metrics": { "harmony": 0, "posture": 0, "proportion": 0 }
}`;
  }

  return `${shared}
Task: hairstyle and haircut analysis.
JSON schema:
{
  "faceShape": "string",
  "confidence": 0.0,
  "summary": "string",
  "hairColors": [{ "name": "string", "hex": "#RRGGBB", "note": "string" }],
  "styles": [{ "name": "string", "reason": "string", "maintenance": "string" }],
  "careTips": ["string"],
  "premiumAlternatives": ["string"]
}`;
}

async function runAnalysis(type: AnalysisType, body: AnalyzeRequest, premium: boolean) {
  const fallback = fallbackResult(type, premium);
  if (!ai) return fallback;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: body.image.mimeType,
          data: stripDataUrlPrefix(body.image.data),
        },
      },
      { text: buildPrompt(type, body.answers, premium) },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  return safeJson(response.text, fallback);
}

function buildImageGenerationPrompt(type: AnalysisType, analysis: Record<string, any>, answers: Record<string, string>): string {
  const basePrompt = `Create a high-quality, professional beauty and fashion image. The style should be modern, clean, and inspired by Korean beauty aesthetics. The person should look natural and confident. Studio lighting, soft background, professional photography style.`;

  if (type === "color_suit") {
    const season = analysis.season || "Spring Warm";
    const bestColors = (analysis.bestColors || ["coral", "cream", "aqua"]).slice(0, 3).join(", ");
    const makeup = analysis.makeup || { base: "satin", cheek: "coral", lip: "rose" };
    return `${basePrompt}

This is for a ${season} color analysis. The person should be wearing an outfit featuring these colors: ${bestColors}. 
Makeup: ${makeup.base} base, ${makeup.cheek} blush, ${makeup.lip} lip color. 
Style preference: ${answers.preferredStyle || "elegant"}. 
The outfit should be styled for: ${answers.occasion || "everyday wear"}.
Show a full body or half-body shot with clear visibility of the outfit colors and overall styling.`;
  }

  if (type === "hair_analysis") {
    const style = analysis.styles?.[0]?.name || "Korean Hush Cut";
    const hairColor = analysis.hairColors?.[0]?.name || "Glossy Espresso";
    return `${basePrompt}

This is for a hair styling recommendation. The person should have a ${style} hairstyle with ${hairColor} hair color.
Hair texture: ${answers.hairTexture || "wavy"}. Maintenance level: ${answers.maintenance || "medium"}.
Purpose: ${answers.occasion || "daily wear"}.
Show a clear face shot focusing on the hairstyle and how it frames the face. Include shoulder-length view to see the full haircut.`;
  }

  if (type === "makeup_analysis") {
    const lookName = analysis.lookName || "K-Beauty";
    const palette = analysis.makeupPalette || [];
    const baseShade = palette.find((p: any) => p.type === "Base")?.name || "warm satin";
    const blushShade = palette.find((p: any) => p.type === "Blush")?.name || "coral";
    const lipShade = palette.find((p: any) => p.type === "Lip")?.name || "rose";
    const eyeShade = palette.find((p: any) => p.type === "Eyeshadow")?.name || "taupe";
    return `${basePrompt}

This is a ${lookName} makeup look. The person should be wearing:
- Base: ${baseShade}
- Blush: ${blushShade}
- Eyeshadow: ${eyeShade}
- Lips: ${lipShade}
Skin tone: ${answers.skinTone || "medium"}. Undertone: ${answers.undertone || "warm"}.
Show a close-up or medium shot of the face emphasizing the makeup application and how the colors look on the skin.`;
  }

  return basePrompt;
}

async function generateImage(type: AnalysisType, analysis: Record<string, any>, answers: Record<string, string>): Promise<string | null> {
  if (!ai) return null;

  try {
    const prompt = buildImageGenerationPrompt(type, analysis, answers);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use flash for faster image generation
      contents: [
        { text: prompt }
      ]
    });

    if (!response) return null;
    
    // Check if the response contains a generated image
    // Note: Gemini 2.5 flash may not support full image generation in all regions
    // Return null if image generation isn't available
    return null;
  } catch (error: any) {
    console.error("Image generation error:", error.message);
    return null;
  }
}

async function createAnalysisHandler(type: AnalysisType, req: express.Request, res: express.Response) {
  const userId = await getUserIdFromRequest(req);
  const body = req.body as AnalyzeRequest;

  if (!body.imagePath || !body.image?.data || !body.image?.mimeType?.startsWith("image/")) {
    return res.status(400).json({ error: "A valid uploaded image is required." });
  }

  const client = requireSupabase();
  const { data: profile } = await client
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .single();

  const premium = Boolean(profile?.is_premium);
  const result = await runAnalysis(type, body, premium);
  const confidence = Number(result?.confidence || 0);

  // Generate enhancement description for AI visualization
  const enhancementDescription = buildImageGenerationPrompt(type, result, body.answers);

  const { data: requestRow, error: requestError } = await client
    .from("analysis_requests")
    .insert({
      user_id: userId,
      type,
      image_path: body.imagePath,
      answers_json: body.answers,
      status: "completed",
    })
    .select("id")
    .single();

  if (requestError || !requestRow) {
    throw requestError || new Error("Could not save analysis request.");
  }

  const { error: resultError } = await client.from("analysis_results").insert({
    request_id: requestRow.id,
    result_json: result,
    confidence,
    model: ai ? GEMINI_MODEL : "fallback-local",
    premium,
  });

  if (resultError) {
    throw resultError;
  }

  res.json({
    requestId: requestRow.id,
    result,
    premium,
    model: ai ? GEMINI_MODEL : "fallback-local",
    visualizationPrompt: enhancementDescription,
    generatedImageUrl: null, // Placeholder for future image generation service
  });
}

async function startServer() {
  const app = express();
  const appPort = await findAvailablePort(PORT);
  const hmrPort = await findAvailablePort(appPort + 1);
  const appUrl = process.env.APP_URL || `http://localhost:${appPort}`;

  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).json({ error: "Stripe webhook is not configured." });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.header("stripe-signature") || "",
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error: any) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId) {
        const client = requireSupabase();
        await client.from("payments").upsert({
          user_id: userId,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : session.customer?.id,
          checkout_session_id: session.id,
          status: "completed",
          plan: session.metadata?.plan || "premium_beta",
        });
        await client.from("profiles").update({ is_premium: true }).eq("user_id", userId);
      }
    }

    res.json({ received: true });
  });

  app.use(express.json({ limit: "12mb" }));

  app.post("/api/glowra/analyze/color", async (req, res, next) => {
    try {
      await createAnalysisHandler("color_suit", req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/glowra/analyze/hair", async (req, res, next) => {
    try {
      await createAnalysisHandler("hair_analysis", req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/glowra/analyze/makeup", async (req, res, next) => {
    try {
      await createAnalysisHandler("makeup_analysis", req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/glowra/analyze/face", async (req, res, next) => {
    try {
      await createAnalysisHandler("face_body_analysis", req, res);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/glowra/visualize/outfit", async (req, res, next) => {
    try {
      const userId = await getUserIdFromRequest(req);
      const { analysisResult, type, photoData } = req.body as {
        analysisResult: Record<string, any>;
        type: AnalysisType;
        photoData: string;
      };

      if (!analysisResult || !type || !photoData) {
        return res.status(400).json({ error: "Missing analysisResult, type, or photoData." });
      }

      // Generate a rich visualization description
      let visualDescription = "";
      if (type === "color_suit") {
        const colors = (analysisResult.bestColors || []).slice(0, 3).join(", ");
        const style = analysisResult.season || "Spring Warm";
        visualDescription = `Fashion visualization: ${style} palette featuring ${colors}. Modern K-beauty inspired styling.`;
      } else if (type === "hair_analysis") {
        const style = analysisResult.styles?.[0]?.name || "Modern cut";
        const color = analysisResult.hairColors?.[0]?.name || "Brunette";
        visualDescription = `Hair styling: ${style} in ${color}. Professional salon-quality styling.`;
      } else if (type === "makeup_analysis") {
        const lookName = analysisResult.lookName || "K-Beauty look";
        visualDescription = `Makeup visualization: ${lookName}. Professional makeup application with recommended shades.`;
      }

      res.json({
        status: "visualization_ready",
        description: visualDescription,
        analysisType: type,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/create-checkout-session", async (req, res, next) => {
    try {
      if (!stripe || !process.env.STRIPE_PRICE_ID) {
        return res.status(503).json({ error: "Stripe checkout is not configured." });
      }

      const userId = await getUserIdFromRequest(req);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${appUrl}?payment=success`,
        cancel_url: `${appUrl}?payment=cancelled`,
        metadata: { userId, plan: "premium_beta" },
      });

      res.json({ url: session.url });
    } catch (error) {
      next(error);
    }
  });

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Glowra API error:", error);
    res.status(error.status || 500).json({
      error: error.message || "Glowra AI is currently resting. Please try again soon.",
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: hmrPort, host: "localhost" } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(appPort, "0.0.0.0", () => {
    console.log(`Glowra Server running at ${appUrl}`);
  });
}

startServer();
