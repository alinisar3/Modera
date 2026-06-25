import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, ShieldCheck, User, MessageSquare, 
  ExternalLink, CheckCircle2, XCircle, AlertCircle, Send,
  Zap, Clock, Hash
} from 'lucide-react';

export default function AppealQueue() {
  const [queue, setQueue] = useState([]);
  const [notif, setNotif] = useState(null);
  const [adminResponses, setAdminResponses] = useState({});

  const fetchQueue = async () => {
    try {
      const res = await api.get('/appeals/queue');
      setQueue(res.data);
    } catch (err) {
      triggerNotify("Engine Sync Interrupted", "error");
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const triggerNotify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 5000);
  };

  const resolve = async (id, status) => {
    const feedback = adminResponses[id] || "Resolution applied by Admin node.";
    try {
      await api.put(`/appeals/${id}`, { status, adminResponse: feedback });
      triggerNotify(`Record Purged & Verdict: ${status}`, "success");
      setQueue(queue.filter(a => a._id !== id));
    } catch (err) {
      triggerNotify("System Override Error", "error");
    }
  };

  const handleInputChange = (id, value) => {
    setAdminResponses({ ...adminResponses, [id]: value });
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans overflow-x-hidden">
      
      {/* --- CUSTOM DESIGNED NOTIFICATION TOAST --- */}
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 30, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed top-0 left-1/2 z-[200] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-xl min-w-[320px] md:min-w-[340px] ${
              notif.type === 'error' ? 'bg-white/90 border-rose-100' : 'bg-white/90 border-emerald-100'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${notif.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {notif.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Alert</p>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{notif.msg}</p>
            </div>
            <button onClick={() => setNotif(null)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X size={16} className="text-slate-300" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        {/* Added pt-24 for mobile spacing to avoid appbar conflict */}
        <div className="p-6 md:p-12 pt-24 lg:pt-12 flex-grow max-w-6xl mx-auto w-full">
          
          {/* HEADER SECTION (Mobile Optimized: flex-row ensures status is in front) */}
          <div className="mb-14 flex flex-row items-center justify-between gap-4">
            <div>
              <div className="hidden md:flex items-center gap-2 mb-3">
                 <Zap size={14} className="text-brand-primary animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Integrity Node</span>
              </div>
             <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
              Appeals <span className="text-brand-primary">Oversight</span>
             </h1>
            </div>
            
            {/* Queue Status Box: Scaled down for mobile balance */}
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-3xl border border-slate-100 shadow-xl flex items-center gap-3 md:gap-5">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Clock size={16} className="md:w-5 md:h-5" />
               </div>
               <div>
                  <p className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Queue Status</p>
                  <p className="text-lg md:text-xl font-black text-slate-800 tracking-tighter leading-none">{queue.length} <span className="text-[10px] text-slate-400">Tasks</span></p>
               </div>
            </div>
          </div>

          {/* DYNAMIC LIST */}
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence mode="popLayout">
              {queue.map((appeal, idx) => (
                <motion.div 
                  key={appeal._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row items-center gap-10 hover:shadow-3xl transition-all relative group"
                >
                  {/* Visual Evidence Area */}
                  <div className="w-full lg:w-48 h-40 relative rounded-[2.2rem] overflow-hidden shadow-2xl border-4 border-white group/img flex-shrink-0">
                     <img src={appeal.submissionId?.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" alt="Audit Asset" />
                     <a href={appeal.submissionId?.imageUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white">
                        <ExternalLink size={20} />
                     </a>
                  </div>

                  {/* Context Workspace */}
                  <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-brand-primary shadow-inner">
                            <User size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none">{appeal.userId?.username}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Hash size={10} className="text-slate-300" />
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{appeal._id.slice(-6)}</span>
                            </div>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                         {new Date(appeal.createdAt).toLocaleDateString()}
                       </span>
                    </div>

                    <div className="bg-[#F8FAFC] p-6 rounded-[1.8rem] border border-slate-100 shadow-inner">
                       <p className="text-xs font-bold text-slate-500 italic leading-relaxed">
                         "{appeal.justification}"
                       </p>
                    </div>

                    <div className="relative group/input">
                      <input 
                        type="text" 
                        placeholder="Attach administrative feedback..."
                        value={adminResponses[appeal._id] || ''}
                        onChange={(e) => handleInputChange(appeal._id, e.target.value)}
                        className="w-full bg-white border-2 border-slate-50 p-4 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-8 focus:ring-brand-primary/5 transition-all pr-12 shadow-sm"
                      />
                      <Send size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/input:text-brand-primary transition-colors" />
                    </div>
                  </div>

                  {/* --- ACTION GATE (Redesigned with blurred classy hover effects) --- */}
                  <div className="flex lg:flex-col gap-8 flex-shrink-0 w-full lg:w-auto border-l border-slate-50 pl-0 lg:pl-10 justify-center">
                     <button 
                        onClick={() => resolve(appeal._id, 'Accepted')}
                        className="relative flex flex-col items-center justify-center gap-1 group/btn active:scale-90 transition-all"
                     >
                        {/* The Blur Effect */}
                        <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-0 group-hover/btn:opacity-40 transition-opacity duration-500 rounded-full" />
                        <div className="relative w-12 h-12 flex items-center justify-center text-emerald-500 group-hover/btn:text-emerald-600 transition-colors">
                            <Check size={28} strokeWidth={3} />
                        </div>
                        <span className="relative text-[9px] font-black uppercase text-slate-400 group-hover/btn:text-emerald-600 tracking-widest transition-colors">Accept</span>
                     </button>

                     <button 
                        onClick={() => resolve(appeal._id, 'Rejected')}
                        className="relative flex flex-col items-center justify-center gap-1 group/btn active:scale-90 transition-all"
                     >
                        {/* The Blur Effect */}
                        <div className="absolute inset-0 bg-rose-400 blur-2xl opacity-0 group-hover/btn:opacity-40 transition-opacity duration-500 rounded-full" />
                        <div className="relative w-12 h-12 flex items-center justify-center text-rose-500 group-hover/btn:text-rose-600 transition-colors">
                            <X size={28} strokeWidth={3} />
                        </div>
                        <span className="relative text-[9px] font-black uppercase text-slate-400 group-hover/btn:text-rose-600 tracking-widest transition-colors">Reject</span>
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {queue.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-48 flex flex-col items-center justify-center text-center">
                 <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-2xl mb-10 relative">
                    <ShieldCheck size={56} className="text-emerald-400" />
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-10" />
                 </div>
                 <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Registry Synchronized</h3>
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.4em] mt-4 opacity-70">Manual override buffer is clear.</p>
              </motion.div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}