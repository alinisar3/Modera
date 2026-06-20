import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Footer from '../components/Footer';
import { 
  Upload, ShieldCheck, AlertTriangle, XCircle, Sparkles, X, 
  Activity, ShieldAlert, Zap, BarChart3, Fingerprint, Layers, Cpu
} from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modera Dashboard - Gemini/Mistral AI Powered
 * Instruction 4.1 & 4.2 & 4.5 Integration
 * Provides real-time asset analysis and live database intelligence.
 */
export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Logic States
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState(null);

  // Requirement 4.5: Live Analytics Data State
  const [stats, setStats] = useState({ total: 0, blocked: 0, flagged: 0 });

  /**
   * fetchLiveStats (Instruction 4.5)
   * Synchronizes UI with the MongoDB global audit metrics.
   */
  const fetchLiveStats = async () => {
    try {
      const res = await api.get('/analytics');
      // res.data contains total, blocked, and flagged counts from DB
      setStats(res.data);
    } catch (err) {
      console.error("Audit Node Stats Sync Error:", err);
    }
  };

  // On Mount: Guard Route and Initial Data Sync
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchLiveStats();
    }
  }, [user, loading, router]);

  /**
   * Safety Index Calculation
   * Real-time calculation of clean assets vs total volume.
   */
  const approvedCount = stats.total - (stats.blocked + stats.flagged);
  const liveSafetyIndex = stats.total > 0 ? Math.round((approvedCount / stats.total) * 100) : 100;

  // Requirement 4.1: Submission Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.post('/submit', { imageUrl });
      setResult(res.data);
      
      // Post-Submit Sync: Ensure header KPIs update immediately
      fetchLiveStats(); 
    } catch (err) {
      setError(err.response?.data?.msg || "AI Processing Node Timeout.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen w-full overflow-x-hidden font-sans antialiased selection:bg-brand-primary/10">
      
      {/* --- PROFESSIONAL TAILWIND NOTIFICATION --- */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} 
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-white border border-rose-100 shadow-2xl p-5 rounded-[2rem] flex items-center gap-4 max-w-md w-[90%]"
          >
            <div className="bg-rose-50 p-2 rounded-2xl text-rose-500 shadow-inner"><ShieldAlert size={20} /></div>
            <p className="text-xs font-black text-slate-600 flex-1 uppercase tracking-widest">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-slate-50 rounded-full transition-colors"><X size={18} className="text-slate-300" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 md:p-12 flex-grow">
          
          {/* INDUSTRIAL CONSOLE HEADER */}
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Audit Node Active</span>
              </div>
              <h1 className="text-6xl font-black text-slate-800 tracking-tighter italic uppercase leading-none">
                Modera <span className="text-brand-primary">Console</span>
              </h1>
              <div className="flex items-center gap-4 mt-3">
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">Auth: <span className="text-slate-900 font-black">{user.username}</span></p>
                 <div className="h-4 w-px bg-slate-300" />
                 <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-none">Role: <span className="text-brand-primary">{user.role}</span></p>
              </div>
            </motion.div>

            <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-2xl flex items-center gap-5">
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Intelligence Layer</p>
                  <p className="text-sm font-black text-brand-primary uppercase tracking-widest italic">Pixtral 12B Vision</p>
               </div>
               <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner border border-indigo-100/50">
                  <Cpu size={24} className="animate-pulse" />
               </div>
            </div>
          </header>

          {/* KPI GRID (Instruction 4.5 - Point 2 Implementation) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard 
                title="Integrity Score" 
                value={`${liveSafetyIndex}%`} 
                icon={<ShieldCheck size={32}/>} 
                colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" 
                delay={0.1} 
            />
            <StatCard 
                title="Awaiting Review" 
                value={stats.flagged} 
                icon={<AlertTriangle size={32}/>} 
                colorClass="bg-amber-50 text-amber-600 border border-amber-100" 
                delay={0.2} 
            />
            <StatCard 
                title="Total Interceptions" 
                value={stats.blocked} 
                icon={<XCircle size={32}/>} 
                colorClass="bg-rose-50 text-rose-600 border border-rose-100" 
                delay={0.3} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            
            {/* 4.1 SUBMISSION WORKSPACE */}
            <section className="lg:col-span-2 bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
              {/* Glass background decorative glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-indigo-100 transition-colors" />
              
              <div className="relative z-10 text-left">
                <div className="flex items-center gap-4 mb-12">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary border border-slate-100 shadow-inner">
                      <Fingerprint size={24} />
                   </div>
                   <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">Initial Audit</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Hardware Image Stream</label>
                    <input 
                        type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-6 rounded-[1.5rem] border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-brand-primary focus:ring-[12px] focus:ring-brand-primary/5 outline-none transition-all font-bold text-slate-800 shadow-inner"
                        required
                    />
                  </div>
                  <button 
                    disabled={loadingAI} 
                    className="w-full bg-brand-primary text-white py-7 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-brand-primary/30 transition-all hover:bg-brand-accent hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {loadingAI ? (
                        <>
                           <Activity className="animate-spin" size={18} />
                           <span>Deconstructing Assets...</span>
                        </>
                    ) : (
                        <>
                           <BarChart3 size={18} />
                           <span>Run Analysis</span>
                        </>
                    )}
                  </button>
                </form>
              </div>
            </section>

            {/* 4.2 LIVE AUDIT REPORT ENGINE (Confidence Scores) */}
            <div className="lg:col-span-3 min-h-[500px]">
              <AnimatePresence mode="wait">
                {result ? (
                  <motion.div 
                    key="report" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white p-10 md:p-12 rounded-[4rem] border border-slate-100 shadow-2xl h-full flex flex-col text-left"
                  >
                    <div className="flex justify-between items-start mb-12">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Global Audit Resolution</p>
                          <h3 className={`text-6xl font-black uppercase italic tracking-tighter mt-2 ${result.outcome === 'Approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                             {result.outcome}
                          </h3>
                       </div>
                       <div className="px-5 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-inner">
                          NODE-ID: {result._id.slice(-6)}
                       </div>
                    </div>

                    {/* Requirement 4.2: Structured Per-Category Breakdown */}
                    <div className="space-y-8 flex-1">
                       <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                          <BarChart3 size={14} /> Intelligence Profile
                       </p>
                       {result.results.map((res, i) => (
                         <motion.div 
                            key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
                            className="space-y-3 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:border-brand-primary/10"
                         >
                            <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                               <span className="text-slate-600">{res.category}</span>
                               <span className={res.confidence > 50 ? 'text-rose-500' : 'text-emerald-500'}>{res.confidence}% Certainty</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
                               <motion.div 
                                  initial={{ width: 0 }} animate={{ width: `${res.confidence}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                                  className={`h-full rounded-full ${res.confidence > 50 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]'}`}
                               />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold italic leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                               Detection Note: {res.reasoning}
                            </p>
                         </motion.div>
                       ))}
                    </div>
                  </motion.div>
                ) : (
                  /* EMPTY STATE VISUAL (Cool Dashboard Placeholder) */
                  <div className="h-full min-h-[550px] border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center text-center p-16 bg-white/40 backdrop-blur-sm">
                     <div className="w-28 h-28 bg-white/80 rounded-full flex items-center justify-center text-slate-100 shadow-inner mb-8 border border-white">
                        <Layers size={56} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-300 uppercase italic tracking-tighter">Node Ready</h3>
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-3 max-w-[320px] leading-relaxed">
                        Transmit an image data stream into the governance node to generate a live safety report.
                     </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}