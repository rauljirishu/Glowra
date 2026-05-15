import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Camera, 
  Palette, 
  Scissors, 
  Heart, 
  Layout, 
  TrendingUp, 
  User, 
  Menu,
  ChevronRight,
  Zap,
  Star
} from 'lucide-react';

// --- Types ---
interface GlowScore {
  score: number;
  label: string;
  description: string;
}

interface AIRecommendation {
  title: string;
  description: string;
  tag: string;
  accent: string;
}

// --- Components ---

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`backdrop-blur-xl bg-white/40 border border-white/60 rounded-[40px] shadow-xl shadow-pink-100/20 ${className}`}>
    {children}
  </div>
);

const NavLink = ({ children, active = false }: { children: React.ReactNode, active?: boolean }) => (
  <a 
    href="#" 
    className={`hover:text-[#FF8E8E] transition-colors text-sm font-medium ${active ? 'text-[#FF8E8E]' : 'text-[#4A4A4A]'}`}
  >
    {children}
  </a>
);

export default function App() {
  const [glowScore, setGlowScore] = useState<GlowScore>({
    score: 89,
    label: "Radiant Spring",
    description: "Your skin undertone is warm peach. Opt for coral blushes and golden-brown eye shadows to enhance your natural aura."
  });

  const [activeTab, setActiveTab] = useState('analysis');
  const [loading, setLoading] = useState(false);

  const fetchAIInsight = async (task: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/glowra/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
      });
      const result = await response.json();
      if (result.season) {
        setGlowScore({
          score: Math.floor(Math.random() * 15) + 85,
          label: `${result.season} ${result.subType}`,
          description: result.description
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF2F2] via-[#F3F0FF] to-[#FFF9F2] text-[#4A4A4A] font-sans relative overflow-hidden flex flex-col p-8">
      {/* Background Decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-[#FFD1D1] to-[#D1D1FF] blur-[120px] rounded-full opacity-40 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-[#FFF0DB] to-[#E0C3FC] blur-[100px] rounded-full opacity-50" />
      
      {/* Header */}
      <header className="flex justify-between items-center z-10 mb-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9999] via-[#C3BEF0] to-[#7BC9FF] flex items-center justify-center shadow-lg border border-white/50">
            <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center relative">
              <div className="w-2 h-2 bg-white rounded-full" />
              <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#FF8E8E] to-[#8E8EFF]" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
            GLOWRA
          </span>
        </div>

        <nav className="hidden md:flex backdrop-blur-md bg-white/40 border border-white/60 rounded-full px-8 py-3 gap-8 shadow-sm">
          <NavLink active={activeTab === 'analysis'}>Analysis</NavLink>
          <NavLink>Stylist</NavLink>
          <NavLink>Community</NavLink>
          <NavLink>Studio</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/40 rounded-full transition-colors md:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md cursor-pointer hover:scale-105 transition-transform">
             <div className="w-full h-full bg-[#FFE3E3] flex items-center justify-center text-lg">✨</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-6 z-10 flex-grow max-w-7xl mx-auto w-full">
        
        {/* Left Column: Analysis & Palette */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          <GlassCard className="p-8 flex-grow flex flex-col justify-center items-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative mb-6"
            >
              <div className="w-48 h-48 rounded-full border-4 border-dashed border-[#FFC7C7] flex items-center justify-center animate-spin-slow" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-[#FF8E8E]">{glowScore.score}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Glow Score</span>
              </div>
            </motion.div>
            <h2 className="text-2xl font-light italic mb-2 font-serif">{glowScore.label}</h2>
            <p className="text-sm opacity-70 leading-relaxed max-w-[280px]">
              {glowScore.description}
            </p>
            <button 
              onClick={() => fetchAIInsight('color-analysis')}
              disabled={loading}
              className={`mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#FF8E8E] hover:gap-3 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Analyzing...' : 'Refresh AI Analysis'} <ChevronRight className="w-4 h-4" />
            </button>
          </GlassCard>
          
          <GlassCard className="p-6 rounded-[32px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase tracking-widest font-bold opacity-50">Palette Match</h3>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full bg-[#FFD1D1]" />
                <div className="w-3 h-3 rounded-full bg-[#FFEBC1]" />
                <div className="w-3 h-3 rounded-full bg-[#D1D1FF]" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              <div className="h-14 rounded-xl bg-[#F8AD9D] shadow-sm hover:scale-105 transition-transform" />
              <div className="h-14 rounded-xl bg-[#FFDAB9] shadow-sm hover:scale-105 transition-transform" />
              <div className="h-14 rounded-xl bg-[#FBCEB1] shadow-sm hover:scale-105 transition-transform" />
              <div className="h-14 rounded-xl bg-[#FEC5BB] shadow-sm hover:scale-105 transition-transform" />
              <div className="h-14 rounded-xl bg-gradient-to-br from-[#8E8EFF] to-[#FF8E8E] shadow-sm hover:scale-105 transition-transform" />
            </div>
          </GlassCard>
        </div>

        {/* Center Column: AI Recommendations */}
        <div className="col-span-1 md:col-span-5 grid grid-rows-[1.5fr_1fr] gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass rounded-[40px] overflow-hidden relative shadow-2xl group cursor-pointer"
          >
            <div className="absolute top-6 left-6 z-20">
              <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-sm flex items-center gap-2 w-fit">
                <Sparkles className="w-3 h-3 text-[#FF8E8E]" /> AI Stylist Recommendation
              </span>
              <h2 className="text-4xl font-bold mt-4 tracking-tight leading-none group-hover:text-[#FF8E8E] transition-colors">
                Lavender Haze <br />Butterfly Cut
              </h2>
            </div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-[#E2E2FB]/80 via-transparent to-transparent opacity-60" />
            <div className="absolute right-8 bottom-8 z-20">
              <button className="bg-black text-white px-8 py-4 rounded-full text-sm font-medium hover:scale-105 active:scale-95 transition-transform shadow-xl flex items-center gap-2">
                <Camera className="w-4 h-4" /> Try On AR
              </button>
            </div>
            <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="w-56 h-72 bg-white/20 rounded-[30px] border border-white/40 shadow-inner flex items-center justify-center text-7xl animate-pulse">
                🧚‍♀️
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="glass rounded-[32px] p-6 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-2 opacity-40 mb-4 uppercase tracking-widest text-[10px] font-bold">
                <Heart className="w-3 h-3" /> Makeup Bot
              </div>
              <p className="text-xl leading-snug mb-4">
                Soft matte skin with <span className="text-[#FF8E8E] italic font-serif">glossy lips</span>.
              </p>
              <div className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#FFC7C7] via-[#FFD1D1] to-[#FFE3E3] shadow-inner" />
            </div>
            <div className="glass rounded-[32px] p-6 hover:bg-white/50 transition-colors">
              <div className="flex items-center gap-2 opacity-40 mb-4 uppercase tracking-widest text-[10px] font-bold">
                <TrendingUp className="w-3 h-3" /> Outfit Score
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold">A+</span>
                <span className="text-[10px] mb-2 opacity-60 uppercase font-bold">High Contrast</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-[#C3BEF0] rounded-full" />
                </div>
                <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} className="h-full bg-[#FFB6B6] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Moodboards & Social */}
        <div className="col-span-1 md:col-span-3 flex flex-col gap-6">
          <GlassCard className="p-6 flex-grow rounded-[32px]">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2">
              <Star className="w-4 h-4" /> Viral Moodboards
            </h3>
            <div className="grid grid-cols-2 gap-3 h-[420px]">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="rounded-2xl bg-[#E2E2FB] shadow-inner overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent)]" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                   <div className="w-full h-full border border-white/30 rounded-xl flex items-center justify-center text-4xl">🐚</div>
                </div>
              </motion.div>
              <div className="rounded-2xl bg-[#FFE3E3] shadow-inner overflow-hidden flex flex-col gap-2 p-2">
                <div className="h-1/2 bg-white/40 rounded-lg animate-pulse" />
                <div className="h-1/2 bg-white/40 rounded-lg animate-pulse" />
              </div>
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="col-span-2 rounded-2xl bg-gradient-to-br from-[#FFEBC1] to-[#FFD1D1] shadow-inner relative flex items-center justify-center text-5xl"
              >
                 💄
                 <div className="absolute bottom-3 left-4 text-[10px] font-bold opacity-60 italic drop-shadow-sm">#GlowraGirl</div>
              </motion.div>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 flex flex-col md:flex-row justify-between items-center z-10 px-4 max-w-7xl mx-auto w-full gap-6">
        <div className="flex gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">AI Engine</span>
            <span className="text-xs font-medium">GLOW-V2.5.0 <Sparkles className="w-3 h-3 inline ml-1 text-[#FF8E8E]" /></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Trend Pulse</span>
            <span className="text-xs font-medium text-[#FF8E8E]">+12.4% Peach Fuzz</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 bg-white/60 hover:bg-white/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border border-white/60">
            Tutorial
          </button>
          <button className="px-6 py-2.5 bg-black text-white hover:bg-gray-900 rounded-full text-[10px] font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-lg">
            Member Perks
          </button>
        </div>
      </footer>

      {/* Immersive Overlay */}
      <div className="fixed bottom-[-50px] right-[-50px] pointer-events-none">
        <div className="w-[300px] h-[300px] bg-white opacity-5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
