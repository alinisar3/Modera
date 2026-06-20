import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, ShieldCheck, User, MessageSquare, 
  ExternalLink, CheckCircle2, XCircle, AlertCircle, Send,
  Activity, Clock
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
      triggerNotify("Sync Engine Offline", "error");
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const triggerNotify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  const resolve = async (id, status) => {
    const feedback = adminResponses[id] || "Decision finalized by Modera Audit Node.";
    try {
      await api.put(`/appeals/${id}`, { status, adminResponse: feedback });
      triggerNotify(`SYSTEM: Verdict Purged & ${status}`, "success");
      setQueue(queue.filter(a => a._id !== id));
    } catch (err) {
      triggerNotify("Manual Override Interrupted", "error");
    }
  };

  const handleInputChange = (id, value) => {
    setAdminResponses({ ...adminResponses, [id]: value });
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans overflow-x-hidden">
      
      {/* --- REFINED TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {notif && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-full shadow-2xl border backdrop-blur-md flex items-center gap-3 min-w-[300px] ${
              notif.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-600 border-emerald-500 text-white'
            }`}
          >
            {notif.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}
            <span className="text-[10px] font-black uppercase tracking-widest">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col min-h-screen">
        <div className="p-6 md:p-12 flex-grow">
          
          {/* HEADER SECTION (Compact & Bold) */}
          <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-5xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
                Appeals <span className="text-brand-primary">Oversight</span>
              </h1>
              <div className="flex items-center gap-4 mt-3">
                 <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Audit Queue</p>
                 <div className="h-px w-12 bg-slate-200" />
                 <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <Activity size={12} /> Live Sync
                 </span>
              </div>
            </div>
            <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-xl flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Awaiting Audit</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tighter">{queue.length}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-brand-primary shadow-inner">
                  <Clock size={20} />
               </div>
            </div>
          </div>

          {/* DYNAMIC COMPACT LIST */}
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {queue.map((appeal, idx) => (
                <motion.div 
                  key={appeal._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row items-center gap-8 group hover:shadow-2xl transition-all relative overflow-hidden"
                >
                  {/* Status Strip Decor */}
                  <div className="absolute left-0 inset-y-0 w-1.5 bg-brand-primary opacity-20 group-hover:opacity-100 transition-opacity" />

                  {/* 1. COMPACT PREVIEW */}
                  <div className="w-full lg:w-40 h-32 relative rounded-2xl overflow-hidden shadow-md border border-slate-50 flex-shrink-0 group/img">
                     <img src={appeal.submissionId?.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                     <a href={appeal.submissionId?.imageUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white">
                        <ExternalLink size={18} />
                     </a>
                  </div>

                  {/* 2. BALANCED INFO AREA */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-brand-primary transition-colors">
                            <User size={14} />
                          </div>
                          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{appeal.userId?.username}</span>
                       </div>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sent: {new Date(appeal.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 shadow-inner relative">
                       <p className="text-xs text-slate-500 font-bold italic leading-relaxed">
                         "{appeal.justification}"
                       </p>
                    </div>

                    {/* COMPACT INPUT WORKSPACE (Requirement 4.3) */}
                    <div className="relative group/input">
                      <input 
                        type="text" 
                        placeholder="Attach verdict feedback..."
                        value={adminResponses[appeal._id] || ''}
                        onChange={(e) => handleInputChange(appeal._id, e.target.value)}
                        className="w-full bg-white border-b-2 border-slate-100 py-3 pl-2 pr-10 outline-none focus:border-brand-primary transition-all text-xs font-bold text-slate-700 placeholder:text-slate-200"
                      />
                      <Send size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within/input:text-brand-primary transition-colors" />
                    </div>
                  </div>

                  {/* 3. PREMIUM ACTION GATE */}
                  <div className="flex lg:flex-col gap-3 flex-shrink-0 w-full lg:w-auto">
                     <button 
                        onClick={() => resolve(appeal._id, 'Accepted')}
                        className="flex-1 lg:w-28 h-14 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-200/10 flex flex-col items-center justify-center group/btn"
                     >
                        <Check size={20} strokeWidth={3} className="group-hover/btn:scale-125 transition-transform" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Accept</span>
                     </button>
                     <button 
                        onClick={() => resolve(appeal._id, 'Rejected')}
                        className="flex-1 lg:w-28 h-14 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-200/10 flex flex-col items-center justify-center group/btn"
                     >
                        <X size={20} strokeWidth={3} className="group-hover/btn:scale-125 transition-transform" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Reject</span>
                     </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {queue.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-2xl mb-8 relative">
                    <ShieldCheck size={40} className="text-emerald-400" />
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-10" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Oversight Finalized</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-3">All nodes are synchronized to safe states.</p>
              </motion.div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}