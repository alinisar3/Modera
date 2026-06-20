import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon, colorClass, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:scale-[1.02] transition-all"
    >
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        {/* The value here is now passed from the Live API */}
        <p className="text-3xl font-black text-slate-800 tracking-tighter italic">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform ${colorClass}`}>
        {icon}
      </div>
    </motion.div>
  );
}