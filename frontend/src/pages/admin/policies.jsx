import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, ShieldCheck, Power, Percent, ChevronDown, 
  CheckCircle2, XCircle, Activity, Zap 
} from 'lucide-react';

/**
 * Instruction 4.4: Policy Configuration Dashboard
 * Allows Administrators to manage AI behavior, thresholds, and activation.
 */
export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [notif, setNotif] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Sync with Backend Node
  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      triggerNotify("Sync Engine Offline", "error");
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const triggerNotify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  /**
   * handleUpdate (Requirement 4.4)
   * Sends configuration changes to the database.
   */
  const handleUpdate = async (id, updatedData) => {
    try {
      await api.put(`/policies/${id}`, updatedData);
      // Immediate local state update for snappy UI feel
      setPolicies(policies.map(p => p._id === id ? { ...p, ...updatedData } : p));
      triggerNotify("Configuration Synchronized");
    } catch (e) { 
      triggerNotify("Sync Failed", "error"); 
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans overflow-x-hidden">
      
      {/* --- CLASSY TAILWIND NOTIFICATION TOAST --- */}
      <AnimatePresence>
        {notif && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[150] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 min-w-[300px] ${
              notif.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-600 border-emerald-500 text-white'
            }`}
          >
            {notif.type === 'error' ? <XCircle size={18}/> : <CheckCircle2 size={18}/>}
            <span className="text-xs font-black uppercase tracking-widest">{notif.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="p-6 md:p-12 flex-grow">
          
          {/* HEADER SECTION */}
          <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">
                Policy <span className="text-brand-primary text-3xl">Engine</span>
              </h1>
              <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-[0.4em]">Governance Control Console</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                <Zap size={14} className="text-brand-primary animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Version: <span className="text-slate-800">2.5.0</span></span>
            </div>
          </header>

          {/* POLICY GRID (Requirement 4.4 Implementation) */}
          <div className="grid grid-cols-1 gap-6">
            {policies.map((policy, idx) => (
              <motion.div 
                key={policy._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10 hover:shadow-2xl transition-all group"
              >
                {/* 1. Category Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${policy.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">{policy.category}</h3>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-5 leading-relaxed">
                    Automated analysis protocol for {policy.category.toLowerCase()}.
                  </p>
                </div>

                {/* 2. Controls Wrapper */}
                <div className="flex flex-wrap items-center justify-center gap-10 w-full lg:w-auto">
                  
                  {/* ENABLE/DISABLE TOGGLE (Requirement 4.4 - Point 1) */}
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Engine Status</span>
                    <button 
                      onClick={() => handleUpdate(policy._id, { enabled: !policy.enabled })}
                      className={`w-16 h-9 rounded-full p-1.5 transition-all duration-500 ${policy.enabled ? 'bg-brand-primary shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
                    >
                      <motion.div 
                        layout
                        className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-[8px] font-black"
                        animate={{ x: policy.enabled ? 28 : 0 }}
                      >
                         <Power size={10} className={policy.enabled ? 'text-brand-primary' : 'text-slate-300'} />
                      </motion.div>
                    </button>
                  </div>

                  {/* THRESHOLD INPUT (Requirement 4.4 - Point 2) */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sensitivity Threshold</span>
                    <div className="relative">
                        <input 
                            type="number" 
                            min="1" max="100"
                            value={policy.threshold}
                            onChange={(e) => handleUpdate(policy._id, { threshold: e.target.value })}
                            className="w-24 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-base font-black text-slate-800 text-center outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                        />
                        <Percent size={12} className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-300" />
                    </div>
                  </div>

                  {/* CUSTOM TAILWIND DROPDOWN (Requirement 4.4 - Point 3) */}
                  <div className="flex flex-col gap-3 relative">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enforcement Logic</span>
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === policy._id ? null : policy._id)}
                      className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl text-xs font-black uppercase text-slate-700 flex items-center gap-4 hover:bg-slate-100 transition-all min-w-[200px] justify-between shadow-inner"
                    >
                      {policy.behavior}
                      <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdownId === policy._id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdownId === policy._id && (
                        <motion.div 
                          initial={{ opacity:0, y:10, scale:0.95 }} 
                          animate={{ opacity:1, y:5, scale:1 }} 
                          exit={{ opacity:0, y:10, scale:0.95 }}
                          className="absolute top-full left-0 w-full bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 z-[60] overflow-hidden py-3"
                        >
                          {['Auto-Block', 'Flag for Review'].map((mode) => (
                            <button 
                              key={mode} 
                              onClick={() => { handleUpdate(policy._id, { behavior: mode }); setOpenDropdownId(null); }}
                              className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase transition-all flex items-center justify-between ${
                                policy.behavior === mode ? 'text-brand-primary bg-indigo-50/50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                              }`}
                            >
                              {mode}
                              {policy.behavior === mode && <ShieldCheck size={14} />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}