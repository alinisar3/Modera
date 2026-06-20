import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { Shield, Lock, User, Key, AlertCircle, CheckCircle2, X, Fingerprint, ArrowRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

export default function Auth() {
  // Logic States
  const [isLogin, setIsLogin] = useState(true);
  const [isForgetPassword, setIsForgetPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [remember, setRemember] = useState(false); 
  const [role, setRole] = useState('user'); 
  const [adminKey, setAdminKey] = useState(''); 
  const [notification, setNotification] = useState({ show: false, msg: '', type: 'error' });
  
  const { login, register } = useAuth(); 
  const router = useRouter();

  /**
   * CLASSY NOTIFICATION HANDLER
   * Replaces default browser alerts with professional Tailwind toasts.
   */
  const triggerNotify = (msg, type = 'error') => {
    setNotification({ show: true, msg, type });
    setTimeout(() => setNotification({ show: false, msg: '', type: 'error' }), 4000);
  };

  /**
   * FORGET PASSWORD LOGIC
   * Fully functional password override.
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reset-password', { username, newPassword });
      triggerNotify("Password reset successful!", "success");
      setIsForgetPassword(false);
      setIsLogin(true);
    } catch (err) {
      triggerNotify(err.response?.data?.msg || "Reset failed.", "error");
    }
  };

  /**
   * MAIN SUBMIT HANDLER
   * Manages Role Gating, Registration (Redirect to Login), and Login (Redirect to Dashboard).
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Log in with 'Remember Me' logic
        await login(username, password, role, remember);
        router.push('/');
      } else {
        // Instruction 5: Admin Creation Lock
        if (role === 'admin' && adminKey !== "MODERA_2025_ACCESS") {
          triggerNotify("Invalid Admin Secret Key. Access Denied.");
          return;
        }
        // Account Creation
        await register(username, password, role);
        triggerNotify("Account created successfully! Please login.", "success");
        setIsLogin(true); 
      }
    } catch (err) {
      // Precise Backend Error Extraction
      const errorMsg = err.response?.data?.msg || "Authentication failed. Check credentials/role.";
      triggerNotify(errorMsg, "error");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row font-sans antialiased bg-white overflow-hidden">
      
      {/* --- TAILWIND NOTIFICATION TOAST (CLASSY DESIGN) --- */}
      <AnimatePresence>
        {notification.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }} 
            animate={{ opacity: 1, y: 30, x: '-50%' }} 
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-0 left-1/2 lg:left-[75%] z-[150] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px] ${
              notification.type === 'error' ? 'bg-rose-50/90 border-rose-100 text-rose-600' : 'bg-emerald-50/90 border-emerald-100 text-emerald-600'
            }`}
          >
            {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="text-sm font-bold tracking-tight flex-1">{notification.msg}</span>
            <button onClick={() => setNotification({ ...notification, show: false, msg: '', type: 'error' })}>
              <X size={16} className="opacity-40 hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LEFT SIDE: CONTENT MODERATION DESIGN (AREA: flex-[1.5]) --- */}
      <div className="hidden lg:flex flex-[1.5] bg-[#020617] relative overflow-hidden items-center justify-center border-r border-slate-900">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 text-center px-12">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
              <div className="relative mb-12 inline-block">
                <div className="w-36 h-32 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl">
                  <Shield size={72} className="text-brand-primary drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                </div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -top-6 -right-6 p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl">
                  <Fingerprint size={28} className="text-indigo-400" />
                </motion.div>
              </div>
            </motion.div>
            <h2 className="text-6xl font-black text-white tracking-tighter mb-6 uppercase italic leading-none">
              Secure <br/> <span className="text-brand-primary">Moderation</span>
            </h2>
            <p className="text-slate-500 text-xl max-w-md mx-auto font-medium leading-relaxed tracking-tight">
              Advanced governance for digital ecosystems. AI-powered protection, active 24/7.
            </p>
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        </div>
      </div>

      {/* --- RIGHT SIDE: OPEN-SPACE CLEAN DESIGN --- */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 md:p-20 relative">
        <div className="w-full max-w-[420px] h-full flex flex-col justify-center">
            
          {/* Header Implementation */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4 uppercase">
               {isForgetPassword ? 'Reset Access' : (isLogin ? 'Welcome Back' : 'Get Started')} <br/>
               <span className="text-brand-primary text-4xl italic opacity-80 lowercase">
                {isForgetPassword ? '' : (isLogin ? 'to Modera' : 'with Modera')}
               </span>
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] leading-none opacity-80">
              {isForgetPassword ? 'Initiate identity verification' : (isLogin ? 'Access your governance console' : 'Initialise your monitoring account')}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {isForgetPassword ? (
              /* RESET VIEW */
              <motion.form key="forget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleResetPassword} className="space-y-10">
                <div className="group border-b border-slate-100 focus-within:border-brand-primary transition-all pb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Verify Username</label>
                  <input type="text" placeholder="Confirm account name" required className="w-full bg-transparent py-2 outline-none text-slate-800 font-bold" onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="group border-b border-slate-100 focus-within:border-brand-primary transition-all pb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" required className="w-full bg-transparent py-2 outline-none text-slate-800 font-bold" onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="flex flex-col gap-6">
                  <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-brand-primary/30 transition-all hover:bg-brand-accent hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
                     Update Access <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                  <button type="button" onClick={() => setIsForgetPassword(false)} className="text-xs font-black text-slate-300 uppercase tracking-widest hover:text-brand-primary transition-colors text-center">Back to Login</button>
                </div>
              </motion.form>
            ) : (
              /* LOGIN / SIGNUP VIEW */
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Industrial Role Tabs */}
                <div className="flex gap-8 mb-12 border-b border-slate-100 pb-2">
                    <button onClick={() => setRole('user')} className={`text-xs font-black uppercase tracking-widest pb-3 transition-all relative ${role === 'user' ? 'text-brand-primary' : 'text-slate-300'}`}>
                      Standard User
                      {role === 'user' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-primary" />}
                    </button>
                    <button onClick={() => setRole('admin')} className={`text-xs font-black uppercase tracking-widest pb-3 transition-all relative ${role === 'admin' ? 'text-brand-primary' : 'text-slate-300'}`}>
                      Platform Admin
                      {role === 'admin' && <motion.div layoutId="tab" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-brand-primary" />}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="group border-b border-slate-100 focus-within:border-brand-primary transition-all pb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Username</label>
                    <input type="text" placeholder="Enter account name" required className="w-full bg-transparent py-2 outline-none text-slate-800 font-bold placeholder:text-slate-200" onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="group border-b border-slate-100 focus-within:border-brand-primary transition-all pb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Password</label>
                    <input type="password" placeholder="••••••••" required className="w-full bg-transparent py-2 outline-none text-slate-800 font-bold placeholder:text-slate-200" onChange={(e) => setPassword(e.target.value)} />
                  </div>

                  <AnimatePresence>
                    {!isLogin && role === 'admin' && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-2 border-b border-indigo-100 focus-within:border-brand-primary pb-2 overflow-hidden">
                         <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest block mb-1">Security Token</label>
                         <input type="password" placeholder="Master Access Key" required className="w-full bg-transparent py-2 outline-none text-brand-primary font-black uppercase tracking-widest" onChange={(e) => setAdminKey(e.target.value)} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-6 pt-4">
                      {isLogin && (
                        <div className="flex justify-between items-center mb-2">
                            {/* FUNCTIONAL CUSTOM CHECKBOX */}
                            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setRemember(!remember)}>
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${remember ? 'bg-brand-primary border-brand-primary shadow-lg shadow-brand-primary/30' : 'border-slate-200'}`}>
                                    {remember && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${remember ? 'text-slate-600' : 'text-slate-300 group-hover:text-slate-400'}`}>Remember Me</span>
                            </div>
                            <button type="button" onClick={() => setIsForgetPassword(true)} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline underline-offset-4">Forget Password?</button>
                        </div>
                      )}
                      <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-brand-primary/30 transition-all hover:bg-brand-accent hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
                         {isLogin ? 'Sign In' : (role === 'admin' ? 'Initialise' : 'Create Account')}
                         <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <div className="text-center">
                        <p className="text-sm text-slate-300 font-bold">
                          {isLogin ? "New user?" : "Already registered?"}
                          <button type="button" onClick={() => { setIsLogin(!isLogin); setRole('user'); }} className="ml-2 text-brand-primary hover:underline underline-offset-4">
                            {isLogin ? 'Join Now' : 'Sign In'}
                          </button>
                        </p>
                      </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
       
      </div>
    </div>
  );
}