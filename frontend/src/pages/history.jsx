import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, ShieldCheck, Clock, AlertCircle, CheckCircle2, 
  XCircle, X, AlertTriangle, Search, MessageSquare, Send, Filter, Calendar, ChevronDown, Info
} from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // UI States
  const [notif, setNotif] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Logic States
  const [activeItem, setActiveItem] = useState(null);
  const [justification, setJustification] = useState('');
  const [filters, setFilters] = useState({ outcome: '', category: '', date: '' });

  const triggerNotify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 4000);
  };

  // Requirement 4.1: Advanced Sync with smooth loading state
  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get('/history', { params: filters });
      setHistory(res.data);
    } catch (err) {
      triggerNotify("Audit Node Synchronization Failed", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const confirmDelete = async () => {
    try {
      await api.delete(`/submissions/${activeItem._id}`);
      setHistory(prev => prev.filter(item => item._id !== activeItem._id));
      triggerNotify("Security record purged", "success");
      setShowDeleteModal(false);
    } catch (err) {
      triggerNotify("Purge operation failed", "error");
    }
  };

  const submitAppeal = async () => {
    if (!justification.trim()) {
        triggerNotify("Justification required", "error");
        return;
    }
    try {
      await api.post('/appeals', { submissionId: activeItem._id, justification });
      triggerNotify("Dispute synchronized to queue", "success");
      setShowAppealModal(false);
      setJustification('');
      fetchHistory();
    } catch (err) {
      triggerNotify("Active dispute already exists", "error");
    }
  };

  const renderCategories = (results) => {
    const detected = results?.filter(r => r.confidence > 20) || [];
    if (detected.length === 0) return <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100 shadow-sm">Clean Asset</span>;

    return (
      <div className="flex flex-wrap gap-2 justify-start">
        {detected.map((r, i) => {
          const shortName = r.category
            .replace("Graphic Violence", "Violence")
            .replace("Hate Symbols", "Hate")
            .replace("Self-Harm", "Harm")
            .replace("Extremist Propaganda", "Extremist")
            .replace("Weapons & Contraband", "Weapons")
            .replace("Harassment & Humiliation", "Harass");

          return (
            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase border border-slate-200 shadow-sm transition-all hover:bg-slate-200">
              {shortName}
            </span>
          );
        })}
      </div>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      case 'Flagged': return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'Blocked': return 'text-rose-500 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans overflow-x-hidden selection:bg-brand-primary selection:text-white">
      
      {/* PROFESSIONAL TAILWIND TOAST */}
      <AnimatePresence>
        {notif && (
          <motion.div 
            initial={{ y: -100, x: '-50%', opacity: 0 }} 
            animate={{ y: 30, x: '-50%', opacity: 1 }} 
            exit={{ y: -100, x: '-50%', opacity: 0 }}
            className={`fixed top-0 left-1/2 z-[300] px-8 py-5 rounded-[2rem] shadow-2xl border backdrop-blur-xl flex items-center gap-4 min-w-[340px] ${
              notif.type === 'error' ? 'bg-white/90 border-rose-200 text-rose-600' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`p-2 rounded-xl ${notif.type === 'error' ? 'bg-rose-100' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {notif.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest leading-none">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen w-full relative">
        <div className="p-4 md:p-12 flex-grow max-w-[1600px] mx-auto w-full">
          
          <motion.div initial={{ opacity:0, y: 10 }} animate={{ opacity:1, y: 0 }} className="mb-14">
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter uppercase italic leading-tight">
                Security <span className="text-indigo-600">Audit Log</span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] md:text-xs mt-3 uppercase tracking-[0.4em] flex items-center gap-2">
                <ShieldCheck size={14} />
                {user?.role === 'admin' ? "Global Governance Node Active" : "Personal Access History"}
            </p>
          </motion.div>

          {/* FILTER MATRIX - RESPONSIVE */}
          <motion.section layout className="mb-10 flex flex-col lg:flex-row gap-6 items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl">
             <div className="flex items-center gap-3 lg:pr-6 lg:border-r border-slate-100 w-full lg:w-auto">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Filter size={20} /></div>
                <span className="text-sm font-black text-slate-600 uppercase tracking-widest">Filter Matrix</span>
             </div>

             <div className="flex flex-wrap items-center gap-4 w-full">
                {/* CUSTOM DROPDOWN */}
                <div className="relative flex-1 min-w-[200px]">
                    <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl text-xs font-black uppercase text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all justify-between shadow-inner"
                    >
                    {filters.outcome || "Status: All"}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 5 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl z-[100] overflow-hidden py-3"
                        >
                        {['', 'Approved', 'Flagged', 'Blocked'].map((opt) => (
                            <button key={opt} onClick={() => { setFilters({...filters, outcome: opt}); setIsDropdownOpen(false); }}
                            className="w-full text-left px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                            {opt || "Show All Assets"}
                            </button>
                        ))}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-inner flex-1 min-w-[200px]">
                    <Calendar size={16} className="text-indigo-600" />
                    <input type="date" value={filters.date} onChange={(e)=>setFilters({...filters, date: e.target.value})} className="bg-transparent text-xs font-black uppercase outline-none text-slate-600 w-full" />
                </div>

                <button 
                    onClick={() => setFilters({outcome:'', category:'', date:''})} 
                    className="px-6 py-4 text-xs font-black text-rose-500 uppercase hover:text-rose-700 transition-colors underline underline-offset-8 decoration-2"
                >
                    Reset View
                </button>
             </div>
          </motion.section>

          {/* LOG TABLE - NO INTERNAL SCROLLBAR ON DESKTOP */}
          <motion.div layout className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-12">
            <div className="overflow-x-auto scrollbar-hide">
                <table className="min-w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Preview</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Verdict</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Category Matrix</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Date</th>
                    {user?.role === 'admin' && <th className="px-8 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    <AnimatePresence mode="popLayout">
                    {history.length > 0 ? history.map((item) => (
                        <motion.tr 
                          layout 
                          key={item._id} 
                          initial={{ opacity: 0, scale: 0.98 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.95 }} 
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                        <td className="px-8 py-6">
                            <div className="w-16 h-12 md:w-20 md:h-14 rounded-xl overflow-hidden shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                                <img src={item.imageUrl} alt="audit" className="w-full h-full object-cover" />
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(item.outcome)} shadow-sm`}>
                                {item.outcome}
                            </span>
                        </td>
                        <td className="px-8 py-6 hidden lg:table-cell max-w-[250px]">{renderCategories(item.results)}</td>
                        <td className="px-8 py-6">
                            {item.outcome !== 'Approved' && item.appealStatus === 'None' ? (
                            <button onClick={()=>{setActiveItem(item); setShowAppealModal(true)}} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase hover:underline underline-offset-4 decoration-2">
                                <MessageSquare size={14}/> File Dispute
                            </button>
                            ) : item.appealStatus !== 'None' ? (
                            <button onClick={()=>{setActiveItem(item); setShowFeedbackModal(true)}} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all hover:scale-105 shadow-sm ${item.appealStatus === 'Accepted' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                {item.appealStatus} <Info size={14} />
                            </button>
                            ) : <span className="text-[10px] font-black text-slate-300 uppercase italic">Verified Safe</span>}
                        </td>
                        <td className="px-8 py-6">
                            <p className="text-xs font-black text-slate-800 tracking-tighter">
                                {new Date(item.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                            </p>
                        </td>
                        {user?.role === 'admin' && (
                            <td className="px-8 py-6 text-center">
                            <button onClick={()=>{setActiveItem(item); setShowDeleteModal(true)}} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90">
                                <Trash2 size={18}/>
                            </button>
                            </td>
                        )}
                        </motion.tr>
                    )) : (
                        <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <td colSpan="6" className="py-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                        <Search size={32}/>
                                    </div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No matching records in current node</p>
                                </div>
                            </td>
                        </motion.tr>
                    )}
                    </AnimatePresence>
                </tbody>
                </table>
            </div>
          </motion.div>
        </div>
        <Footer />
      </main>

      {/* ADMIN FEEDBACK MODAL */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={()=>setShowFeedbackModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl border border-white text-center relative z-10"
            >
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto mb-10 shadow-inner">
                <ShieldCheck size={48}/>
              </div>
              <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">Manual Review</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Administrative Feedback Report</p>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10 text-base font-bold text-slate-600 leading-relaxed italic shadow-inner">
                "{activeItem?.adminResponse || "The submission has been manually synchronized after administrator audit."}"
              </div>
              <button onClick={()=>setShowFeedbackModal(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95">Acknowledge</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISPUTE MODAL */}
      <AnimatePresence>
        {showAppealModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={()=>setShowAppealModal(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border border-white relative z-10">
              <button onClick={()=>setShowAppealModal(false)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={24}/></button>
              <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-2">Verdict Dispute</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Manual context required</p>
              <textarea 
                className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none text-base font-bold text-slate-700 mb-10 h-48 focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner placeholder:text-slate-300 resize-none" 
                placeholder="Detailed justification..." 
                onChange={(e)=>setJustification(e.target.value)} 
              />
              <button onClick={submitAppeal} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-200 transition-all hover:bg-indigo-700 flex items-center justify-center gap-4 active:scale-95">
                 Send Review <Send size={18}/>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={()=>setShowDeleteModal(false)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-sm rounded-[3rem] p-12 shadow-2xl text-center border border-white relative z-10">
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner"><AlertTriangle size={40} /></div>
              <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4 italic">Security Purge</h3>
              <p className="text-slate-500 text-sm font-bold mb-10 leading-relaxed uppercase tracking-tight">Permanently erase this security asset?</p>
              <div className="flex gap-4">
                <button onClick={()=>setShowDeleteModal(false)} className="flex-1 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all active:scale-95">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}