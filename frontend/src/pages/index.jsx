import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Footer from '../components/Footer';
import { 
  Upload, ShieldCheck, AlertTriangle, XCircle, Sparkles, X, 
  Activity, ShieldAlert, Zap, BarChart3, Fingerprint, Layers, Cpu, Search, ClipboardCheck
} from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, blocked: 0, flagged: 0 });

  const fetchLiveStats = async () => {
    try {
      const res = await api.get('/analytics');
      setStats(res.data);
    } catch (err) {
      console.error("Stats Sync Error:", err);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchLiveStats();
    }
  }, [user, loading, router]);

  const approvedCount = stats.total - (stats.blocked + stats.flagged);
  const liveSafetyIndex = stats.total > 0 ? Math.round((approvedCount / stats.total) * 100) : 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    setResult(null);
    setError(null);
    try {
      const res = await api.post('/submit', { imageUrl });
      setResult(res.data);
      fetchLiveStats(); 
    } catch (err) {
      setError(err.response?.data?.msg || "AI Engine Timeout.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen w-full overflow-x-hidden font-sans antialiased">
      
      {/* PROFESSIONAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 24, opacity: 1 }} exit={{ y: -100, opacity: 0 }} 
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-white border border-rose-100 shadow-2xl p-4 rounded-2xl flex items-center gap-4 max-w-md w-[90%]"
          >
            <div className="bg-rose-50 p-2 rounded-xl text-rose-500"><ShieldAlert size={18} /></div>
            <p className="text-[10px] font-black text-slate-600 flex-1 uppercase tracking-widest">{error}</p>
            <button onClick={() => setError(null)}><X size={16} className="text-slate-300" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 lg:p-12 flex-grow max-w-7xl mx-auto w-full">
          
          {/* HEADER SECTION - BALANCED & SLEEK */}
          <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Node: 0x82A1 • Operational</span>
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
                Control <span className="text-brand-primary">Center</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Operator</p>
                    <p className="text-sm font-black text-slate-700">{user.username}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-lg flex items-center justify-center text-brand-primary">
                    <Cpu size={24} />
                </div>
            </div>
          </header>

          {/* KPI GRID - STABLE SIZES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard title="Safety Index" value={`${liveSafetyIndex}%`} icon={<ShieldCheck size={24}/>} colorClass="bg-emerald-50 text-emerald-600" />
            <StatCard title="Flagged Assets" value={stats.flagged} icon={<AlertTriangle size={24}/>} colorClass="bg-amber-50 text-amber-600" />
            <StatCard title="Blocked Assets" value={stats.blocked} icon={<XCircle size={24}/>} colorClass="bg-rose-50 text-rose-600" />
          </div>

          {/* MAIN ACTION SECTION - FULL ROW INPUT */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 mb-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary pointer-events-none">
                <Zap size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2 bg-indigo-50 text-brand-primary rounded-lg border border-indigo-100"><Search size={18} /></div>
                   <h2 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Initial Asset Audit</h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="flex-1 w-full relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors">
                            <Fingerprint size={20} />
                        </div>
                        <input 
                            type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Enter image URL for deconstruction..."
                            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary focus:bg-white outline-none transition-all font-bold text-slate-700 shadow-inner"
                            required
                        />
                    </div>
                    <button 
                        disabled={loadingAI}
                        className="w-full lg:w-64 bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-brand-primary/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                    >
                        {loadingAI ? <Activity className="animate-spin" size={16} /> : <Zap size={16} />}
                        {loadingAI ? "Auditing..." : "Execute Scan"}
                    </button>
                </form>
            </div>
          </motion.section>

          {/* AUDIT RESULTS - CENTERED & BALANCED */}
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div 
                key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-12"
              >
                <div className="p-8 lg:p-12 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-3">
                            <img src={result.imageUrl} className="w-full h-full object-cover" alt="Audit" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Global Verdict</p>
                            <h3 className={`text-5xl font-black italic uppercase tracking-tighter ${result.outcome === 'Approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {result.outcome}
                            </h3>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[140px]">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Registry ID</p>
                        <p className="text-sm font-black text-slate-700 tracking-widest">#{result._id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>

                <div className="p-8 lg:p-12">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                        <ClipboardCheck size={14} /> Category Confidence Matrix
                    </p>
                    
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.results.map((res, i) => (
                      <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-center mb-4">
                          {/* Category Header: Balanced to 11px */}
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] leading-none">
                            {res.category}
                          </span>
                          {/* Percentage: Balanced to 12px (text-xs) */}
                          <span className={`text-xs font-black ${res.confidence > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {res.confidence}%
                          </span>
                        </div>
                        
                        {/* Thicker Progress Bar for better visibility */}
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-5">
                          <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${res.confidence}%` }} 
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${res.confidence > 50 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                          />
                        </div>
                        
                        {/* Note Text: Balanced to 12px (text-xs) for readability */}
                        <p className="text-xs text-slate-400 font-bold italic leading-relaxed opacity-75 group-hover:opacity-100 transition-opacity"> 
                          Note: {res.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                </div>
              </motion.div>
            ) : (
                <div className="h-64 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center opacity-40">
                    <Layers size={48} className="text-slate-300 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">System Standby • Awaiting Data Link</p>
                </div>
            )}
          </AnimatePresence>

        </div>
        <Footer />
      </main>
    </div>
  );
}