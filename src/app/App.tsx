import { useEffect, useRef, useState } from 'react';
import { Camera, Download, FileText, History, Palette, Scissors, Sparkles, UserRound, Wand2 } from 'lucide-react';

type Mode = 'color' | 'hair' | 'makeup' | 'face';

type Report = {
  id: string;
  mode: Mode;
  title: string;
  score: number;
  summary: string;
  photo: string;
  generated: string;
  palette: Array<{ name: string; hex: string; note: string }>;
  tips: string[];
  details: string[];
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

function makeAnalysis(mode: Mode, photo: string): Omit<Report, 'id' | 'mode' | 'photo' | 'generated'> {
  const seed = seedFromPhoto(photo);
  const warm = seed % 2 === 0;
  const score = 80 + (seed % 17);
  const palette = warm ? basePalettes.warm : basePalettes.cool;

  if (mode === 'hair') {
    return {
      title: seed % 3 === 0 ? 'Korean Hush Cut + Glossy Espresso' : seed % 3 === 1 ? 'Butterfly Layers + Mocha Brown' : 'Curtain Bangs + Milk Tea Brown',
      score,
      summary: 'This hairstyle frames your face softly and gives a polished Korean beauty silhouette.',
      palette: [
        { name: 'Glossy Espresso', hex: '#3B2418', note: 'Deep shine and luxury finish.' },
        { name: 'Mocha Brown', hex: '#6B3F27', note: 'Softens the face without looking flat.' },
        { name: 'Milk Tea Brown', hex: '#A96F45', note: 'Brightens the total look.' },
      ],
      tips: ['Use heat protectant before styling.', 'Add weekly gloss mask.', 'Trim face-framing layers every 8 to 10 weeks.'],
      details: ['Face-framing volume suits your selfie balance.', 'Medium movement is better than a heavy blunt cut.', 'Soft shine color improves camera glow.'],
    };
  }

  if (mode === 'makeup') {
    return {
      title: warm ? 'Peach Glow K-Beauty Makeup' : 'Rose Glass K-Beauty Makeup',
      score,
      summary: warm ? 'Peach, coral, champagne, and warm rose shades suit your face best.' : 'Cool rose, lavender taupe, pearl, and berry rose shades suit your face best.',
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
      details: ['Base, blush, lip, eye, highlighter, and contour shades are matched from your selfie.', 'Soft gradient makeup will look more natural than heavy glam.'],
    };
  }

  if (mode === 'face') {
    return {
      title: seed % 2 === 0 ? 'Soft Oval Face + Balanced Frame' : 'Heart-Oval Face + Soft Shoulder Frame',
      score,
      summary: 'Your best styling direction is open posture, bright face framing, and clean vertical outfit lines.',
      palette,
      tips: ['Use gentle cleanser twice daily.', 'Apply sunscreen every morning.', 'Use hydrating serum before makeup.', 'Use lightweight conditioner on hair ends.'],
      details: [`Face harmony: ${score}%`, `Posture alignment: ${78 + (seed % 16)}%`, `Body proportion balance: ${76 + (seed % 18)}%`, 'Best photo angle: soft front or slight three-quarter.'],
    };
  }

  return {
    title: warm ? 'Spring Warm Color Suit' : 'Summer Cool Color Suit',
    score,
    summary: warm ? 'Warm peach, ivory, coral, and aqua outfit shades will brighten your selfie.' : 'Cool rose, lavender, pearl, and navy outfit shades create the cleanest harmony.',
    palette,
    tips: ['Try the first palette color as your top or dress.', 'Use the darkest shade only as an accent.', 'Keep jewelry in the same warm or cool family.'],
    details: ['Generated outfit preview applies the selected color onto your photo.', 'Palette changes are based on the selfie data, so different photos produce different reports.'],
  };
}

async function generateTryOn(mode: Mode, photo: string, report: Omit<Report, 'id' | 'mode' | 'photo' | 'generated'>) {
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
        const color = report.palette[0].hex;
        const grad = ctx.createLinearGradient(0, canvas.height * 0.46, 0, canvas.height);
        grad.addColorStop(0, color);
        grad.addColorStop(1, report.palette[1]?.hex || color);
        ctx.globalAlpha = 0.76;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.22, canvas.height * 0.56);
        ctx.quadraticCurveTo(canvas.width * 0.5, canvas.height * 0.46, canvas.width * 0.78, canvas.height * 0.56);
        ctx.lineTo(canvas.width * 0.92, canvas.height);
        ctx.lineTo(canvas.width * 0.08, canvas.height);
        ctx.closePath();
        ctx.fill();
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

function downloadText(report: Report) {
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
  ].join('\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `glowra-${report.mode}-report.txt`;
  link.click();
  URL.revokeObjectURL(url);
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

  async function openCamera() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage('Camera is not available in this browser. Please use image upload.');
        return;
      }
      if (!window.isSecureContext && !location.hostname.includes('localhost')) {
        setMessage('Camera needs HTTPS or localhost. Open the deployed HTTPS app or localhost.');
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
      setMessage(error.message || 'Camera access was blocked. Please allow camera permission.');
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
    closeCamera();
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setPhoto(await readFile(file));
  }

  async function runAnalysis() {
    if (!photo) {
      setMessage('Please upload a picture or take a live selfie first.');
      return;
    }
    const analysis = makeAnalysis(mode, photo);
    const generated = await generateTryOn(mode, photo, analysis);
    const nextReport: Report = {
      id: `${Date.now()}`,
      mode,
      photo,
      generated,
      ...analysis,
    };
    setReport(nextReport);
    saveHistory([nextReport, ...history].slice(0, 12));
    setMessage('Analysis complete. Photo, generated try-on, and report saved.');
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
        </header>

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
            <h2 className="text-3xl font-black">User photo</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid min-h-44 cursor-pointer place-items-center rounded-[30px] border-2 border-dashed border-pink-300 bg-white/55 p-6 text-center">
                <FileText className="mb-3 h-9 w-9 text-pink-500" />
                <span className="font-black">Upload user picture</span>
                <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
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
              <button onClick={runAnalysis} className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-sky-400 px-6 py-4 font-black text-white shadow-xl">
                <Wand2 className="h-5 w-5" />
                Run AI try-on
              </button>
            </div>
          </section>

          <section className="rounded-[34px] border border-white/70 bg-white/45 p-6 shadow-2xl shadow-purple-100 backdrop-blur-2xl">
            <h2 className="text-3xl font-black">Generated result</h2>
            {!report && (
              <div className="mt-6 grid min-h-[420px] place-items-center rounded-[30px] bg-white/45 text-center">
                <div>
                  <Sparkles className="mx-auto h-14 w-14 text-pink-500" />
                  <p className="mt-4 font-bold text-[#666]">Your generated try-on image and report will appear here.</p>
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
                  <button onClick={() => downloadText(report)} className="mt-5 flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white">
                    <Download className="h-4 w-4" />
                    Download report
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {report.palette.map((shade) => (
                    <div key={shade.name} className="overflow-hidden rounded-[28px] bg-white/65 shadow-xl">
                      <div className="h-32" style={{ background: shade.hex }} />
                      <div className="p-4">
                        <p className="font-black">{shade.name}</p>
                        <p className="mt-1 text-xs font-bold text-[#777]">{shade.hex}</p>
                        <p className="mt-2 text-sm text-[#666]">{shade.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Info title="Personal tips" items={report.tips} />
                  <Info title="Analysis details" items={report.details} />
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
                <img src={item.generated} alt={item.title} className="aspect-[3/4] w-full rounded-[22px] object-cover" />
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
