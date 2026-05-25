import { useEffect, useRef, useState } from 'react';
import { Camera, Download, FileText, History, MessageCircle, Palette, Scissors, Send, Sparkles, UserRound, Wand2 } from 'lucide-react';

type Mode = 'color' | 'hair' | 'makeup' | 'face';

type Report = {
  id: string;
  mode: Mode;
  title: string;
  score: number;
  summary: string;
  photo: string;
  generated: string;
  moodboard: string[];
  hairstyles: HairstyleRecommendation[];
  haircutPreview?: string;
  selectedHairstyle?: string;
  detected: DetectedBeauty;
  outfits: OutfitRecommendation[];
  palette: Array<{ name: string; hex: string; note: string }>;
  selectedPaletteName?: string;
  aestheticTitle: string;
  seasonalPalette: string;
  museAesthetic: string;
  tips: string[];
  details: string[];
  skinCare: string[];
  hairCare: string[];
  photoFeedback: string[];
  profileFeedback: string[];
  glowUp: string[];
  compliments: string[];
  selectedColor?: string;
};

type DetectedBeauty = {
  faceShape: string;
  skinTone: string;
  undertone: string;
  eyeShape: string;
  lipShape: string;
  eyebrowStructure: string;
  hairTexture: string;
  symmetry: number;
  featureSoftness: 'Soft' | 'Balanced' | 'Sharp';
  aestheticVibe: string;
  photoQuality: number;
  contrast: number;
  warmth: number;
  brightness: number;
  seasonalPalette: string;
  score: number;
};

type HairstyleRecommendation = {
  name: string;
  match: number;
  reason: string;
  preview: string;
  color: string;
};

type OutfitRecommendation = {
  title: string;
  match: number;
  reason: string;
  image: string;
};

type AnalysisDraft = Omit<Report, 'id' | 'mode' | 'photo' | 'generated' | 'detected' | 'outfits' | 'haircutPreview' | 'selectedHairstyle'>;

type LocalUser = {
  name: string;
  email: string;
};

const modes: Array<{ id: Mode; label: string; icon: typeof Sparkles; helper: string }> = [
  { id: 'color', label: 'Color Suit', icon: Palette, helper: 'AI outfit color try-on' },
  { id: 'hair', label: 'Hair Style', icon: Scissors, helper: 'Hair color and cut preview' },
  { id: 'makeup', label: 'Makeup', icon: Sparkles, helper: 'Full shade analysis' },
  { id: 'face', label: 'Face + Body', icon: UserRound, helper: 'Structure, skin, hair report' },
];

const basePalettes = {
  warm: [
    { name: 'Peach Coral Outfit', hex: '#F58D7A', note: 'Brightens warm skin and looks fresh in daylight.' },
    { name: 'Cream Ivory Layer', hex: '#FFF1C7', note: 'Soft luxury base for tops and dresses.' },
    { name: 'Clear Aqua Accent', hex: '#7BC9FF', note: 'Use as a bag, scarf, or nail accent.' },
  ],
  cool: [
    { name: 'Rose Pink Outfit', hex: '#E59AAF', note: 'Gives a clean Korean soft-glow effect.' },
    { name: 'Lavender Pearl Layer', hex: '#D9D7FF', note: 'Best for blouse, cardigan, or dress shade.' },
    { name: 'Soft Navy Contrast', hex: '#27385E', note: 'Use when you want premium contrast.' },
  ],
};

const premiumPalettes = [
  {
    name: 'Soft Pink',
    vibe: 'clean girl blush, satin lips, pearl jewelry',
    colors: ['#F6A6BF', '#FFDDE8', '#FFF7FA'],
  },
  {
    name: 'Mocha Brown',
    vibe: 'warm espresso outfit, bronze makeup, gold accessories',
    colors: ['#6B3F27', '#A96F45', '#F0C6A8'],
  },
  {
    name: 'Royal Black',
    vibe: 'matte black tailoring, glossy hair, minimal silver',
    colors: ['#111116', '#3A3442', '#E8E5F3'],
  },
  {
    name: 'Emerald Green',
    vibe: 'deep green dress, fresh skin, delicate gold',
    colors: ['#0F6B4F', '#75B99B', '#F4FFF9'],
  },
  {
    name: 'Lavender Glow',
    vibe: 'lavender blouse, cool rose makeup, dreamy shimmer',
    colors: ['#B9A6F2', '#DED7FF', '#F9F7FF'],
  },
  {
    name: 'Vanilla Cream',
    vibe: 'cream outfit, soft peach makeup, polished elegance',
    colors: ['#FFF1C7', '#F8D8B8', '#FFFFFF'],
  },
];

const outfitPaletteChoices = premiumPalettes.map((palette) => ({
  name: palette.name,
  hex: palette.colors[0],
  note: palette.vibe,
  colors: palette.colors,
}));

const scanSteps = ['Detecting facial symmetry', 'Matching seasonal palette', 'Analyzing hairstyle compatibility', 'Generating glow-up recommendations'];

const hairstyleCatalog = [
  { name: 'Curtain bangs', color: '#4B2C22', reason: 'Frames the cheekbones and softens the forehead area.' },
  { name: 'Wolf cut', color: '#34231F', reason: 'Adds edgy volume while keeping face-framing movement.' },
  { name: 'Long layers', color: '#6B3F27', reason: 'Creates length balance and a polished flowing silhouette.' },
  { name: 'Soft waves', color: '#7A4E39', reason: 'Makes the face look gentle, romantic, and camera-friendly.' },
  { name: 'Korean straight hair', color: '#202026', reason: 'Gives a clean luxury finish with glossy vertical lines.' },
  { name: 'Butterfly cut', color: '#8A553A', reason: 'Lifts the cheek area and adds expensive-looking bounce.' },
  { name: 'Ponytail styles', color: '#2F2523', reason: 'Opens the face and highlights brows, eyes, and jawline.' },
  { name: 'Messy bun', color: '#5C392B', reason: 'Adds effortless soft volume around the face.' },
  { name: 'Sleek hairstyle', color: '#17171B', reason: 'Looks refined, minimal, and editorial for formal photos.' },
  { name: 'Short bob', color: '#3B2A25', reason: 'Sharpens the outline and gives a chic beauty-tech look.' },
  { name: 'U-Cut', color: '#684231', reason: 'Keeps length while creating a soft polished back shape.' },
  { name: 'Face Framing Layers', color: '#5B392D', reason: 'Adds customized softness around cheeks and jawline.' },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

async function analyzeSelfie(photo: string): Promise<DetectedBeauty> {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 180;
      canvas.height = Math.max(220, Math.round((image.height / image.width) * 180));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(fallbackDetection(photo));
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let total = 0;
      let brightness = 0;
      let warmth = 0;
      let contrastSum = 0;
      let centerBrightness = 0;
      let centerWarmth = 0;
      let centerCount = 0;
      let leftLum = 0;
      let rightLum = 0;
      let sideCount = 0;
      let darkTop = 0;
      let darkTopCount = 0;
      let edgeEnergy = 0;
      let prevLum = 0;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const offset = (y * width + x) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          const pixelWarmth = (r - b) / 255;
          brightness += lum;
          warmth += pixelWarmth;
          contrastSum += Math.abs(lum - 0.5);
          if (x > 0) edgeEnergy += Math.abs(lum - prevLum);
          prevLum = lum;
          total += 1;

          const inCenter = x >= width * 0.25 && x <= width * 0.75 && y >= height * 0.18 && y <= height * 0.78;
          if (inCenter) {
            centerBrightness += lum;
            centerWarmth += pixelWarmth;
            centerCount += 1;
          }
          if (x < width * 0.42 && y > height * 0.22 && y < height * 0.72) {
            leftLum += lum;
            sideCount += 1;
          }
          if (x > width * 0.58 && y > height * 0.22 && y < height * 0.72) {
            rightLum += lum;
          }
          if (y < height * 0.33) {
            if (lum < 0.28) darkTop += 1;
            darkTopCount += 1;
          }
        }
      }

      const avgBrightness = brightness / total;
      const avgWarmth = warmth / total;
      const avgContrast = contrastSum / total;
      const faceLum = centerBrightness / Math.max(1, centerCount);
      const faceWarmth = centerWarmth / Math.max(1, centerCount);
      const symmetry = clamp(Math.round(100 - Math.abs(leftLum / sideCount - rightLum / sideCount) * 155), 58, 98);
      const photoQuality = clamp(Math.round(62 + avgBrightness * 26 + (1 - avgContrast) * 18 - Math.abs(0.55 - faceLum) * 18), 52, 97);
      const texture = edgeEnergy / total;
      const hairDensity = darkTop / Math.max(1, darkTopCount);
      const undertone = faceWarmth > 0.08 ? 'warm' : faceWarmth < -0.015 ? 'cool' : 'neutral';
      const featureSoftness = avgContrast > 0.28 || texture > 0.09 ? 'Sharp' : avgContrast < 0.19 ? 'Soft' : 'Balanced';
      const seasonalPalette = pickSeason(undertone, avgContrast, avgBrightness);
      const score = clamp(Math.round(50 + symmetry * 0.22 + photoQuality * 0.18 + (1 - Math.abs(0.55 - faceLum)) * 18 + (featureSoftness === 'Balanced' ? 4 : 1)), 68, 96);

      resolve({
        faceShape: detectFaceShape(width, height, hairDensity, symmetry, featureSoftness),
        skinTone: faceLum > 0.68 ? 'fair-light' : faceLum > 0.54 ? 'light-medium' : faceLum > 0.42 ? 'medium-tan' : 'deep-rich',
        undertone,
        eyeShape: avgContrast > 0.28 ? 'defined almond' : avgBrightness > 0.58 ? 'soft rounded' : 'relaxed hooded',
        lipShape: faceWarmth > 0.08 ? 'soft full rose' : avgContrast > 0.25 ? 'defined balanced' : 'natural soft',
        eyebrowStructure: hairDensity > 0.24 ? 'bold natural arch' : avgContrast > 0.25 ? 'defined soft arch' : 'light natural brow',
        hairTexture: texture > 0.095 ? 'wavy / textured' : hairDensity > 0.28 ? 'straight dense' : 'soft fine-to-medium',
        symmetry,
        featureSoftness,
        aestheticVibe: pickAesthetic(undertone, featureSoftness, avgContrast, avgBrightness),
        photoQuality,
        contrast: Math.round(avgContrast * 100),
        warmth: Math.round(avgWarmth * 100),
        brightness: Math.round(avgBrightness * 100),
        seasonalPalette,
        score,
      });
    };
    image.onerror = () => resolve(fallbackDetection(photo));
    image.src = photo;
  });
}

function fallbackDetection(photo: string): DetectedBeauty {
  const seed = seedFromPhoto(photo);
  const undertone = seed % 3 === 0 ? 'warm' : seed % 3 === 1 ? 'cool' : 'neutral';
  const featureSoftness = seed % 3 === 0 ? 'Soft' : seed % 3 === 1 ? 'Balanced' : 'Sharp';
  const contrast = 0.2 + (seed % 20) / 100;
  const brightness = 0.45 + (seed % 30) / 100;
  return {
    faceShape: ['soft oval', 'round', 'heart', 'diamond', 'long oval'][seed % 5],
    skinTone: ['fair-light', 'light-medium', 'medium-tan', 'deep-rich'][seed % 4],
    undertone,
    eyeShape: ['soft rounded', 'defined almond', 'relaxed hooded'][seed % 3],
    lipShape: ['natural soft', 'soft full rose', 'defined balanced'][seed % 3],
    eyebrowStructure: ['light natural brow', 'defined soft arch', 'bold natural arch'][seed % 3],
    hairTexture: ['soft fine-to-medium', 'wavy / textured', 'straight dense'][seed % 3],
    symmetry: 68 + (seed % 28),
    featureSoftness,
    aestheticVibe: pickAesthetic(undertone, featureSoftness, contrast, brightness),
    photoQuality: 62 + (seed % 31),
    contrast: Math.round(contrast * 100),
    warmth: -8 + (seed % 24),
    brightness: Math.round(brightness * 100),
    seasonalPalette: pickSeason(undertone, contrast, brightness),
    score: 68 + (seed % 29),
  };
}

function detectFaceShape(width: number, height: number, hairDensity: number, symmetry: number, featureSoftness: string) {
  const ratio = height / width;
  if (ratio > 1.55 && featureSoftness !== 'Soft') return 'long oval';
  if (hairDensity > 0.32 && symmetry < 82) return 'heart';
  if (featureSoftness === 'Sharp' && ratio > 1.42) return 'diamond';
  if (featureSoftness === 'Soft' && ratio < 1.5) return 'round';
  return 'soft oval';
}

function pickSeason(undertone: string, contrast: number, brightness: number) {
  if (undertone === 'cool' && contrast > 0.26) return 'Deep Winter';
  if (undertone === 'cool') return 'Summer Cool';
  if (undertone === 'warm' && brightness < 0.5) return 'Warm Autumn';
  if (undertone === 'warm') return 'Soft Spring';
  return contrast > 0.27 ? 'Deep Winter' : 'Soft Spring';
}

function pickAesthetic(undertone: string, featureSoftness: string, contrast: number, brightness: number) {
  if (featureSoftness === 'Sharp' && contrast > 0.26) return 'dark feminine editorial';
  if (undertone === 'cool' && brightness > 0.54) return 'clean girl cool glow';
  if (undertone === 'warm' && featureSoftness === 'Soft') return 'Pinterest soft girl';
  if (contrast > 0.28) return 'elegant minimal';
  return 'Korean beauty natural';
}

function seedFromPhoto(photo = '') {
  let seed = 0;
  for (let index = 0; index < photo.length; index += Math.max(1, Math.floor(photo.length / 100))) {
    seed = (seed + photo.charCodeAt(index) * (index + 3)) % 7919;
  }
  return seed;
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sharedInsights(seed: number) {
  const skinTypes = ['normal to combination', 'slightly dry / glow-seeking', 'combination with T-zone shine', 'sensitive-leaning normal'];
  const hairTypes = ['smooth straight-to-wavy', 'soft wavy', 'medium-density natural', 'voluminous wavy'];
  const faces = ['soft oval', 'heart-soft oval', 'balanced round-oval', 'soft diamond-oval'];
  return {
    expression: ['soft smile / calm expression', 'confident neutral expression', 'relaxed natural expression'][seed % 3],
    faceShape: faces[seed % faces.length],
    skinType: skinTypes[(seed + 1) % skinTypes.length],
    hairType: hairTypes[(seed + 2) % hairTypes.length],
    skinCare: ['Use a gentle cleanser.', 'Apply sunscreen every morning.', 'Add a hydrating serum or lightweight moisturizer.', 'Avoid harsh scrubs when skin feels sensitive.'],
    hairCare: ['Use heat protectant before styling.', 'Apply conditioner from mid-length to ends.', 'Use a weekly gloss mask for shine.', 'Avoid heavy oil near the scalp.'],
    photoFeedback: ['Use bright front window light for better accuracy.', 'Keep camera at eye level with full face visible.', 'Avoid heavy filters because they change undertone and skin texture.'],
    profileFeedback: ['Use a plain background and crop chest-to-head.', 'Turn slightly three-quarter and relax shoulders.', 'Keep hair away from both eyes for a sharper professional photo.'],
    glowUp: ['Groom brows softly.', 'Choose one signature color near the face.', 'Use clean neckline, posture, and healthy hair shine as the main upgrade trio.'],
    compliments: ['You have such a soft main-character glow ✨', 'Your camera presence is sweet and very cute 💖', 'Glowra is politely blushing at this charm 😌'],
  };
}

function makeAnalysis(mode: Mode, photo: string, detected: DetectedBeauty): AnalysisDraft {
  const warm = detected.undertone === 'warm';
  const cool = detected.undertone === 'cool';
  const score = detected.score;
  const palette = paletteForDetection(detected);
  const insight = {
    expression: detected.aestheticVibe,
    faceShape: detected.faceShape,
    skinType: `${detected.skinTone} with ${detected.undertone} undertone`,
    hairType: detected.hairTexture,
    skinCare: skinCareForDetection(detected),
    hairCare: hairCareForDetection(detected),
    photoFeedback: photoTipsForDetection(detected),
    profileFeedback: profileTipsForDetection(detected),
    glowUp: glowUpForDetection(detected),
    compliments: complimentsForDetection(detected),
  };

  if (mode === 'hair') {
    return {
      title: detected.faceShape.includes('heart') ? 'Curtain Bangs + Soft Face Frame' : detected.faceShape.includes('round') ? 'Long Layers + Crown Volume' : detected.featureSoftness === 'Sharp' ? 'Sleek Layers + Gloss Finish' : 'Butterfly Layers + Soft Waves',
      score,
      moodboard: [],
      hairstyles: [],
      aestheticTitle: 'Soft elegant aesthetic',
      seasonalPalette: detected.seasonalPalette,
      museAesthetic: 'K-beauty editorial muse',
      summary: 'This hairstyle frames your face softly and gives a polished Korean beauty silhouette.',
      palette: [
        { name: 'Glossy Espresso', hex: '#3B2418', note: 'Deep shine and luxury finish.' },
        { name: 'Mocha Brown', hex: '#6B3F27', note: 'Softens the face without looking flat.' },
        { name: 'Milk Tea Brown', hex: '#A96F45', note: 'Brightens the total look.' },
      ],
      tips: ['Try the first hair shade on your photo.', 'Trim face-framing layers every 8 to 10 weeks.', 'Keep the finish glossy and soft.'],
      details: [`Overall vibe: ${detected.aestheticVibe}`, `Face shape: ${detected.faceShape}`, `Hair texture: ${detected.hairTexture}`, `Feature type: ${detected.featureSoftness}`, `Symmetry signal: ${detected.symmetry}%`, hairstyleReasonForFace(detected)],
      skinCare: insight.skinCare,
      hairCare: insight.hairCare,
      photoFeedback: insight.photoFeedback,
      profileFeedback: insight.profileFeedback,
      glowUp: insight.glowUp,
      compliments: insight.compliments,
    };
  }

  if (mode === 'makeup') {
    return {
      title: warm ? 'Peach Glow K-Beauty Makeup' : cool ? 'Rose Glass K-Beauty Makeup' : 'Neutral Satin Beauty Makeup',
      score,
      moodboard: [],
      hairstyles: [],
      aestheticTitle: detected.aestheticVibe,
      seasonalPalette: detected.seasonalPalette,
      museAesthetic: 'Luxury beauty muse',
      summary: makeupSummaryForDetection(detected),
      palette: warm
        ? [
            { name: 'Warm Beige Base', hex: '#F0C6A8', note: 'Natural satin base.' },
            { name: 'Peach Coral Blush', hex: '#F58D7A', note: 'High cheek placement.' },
            { name: 'Warm Rose Lip', hex: '#D96172', note: 'Glossy blurred lip.' },
          ]
        : [
            { name: 'Neutral Ivory Base', hex: '#F4D7CF', note: 'Clean satin finish.' },
            { name: 'Cool Rose Blush', hex: '#E59AAF', note: 'Soft romantic flush.' },
            { name: 'Berry Rose Lip', hex: '#B24C6B', note: 'Camera-friendly tint.' },
          ],
      tips: ['Use sunscreen before base.', 'Blend blush upward.', 'Keep shimmer on the inner eye.', 'Avoid harsh contour lines.'],
      details: [`Skin tone: ${detected.skinTone}`, `Undertone: ${detected.undertone}`, `Eye shape: ${detected.eyeShape}`, `Lip shape: ${detected.lipShape}`, `Eyebrows: ${detected.eyebrowStructure}`, `Photo quality: ${detected.photoQuality}%`],
      skinCare: insight.skinCare,
      hairCare: insight.hairCare,
      photoFeedback: insight.photoFeedback,
      profileFeedback: insight.profileFeedback,
      glowUp: insight.glowUp,
      compliments: insight.compliments,
    };
  }

  if (mode === 'face') {
    return {
      title: `${detected.faceShape} Face + ${detected.featureSoftness} Features`,
      score,
      moodboard: [],
      hairstyles: [],
      aestheticTitle: detected.aestheticVibe,
      seasonalPalette: detected.seasonalPalette,
      museAesthetic: 'Minimal fashion muse',
      summary: 'Your best styling direction is open posture, bright face framing, and clean vertical outfit lines.',
      palette,
      tips: ['Keep posture open.', 'Use bright face-framing color.', 'Choose clean vertical outfit lines.'],
      details: [`Face shape: ${detected.faceShape}`, `Skin tone: ${detected.skinTone}`, `Undertone: ${detected.undertone}`, `Eye shape: ${detected.eyeShape}`, `Lip shape: ${detected.lipShape}`, `Eyebrows: ${detected.eyebrowStructure}`, `Facial symmetry signal: ${detected.symmetry}%`, `Photo quality: ${detected.photoQuality}%`, 'Symmetry note: natural small asymmetry is normal; styling can improve photo balance respectfully.'],
      skinCare: insight.skinCare,
      hairCare: insight.hairCare,
      photoFeedback: insight.photoFeedback,
      profileFeedback: insight.profileFeedback,
      glowUp: insight.glowUp,
      compliments: insight.compliments,
    };
  }

  return {
    title: warm ? 'Spring Warm Color Suit' : 'Summer Cool Color Suit',
    score,
    moodboard: [],
    hairstyles: [],
    aestheticTitle: detected.aestheticVibe,
    seasonalPalette: detected.seasonalPalette,
    museAesthetic: outfitAestheticForDetection(detected),
    summary: colorSummaryForDetection(detected),
    palette,
    tips: ['Tap any palette shade to generate that outfit color on your own photo.', 'Use the darkest shade only as an accent.', 'Keep jewelry in the same warm or cool family.'],
    details: [`Face shape: ${detected.faceShape}`, `Skin tone: ${detected.skinTone}`, `Undertone: ${detected.undertone}`, `Contrast level: ${detected.contrast}%`, `Brightness level: ${detected.brightness}%`, `Detected palette: ${detected.seasonalPalette}`, 'Generated outfit preview applies the selected outfit color onto the lower clothing area of your photo.'],
    skinCare: insight.skinCare,
    hairCare: insight.hairCare,
    photoFeedback: insight.photoFeedback,
    profileFeedback: insight.profileFeedback,
    glowUp: insight.glowUp,
    compliments: insight.compliments,
  };
}

function paletteForDetection(detected: DetectedBeauty) {
  if (detected.seasonalPalette === 'Deep Winter') {
    return [
      { name: 'Royal Black', hex: '#111116', note: 'Sharp contrast that supports defined features.' },
      { name: 'Icy Pearl', hex: '#F4F6FF', note: 'Brightens cool undertones without warmth.' },
      { name: 'Emerald Accent', hex: '#0F6B4F', note: 'Luxury color pop for high-contrast styling.' },
    ];
  }
  if (detected.seasonalPalette === 'Warm Autumn') {
    return [
      { name: 'Mocha Brown', hex: '#6B3F27', note: 'Adds warmth and depth to the complexion.' },
      { name: 'Caramel Silk', hex: '#C88852', note: 'Softens photos with warm elegance.' },
      { name: 'Vanilla Cream', hex: '#FFF1C7', note: 'Clean base shade for tops and accessories.' },
    ];
  }
  if (detected.seasonalPalette === 'Soft Spring') {
    return [
      { name: 'Vanilla Cream', hex: '#FFF1C7', note: 'Fresh soft brightness for low-contrast glow.' },
      { name: 'Peach Petal', hex: '#F6A98A', note: 'Enhances warm undertone without heaviness.' },
      { name: 'Clear Aqua', hex: '#7BC9FF', note: 'Adds playful clean contrast.' },
    ];
  }
  return [
    { name: 'Soft Pink', hex: '#F6A6BF', note: 'Cool blush shade that lifts the face.' },
    { name: 'Lavender Glow', hex: '#B9A6F2', note: 'Dreamy cool tone for a Korean beauty mood.' },
    { name: 'Soft Navy', hex: '#27385E', note: 'Elegant contrast without harsh black.' },
  ];
}

function skinCareForDetection(detected: DetectedBeauty) {
  const base = ['Use sunscreen every morning.', 'Remove makeup fully before sleep.'];
  if (detected.brightness < 45) return ['Add bright front lighting for analysis accuracy.', 'Use a gentle cleanser.', 'Try a vitamin C or niacinamide glow step slowly.', ...base];
  if (detected.contrast > 30) return ['Use calming moisturizer before makeup.', 'Avoid harsh scrubs around textured areas.', ...base];
  return ['Use a hydrating cleanser.', 'Add lightweight moisturizer before base makeup.', ...base];
}

function hairCareForDetection(detected: DetectedBeauty) {
  if (detected.hairTexture.includes('wavy')) return ['Use leave-in cream on damp hair.', 'Diffuse or air dry for soft waves.', 'Avoid brushing waves when fully dry.'];
  if (detected.hairTexture.includes('dense')) return ['Use lightweight shine serum on ends.', 'Keep roots clean for lift.', 'Use heat protectant before sleek styling.'];
  return ['Use volumizing mousse near roots.', 'Condition only mid-lengths and ends.', 'Use a weekly gloss mask.'];
}

function photoTipsForDetection(detected: DetectedBeauty) {
  const tips = ['Keep the camera at eye level.', 'Avoid beauty filters for accurate skin tone.'];
  if (detected.photoQuality < 72) tips.unshift('Use brighter front window light next time.');
  if (detected.symmetry < 78) tips.push('Try a slight three-quarter pose to balance the frame.');
  return tips;
}

function profileTipsForDetection(detected: DetectedBeauty) {
  if (detected.featureSoftness === 'Sharp') return ['Use matte black or cream background.', 'Try sleek hair away from the face.', 'Keep jewelry minimal and reflective.'];
  if (detected.featureSoftness === 'Soft') return ['Use soft front lighting.', 'Try gentle waves around the cheek area.', 'Choose rounded jewelry and blush tones.'];
  return ['Use a plain background.', 'Relax shoulders with a slight three-quarter angle.', 'Keep hair neat around the eyes.'];
}

function glowUpForDetection(detected: DetectedBeauty) {
  const suggestions = [`Build outfits around ${detected.seasonalPalette}.`, `Use ${detected.undertone} makeup shades near the face.`];
  if (detected.faceShape.includes('round')) suggestions.push('Add crown volume and longer face-framing layers.');
  if (detected.faceShape.includes('heart')) suggestions.push('Use curtain bangs or butterfly layers to balance the forehead and chin.');
  if (detected.featureSoftness === 'Sharp') suggestions.push('Try sleek styling and clean tailoring.');
  if (detected.featureSoftness === 'Soft') suggestions.push('Try soft waves, blush textures, and rounded accessories.');
  return suggestions;
}

function complimentsForDetection(detected: DetectedBeauty) {
  return [
    `Your ${detected.aestheticVibe} energy feels really polished and pretty.`,
    `The ${detected.seasonalPalette} direction makes your features look extra intentional.`,
    `Your face has a lovely ${detected.featureSoftness.toLowerCase()} beauty balance.`,
  ];
}

function hairstyleReasonForFace(detected: DetectedBeauty) {
  if (detected.faceShape.includes('round')) return 'Layered cuts with crown lift help elongate rounder proportions.';
  if (detected.faceShape.includes('heart')) return 'Curtain bangs balance a wider upper face and draw attention to the eyes.';
  if (detected.faceShape.includes('diamond')) return 'Soft waves reduce sharpness around cheekbones while keeping elegance.';
  if (detected.faceShape.includes('long')) return 'Face-framing layers and waves add side volume for proportion.';
  return 'Oval balance can carry most cuts, so styling can focus on texture and polish.';
}

function makeupSummaryForDetection(detected: DetectedBeauty) {
  if (detected.undertone === 'warm') return 'Peach, caramel, champagne, and warm rose shades harmonize with your detected warm undertone.';
  if (detected.undertone === 'cool') return 'Cool rose, lavender taupe, pearl, and berry tint shades support your detected cool undertone.';
  return 'Neutral satin base, rose-beige blush, soft brown definition, and balanced gloss suit your neutral undertone.';
}

function colorSummaryForDetection(detected: DetectedBeauty) {
  return `${detected.seasonalPalette} was selected from your detected ${detected.undertone} undertone, ${detected.contrast}% contrast, and ${detected.brightness}% brightness.`;
}

function outfitAestheticForDetection(detected: DetectedBeauty) {
  if (detected.aestheticVibe.includes('dark')) return 'AI fashion magazine muse';
  if (detected.aestheticVibe.includes('clean')) return 'clean girl fashion muse';
  if (detected.aestheticVibe.includes('soft')) return 'Pinterest soft girl muse';
  return 'Korean editorial muse';
}

async function generateTryOn(mode: Mode, photo: string, report: AnalysisDraft) {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise<string>((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(photo);
      ctx.drawImage(image, 0, 0);

      if (mode === 'color') {
        const color = report.selectedColor || report.palette[0].hex;
        const clothTop = canvas.height * 0.74;
        const neckTop = canvas.height * 0.7;
        const center = canvas.width * 0.5;
        const grad = ctx.createLinearGradient(0, clothTop, 0, canvas.height);
        grad.addColorStop(0, color);
        grad.addColorStop(1, report.palette.find((item) => item.hex !== color)?.hex || color);
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.08, canvas.height);
        ctx.lineTo(canvas.width * 0.18, clothTop);
        ctx.quadraticCurveTo(center, neckTop, canvas.width * 0.82, clothTop);
        ctx.lineTo(canvas.width * 0.92, canvas.height);
        ctx.closePath();
        ctx.moveTo(center - canvas.width * 0.12, clothTop + canvas.height * 0.02);
        ctx.quadraticCurveTo(center, clothTop + canvas.height * 0.12, center + canvas.width * 0.12, clothTop + canvas.height * 0.02);
        ctx.lineTo(center + canvas.width * 0.06, clothTop + canvas.height * 0.22);
        ctx.quadraticCurveTo(center, clothTop + canvas.height * 0.27, center - canvas.width * 0.06, clothTop + canvas.height * 0.22);
        ctx.closePath();
        ctx.fill('evenodd');

        ctx.globalAlpha = 0.38;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(3, canvas.width * 0.008);
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.18, clothTop);
        ctx.quadraticCurveTo(center, neckTop, canvas.width * 0.82, clothTop);
        ctx.stroke();
      }

      if (mode === 'hair') {
        ctx.globalAlpha = 0.62;
        const color = report.palette[0].hex;
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.42);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(canvas.width * 0.12, 0, canvas.width * 0.76, canvas.height * 0.42);
      }

      if (mode === 'makeup') {
        const blush = report.palette[1]?.hex || '#E59AAF';
        const lip = report.palette[2]?.hex || '#D96172';
        ctx.globalAlpha = 0.38;
        ctx.fillStyle = blush;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.28, canvas.height * 0.42, canvas.width * 0.08, 0, Math.PI * 2);
        ctx.arc(canvas.width * 0.72, canvas.height * 0.42, canvas.width * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.62;
        ctx.fillStyle = lip;
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.6, canvas.width * 0.07, canvas.height * 0.022, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (mode === 'face') {
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = '#7BC9FF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(canvas.width * 0.5, canvas.height * 0.32, canvas.width * 0.18, canvas.height * 0.18, 0, 0, Math.PI * 2);
        ctx.moveTo(canvas.width * 0.5, canvas.height * 0.5);
        ctx.lineTo(canvas.width * 0.5, canvas.height * 0.88);
        ctx.moveTo(canvas.width * 0.28, canvas.height * 0.58);
        ctx.lineTo(canvas.width * 0.72, canvas.height * 0.58);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(18, 18, Math.min(420, canvas.width - 36), 58);
      ctx.fillStyle = '#312D3D';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(report.title.slice(0, 30), 34, 55);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    image.onerror = () => resolve(photo);
    image.src = photo;
  });
}

async function generateMoodboard(photo: string, report: AnalysisDraft) {
  const selected = premiumPalettes.find((palette) => palette.name === report.selectedPaletteName);
  const colors = selected?.colors || [report.selectedColor || report.palette[0]?.hex || '#F6A6BF', report.palette[1]?.hex || '#FFDDE8', '#FFFFFF'];
  const captions = ['Editorial portrait', 'Outfit idea', 'Makeup vibe', 'Accessories'];
  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise<string[]>((resolve) => {
    image.onload = () => {
      const boards = captions.map((caption, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 960;
        const ctx = canvas.getContext('2d');
        if (!ctx) return photo;
        const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bg.addColorStop(0, colors[index % colors.length]);
        bg.addColorStop(0.58, colors[(index + 1) % colors.length]);
        bg.addColorStop(1, '#fffafc');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(620, 120 + index * 34, 180, 0, Math.PI * 2);
        ctx.arc(80, 780 - index * 28, 220, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        const imgRatio = image.width / image.height;
        const targetW = index % 2 === 0 ? 430 : 360;
        const targetH = targetW / imgRatio;
        const x = index % 2 === 0 ? 145 : 70;
        const y = index % 2 === 0 ? 128 : 168;
        ctx.save();
        roundedRect(ctx, x, y, targetW, Math.min(560, targetH), 42);
        ctx.clip();
        ctx.drawImage(image, x, y, targetW, targetH);
        ctx.restore();

        ctx.globalAlpha = 0.94;
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(90, 760);
        ctx.quadraticCurveTo(360, 650, 630, 760);
        ctx.lineTo(690, 960);
        ctx.lineTo(30, 960);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        roundedRect(ctx, 46, 48, 420, 92, 30);
        ctx.fill();
        ctx.fillStyle = '#221F2C';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText(caption, 76, 96);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(report.selectedPaletteName || report.title, 76, 124);

        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        roundedRect(ctx, 70, 790, 580, 106, 34);
        ctx.fill();
        ctx.fillStyle = '#312D3D';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText((selected?.vibe || report.summary).slice(0, 48), 98, 842);
        ctx.font = '18px sans-serif';
        ctx.fillText(report.museAesthetic, 98, 872);
        return canvas.toDataURL('image/jpeg', 0.9);
      });
      resolve(boards);
    };
    image.onerror = () => resolve([photo, photo, photo, photo]);
    image.src = photo;
  });
}

async function generateHairstyleRecommendations(photo: string, detected: DetectedBeauty) {
  const recs = hairstyleCatalog.map((style, index) => {
    let faceBoost = detected.faceShape.includes('oval') ? 7 : 3;
    if (detected.faceShape.includes('round') && ['Long layers', 'Butterfly cut', 'U-Cut', 'Face Framing Layers'].includes(style.name)) faceBoost += 11;
    if (detected.faceShape.includes('heart') && ['Curtain bangs', 'Butterfly cut', 'Soft waves'].includes(style.name)) faceBoost += 12;
    if (detected.faceShape.includes('diamond') && ['Soft waves', 'Long layers', 'Messy bun'].includes(style.name)) faceBoost += 10;
    if (detected.featureSoftness === 'Sharp' && ['Sleek hairstyle', 'Korean straight hair', 'Sleek Ponytail'].includes(style.name)) faceBoost += 8;
    if (detected.featureSoftness === 'Soft' && ['Soft waves', 'Curtain bangs', 'Messy bun'].includes(style.name)) faceBoost += 8;
    if (detected.hairTexture.includes('wavy') && ['Soft waves', 'Wolf cut', 'Butterfly cut'].includes(style.name)) faceBoost += 5;
    return {
      ...style,
      reason: hairstyleReason(style.name, detected),
      match: Math.round(Math.min(98, 64 + detected.symmetry * 0.12 + detected.photoQuality * 0.08 + ((detected.contrast + index * 7) % 13) + faceBoost)),
      preview: '',
    };
  });

  const sorted = recs.sort((a, b) => b.match - a.match);
  const withImages: HairstyleRecommendation[] = [];
  for (const style of sorted) {
    withImages.push({
      ...style,
      preview: await generateHairstyleImage(photo, style.name, style.color, false),
    });
  }
  return withImages;
}

function hairstyleReason(styleName: string, detected: DetectedBeauty) {
  if (styleName === 'Curtain bangs') return `Soft curtain bangs balance ${detected.faceShape} proportions and enhance eye focus.`;
  if (styleName === 'Butterfly cut') return `Butterfly layers add movement around your ${detected.featureSoftness.toLowerCase()} features without hiding the face.`;
  if (styleName === 'Long layers') return `Long layers support your ${detected.hairTexture} texture and visually lengthen the face.`;
  if (styleName === 'Soft waves') return `Soft waves match your ${detected.aestheticVibe} vibe and add gentle cheek softness.`;
  if (styleName === 'Wolf cut') return `A wolf cut adds crown volume and works best when you want a sharper fashion mood.`;
  if (styleName === 'Sleek hairstyle') return `Sleek styling highlights symmetry and gives your ${detected.seasonalPalette} palette a luxury finish.`;
  if (styleName === 'Short bob') return `A short bob sharpens the outline and creates a clean editorial frame.`;
  if (styleName === 'U-Cut') return `A U-cut keeps length while making the hair fall softer around the shoulders.`;
  if (styleName === 'Face Framing Layers') return `Face framing layers customize volume around your ${detected.faceShape} face shape.`;
  return `${styleName} works with your ${detected.faceShape} face shape and ${detected.hairTexture} texture.`;
}

async function generateHairstyleImage(photo: string, styleName: string, hairColor: string, portrait: boolean) {
  const image = new Image();
  image.crossOrigin = 'anonymous';

  return new Promise<string>((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = portrait ? 900 : 640;
      canvas.height = portrait ? 1120 : 820;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(photo);
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, '#fff4fa');
      bg.addColorStop(0.52, '#f1edff');
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const imgRatio = image.width / image.height;
      const targetW = portrait ? canvas.width * 0.76 : canvas.width * 0.7;
      const targetH = targetW / imgRatio;
      const x = (canvas.width - targetW) / 2;
      const y = portrait ? canvas.height * 0.08 : canvas.height * 0.12;
      ctx.save();
      roundedRect(ctx, x, y, targetW, Math.min(targetH, canvas.height * 0.7), portrait ? 58 : 42);
      ctx.clip();
      ctx.drawImage(image, x, y, targetW, targetH);
      ctx.restore();

      drawHairOverlay(ctx, canvas.width, canvas.height, styleName, hairColor, portrait);

      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      roundedRect(ctx, 36, canvas.height - 148, canvas.width - 72, 104, 34);
      ctx.fill();
      ctx.fillStyle = '#211E2A';
      ctx.font = `bold ${portrait ? 34 : 28}px sans-serif`;
      ctx.fillText(styleName, 64, canvas.height - 100);
      ctx.font = `${portrait ? 20 : 17}px sans-serif`;
      ctx.fillText('Realistic beauty filter preview', 64, canvas.height - 70);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    image.onerror = () => resolve(photo);
    image.src = photo;
  });
}

async function generateOutfitRecommendations(photo: string, detected: DetectedBeauty, selectedPaletteName?: string) {
  const palette = premiumPalettes.find((item) => item.name === selectedPaletteName) || premiumPalettes.find((item) => item.name.includes(detected.seasonalPalette.split(' ')[0])) || premiumPalettes[0];
  const templates = outfitTemplatesForDetection(detected);
  const outfits: OutfitRecommendation[] = [];
  for (const [index, template] of templates.entries()) {
    outfits.push({
      title: template.title,
      match: Math.round(clamp(detected.score - 7 + index * 3 + (detected.undertone === template.undertone ? 5 : 0), 70, 98)),
      reason: template.reason,
      image: await generateOutfitImage(photo, template.title, palette.colors, detected),
    });
  }
  return outfits;
}

function outfitTemplatesForDetection(detected: DetectedBeauty) {
  const clean = [
    { title: 'Clean Girl Satin Set', undertone: 'cool', reason: 'Minimal lines keep the face bright and polished.' },
    { title: 'Korean Soft Cardigan Look', undertone: 'neutral', reason: 'Soft layering matches a beauty-tech everyday aesthetic.' },
    { title: 'Pearl Accessory Blouse', undertone: 'cool', reason: 'Pearl accents support cooler and softer facial contrast.' },
  ];
  const warm = [
    { title: 'Mocha Knit Co-ord', undertone: 'warm', reason: 'Warm brown tones echo the detected undertone.' },
    { title: 'Vanilla Cream Dress', undertone: 'warm', reason: 'Cream near the face adds soft brightness.' },
    { title: 'Gold Detail Minimal Fit', undertone: 'warm', reason: 'Warm jewelry creates a cohesive glow.' },
  ];
  const dark = [
    { title: 'Royal Black Tailored Look', undertone: 'cool', reason: 'High contrast styling supports defined features.' },
    { title: 'Emerald Editorial Dress', undertone: 'cool', reason: 'Deep jewel tones create premium contrast.' },
    { title: 'Dark Feminine Monochrome', undertone: 'neutral', reason: 'Matte black and sleek shapes enhance sharp structure.' },
  ];
  if (detected.aestheticVibe.includes('dark') || detected.seasonalPalette === 'Deep Winter') return dark;
  if (detected.undertone === 'warm') return warm;
  return clean;
}

async function generateOutfitImage(photo: string, title: string, colors: string[], detected: DetectedBeauty) {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  return new Promise<string>((resolve) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(photo);
      const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bg.addColorStop(0, colors[0]);
      bg.addColorStop(0.55, colors[1] || colors[0]);
      bg.addColorStop(1, '#fffafc');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.9;
      ctx.save();
      roundedRect(ctx, 128, 90, 464, 610, 54);
      ctx.clip();
      ctx.drawImage(image, 128, 90, 464, 610);
      ctx.restore();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.moveTo(90, 760);
      ctx.quadraticCurveTo(360, 640, 630, 760);
      ctx.lineTo(700, 960);
      ctx.lineTo(20, 960);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      roundedRect(ctx, 46, 46, 560, 118, 34);
      ctx.fill();
      ctx.fillStyle = '#211E2A';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(title, 78, 94);
      ctx.font = '18px sans-serif';
      ctx.fillText(`${detected.aestheticVibe} · ${detected.seasonalPalette}`, 78, 126);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    image.onerror = () => resolve(photo);
    image.src = photo;
  });
}

function drawHairOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, styleName: string, hairColor: string, portrait: boolean) {
  const cx = width * 0.5;
  const top = portrait ? height * 0.11 : height * 0.13;
  const scale = portrait ? 1.18 : 1;
  const hairW = width * 0.42 * scale;
  const hairH = height * 0.28 * scale;
  const lower = top + hairH * 0.98;
  const grad = ctx.createLinearGradient(0, top, 0, lower);
  grad.addColorStop(0, hairColor);
  grad.addColorStop(1, '#1B1719');
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = grad;

  ctx.beginPath();
  if (styleName === 'Short bob') {
    ctx.roundRect(cx - hairW * 0.45, top + hairH * 0.18, hairW * 0.9, hairH * 0.78, 36);
  } else if (styleName === 'Ponytail styles' || styleName === 'Sleek hairstyle') {
    ctx.ellipse(cx, top + hairH * 0.42, hairW * 0.42, hairH * 0.5, 0, 0, Math.PI * 2);
    ctx.moveTo(cx + hairW * 0.34, top + hairH * 0.44);
    ctx.ellipse(cx + hairW * 0.52, top + hairH * 0.5, hairW * 0.16, hairH * 0.22, 0.3, 0, Math.PI * 2);
  } else {
    ctx.moveTo(cx - hairW * 0.48, lower);
    ctx.quadraticCurveTo(cx - hairW * 0.54, top + hairH * 0.18, cx, top);
    ctx.quadraticCurveTo(cx + hairW * 0.54, top + hairH * 0.18, cx + hairW * 0.48, lower);
    ctx.quadraticCurveTo(cx, lower + hairH * 0.16, cx - hairW * 0.48, lower);
  }
  ctx.fill();

  if (['Curtain bangs', 'Butterfly cut', 'Wolf cut'].includes(styleName)) {
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    ctx.moveTo(cx - hairW * 0.04, top + hairH * 0.08);
    ctx.quadraticCurveTo(cx - hairW * 0.28, top + hairH * 0.3, cx - hairW * 0.2, top + hairH * 0.68);
    ctx.moveTo(cx + hairW * 0.04, top + hairH * 0.08);
    ctx.quadraticCurveTo(cx + hairW * 0.28, top + hairH * 0.3, cx + hairW * 0.2, top + hairH * 0.68);
    ctx.lineWidth = Math.max(10, width * 0.025);
    ctx.strokeStyle = hairColor;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  if (styleName === 'Messy bun') {
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(cx, top + hairH * 0.02, hairW * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = hairColor;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function downloadText(report: Report) {
  const skinCare = report.skinCare || [];
  const hairCare = report.hairCare || [];
  const photoFeedback = report.photoFeedback || [];
  const profileFeedback = report.profileFeedback || [];
  const glowUp = report.glowUp || [];
  const compliments = report.compliments || [];
  const hairstyles = report.hairstyles || [];
  const text = [
    `Glowra Report: ${report.title}`,
    `Score: ${report.score}%`,
    '',
    report.summary,
    '',
    'Palette and shades:',
    ...report.palette.map((item) => `- ${item.name}: ${item.hex} - ${item.note}`),
    '',
    'Tips:',
    ...report.tips.map((tip) => `- ${tip}`),
    '',
    'Details:',
    ...report.details.map((detail) => `- ${detail}`),
    '',
    'Skin care:',
    ...skinCare.map((tip) => `- ${tip}`),
    '',
    'Hair care:',
    ...hairCare.map((tip) => `- ${tip}`),
    '',
    'Recommended hairstyles:',
    ...hairstyles.map((style) => `- ${style.name}: ${style.match}% - ${style.reason}`),
    '',
    'Photo quality, lighting, pose:',
    ...photoFeedback.map((tip) => `- ${tip}`),
    '',
    'Professional profile photo feedback:',
    ...profileFeedback.map((tip) => `- ${tip}`),
    '',
    'AI glow-up suggestions:',
    ...glowUp.map((tip) => `- ${tip}`),
    '',
    'Compliments:',
    ...compliments.map((tip) => `- ${tip}`),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `glowra-${report.mode}-report.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadImage(dataUrl: string, name: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = name;
  link.click();
}

function downloadBeautyPdf(report: Report) {
  const printable = window.open('', '_blank', 'width=900,height=1200');
  if (!printable) {
    downloadText(report);
    return;
  }
  printable.document.write(`
    <html>
      <head>
        <title>Glowra Beauty Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #24202d; background: #fff7fb; }
          h1 { font-size: 34px; margin-bottom: 6px; }
          h2 { margin-top: 24px; color: #d63384; }
          img { width: 46%; border-radius: 24px; margin: 8px; vertical-align: top; }
          .card { background: white; border-radius: 24px; padding: 18px; margin: 14px 0; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
          li { margin: 7px 0; }
        </style>
      </head>
      <body>
        <h1>Glowra Beauty Report</h1>
        <p><strong>${report.title}</strong> · ${report.score}% match</p>
        <div class="card"><p>${report.summary}</p></div>
        <img src="${report.photo}" /><img src="${report.generated}" />
        <h2>AI Face Analysis</h2>
        <ul>${report.details.map((item) => `<li>${item}</li>`).join('')}</ul>
        <h2>Recommended Hairstyles</h2>
        <ul>${(report.hairstyles || []).slice(0, 6).map((item) => `<li>${item.name}: ${item.match}% - ${item.reason}</li>`).join('')}</ul>
        <h2>Style Recommendations</h2>
        <ul>${report.tips.concat(report.glowUp || []).map((item) => `<li>${item}</li>`).join('')}</ul>
      </body>
    </html>
  `);
  printable.document.close();
  printable.focus();
  printable.print();
}

export default function App() {
  const [mode, setMode] = useState<Mode>('color');
  const [photo, setPhoto] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('glowra-history') || '[]');
    } catch {
      return [];
    }
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('glowra-user') || 'null');
    } catch {
      return null;
    }
  });
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [selectedOutfitColor, setSelectedOutfitColor] = useState(outfitPaletteChoices[0].hex);
  const [scanStep, setScanStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => setMessage('Camera opened, but playback was blocked. Allow camera permission and retry.'));
  }, [cameraOpen]);

  function saveHistory(next: Report[]) {
    setHistory(next);
    localStorage.setItem('glowra-history', JSON.stringify(next));
  }

  function login(event: React.FormEvent) {
    event.preventDefault();
    const nextUser = {
      name: loginName.trim() || 'Glowra user',
      email: loginEmail.trim() || 'local@glowra.app',
    };
    setUser(nextUser);
    localStorage.setItem('glowra-user', JSON.stringify(nextUser));
    setLoginOpen(false);
    setMessage(`Welcome ${nextUser.name}. Your photos and reports are saved on this device.`);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('glowra-user');
    setMessage('Logged out from local profile.');
  }

  async function openCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage('Live camera is blocked in this browser. Tap Upload user picture and choose Camera, or open Glowra on HTTPS, localhost, or 127.0.0.1.');
        return;
      }
      const cameraSafeHost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
      if (!window.isSecureContext && !cameraSafeHost) {
        setMessage('Camera needs a secure page. Use http://localhost:3000 on this machine, HTTPS, or Upload user picture to take a camera photo.');
        return;
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setMessage('Camera ready. Click capture selfie.');
    } catch (error: any) {
      const reason = error?.name === 'NotAllowedError' ? 'Camera permission was denied.' : error?.name === 'NotFoundError' ? 'No camera device was found.' : error.message || 'Camera access was blocked.';
      setMessage(`${reason} You can still use Upload user picture and choose Camera.`);
    }
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function captureSelfie() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/jpeg', 0.92));
    setReport(null);
    closeCamera();
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setPhoto(await readFile(file));
    setReport(null);
  }

  async function runAnalysis() {
    if (!photo) {
      setMessage('Please upload a picture or take a live selfie first.');
      return;
    }
    setBusy(true);
    setReport(null);
    setScanStep(0);
    for (let index = 0; index < scanSteps.length; index += 1) {
      setScanStep(index);
      await new Promise((resolve) => setTimeout(resolve, 260));
    }
    const detected = await analyzeSelfie(photo);
    const analysis = makeAnalysis(mode, photo, detected);
    const selectedPalette = outfitPaletteChoices.find((shade) => shade.hex === selectedOutfitColor) || outfitPaletteChoices[0];
    const withSelectedColor = mode === 'color' ? { ...analysis, selectedColor: selectedOutfitColor, selectedPaletteName: selectedPalette.name } : analysis;
    const generated = await generateTryOn(mode, photo, withSelectedColor);
    const moodboard = await generateMoodboard(photo, withSelectedColor);
    const hairstyles = await generateHairstyleRecommendations(photo, detected);
    const outfits = await generateOutfitRecommendations(photo, detected, withSelectedColor.selectedPaletteName);
    const nextReport: Report = {
      id: `${Date.now()}`,
      mode,
      photo,
      generated,
      moodboard,
      hairstyles,
      outfits,
      detected,
      ...withSelectedColor,
    };
    setReport(nextReport);
    saveHistory([nextReport, ...history].slice(0, 12));
    setMessage('Analysis complete. Photo, generated try-on, and report saved.');
    setBusy(false);
  }

  async function tryColor(shade: { name: string; hex: string; note: string }) {
    if (!report) return;
    setBusy(true);
    setSelectedOutfitColor(shade.hex);
    const updated = { ...report, title: `${shade.name} Try-On`, selectedColor: shade.hex, selectedPaletteName: shade.name };
    const generated = await generateTryOn(report.mode, report.photo, updated);
    const moodboard = await generateMoodboard(report.photo, updated);
    const outfits = await generateOutfitRecommendations(report.photo, report.detected, shade.name);
    const nextReport = { ...updated, generated, moodboard, outfits, hairstyles: report.hairstyles || [] };
    setReport(nextReport);
    saveHistory([nextReport, ...history.filter((item) => item.id !== report.id)].slice(0, 12));
    setMessage(`${shade.name} generated on the user's picture.`);
    setBusy(false);
  }

  async function tryHairstyle(style: HairstyleRecommendation) {
    if (!report) return;
    setBusy(true);
    const haircutPreview = await generateHairstyleImage(report.photo, style.name, style.color, true);
    const nextReport = {
      ...report,
      selectedHairstyle: style.name,
      haircutPreview,
      generated: haircutPreview,
    };
    setReport(nextReport);
    saveHistory([nextReport, ...history.filter((item) => item.id !== report.id)].slice(0, 12));
    setMessage(`${style.name} preview generated with the user's face structure.`);
    setBusy(false);
  }

  function deleteAllUserData() {
    closeCamera();
    localStorage.removeItem('glowra-history');
    localStorage.removeItem('glowra-user');
    setHistory([]);
    setUser(null);
    setReport(null);
    setPhoto('');
    setMessage('All local Glowra user data has been deleted.');
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fff0f5,#f4f1ff,#e8f7ff)] p-4 text-[#302d3a] md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <header className="rounded-[34px] border border-white/70 bg-white/45 p-5 shadow-2xl shadow-purple-100 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-500">Glowra beauty AI</p>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">Selfie try-on universe</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold text-[#666]">
                Take a live selfie, try outfit colors, hair colors, makeup shades, face/body structure analysis, skincare and haircare reports.
              </p>
            </div>
            <div className="grid h-28 w-28 place-items-center rounded-full bg-[radial-gradient(circle,#fff,#ff8e8e,#8e8eff)] shadow-[0_0_60px_rgba(142,142,255,0.45)]">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => setChatOpen((open) => !open)} className="flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white">
              <MessageCircle className="h-4 w-4" />
              Glowra chatbot
            </button>
            <button onClick={() => setLoginOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-[#302d3a] shadow">
              <UserRound className="h-4 w-4" />
              {user ? user.name : 'Login'}
            </button>
            {user && (
              <button onClick={logout} className="inline-flex rounded-full bg-white/70 px-5 py-3 text-sm font-black text-[#666] shadow">
                Logout
              </button>
            )}
            <button onClick={deleteAllUserData} className="inline-flex rounded-full bg-white/70 px-5 py-3 text-sm font-black text-[#666] shadow">
              Delete data
            </button>
          </div>
        </header>

        {loginOpen && (
          <section className="rounded-[34px] border border-white/70 bg-white/55 p-6 shadow-2xl shadow-pink-100 backdrop-blur-2xl">
            <h2 className="text-2xl font-black">Login / create local profile</h2>
            <form onSubmit={login} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input value={loginName} onChange={(event) => setLoginName(event.target.value)} placeholder="Your name" className="rounded-full border border-white/80 bg-white/80 px-5 py-4 text-sm font-bold outline-none" />
              <input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="Email" className="rounded-full border border-white/80 bg-white/80 px-5 py-4 text-sm font-bold outline-none" />
              <button className="rounded-full bg-black px-6 py-4 text-sm font-black text-white">Login</button>
            </form>
          </section>
        )}

        {chatOpen && <GlowChat latest={report || history[0] || null} />}

        <nav className="grid gap-3 md:grid-cols-4">
          {modes.map(({ id, label, helper, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`rounded-[28px] border border-white/70 p-5 text-left shadow-xl backdrop-blur-xl transition hover:-translate-y-1 ${
                mode === id ? 'bg-black text-white' : 'bg-white/50'
              }`}
            >
              <Icon className="mb-4 h-8 w-8" />
              <p className="text-xl font-black">{label}</p>
              <p className={`mt-2 text-sm font-semibold ${mode === id ? 'text-white/70' : 'text-[#666]'}`}>{helper}</p>
            </button>
          ))}
        </nav>

        {message && (
          <button onClick={() => setMessage('')} className="rounded-[26px] bg-black px-6 py-4 text-left text-sm font-bold text-white">
            {message}
          </button>
        )}

        <main className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-[34px] border border-white/70 bg-white/45 p-6 shadow-2xl shadow-pink-100 backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-500">Step 1</p>
            <h2 className="mt-1 text-3xl font-black">Upload Your Selfie</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid min-h-56 cursor-pointer place-items-center rounded-[30px] border-2 border-dashed border-pink-300 bg-white/55 p-6 text-center shadow-inner">
                <FileText className="mb-3 h-9 w-9 text-pink-500" />
                <span className="font-black">Upload from gallery</span>
                <input type="file" accept="image/*" capture="user" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
              </label>
              <button onClick={openCamera} className="flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 font-black text-white">
                <Camera className="h-5 w-5" />
                Take live selfie
              </button>
              {cameraOpen && (
                <div className="rounded-[30px] bg-white/60 p-4">
                  <video ref={videoRef} autoPlay playsInline muted className="aspect-[3/4] w-full rounded-[24px] bg-black object-cover [transform:scaleX(-1)]" />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={captureSelfie} className="rounded-full bg-black px-5 py-3 font-black text-white">Capture</button>
                    <button onClick={closeCamera} className="rounded-full bg-white px-5 py-3 font-black">Close</button>
                  </div>
                </div>
              )}
              {photo && <img src={photo} alt="User selected" className="aspect-[3/4] w-full rounded-[30px] object-cover shadow-2xl" />}
              {mode === 'color' && (
                <div className="rounded-[28px] bg-white/65 p-4">
                  <p className="mb-3 text-sm font-black">Interactive color palette selector</p>
                  <div className="grid grid-cols-2 gap-3">
                    {outfitPaletteChoices.map((shade) => (
                      <button
                        key={shade.hex}
                        onClick={() => setSelectedOutfitColor(shade.hex)}
                        className={`overflow-hidden rounded-[22px] border-4 bg-white text-left text-xs font-black shadow transition hover:-translate-y-1 ${selectedOutfitColor === shade.hex ? 'border-black' : 'border-white'}`}
                        type="button"
                      >
                        <span className="relative block h-20 rounded-[16px]" style={{ background: `linear-gradient(135deg, ${shade.colors?.[0] || shade.hex}, ${shade.colors?.[1] || shade.hex}, ${shade.colors?.[2] || '#fff'})` }}>
                          <span className="absolute bottom-2 right-2 h-10 w-8 rounded-t-full bg-white/70 shadow" />
                          <span className="absolute bottom-2 right-8 h-12 w-9 rounded-t-full bg-black/15" />
                        </span>
                        <span className="mt-3 block px-1">{shade.name}</span>
                        <span className="block px-1 pb-2 pt-1 text-[10px] font-bold text-[#777]">{shade.note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={runAnalysis} className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 px-6 py-4 font-black text-white shadow-xl">
                <Wand2 className="h-5 w-5" />
                {busy ? 'Generating...' : 'Run AI try-on'}
              </button>
            </div>
          </section>

          <section className="rounded-[34px] border border-white/70 bg-white/45 p-6 shadow-2xl shadow-purple-100 backdrop-blur-2xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-500">Step 2</p>
            <h2 className="mt-1 text-3xl font-black">AI Face Analysis Report</h2>
            {busy && (
              <div className="mt-6 rounded-[30px] bg-black p-6 text-white shadow-2xl">
                <div className="mx-auto grid h-52 w-52 place-items-center rounded-full border border-white/20 bg-white/10">
                  <div className="h-32 w-24 animate-pulse rounded-[48%] border-4 border-pink-300 shadow-[0_0_45px_rgba(246,166,191,0.65)]" />
                </div>
                <div className="mt-6 grid gap-3">
                  {scanSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-3 text-sm font-black">
                      <span className={`h-3 w-3 rounded-full ${index <= scanStep ? 'bg-pink-300' : 'bg-white/30'}`} />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!report && !busy && (
              <div className="mt-6 grid min-h-[420px] place-items-center rounded-[30px] bg-white/45 text-center">
                <div>
                  <Sparkles className="mx-auto h-14 w-14 text-pink-500" />
                  <p className="mt-4 font-bold text-[#666]">Your face report, palette AI, and generated moodboard will appear here.</p>
                </div>
              </div>
            )}
            {report && (
              <div className="mt-6 grid gap-5">
                <img src={report.generated} alt="Generated try-on" className="w-full rounded-[30px] shadow-2xl" />
                <div className="rounded-[28px] bg-white/65 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">AI report</p>
                      <h3 className="mt-1 text-3xl font-black">{report.title}</h3>
                    </div>
                    <span className="rounded-full bg-black px-4 py-2 text-sm font-black text-white">{report.score}% match</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-7 text-[#666]">{report.summary}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <button onClick={() => downloadBeautyPdf(report)} className="flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white">
                      <Download className="h-4 w-4" />
                      Download beauty report PDF
                    </button>
                    <button onClick={() => downloadImage(report.moodboard?.[0] || report.generated, 'glowra-instagram-story.jpg')} className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#302d3a]">
                      Share story image
                    </button>
                    <button onClick={() => downloadImage(report.generated, 'glowra-before-after.jpg')} className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#302d3a]">
                      Save glow-up
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <ScoreCard title="Overall aesthetic" value={report.aestheticTitle} helper="Premium face vibe" />
                  <ScoreCard title="Seasonal palette" value={report.seasonalPalette} helper={report.selectedPaletteName || 'AI matched'} />
                  <ScoreCard title="Beauty score" value={`${report.score}%`} helper={`Symmetry ${report.detected?.symmetry || '--'}% · Photo ${report.detected?.photoQuality || '--'}%`} />
                </div>
                {report.detected && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Info title="Detected facial features" items={[
                      `Face shape: ${report.detected.faceShape}`,
                      `Eye shape: ${report.detected.eyeShape}`,
                      `Lip shape: ${report.detected.lipShape}`,
                      `Eyebrows: ${report.detected.eyebrowStructure}`,
                      `Hair texture: ${report.detected.hairTexture}`,
                    ]} />
                    <Info title="Skin tone and palette analysis" items={[
                      `Skin tone: ${report.detected.skinTone}`,
                      `Undertone: ${report.detected.undertone}`,
                      `Seasonal palette: ${report.detected.seasonalPalette}`,
                      `Contrast: ${report.detected.contrast}%`,
                      `Brightness: ${report.detected.brightness}%`,
                    ]} />
                  </div>
                )}
                <div>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-500">AI haircut engine</p>
                      <h3 className="text-2xl font-black">Recommended Hairstyles</h3>
                    </div>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#666]">Detected {report.details.find((item) => item.startsWith('Face shape'))?.replace('Face shape: ', '') || 'soft oval'} face</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {(report.hairstyles || []).map((style) => (
                      <div key={style.name} className="overflow-hidden rounded-[28px] bg-white/70 shadow-xl">
                        <img src={style.preview} alt={`${style.name} hairstyle preview`} className="aspect-[4/5] w-full object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="font-black">{style.name}</h4>
                            <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">{style.match}%</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#666]">{style.reason}</p>
                          <button onClick={() => tryHairstyle(style)} className="mt-4 w-full rounded-full bg-black px-4 py-3 text-xs font-black text-white">
                            Try this look
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {report.haircutPreview && (
                  <div>
                    <h3 className="mb-4 text-2xl font-black">Haircut visual preview</h3>
                    <img src={report.haircutPreview} alt={`${report.selectedHairstyle} generated haircut preview`} className="w-full rounded-[30px] shadow-2xl" />
                  </div>
                )}
                <div>
                  <h3 className="mb-4 text-2xl font-black">Outfit inspiration for your palette</h3>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {(report.outfits || []).map((outfit) => (
                      <div key={outfit.title} className="overflow-hidden rounded-[28px] bg-white/70 shadow-xl">
                        <img src={outfit.image} alt={outfit.title} className="aspect-[3/4] w-full object-cover" />
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="font-black">{outfit.title}</h4>
                            <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">{outfit.match}%</span>
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#666]">{outfit.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {report.palette.map((shade) => (
                    <div key={shade.name} className="overflow-hidden rounded-[28px] bg-white/65 shadow-xl">
                      <div className="relative h-32" style={{ background: shade.hex }}>
                        <div className="absolute bottom-3 right-4 h-16 w-12 rounded-t-full bg-white/70 shadow" />
                        <div className="absolute bottom-3 right-12 h-20 w-14 rounded-t-full bg-black/15" />
                      </div>
                      <div className="p-4">
                        <p className="font-black">{shade.name}</p>
                        <p className="mt-1 text-xs font-bold text-[#777]">{shade.hex}</p>
                        <p className="mt-2 text-sm text-[#666]">{shade.note}</p>
                        <button onClick={() => tryColor(shade)} className="mt-4 rounded-full bg-black px-4 py-2 text-xs font-black text-white">
                          Try this on photo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-black">AI generated fashion inspiration</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(report.moodboard || []).map((image, index) => (
                      <img key={`${report.id}-${index}`} src={image} alt={`Glowra fashion inspiration ${index + 1}`} className="aspect-[3/4] w-full rounded-[28px] object-cover shadow-xl" />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-2xl font-black">Before / After glow-up</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <img src={report.photo} alt="Before selfie" className="aspect-[3/4] w-full rounded-[28px] object-cover shadow-xl" />
                    <img src={report.generated} alt="After palette try-on" className="aspect-[3/4] w-full rounded-[28px] object-cover shadow-xl" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Info title="Facial features" items={report.details.slice(0, 5)} />
                  <Info title="Style suggestions" items={report.tips} />
                  <Info title="Personal tips" items={report.tips} />
                  <Info title="Full analysis details" items={report.details} />
                  <Info title="Skin care according to you" items={report.skinCare} />
                  <Info title="Hair care according to you" items={report.hairCare} />
                  <Info title="Photo quality and pose" items={report.photoFeedback} />
                  <Info title="Professional profile photo" items={report.profileFeedback} />
                  <Info title="AI glow-up suggestions" items={report.glowUp} />
                  <Info title="Cute Glowra compliments" items={report.compliments} />
                </div>
              </div>
            )}
          </section>
        </main>

        <section className="rounded-[34px] border border-white/70 bg-white/45 p-6 shadow-2xl shadow-sky-100 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6" />
            <h2 className="text-2xl font-black">Saved user pictures and analysis</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {history.length === 0 && <p className="text-sm font-bold text-[#666]">No saved reports yet.</p>}
            {history.map((item) => (
              <div key={item.id} className="rounded-[28px] bg-white/65 p-4 shadow-xl">
                <div className="grid grid-cols-2 gap-2">
                  <img src={item.photo} alt="Saved user" className="aspect-[3/4] w-full rounded-[18px] object-cover" />
                  <img src={item.generated} alt={item.title} className="aspect-[3/4] w-full rounded-[18px] object-cover" />
                </div>
                <p className="mt-3 font-black">{item.title}</p>
                <p className="text-sm font-bold text-[#777]">{item.score}% match</p>
                <button onClick={() => downloadText(item)} className="mt-3 rounded-full bg-black px-4 py-2 text-xs font-black text-white">Download report</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[28px] bg-white/65 p-5">
      <h4 className="font-black">{title}</h4>
      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <p key={item} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#666]">{item}</p>
        ))}
      </div>
    </div>
  );
}

function ScoreCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-[28px] bg-white/70 p-5 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">{title}</p>
      <h4 className="mt-3 text-2xl font-black">{value}</h4>
      <p className="mt-2 text-sm font-bold text-[#777]">{helper}</p>
    </div>
  );
}

function GlowChat({ latest }: { latest: Report | null }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi beautiful 💖 Ask me about skin type, hair type, outfit colors, makeup, pose, what to do, or what to avoid.' },
  ]);
  const [draft, setDraft] = useState('');

  function reply(question: string) {
    const q = question.toLowerCase();
    if (!latest) return 'Run one Glowra analysis first, then I can answer from your saved photo report and try-on result ✨';
    const skinCare = latest.skinCare || ['Use a gentle cleanser.', 'Apply sunscreen every morning.', 'Avoid harsh scrubs.'];
    const hairCare = latest.hairCare || ['Use heat protectant.', 'Condition the ends.', 'Avoid heavy scalp oil.'];
    const photoFeedback = latest.photoFeedback || ['Use bright front lighting.', 'Keep camera at eye level.'];
    const profileFeedback = latest.profileFeedback || ['Use a plain background.', 'Relax shoulders.'];
    const compliments = latest.compliments || ['You have a lovely soft glow ✨'];
    if (q.includes('skin')) return `Your skin-care direction: ${skinCare.join(' ')} Do sunscreen daily. Avoid harsh scrubs and sleeping in makeup.`;
    if (q.includes('hair')) return `Your hair-care direction: ${hairCare.join(' ')} Avoid high heat without protection and heavy scalp oil.`;
    if (q.includes('color') || q.includes('outfit') || q.includes('wear')) return `Try these outfit shades: ${latest.palette.map((item) => item.name).join(', ')}. Tap "Try this on photo" to generate each color on the user's picture.`;
    if (q.includes('makeup')) return 'Keep the base thin, blush lifted upward, shimmer near the inner eye, and lip softly glossy. Run Makeup mode for shade-specific try-on.';
    if (q.includes('photo') || q.includes('pose') || q.includes('profile')) return `Photo/profile tips: ${photoFeedback.concat(profileFeedback).join(' ')}`;
    if (q.includes('avoid') || q.includes('not')) return 'Avoid heavy filters, dim overhead lighting, harsh contour, too many colors near the face, and heat styling without protectant.';
    return `${compliments[0]} My best quick tip: use one strong face-framing color, clean lighting, groomed hair, and a relaxed three-quarter pose.`;
  }

  function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: 'user', text }, { role: 'ai', text: reply(text) }]);
    setDraft('');
  }

  return (
    <section className="rounded-[34px] border border-white/70 bg-white/45 p-6 shadow-2xl shadow-pink-100 backdrop-blur-2xl">
      <h2 className="text-2xl font-black">Glowra chatbot</h2>
      <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto rounded-[26px] bg-white/50 p-4">
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={`max-w-[86%] rounded-[22px] px-4 py-3 text-sm font-bold leading-6 ${message.role === 'ai' ? 'justify-self-start bg-white text-[#555]' : 'justify-self-end bg-black text-white'}`}>
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask what suits me, what to avoid, skin care, hair care..."
          className="min-w-0 flex-1 rounded-full border border-white/70 bg-white/70 px-5 py-4 text-sm font-bold outline-none"
        />
        <button className="grid h-14 w-14 place-items-center rounded-full bg-black text-white" aria-label="Send message">
          <Send className="h-5 w-5" />
        </button>
      </form>
    </section>
  );
}
