import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { createClient, type Session, type User } from "@supabase/supabase-js";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cookie,
  Crown,
  History,
  Gem,
  Heart,
  LogOut,
  Palette,
  Brush,
  Camera,
  Scissors,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Wand2,
} from "lucide-react";

type View = "manual" | "signup" | "login" | "dashboard" | "color" | "hair" | "makeup" | "face" | "history" | "premium" | "terms" | "settings";
type AnalysisKind = "color_suit" | "hair_analysis" | "makeup_analysis" | "face_body_analysis";

type Profile = {
  user_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  theme_preference: string;
  template_preference: string;
  is_premium: boolean;
};

type HistoryItem = {
  id: string;
  type: AnalysisKind;
  image_path: string;
  image_preview?: string;
  generated_image?: string;
  created_at: string;
  analysis_results?: {
    result_json: Record<string, any>;
    confidence: number;
    premium: boolean;
    model: string;
  }[];
};

type AppUser = Pick<User, "id" | "email">;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: Sparkles },
  { id: "color", label: "Color AI", icon: Palette },
  { id: "hair", label: "Hair AI", icon: Scissors },
  { id: "makeup", label: "Makeup AI", icon: Brush },
  { id: "face", label: "Face AI", icon: UserRound },
  { id: "history", label: "History", icon: History },
  { id: "premium", label: "Premium", icon: Crown },
  { id: "settings", label: "Settings", icon: Settings },
];

const colorQuestions = [
  ["undertone", "What undertone do you feel closest to?", "Warm peach, cool pink, olive, neutral"],
  ["skinSensitivity", "How does your skin react to strong colors?", "Brightens, looks dull, redness appears, not sure"],
  ["preferredStyle", "Preferred fashion mood?", "Korean soft, luxury minimal, bold trendy, everyday casual"],
  ["occasion", "Main occasion?", "College, office, date, wedding, daily wear"],
  ["colorComfort", "Comfort with bold color?", "Soft only, medium, bold, experimental"],
];

const hairQuestions = [
  ["hairLength", "Current hair length?", "Short, shoulder, medium, long"],
  ["hairTexture", "Hair texture?", "Straight, wavy, curly, frizzy, fine, thick"],
  ["maintenance", "Maintenance level?", "Low, medium, high"],
  ["preferredStyle", "Preferred style?", "Korean hush cut, butterfly cut, bob, layers, bangs"],
  ["occasion", "Purpose?", "Daily refresh, special event, professional look, full makeover"],
];

const makeupQuestions = [
  ["skinTone", "Your skin tone range?", "Fair, light, medium, tan, deep"],
  ["undertone", "Your undertone?", "Warm, cool, olive, neutral, not sure"],
  ["finish", "Preferred skin finish?", "Dewy, satin, matte, glass skin"],
  ["occasion", "Main makeup occasion?", "Daily, party, wedding, office, date"],
  ["comfort", "Color comfort level?", "Soft nude, rosy, glam, bold, experimental"],
];

const faceQuestions = [
  ["goal", "Main goal?", "Face balance, body proportions, posture, glow up plan"],
  ["skinConcern", "Top skin concern?", "Dryness, acne, dullness, pigmentation, sensitivity"],
  ["hairConcern", "Top hair concern?", "Frizz, hair fall, dryness, oily scalp, low volume"],
  ["routine", "Current routine level?", "Beginner, simple, detailed, salon-care"],
  ["styleGoal", "Preferred aesthetic?", "Korean luxury, soft natural, bold glam, clean minimal"],
];

const palette = ["#F8AD9D", "#FFDAB9", "#FEC5BB", "#FFF1C7", "#7BC9FF"];
const colorNames: Record<string, string> = {
  "#F8AD9D": "Warm Coral",
  "#FFDAB9": "Peach Beige",
  "#FEC5BB": "Soft Apricot",
  "#FFF1C7": "Creamy Ivory",
  "#7BC9FF": "Clear Aqua",
  "#F4A7B9": "Rose Pink",
  "#D9D7FF": "Lavender Pearl",
  "#F7F5FF": "Cool Pearl",
  "#9DB7E8": "Powder Blue",
  "#27385E": "Soft Navy",
  "#3B2418": "Glossy Espresso",
  "#6B3F27": "Mocha Brown",
  "#A96F45": "Milk Tea Brown",
  "#2B2B2B": "Soft Black",
};

const defaultHairColors = [
  { name: "Glossy Espresso", hex: "#3B2418", note: "Best for a polished Korean salon finish." },
  { name: "Mocha Brown", hex: "#6B3F27", note: "Softens the face while keeping rich depth." },
  { name: "Milk Tea Brown", hex: "#A96F45", note: "Brightens warm and neutral looks without harsh contrast." },
  { name: "Soft Black", hex: "#2B2B2B", note: "Clean, healthy shine for a minimal luxury style." },
];

const styleVisuals: Record<string, string> = {
  "Korean Hush Cut": "linear-gradient(135deg, #2b2b2b 0%, #4a2e24 58%, #f5d2c4 59%, #f5d2c4 100%)",
  "Butterfly Layers": "linear-gradient(135deg, #6b3f27 0%, #a96f45 48%, #f8d8c6 49%, #f8d8c6 100%)",
  "Soft Curtain Bangs": "linear-gradient(135deg, #3b2418 0%, #7b4a31 52%, #f3c8b8 53%, #f3c8b8 100%)",
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("glass rounded-[32px]", className)}>
      {children}
    </section>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#4A4A4A]">
      {props.label}
      <input
        {...props}
        className="liquid-panel rounded-[22px] border border-white/70 px-4 py-3 text-sm outline-none transition focus:border-[#FF8E8E] focus:ring-2 focus:ring-[#FF8E8E]/20"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#4A4A4A]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="liquid-panel rounded-[22px] border border-white/70 px-4 py-3 text-sm outline-none transition focus:border-[#FF8E8E] focus:ring-2 focus:ring-[#FF8E8E]/20"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="icon-3d grid h-14 w-14 place-items-center rounded-[22px] p-2 shadow-lg">
        <div className="grid h-full w-full place-items-center rounded-full border-2 border-white">
          <Sparkles className="h-5 w-5 text-[#8E8EFF]" />
        </div>
      </div>
      <span className="glow-text text-3xl font-black tracking-normal">GLOWRA</span>
    </div>
  );
}

function FloatingBeautyIcons() {
  const items = [
    { Icon: Sparkles, className: "left-[5%] top-[20%]", delay: "0s" },
    { Icon: Palette, className: "right-[8%] top-[24%]", delay: "1.1s" },
    { Icon: Scissors, className: "left-[9%] bottom-[16%]", delay: "2.2s" },
    { Icon: Gem, className: "right-[14%] bottom-[12%]", delay: "3.1s" },
    { Icon: Heart, className: "left-[48%] top-[13%]", delay: "1.7s" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden xl:block">
      {items.map(({ Icon, className, delay }, index) => (
        <div
          key={index}
          className={cx("icon-3d absolute grid h-16 w-16 place-items-center rounded-[24px] text-[#8E8EFF]", className)}
          style={{ animationDelay: delay }}
        >
          <Icon className="h-7 w-7" />
        </div>
      ))}
    </div>
  );
}

function BeautyObjectField() {
  const objects = [
    ["Glossy lipstick", "left-[3%] top-[22%]", "linear-gradient(135deg, #FF5E83, #FFB0C2)"],
    ["Fashion hanger", "right-[5%] top-[18%]", "linear-gradient(135deg, #D9D7FF, #7BC9FF)"],
    ["Holographic shirt", "left-[16%] top-[42%]", "linear-gradient(135deg, #DDF6FF, #C3BEF0, #DDF7EA)"],
    ["Makeup brush", "right-[16%] top-[42%]", "linear-gradient(135deg, #3B2418, #FFDAB9)"],
    ["Color palette", "left-[5%] bottom-[20%]", "linear-gradient(135deg, #F8AD9D, #D9D7FF, #7BC9FF)"],
    ["Crystal perfume", "right-[7%] bottom-[22%]", "linear-gradient(135deg, #F7F5FF, #9DB7E8)"],
    ["Shiny scissors", "left-[28%] bottom-[9%]", "linear-gradient(135deg, #E8EAFF, #8E8EFF)"],
    ["Glossy handbag", "right-[30%] bottom-[8%]", "linear-gradient(135deg, #2B2B2B, #A98CFF)"],
    ["Glowing mirror", "left-[44%] top-[18%]", "linear-gradient(135deg, #DDF6FF, #FFFFFF)"],
    ["Skincare bottle", "right-[42%] top-[10%]", "linear-gradient(135deg, #DDF7EA, #7BC9FF)"],
    ["Luxury heels", "left-[38%] bottom-[24%]", "linear-gradient(135deg, #FF8E8E, #3B2418)"],
    ["Holo jewelry", "right-[39%] bottom-[27%]", "linear-gradient(135deg, #FFF1C7, #D9D7FF, #DDF6FF)"],
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-[2] hidden overflow-hidden 2xl:block">
      {objects.map(([label, position, gradient], index) => (
        <div
          key={label}
          className={cx("beauty-object", position)}
          style={{ ["--object-gradient" as string]: gradient, animationDelay: `${index * 0.45}s` }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function AIOrb({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cx("ai-orb", compact ? "h-24 w-24" : "h-44 w-44 md:h-56 md:w-56")}>
      <div className="grid h-[58%] w-[58%] place-items-center rounded-full border border-white/70 bg-white/30 backdrop-blur-xl">
        <Sparkles className={cx("text-white drop-shadow", compact ? "h-8 w-8" : "h-14 w-14")} />
      </div>
    </div>
  );
}

function FashionFlashcards() {
  const cards = [
    { title: "Seasonal Aura", value: "Summer Cool", copy: "Lavender pearl, powder blue, and rose pink lift your glow.", accent: "#D9D7FF", score: 92 },
    { title: "Outfit Sync", value: "88% Match", copy: "Soft contrast styling with glossy silver accents.", accent: "#7BC9FF", score: 88 },
    { title: "Makeup Match", value: "Rose Tint", copy: "Clear satin skin, cool pink cheek, blurred rose lip.", accent: "#F4A7B9", score: 90 },
    { title: "Hair Vision", value: "Hush Cut", copy: "Airy layers with glossy espresso color movement.", accent: "#6B3F27", score: 86 },
  ];

  return (
    <div className="no-scrollbar flashcard-lane flex gap-5 overflow-x-auto pb-4">
      {cards.map((card, index) => (
        <div key={card.title} className="fashion-flashcard glass p-6" style={{ animationDelay: `${index * 0.8}s` }}>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">{card.title}</span>
            <span className="grid h-12 w-12 place-items-center rounded-full text-sm font-black text-white" style={{ background: card.accent }}>
              {index + 1}
            </span>
          </div>
          <div className="mt-20">
            <p className="text-5xl font-black leading-none tracking-normal">{card.value}</p>
            <p className="mt-5 max-w-[260px] text-base font-semibold leading-7 text-[#666]">{card.copy}</p>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="mb-3 flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-[#777]">
              <span>Beauty score</span>
              <span>{card.score}%</span>
            </div>
            <div className="meter-track h-3">
              <div className="meter-fill" style={{ width: `${card.score}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FaceScanner({ kind }: { kind: AnalysisKind }) {
  return (
    <div className="scanner-stage liquid-panel">
      <div className="scan-line" />
      <div className="scanner-face" />
      <div className="absolute left-5 top-5 rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#777]">
        {kind === "color_suit" ? "Aura scanner" : "Hair mesh"}
      </div>
      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
        {["Skin harmony", "Face balance", "Style match"].map((label, index) => (
          <div key={label} className="rounded-2xl bg-white/55 p-3">
            <p className="text-[10px] font-black uppercase text-[#777]">{label}</p>
            <div className="meter-track mt-2 h-2">
              <div className="meter-fill" style={{ width: `${82 + index * 4}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BeautyAnalytics({ result }: { result: Record<string, any> }) {
  const base = Math.round(Number(result.confidence || 0.82) * 100);
  const metrics = [
    ["Skin harmony", Math.min(99, base + 5)],
    ["Outfit compatibility", Math.max(74, base - 2)],
    ["Season signal", Math.min(98, base + 8)],
    ["Beauty balance", Math.max(78, base + 1)],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="liquid-panel grid place-items-center rounded-[32px] p-6 text-center">
        <div className="grid h-40 w-40 place-items-center rounded-full border-[12px] border-[#D9D7FF] bg-white/55 shadow-inner">
          <div>
            <p className="text-5xl font-black glow-text">{base}</p>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#777]">Aura score</p>
          </div>
        </div>
      </div>
      <div className="liquid-panel rounded-[32px] p-5">
        <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#777]">Glowing analytics</h4>
        <div className="grid gap-4">
          {metrics.map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-sm font-black">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="meter-track h-3">
                <div className="meter-fill" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, fileName: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}

function isInvalidSupabaseKey(error?: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("invalid api key"));
}

function localProfile(input: {
  name?: string;
  age?: number;
  gender?: string;
  phone?: string;
  email: string;
  isPremium?: boolean;
}): Profile {
  return {
    user_id: "local-demo-user",
    name: input.name || input.email.split("@")[0] || "Glowra User",
    age: input.age || 21,
    gender: input.gender || "Prefer not to say",
    phone: input.phone || "0000000000",
    email: input.email,
    theme_preference: "Soft K-beauty",
    template_preference: "Editorial cards",
    is_premium: Boolean(input.isPremium),
  };
}

function loadLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem("glowra-local-history") || "[]") as HistoryItem[];
  } catch {
    return [];
  }
}

function saveLocalHistory(history: HistoryItem[]) {
  localStorage.setItem("glowra-local-history", JSON.stringify(history));
}

function getPhotoSeed(photoData = "") {
  let seed = 0;
  for (let index = 0; index < photoData.length; index += Math.max(1, Math.floor(photoData.length / 120))) {
    seed = (seed + photoData.charCodeAt(index) * (index + 1)) % 9973;
  }
  return seed;
}

function localAiResult(kind: AnalysisKind, answers: Record<string, string>, premium: boolean, photoData = "") {
  const seed = getPhotoSeed(photoData);
  if (kind === "color_suit") {
    const warm = `${answers.undertone || ""} ${answers.colorComfort || ""}`.toLowerCase().includes("warm");
    const coolSeason = seed % 2 === 0 ? "Summer Cool" : "Winter Cool";
    const warmSeason = seed % 2 === 0 ? "Spring Warm" : "Autumn Warm";
    return {
      season: warm ? warmSeason : coolSeason,
      subType: warm ? (seed % 3 === 0 ? "Golden Apricot" : "Clear Peach") : (seed % 3 === 0 ? "Icy Rose" : "Soft Rose"),
      confidence: premium ? 0.88 + (seed % 8) / 100 : 0.78 + (seed % 10) / 100,
      description: warm
        ? "Warm peach, coral, ivory, and clear aqua will brighten your face and keep the styling fresh."
        : "Cool rose, lavender, pearl, and soft blue will make the look cleaner and more balanced.",
      bestColors: warm ? ["Coral", "Warm ivory", "Peach", "Camel", "Clear aqua"] : ["Rose pink", "Lavender", "Pearl", "Soft navy", "Powder blue"],
      avoidColors: warm ? ["Icy gray", "Dusty mauve", "Flat black"] : ["Orange brown", "Mustard", "Warm beige"],
      makeup: warm
        ? { base: "Luminous satin", cheek: "Peach coral", lip: "Warm rose gloss" }
        : { base: "Clear satin", cheek: "Cool pink", lip: "Rose tint" },
      palette: warm ? ["#F8AD9D", "#FFDAB9", "#FEC5BB", "#FFF1C7", "#7BC9FF"] : ["#F4A7B9", "#D9D7FF", "#F7F5FF", "#9DB7E8", "#27385E"],
      premiumNotes: premium ? ["Use the two brightest colors near your face.", "Keep accessories in the same temperature family."] : ["Upgrade for detailed outfit and product notes."],
    };
  }

  if (kind === "makeup_analysis") {
    const cool = `${answers.undertone || ""} ${answers.comfort || ""}`.toLowerCase().includes("cool");
    return {
      lookName: cool ? "Rose Glass K-Beauty" : "Peach Glow K-Beauty",
      confidence: premium ? 0.89 + (seed % 8) / 100 : 0.8 + (seed % 10) / 100,
      summary: cool
        ? "Cool rose, mauve, pearl, and soft berry shades will look clean, romantic, and camera-friendly."
        : "Peach, coral, champagne, and warm rose shades will make your face look fresh and naturally lifted.",
      makeupPalette: cool
        ? [
            { type: "Base", name: "Neutral ivory satin", hex: "#F4D7CF" },
            { type: "Blush", name: "Cool rose flush", hex: "#E59AAF" },
            { type: "Eyeshadow", name: "Lavender taupe", hex: "#B9A6D8" },
            { type: "Lip", name: "Berry rose tint", hex: "#B24C6B" },
            { type: "Highlighter", name: "Pearl beam", hex: "#F7F5FF" },
            { type: "Contour", name: "Soft cocoa shadow", hex: "#8A695F" },
          ]
        : [
            { type: "Base", name: "Warm beige satin", hex: "#F0C6A8" },
            { type: "Blush", name: "Peach coral bloom", hex: "#F58D7A" },
            { type: "Eyeshadow", name: "Caramel shimmer", hex: "#B8784E" },
            { type: "Lip", name: "Warm rose gloss", hex: "#D96172" },
            { type: "Highlighter", name: "Champagne glow", hex: "#FFE6B8" },
            { type: "Contour", name: "Milk tea bronze", hex: "#A96F45" },
          ],
      steps: ["Use a thin satin base.", "Place blush high on cheeks.", "Keep shimmer near inner eye.", "Use a blurred glossy lip."],
      avoidShades: cool ? ["Orange coral", "Mustard gold", "Warm brown lip"] : ["Icy lilac", "Blue red lip", "Ash gray contour"],
      skinCareTips: cool
        ? ["Use a calming gel cleanser.", "Add ceramide moisturizer before makeup.", "Choose pearl sunscreen to reduce dullness."]
        : ["Use a hydrating cleanser.", "Add niacinamide serum for glow.", "Use dewy sunscreen before base makeup."],
    };
  }

  if (kind === "face_body_analysis") {
    const harmony = 78 + (seed % 18);
    const posture = 74 + (seed % 20);
    const proportion = 76 + (seed % 17);
    return {
      reportTitle: "Face and Body Harmony Report",
      confidence: 0.8 + (seed % 12) / 100,
      summary: "Your visual balance is strongest when styling keeps the face bright, posture open, and silhouette clean.",
      faceStructure: {
        shape: seed % 2 === 0 ? "Soft oval" : "Heart-soft oval",
        balance: `${harmony}% facial harmony`,
        bestAngles: ["Soft front angle", "Slight three-quarter pose", "Lifted chin with relaxed shoulders"],
      },
      bodyStructure: {
        frame: seed % 2 === 0 ? "Balanced vertical frame" : "Soft shoulder-balanced frame",
        postureScore: `${posture}% posture alignment`,
        proportionScore: `${proportion}% proportion balance`,
      },
      skinCareTips: ["Use gentle cleanser twice daily.", "Add sunscreen every morning.", "Use hydrating serum before makeup.", "Avoid harsh scrubs when skin feels sensitive."],
      hairCareTips: ["Use lightweight conditioner on ends.", "Add weekly gloss or hair mask.", "Avoid high heat near face-framing layers.", "Use scalp massage for volume."],
      stylingTips: ["Choose V-neck or open collar outfits.", "Keep accessories near the face delicate.", "Use vertical lines for taller visual balance."],
      metrics: { harmony, posture, proportion },
    };
  }

  const styleOffset = seed % 3;
  const styles = [
    { name: "Korean Hush Cut", reason: "Adds movement without looking heavy.", maintenance: answers.maintenance || "Medium" },
    { name: "Butterfly Layers", reason: "Lifts the cheekbone area and works well for photo-ready styling.", maintenance: "Medium-high" },
    { name: "Soft Curtain Bangs", reason: "Frames the eyes and is easy to grow out.", maintenance: "Low-medium" },
  ];
  return {
    faceShape: "Soft oval",
    confidence: premium ? 0.87 + (seed % 9) / 100 : 0.77 + (seed % 11) / 100,
    summary: "Face-framing movement, airy layers, and soft volume will suit the preferences you entered.",
    styles: [...styles.slice(styleOffset), ...styles.slice(0, styleOffset)],
    hairColors: defaultHairColors,
    careTips: ["Use light root volume spray.", "Blow-dry front pieces away from the face.", "Finish with shine serum only on ends."],
    hairCareTips: ["Use sulfate-free shampoo if hair feels dry.", "Apply mask once a week.", "Use heat protectant before styling.", "Trim face-framing layers every 8 to 10 weeks."],
    premiumAlternatives: premium ? ["C-shape perm with long layers", "Mocha brown gloss refresh"] : ["Upgrade for salon-ready cut notes."],
  };
}

export default function App() {
  const [view, setView] = useState<View>("manual");
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) setView("dashboard");
    }).catch(() => setMessage("Supabase key is invalid. Local demo mode is available until the real anon key is added."));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) setView("dashboard");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setHistory([]);
      return;
    }
    if (user.id === "local-demo-user") {
      setHistory(loadLocalHistory());
      return;
    }
    if (!supabase) return;
    loadProfile();
    loadHistory();
  }, [user?.id]);

  async function loadProfile() {
    if (!supabase || !user) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
    if (!error) setProfile(data as Profile);
  }

  async function loadHistory() {
    if (user?.id === "local-demo-user") {
      setHistory(loadLocalHistory());
      return;
    }
    if (!supabase || !user) return;
    const { data } = await supabase
      .from("analysis_requests")
      .select("id,type,image_path,created_at,analysis_results(result_json,confidence,premium,model)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHistory((data || []) as HistoryItem[]);
  }

  async function logout() {
    if (supabase && user?.id !== "local-demo-user") await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setHistory([]);
    setView("manual");
    setMessage("Logged out successfully.");
  }

  function startLocalSession(nextProfile: Profile, notice = "Local demo mode started. Add the real Supabase anon key for cloud login.") {
    localStorage.setItem("glowra-local-profile", JSON.stringify(nextProfile));
    setSession(null);
    setUser({ id: nextProfile.user_id, email: nextProfile.email });
    setProfile(nextProfile);
    setHistory(loadLocalHistory());
    setView("dashboard");
    setMessage(notice);
  }

  function addLocalHistory(kind: AnalysisKind, result: Record<string, any>, imagePreview = "", generatedImage = "") {
    const next: HistoryItem = {
      id: `local-${Date.now()}`,
      type: kind,
      image_path: "local-demo-image",
      image_preview: imagePreview,
      generated_image: generatedImage,
      created_at: new Date().toISOString(),
      analysis_results: [{ result_json: result, confidence: Number(result.confidence || 0), premium: Boolean(profile?.is_premium), model: "local-glowra-ai" }],
    };
    const updated = [next, ...history];
    setHistory(updated);
    saveLocalHistory(updated);
  }

  const latestColor = history.find((item) => item.type === "color_suit")?.analysis_results?.[0]?.result_json;
  const latestHair = history.find((item) => item.type === "hair_analysis")?.analysis_results?.[0]?.result_json;

  return (
    <div className="cinematic-shell min-h-screen overflow-hidden p-3 text-[#373740] md:p-6">
      <FloatingBeautyIcons />
      <BeautyObjectField />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1500px] flex-col gap-6 pb-28 md:pb-6">
        <header className="glass sticky top-3 z-20 flex flex-col gap-4 rounded-[34px] p-4 md:flex-row md:items-center md:justify-between md:px-6">
          <Logo />
          <nav className="no-scrollbar flex gap-2 overflow-x-auto">
            {(user ? navItems : [{ id: "manual" as View, label: "Manual", icon: BookOpen }, { id: "login" as View, label: "Login", icon: UserRound }, { id: "signup" as View, label: "Create Account", icon: ShieldCheck }, { id: "terms" as View, label: "Terms", icon: Cookie }]).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cx(
                    "flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-normal transition",
                    view === item.id ? "luxury-button text-white" : "liquid-panel text-[#4A4A4A] hover:scale-[1.03]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            {user && (
              <button onClick={logout} className="liquid-panel flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-normal transition hover:scale-[1.03]">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            )}
          </nav>
        </header>

        {message && (
          <button onClick={() => setMessage("")} className="luxury-button rounded-[26px] px-6 py-4 text-left text-sm font-bold text-white shadow-lg">
            {message}
          </button>
        )}

        {view === "manual" && <Manual onStart={() => setView(user ? "dashboard" : "signup")} />}
        {view === "signup" && <Signup setMessage={setMessage} setView={setView} onLocalAuth={startLocalSession} />}
        {view === "login" && <Login setMessage={setMessage} onLocalAuth={startLocalSession} />}
        {view === "terms" && <Terms />}
        {view === "dashboard" && <Dashboard profile={profile} latestColor={latestColor} latestHair={latestHair} setView={setView} />}
        {view === "color" && <AnalysisStudio kind="color_suit" questions={colorQuestions} session={session} profile={profile} setMessage={setMessage} refresh={loadHistory} onLocalResult={addLocalHistory} />}
        {view === "hair" && <AnalysisStudio kind="hair_analysis" questions={hairQuestions} session={session} profile={profile} setMessage={setMessage} refresh={loadHistory} onLocalResult={addLocalHistory} />}
        {view === "makeup" && <AnalysisStudio kind="makeup_analysis" questions={makeupQuestions} session={session} profile={profile} setMessage={setMessage} refresh={loadHistory} onLocalResult={addLocalHistory} />}
        {view === "face" && <AnalysisStudio kind="face_body_analysis" questions={faceQuestions} session={session} profile={profile} setMessage={setMessage} refresh={loadHistory} onLocalResult={addLocalHistory} />}
        {view === "history" && <HistoryView history={history} refresh={loadHistory} />}
        {view === "premium" && <Premium session={session} profile={profile} setMessage={setMessage} />}
        {view === "settings" && <Preferences profile={profile} setProfile={setProfile} setMessage={setMessage} />}
      </div>

      <nav className="bottom-orbit-nav fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 justify-between rounded-[30px] border border-white/60 p-2 shadow-2xl shadow-purple-200/30 md:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(user ? item.id : "signup")}
              className={cx("grid h-14 w-14 place-items-center rounded-[22px] transition", view === item.id ? "luxury-button text-white" : "text-[#4A4A4A]")}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Manual({ onStart }: { onStart: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-9rem)] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <GlassCard className="relative flex flex-col justify-center p-8 md:p-12">
        <div className="absolute right-8 top-8 hidden md:block">
          <AIOrb compact />
        </div>
        <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-[#FF7C9C]">Next-gen beauty assistant</p>
        <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-normal md:text-7xl">
          Your holographic Korean beauty universe.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-9 text-[#5F5F5F]">
          Swipe premium fashion cards, scan your selfie, discover seasonal aura, matching makeup, color palettes, outfits, hairstyles, and glowing AI analytics.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onStart} className="luxury-button flex items-center gap-2 rounded-full px-7 py-4 text-sm font-black text-white transition hover:scale-[1.02]">
            Launch AI scanner <ChevronRight className="h-4 w-4" />
          </button>
          <a href="#manual-steps" className="liquid-panel flex items-center gap-2 rounded-full px-7 py-4 text-sm font-black">
            Beauty flow <BookOpen className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Skin harmony", 94],
            ["Outfit match", 88],
            ["Season aura", 91],
          ].map(([label, value]) => (
            <div key={label} className="liquid-panel rounded-[24px] p-4">
              <p className="text-xs font-black uppercase text-[#777]">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}%</p>
              <div className="meter-track mt-3 h-2">
                <div className="meter-fill" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6">
        <div className="grid place-items-center">
          <AIOrb />
        </div>
        <FashionFlashcards />
      </div>

      <GlassCard className="p-6 md:p-8 lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-5" id="manual-steps">
          {[
            ["1", "Create account and unlock your beauty OS."],
            ["2", "Upload selfie for scanner and aura detection."],
            ["3", "Receive palette, outfit, makeup, and hair cards."],
            ["4", "Read analytics for harmony and compatibility."],
            ["5", "Upgrade for deeper premium recommendations."],
          ].map(([num, text]) => (
            <div key={num} className="liquid-panel flex gap-4 rounded-[26px] p-5 md:flex-col">
              <span className="holographic-gradient grid h-12 w-12 shrink-0 place-items-center rounded-[18px] text-sm font-black text-white shadow-lg">{num}</span>
              <p className="text-sm font-semibold leading-6">{text}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}

function Signup({
  setMessage,
  setView,
  onLocalAuth,
}: {
  setMessage: (message: string) => void;
  setView: (view: View) => void;
  onLocalAuth: (profile: Profile, notice?: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Female",
    phone: "",
    email: "",
    password: "",
    terms: false,
    cookies: false,
  });
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name || !form.age || !form.gender || !form.phone || !form.email || !form.password || !form.terms || !form.cookies) {
      return setMessage("Please complete all account details and consent checkboxes.");
    }
    if (!supabase) {
      onLocalAuth(localProfile({ name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone, email: form.email }));
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (error || !data.user) {
      setBusy(false);
      if (isInvalidSupabaseKey(error)) {
        onLocalAuth(
          localProfile({ name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone, email: form.email }),
          "Supabase rejected the anon key, so Glowra opened in local demo mode. Paste the real anon key to enable cloud login.",
        );
        return;
      }
      return setMessage(error?.message || "Could not create account.");
    }
    const now = new Date().toISOString();
    const { error: profileError } = await supabase.from("profiles").upsert({
      user_id: data.user.id,
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      terms_accepted_at: now,
      cookies_accepted_at: now,
    });
    setBusy(false);
    if (profileError) return setMessage(profileError.message);
    setMessage("Account created. Welcome to Glowra.");
    setView("dashboard");
  }

  return (
    <AuthShell title="Create your Glowra account" helper="All fields are required for safer, more accurate beta analysis.">
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Field label="Age" type="number" min="13" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
        <SelectField label="Gender" value={form.gender} onChange={(gender) => setForm({ ...form, gender })} options={["Female", "Male", "Non-binary", "Prefer not to say"]} />
        <Field label="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <Field label="Email ID" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Field label="Password" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <label className="liquid-panel flex gap-3 rounded-[24px] p-4 text-sm font-semibold md:col-span-2">
          <input type="checkbox" checked={form.cookies} onChange={(e) => setForm({ ...form, cookies: e.target.checked })} />
          I accept app cookies for login, preferences, and premium access.
        </label>
        <label className="liquid-panel flex gap-3 rounded-[24px] p-4 text-sm font-semibold md:col-span-2">
          <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
          I accept Glowra terms and AI image analysis conditions.
        </label>
        <button disabled={busy} className="luxury-button rounded-full px-6 py-3 text-sm font-black text-white disabled:opacity-50 md:col-span-2">
          {busy ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

function Login({
  setMessage,
  onLocalAuth,
}: {
  setMessage: (message: string) => void;
  onLocalAuth: (profile: Profile, notice?: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) {
      onLocalAuth(localProfile({ email }));
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      if (isInvalidSupabaseKey(error)) {
        const saved = localStorage.getItem("glowra-local-profile");
        const fallback = saved ? (JSON.parse(saved) as Profile) : localProfile({ email });
        onLocalAuth(fallback, "Supabase rejected the anon key, so Glowra opened in local demo mode. Paste the real anon key to enable cloud login.");
        return;
      }
      return setMessage(error.message);
    }
    setMessage("Logged in successfully.");
  }

  return (
    <AuthShell title="Log in to Glowra" helper="Continue your saved color, hair, and premium analysis history.">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Email ID" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={busy} className="luxury-button rounded-full px-6 py-3 text-sm font-black text-white disabled:opacity-50">
          {busy ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, helper, children }: { title: string; helper: string; children: React.ReactNode }) {
  return (
    <GlassCard className="mx-auto w-full max-w-3xl p-6 md:p-8">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#FF8E8E]">Account</p>
      <h1 className="text-3xl font-black tracking-normal">{title}</h1>
      <p className="mb-6 mt-2 text-sm leading-6 text-[#666]">{helper}</p>
      {children}
    </GlassCard>
  );
}

function Dashboard({
  profile,
  latestColor,
  latestHair,
  setView,
}: {
  profile: Profile | null;
  latestColor?: Record<string, any>;
  latestHair?: Record<string, any>;
  setView: (view: View) => void;
}) {
  return (
    <main className="grid gap-6 lg:grid-cols-12">
      <GlassCard className="p-7 lg:col-span-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF8E8E]">Glow score</p>
        <div className="mt-6 grid place-items-center text-center">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="holographic-gradient grid h-56 w-56 place-items-center rounded-full border border-white/70 shadow-2xl shadow-pink-200/30">
            <div>
              <p className="text-7xl font-black text-white drop-shadow">{profile?.is_premium ? "96" : "84"}</p>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">{profile?.is_premium ? "Premium" : "Beta"}</p>
            </div>
          </motion.div>
          <h2 className="mt-5 text-2xl font-black">{latestColor?.season || "Ready for analysis"}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#666]">{latestColor?.description || "Upload your first image to unlock a Korean seasonal palette and Glowra recommendations."}</p>
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:col-span-8">
        <GlassCard className="p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-[#FF8E8E]">Hello {profile?.name || "Glowra user"}</p>
              <h1 className="text-3xl font-black tracking-normal">Choose your AI studio</h1>
            </div>
            <span className="liquid-panel w-fit rounded-full px-4 py-2 text-xs font-black uppercase">{profile?.is_premium ? "Premium active" : "Free beta"}</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <StudioButton icon={Palette} title="Color Suit Analysis" text="Season, palette, makeup, outfit shades." onClick={() => setView("color")} />
            <StudioButton icon={Scissors} title="Hair Style Analysis" text="Haircut, face balance, styling and care." onClick={() => setView("hair")} />
            <StudioButton icon={Brush} title="Makeup Shade Analysis" text="Base, blush, lip, eye, contour, glow shades." onClick={() => setView("makeup")} />
            <StudioButton icon={UserRound} title="Face and Body Analysis" text="Face harmony, body structure, skincare, haircare report." onClick={() => setView("face")} />
          </div>
        </GlassCard>

        <div className="grid gap-6 md:grid-cols-2">
          <ResultPreview title="Latest palette" empty="No color result yet." data={latestColor} />
          <ResultPreview title="Latest haircut" empty="No hair result yet." data={latestHair} />
        </div>
      </div>
    </main>
  );
}

function StudioButton({ icon: Icon, title, text, onClick }: { icon: React.ElementType; title: string; text: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="liquid-panel rounded-[28px] p-6 text-left transition hover:scale-[1.02]">
      <Icon className="mb-4 h-8 w-8 text-[#FF8E8E]" />
      <h3 className="text-xl font-black tracking-normal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#666]">{text}</p>
    </button>
  );
}

function AnalysisStudio({
  kind,
  questions,
  session,
  profile,
  setMessage,
  refresh,
  onLocalResult,
}: {
  kind: AnalysisKind;
  questions: string[][];
  session: Session | null;
  profile: Profile | null;
  setMessage: (message: string) => void;
  refresh: () => Promise<void>;
  onLocalResult: (kind: AnalysisKind, result: Record<string, any>, imagePreview?: string, generatedImage?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, any> | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [visualizationLoading, setVisualizationLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const title = kind === "color_suit" ? "Color Suit AI" : kind === "hair_analysis" ? "Hair Style AI" : kind === "makeup_analysis" ? "Makeup Shade AI" : "Face and Body AI";
  const endpoint = kind === "color_suit" ? "/api/glowra/analyze/color" : kind === "hair_analysis" ? "/api/glowra/analyze/hair" : kind === "makeup_analysis" ? "/api/glowra/analyze/makeup" : "/api/glowra/analyze/face";

  async function openCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage("Camera is not available in this browser. Use upload, or open the app on HTTPS/localhost.");
        return;
      }
      if (!window.isSecureContext && !location.hostname.includes("localhost")) {
        setMessage("Camera requires HTTPS or localhost. Open the deployed HTTPS site or localhost to use live selfie.");
        return;
      }
      closeCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error: any) {
      setMessage(error.message || "Camera access was blocked. You can still upload a selfie.");
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function captureSelfie() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const selfie = await dataUrlToFile(dataUrl, `glowra-selfie-${Date.now()}.jpg`);
    setFile(selfie);
    setPhotoUrl(dataUrl);
    closeCamera();
  }

  function onFileChange(nextFile: File | null) {
    setFile(nextFile);
    if (!nextFile) {
      setPhotoUrl("");
      return;
    }
    readAsDataUrl(nextFile).then(setPhotoUrl).catch(() => setPhotoUrl(""));
  }

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setMessage("Camera opened, but playback was blocked. Please allow camera access and retry."));
  }, [cameraOpen]);

  useEffect(() => () => closeCamera(), []);

  async function generateOutfitVisualization(analysisResult: Record<string, any>) {
    if (!session?.access_token || !photoUrl) return;
    
    setVisualizationLoading(true);
    try {
      const response = await fetch("/api/glowra/visualize/outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          analysisResult,
          type: kind,
          photoData: photoUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Visualization failed.");
      
      // Create an enhanced try-on image using canvas
      const enhancedImageUrl = await createEnhancedTryOn(kind, analysisResult, photoUrl);
      setGeneratedImage(enhancedImageUrl);
    } catch (error: any) {
      console.error("Visualization error:", error);
    } finally {
      setVisualizationLoading(false);
    }
  }

  async function createEnhancedTryOn(type: AnalysisKind, analysis: Record<string, any>, basePhotoUrl: string): Promise<string> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return basePhotoUrl;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (type === "color_suit") {
          const colors = analysis.palette || ["#F8AD9D", "#FFDAB9", "#FEC5BB"];
          const outfitColor = colors[0] || "#F8AD9D";
          ctx.globalAlpha = 0.72;
          const outfitGradient = ctx.createLinearGradient(0, canvas.height * 0.48, 0, canvas.height);
          outfitGradient.addColorStop(0, outfitColor);
          outfitGradient.addColorStop(1, colors[1] || outfitColor);
          ctx.fillStyle = outfitGradient;
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.24, canvas.height * 0.58);
          ctx.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.48, canvas.width * 0.76, canvas.height * 0.58);
          ctx.lineTo(canvas.width * 0.92, canvas.height);
          ctx.lineTo(canvas.width * 0.08, canvas.height);
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 0.35;
          colors.slice(0, 4).forEach((color: string, index: number) => {
            ctx.fillStyle = color;
            ctx.fillRect(canvas.width * (0.16 + index * 0.17), canvas.height * 0.82, canvas.width * 0.12, canvas.height * 0.12);
          });
          ctx.globalAlpha = 1;
          
          // Add label
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText(`${analysis.season} Palette`, 20, canvas.height - 20);
        } else if (type === "hair_analysis") {
          const hairColor = analysis.hairColors?.[0]?.hex || "#3B2418";
          // Add hair color effect overlay at top
          ctx.fillStyle = hairColor;
          ctx.globalAlpha = 0.45;
          const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.35);
          gradient.addColorStop(0, hairColor);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height * 0.35);
          ctx.globalAlpha = 1;
          
          // Add label
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText(`${analysis.styles?.[0]?.name || "Hair Style"}`, 20, 50);
        } else if (type === "makeup_analysis") {
          const palette = analysis.makeupPalette || [];
          const blushColor = palette.find((p: any) => p.type === "Blush")?.hex || "#E59AAF";
          const lipColor = palette.find((p: any) => p.type === "Lip")?.hex || "#D96172";
          
          // Add makeup effect with blush and lip color hints
          ctx.fillStyle = blushColor;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.arc(canvas.width * 0.25, canvas.height * 0.4, 60, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(canvas.width * 0.75, canvas.height * 0.4, 60, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = lipColor;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.ellipse(canvas.width * 0.5, canvas.height * 0.55, 40, 25, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          
          // Add label
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText(`${analysis.lookName || "Makeup Look"}`, 20, canvas.height - 20);
        } else if (type === "face_body_analysis") {
          ctx.strokeStyle = "rgba(123, 201, 255, 0.9)";
          ctx.lineWidth = 5;
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.ellipse(canvas.width * 0.5, canvas.height * 0.32, canvas.width * 0.18, canvas.height * 0.18, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.5, canvas.height * 0.5);
          ctx.lineTo(canvas.width * 0.5, canvas.height * 0.9);
          ctx.moveTo(canvas.width * 0.28, canvas.height * 0.58);
          ctx.lineTo(canvas.width * 0.72, canvas.height * 0.58);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText("Face and body harmony", 20, canvas.height - 20);
        }

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(basePhotoUrl);
      img.src = basePhotoUrl;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !file.type.startsWith("image/")) return setMessage("Upload a valid image file first.");

    if (!supabase || !session?.access_token || !session.user) {
      const demoResult = localAiResult(kind, answers, Boolean(profile?.is_premium), photoUrl);
      const enhancedImageUrl = photoUrl ? await createEnhancedTryOn(kind, demoResult, photoUrl) : "";
      setResult(demoResult);
      setGeneratedImage(enhancedImageUrl || null);
      onLocalResult(kind, demoResult, photoUrl, enhancedImageUrl);
      setMessage(`${title} completed in local AI demo mode. Photo, try-on preview, and report are saved in history.`);
      return;
    }

    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
      const imagePath = `${session.user.id}/${kind}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("glowra-private").upload(imagePath, file, { upsert: false });
      if (uploadError) throw uploadError;

      const dataUrl = await readAsDataUrl(file);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          imagePath,
          image: { data: dataUrl, mimeType: file.type },
          answers,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Analysis failed.");
      setResult(payload.result);
      
      // Generate outfit visualization
      await generateOutfitVisualization(payload.result);
      
      await refresh();
      setMessage(`${title} completed and saved privately. Generated outfit preview ready!`);
    } catch (error: any) {
      setMessage(error.message || "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <GlassCard className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF8E8E]">{profile?.is_premium ? "Premium depth" : "Free beta"}</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal">{title}</h1>
        <div className="mt-6">
          <FaceScanner kind={kind} />
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="liquid-panel grid min-h-56 cursor-pointer place-items-center rounded-[32px] border border-white/75 p-8 text-center transition hover:scale-[1.01]">
            <span className="icon-3d mb-4 grid h-16 w-16 place-items-center rounded-[24px]">
              <Upload className="h-8 w-8 text-[#FF8E8E]" />
            </span>
            <span className="text-sm font-black">{file ? file.name : "Single click or drag to select an image"}</span>
            <span className="mt-1 text-xs text-[#777]">{kind === "color_suit" ? "Selfie or outfit image" : kind === "hair_analysis" ? "Face and hair image" : "Clean selfie for makeup shades"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] || null)} />
          </label>
          <button type="button" onClick={openCamera} className="liquid-panel flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black transition hover:scale-[1.02]">
            <Camera className="h-4 w-4" />
            Take live selfie
          </button>
          {cameraOpen && (
            <div className="glass rounded-[32px] p-4">
              <video ref={videoRef} autoPlay playsInline muted className="aspect-[3/4] w-full rounded-[26px] bg-black object-cover [transform:scaleX(-1)]" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" onClick={captureSelfie} className="luxury-button rounded-full px-5 py-3 text-sm font-black text-white">
                  Capture selfie
                </button>
                <button type="button" onClick={closeCamera} className="liquid-panel rounded-full px-5 py-3 text-sm font-black">
                  Close camera
                </button>
              </div>
            </div>
          )}
          {photoUrl && (
            <PhotoTryOn kind={kind} result={result || localAiResult(kind, answers, Boolean(profile?.is_premium), photoUrl)} photoUrl={photoUrl} compact />
          )}
          {questions.map(([key, label, placeholder]) => (
            <Field key={key} label={label} value={answers[key] || ""} placeholder={placeholder} onChange={(event) => setAnswers({ ...answers, [key]: event.target.value })} />
          ))}
          <button disabled={busy} className="luxury-button flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black text-white disabled:opacity-50">
            {busy ? "Analyzing..." : "Run AI analysis"} <Wand2 className="h-4 w-4" />
          </button>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-3xl font-black tracking-normal">Result</h2>
        {result ? <ResultJson result={result} kind={kind} photoUrl={photoUrl} generatedImage={generatedImage} visualizationLoading={visualizationLoading} /> : <EmptyResult kind={kind} />}
      </GlassCard>
    </main>
  );
}

function EmptyResult({ kind }: { kind: AnalysisKind }) {
  return (
    <div className="mt-6 grid min-h-80 place-items-center rounded-[24px] bg-white/45 p-8 text-center">
      <div>
        {kind === "color_suit" ? <Palette className="mx-auto h-12 w-12 text-[#FF8E8E]" /> : <Scissors className="mx-auto h-12 w-12 text-[#FF8E8E]" />}
        <p className="mt-4 text-sm font-semibold text-[#666]">Your private AI result will appear here after upload and questions.</p>
      </div>
    </div>
  );
}

function PhotoTryOn({
  kind,
  result,
  photoUrl,
  compact = false,
}: {
  kind: AnalysisKind;
  result: Record<string, any>;
  photoUrl: string;
  compact?: boolean;
}) {
  const colors = result.palette || palette;
  const [selectedColor, setSelectedColor] = useState(colors[0] || "#F8AD9D");
  const makeup = result.makeupPalette || [
    { type: "Blush", name: "Rose glow", hex: "#E59AAF" },
    { type: "Lip", name: "Warm rose gloss", hex: "#D96172" },
    { type: "Eyeshadow", name: "Pearl taupe", hex: "#B9A6D8" },
  ];
  const hairColor = result.hairColors?.[0]?.hex || "#3B2418";

  return (
    <div className={cx("glass overflow-hidden rounded-[32px] p-5", compact && "p-4")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FF8E8E]">AI try-on preview</p>
          <h4 className="mt-1 text-2xl font-black tracking-normal">
            {kind === "color_suit" ? "Palette on your photo" : kind === "hair_analysis" ? "Hair color and style preview" : "Makeup shades on your selfie"}
          </h4>
        </div>
        <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase text-[#666]">Live photo</span>
      </div>

      <div className={cx("mt-5 grid gap-4", compact ? "lg:grid-cols-1" : "lg:grid-cols-[0.9fr_1.1fr]")}>
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[30px] bg-black shadow-2xl shadow-purple-200/30">
          <img src={photoUrl} alt="User selfie try-on" className="h-full w-full object-cover" />
          {kind === "color_suit" && (
            <>
              <div
                className="absolute inset-x-[10%] bottom-0 h-[38%] rounded-t-[46%] opacity-75 mix-blend-multiply blur-[0.5px]"
                style={{ background: `linear-gradient(180deg, ${selectedColor}, ${colors[1] || selectedColor})` }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {colors.slice(0, 5).map((color: string) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="h-9 flex-1 rounded-full border-2 border-white/70 shadow-lg"
                    style={{ background: color }}
                    aria-label={`Try ${color}`}
                  />
                ))}
              </div>
            </>
          )}
          {kind === "makeup_analysis" && (
            <>
              <div className="absolute left-[24%] top-[42%] h-14 w-16 rounded-full blur-md opacity-55" style={{ background: makeup.find((item: any) => item.type === "Blush")?.hex || "#E59AAF" }} />
              <div className="absolute right-[24%] top-[42%] h-14 w-16 rounded-full blur-md opacity-55" style={{ background: makeup.find((item: any) => item.type === "Blush")?.hex || "#E59AAF" }} />
              <div className="absolute left-1/2 top-[60%] h-5 w-24 -translate-x-1/2 rounded-full opacity-75 blur-[1px]" style={{ background: makeup.find((item: any) => item.type === "Lip")?.hex || "#D96172" }} />
              <div className="absolute left-[28%] top-[34%] h-4 w-20 rounded-full opacity-45 blur-sm" style={{ background: makeup.find((item: any) => item.type === "Eyeshadow")?.hex || "#B9A6D8" }} />
              <div className="absolute right-[28%] top-[34%] h-4 w-20 rounded-full opacity-45 blur-sm" style={{ background: makeup.find((item: any) => item.type === "Eyeshadow")?.hex || "#B9A6D8" }} />
            </>
          )}
          {kind === "hair_analysis" && (
            <div className="absolute inset-x-[16%] top-[6%] h-[38%] rounded-t-[90px] rounded-b-[42px] opacity-65 blur-[1px] mix-blend-multiply" style={{ background: `linear-gradient(180deg, ${hairColor}, transparent)` }} />
          )}
          {kind === "face_body_analysis" && (
            <>
              <div className="absolute left-1/2 top-[30%] h-[30%] w-[42%] -translate-x-1/2 rounded-full border-4 border-[#7BC9FF]/80 shadow-[0_0_30px_rgba(123,201,255,0.45)]" />
              <div className="absolute left-1/2 top-[50%] h-[42%] w-1 -translate-x-1/2 rounded-full bg-[#FF8E8E]/80 shadow-[0_0_22px_rgba(255,142,142,0.5)]" />
              <div className="absolute left-[26%] top-[58%] h-1 w-[48%] rounded-full bg-[#A98CFF]/80 shadow-[0_0_22px_rgba(169,140,255,0.45)]" />
            </>
          )}
          <div className="absolute left-4 top-4 rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#555]">
            Try AI
          </div>
        </div>

        {!compact && (
          <div className="grid content-center gap-3">
            {(kind === "makeup_analysis" ? makeup : kind === "hair_analysis" ? result.hairColors || defaultHairColors : kind === "face_body_analysis" ? [
              { name: result.faceStructure?.shape || "Face harmony", hex: "#7BC9FF", type: result.faceStructure?.balance || "Face" },
              { name: result.bodyStructure?.frame || "Body structure", hex: "#A98CFF", type: result.bodyStructure?.postureScore || "Body" },
              { name: "Glow-up plan", hex: "#FF8E8E", type: result.bodyStructure?.proportionScore || "Plan" },
            ] : colors.slice(0, 5).map((hex: string, index: number) => ({ name: colorNames[String(hex).toUpperCase()] || `Shade ${index + 1}`, hex }))).map((item: any) => (
              <div key={`${item.name}-${item.hex}`} className="liquid-panel flex items-center gap-4 rounded-[24px] p-4">
                <span className="h-12 w-12 rounded-2xl shadow-inner" style={{ background: item.hex || item }} />
                <div>
                  <p className="text-sm font-black">{item.name || colorNames[String(item).toUpperCase()] || item}</p>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#777]">{item.type || item.hex || item}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildReportText(kind: AnalysisKind, result: Record<string, any>) {
  const title =
    kind === "color_suit" ? "Glowra Color Suit Report" :
    kind === "hair_analysis" ? "Glowra Hair Style Report" :
    kind === "makeup_analysis" ? "Glowra Makeup Shade Report" :
    "Glowra Face and Body Report";

  const lines = [
    title,
    "",
    `Main result: ${result.season || result.lookName || result.faceShape || result.reportTitle || "Glowra analysis"}`,
    `Match score: ${Math.round(Number(result.confidence || 0.82) * 100)}%`,
    "",
    result.description || result.summary || "",
    "",
  ];

  const sections: Array<[string, any]> = [
    ["Best colors", result.bestColors],
    ["Avoid shades", result.avoidColors || result.avoidShades],
    ["Makeup palette", result.makeupPalette],
    ["Hairstyles", result.styles],
    ["Hair colors", result.hairColors],
    ["Face structure", result.faceStructure],
    ["Body structure", result.bodyStructure],
    ["Skin care tips", result.skinCareTips],
    ["Hair care tips", result.hairCareTips || result.careTips],
    ["Styling tips", result.stylingTips],
  ];

  sections.forEach(([heading, value]) => {
    if (!value) return;
    lines.push(heading);
    if (Array.isArray(value)) {
      value.forEach((item) => lines.push(`- ${typeof item === "string" ? item : Object.values(item).join(" | ")}`));
    } else {
      Object.entries(value).forEach(([key, item]) => lines.push(`- ${key}: ${Array.isArray(item) ? item.join(", ") : item}`));
    }
    lines.push("");
  });

  return lines.filter(Boolean).join("\n");
}

function downloadReport(kind: AnalysisKind, result: Record<string, any>) {
  const blob = new Blob([buildReportText(kind, result)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `glowra-${kind}-report.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ResultJson({ result, kind, photoUrl, generatedImage, visualizationLoading }: { result: Record<string, any>; kind: AnalysisKind; photoUrl?: string; generatedImage?: string | null; visualizationLoading?: boolean }) {
  const colors = result.palette || palette;
  const isColorResult = Boolean(result.season || result.bestColors || result.makeup);
  const isHairResult = Boolean(result.styles || result.faceShape);
  const isMakeupResult = Boolean(result.makeupPalette || result.lookName);
  const isFaceResult = Boolean(result.faceStructure || result.bodyStructure || result.reportTitle);

  return (
    <div className="mt-5 grid gap-5">
      {generatedImage && (
        <div className="glass overflow-hidden rounded-[32px] shadow-2xl shadow-pink-200/30">
          <div className="relative">
            <img src={generatedImage} alt="Generated outfit visualization" className="w-full rounded-[28px]" />
            <span className="absolute right-4 top-4 rounded-full bg-black/60 px-4 py-2 text-xs font-black uppercase text-white">Generated</span>
          </div>
        </div>
      )}
      
      {visualizationLoading && (
        <div className="glass flex items-center justify-center rounded-[32px] p-8">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="h-8 w-8 rounded-full border-4 border-[#FF8E8E] border-t-transparent" />
          <span className="ml-4 text-sm font-black text-[#FF8E8E]">Generating visualization...</span>
        </div>
      )}

      <div className="liquid-panel rounded-[32px] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FF8E8E]">
              {result.subType || result.faceShape || result.faceStructure?.shape || "Glowra match"}
            </p>
            <h3 className="mt-2 text-3xl font-black tracking-normal">{result.season || result.faceShape || result.lookName || result.reportTitle || "Glowra Result"}</h3>
          </div>
          {result.confidence && (
            <span className="rounded-full bg-black px-4 py-2 text-sm font-black text-white">
              {Math.round(Number(result.confidence) * 100)}% match
            </span>
          )}
        </div>
        <p className="mt-4 text-base leading-8 text-[#666]">{result.description || result.summary || "Analysis completed."}</p>
        <button onClick={() => downloadReport(kind, result)} className="luxury-button mt-5 rounded-full px-6 py-3 text-sm font-black text-white">
          Download report
        </button>
      </div>

      <BeautyAnalytics result={result} />

      {photoUrl && <PhotoTryOn kind={kind} result={result} photoUrl={photoUrl} />}

      {isColorResult && (
        <>
          <div>
            <h4 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#777]">Your best colors</h4>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {colors.slice(0, 6).map((color: string, index: number) => {
                const hex = String(color).toUpperCase();
                const name = colorNames[hex] || result.bestColors?.[index] || `Glowra Color ${index + 1}`;
                return (
                  <div key={`${hex}-${index}`} className="glass overflow-hidden rounded-[32px] shadow-lg shadow-pink-100/30">
                    <div className="h-44 w-full" style={{ background: hex }} />
                    <div className="p-4">
                      <h5 className="text-xl font-black tracking-normal">{name}</h5>
                      <p className="mt-1 text-sm font-semibold text-[#777]">{hex}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoList title="Best clothing shades" items={result.bestColors || []} />
            <InfoList title="Avoid near face" items={result.avoidColors || []} />
          </div>

          {result.makeup && (
            <div className="liquid-panel rounded-[32px] p-5">
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#777]">Makeup match</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {Object.entries(result.makeup).map(([key, value]) => (
                  <div key={key} className="liquid-panel rounded-[22px] p-4">
                    <p className="text-xs font-black uppercase text-[#FF8E8E]">{key}</p>
                    <p className="mt-1 text-sm font-bold">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isMakeupResult && (
        <>
          <div>
            <h4 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#777]">Makeup shades that suit you</h4>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(result.makeupPalette || []).map((shade: { type: string; name: string; hex: string }) => (
                <div key={`${shade.type}-${shade.name}`} className="glass overflow-hidden rounded-[32px] shadow-lg shadow-pink-100/30">
                  <div className="h-40" style={{ background: shade.hex }} />
                  <div className="p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FF8E8E]">{shade.type}</p>
                    <h5 className="mt-1 text-xl font-black tracking-normal">{shade.name}</h5>
                    <p className="mt-1 text-sm font-semibold text-[#777]">{shade.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <InfoList title="Application guide" items={result.steps || []} />
            <InfoList title="Avoid shades" items={result.avoidShades || []} />
          </div>
        </>
      )}

      {isHairResult && (
        <div className="grid gap-4">
          <div>
            <h4 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#777]">Hair colors that suit you</h4>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(result.hairColors || defaultHairColors).map((color: { name: string; hex: string; note?: string }) => (
                <div key={color.name} className="glass overflow-hidden rounded-[32px] shadow-lg shadow-pink-100/30">
                  <div className="h-40" style={{ background: color.hex }} />
                  <div className="p-4">
                    <h5 className="text-xl font-black tracking-normal">{color.name}</h5>
                    <p className="mt-1 text-sm font-semibold text-[#777]">{color.hex}</p>
                    <p className="mt-2 text-sm leading-6 text-[#666]">{color.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#777]">Hairstyles that suit you</h4>
            <div className="grid gap-4 lg:grid-cols-3">
              {(result.styles || []).map((style: Record<string, string>) => (
                <div key={style.name} className="glass overflow-hidden rounded-[32px] shadow-lg shadow-pink-100/30">
                  <div className="relative h-52 overflow-hidden" style={{ background: styleVisuals[style.name] || styleVisuals["Korean Hush Cut"] }}>
                    <div className="absolute bottom-0 left-1/2 h-32 w-28 -translate-x-1/2 rounded-t-full bg-[#f3c8b8]" />
                    <div className="absolute bottom-20 left-1/2 h-24 w-36 -translate-x-1/2 rounded-t-[60px] bg-black/20 blur-sm" />
                    <div className="absolute left-6 top-6 rounded-full bg-white/80 px-4 py-2 text-xs font-black uppercase text-[#4A4A4A]">Style preview</div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-2xl font-black tracking-normal">{style.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-[#666]">{style.reason || style.description}</p>
                    <p className="mt-3 w-fit rounded-full bg-[#FF8E8E]/15 px-4 py-2 text-xs font-black text-[#B45353]">
                      Maintenance: {style.maintenance || "Medium"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <InfoList title="Care tips" items={result.careTips || []} />
          <InfoList title="Hair care tips" items={result.hairCareTips || []} />
          <InfoList title="Premium alternatives" items={result.premiumAlternatives || []} />
        </div>
      )}

      {isFaceResult && (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoList title="Face structure" items={[
              result.faceStructure?.shape,
              result.faceStructure?.balance,
              ...(result.faceStructure?.bestAngles || []),
            ].filter(Boolean)} />
            <InfoList title="Body structure" items={[
              result.bodyStructure?.frame,
              result.bodyStructure?.postureScore,
              result.bodyStructure?.proportionScore,
            ].filter(Boolean)} />
          </div>
          <InfoList title="Skin care according to you" items={result.skinCareTips || []} />
          <InfoList title="Hair care according to you" items={result.hairCareTips || []} />
          <InfoList title="Styling and posture tips" items={result.stylingTips || []} />
        </div>
      )}
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="liquid-panel rounded-[32px] p-5">
      <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#777]">{title}</h4>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-white/75 px-4 py-2 text-sm font-bold shadow-sm">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold text-[#777]">No extra notes yet.</p>
      )}
    </div>
  );
}

function ResultPreview({ title, empty, data }: { title: string; empty: string; data?: Record<string, any> }) {
  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-black tracking-normal">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[#666]">{data?.description || data?.summary || empty}</p>
    </GlassCard>
  );
}

function HistoryView({ history, refresh }: { history: HistoryItem[]; refresh: () => Promise<void> }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF8E8E]">Private data</p>
          <h1 className="text-3xl font-black tracking-normal">Saved analysis history</h1>
        </div>
        <button onClick={refresh} className="rounded-full bg-white/70 px-5 py-2 text-sm font-black">Refresh</button>
      </div>
      <div className="mt-6 grid gap-4">
        {history.length === 0 && <p className="rounded-2xl bg-white/60 p-5 text-sm font-semibold">No saved analysis yet.</p>}
        {history.map((item) => {
          const result = item.analysis_results?.[0]?.result_json || {};
          return (
            <div key={item.id} className="rounded-[24px] bg-white/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-black">{item.type === "color_suit" ? "Color Suit" : item.type === "hair_analysis" ? "Hair Analysis" : item.type === "makeup_analysis" ? "Makeup Analysis" : "Face and Body Analysis"}</h2>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              {(item.generated_image || item.image_preview) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {item.image_preview && <img src={item.image_preview} alt="Saved user upload" className="aspect-[3/4] w-full rounded-[22px] object-cover" />}
                  {item.generated_image && <img src={item.generated_image} alt="Saved try-on preview" className="aspect-[3/4] w-full rounded-[22px] object-cover" />}
                </div>
              )}
              <p className="mt-2 text-sm leading-6 text-[#666]">{result.description || result.summary || "Saved result"}</p>
              <button onClick={() => downloadReport(item.type, result)} className="mt-4 rounded-full bg-black px-4 py-2 text-xs font-black text-white">
                Download report
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function Premium({ session, profile, setMessage }: { session: Session | null; profile: Profile | null; setMessage: (message: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (!session?.access_token) return setMessage("Log in before upgrading.");
    setBusy(true);
    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Stripe checkout failed.");
      window.location.href = payload.url;
    } catch (error: any) {
      setMessage(error.message || "Stripe checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard className="p-8">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF8E8E]">Premium</p>
      <h1 className="mt-2 text-4xl font-black tracking-normal">Better analysis, more style depth.</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {["Detailed palette and avoid shades", "More haircut alternatives", "Premium notes saved with every result"].map((text) => (
          <div key={text} className="rounded-[24px] bg-white/60 p-5">
            <CheckCircle2 className="mb-4 h-7 w-7 text-[#FF8E8E]" />
            <p className="text-sm font-bold leading-6">{text}</p>
          </div>
        ))}
      </div>
      <button disabled={busy || profile?.is_premium} onClick={checkout} className="mt-8 rounded-full bg-black px-7 py-3 text-sm font-black text-white disabled:opacity-50">
        {profile?.is_premium ? "Premium active" : busy ? "Opening checkout..." : "Upgrade with Stripe test mode"}
      </button>
    </GlassCard>
  );
}

function Preferences({ profile, setProfile, setMessage }: { profile: Profile | null; setProfile: (profile: Profile | null) => void; setMessage: (message: string) => void }) {
  const [theme, setTheme] = useState(profile?.theme_preference || "Soft K-beauty");
  const [template, setTemplate] = useState(profile?.template_preference || "Editorial cards");

  async function save() {
    if (!supabase || !profile) return setMessage("Profile is not loaded yet.");
    const { error } = await supabase.from("profiles").update({ theme_preference: theme, template_preference: template }).eq("user_id", profile.user_id);
    if (error) return setMessage(error.message);
    setProfile({ ...profile, theme_preference: theme, template_preference: template });
    setMessage("Preferences saved.");
  }

  return (
    <GlassCard className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-3xl font-black tracking-normal">Themes and templates</h1>
      <div className="mt-6 grid gap-4">
        <SelectField label="Color theme preference" value={theme} onChange={setTheme} options={["Soft K-beauty", "Luxury minimal", "Bright idol", "Classic neutral"]} />
        <SelectField label="Result template preference" value={template} onChange={setTemplate} options={["Editorial cards", "Compact report", "Palette-first", "Salon brief"]} />
        <button onClick={save} className="rounded-full bg-black px-6 py-3 text-sm font-black text-white">Save preferences</button>
      </div>
    </GlassCard>
  );
}

function Terms() {
  return (
    <GlassCard className="p-8">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FF8E8E]">Terms and conditions</p>
      <h1 className="mt-2 text-3xl font-black tracking-normal">Glowra beta consent</h1>
      <div className="mt-6 grid gap-4 text-sm leading-7 text-[#5F5F5F]">
        <p>Glowra uses uploaded images and questionnaire answers to create fashion, color, and hairstyle recommendations. Results are suggestions, not professional medical, dermatology, or identity assessments.</p>
        <p>Private images, answers, and results are stored per user in Supabase. Cookies and session storage keep users logged in and remember preferences.</p>
        <p>Premium checkout uses Stripe test mode. Access is enabled after the Stripe webhook marks the account as premium.</p>
      </div>
    </GlassCard>
  );
}
