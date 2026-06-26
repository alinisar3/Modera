import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Activity, ShieldCheck, AlertOctagon, Zap, 
  TrendingUp, Users, MessageSquare, Award, AlertTriangle 
} from 'lucide-react';

const AdminCharts = ({ stats }) => {
  // Logic: Calculate derived metrics for Instruction 4.5
  const approvedCount = (stats.total || 0) - ((stats.blocked || 0) + (stats.flagged || 0));
  const safetyRate = stats.total > 0 ? Math.round((approvedCount / stats.total) * 100) : 0;

  // Pie Data: Verdict Distribution (Instruction 4.5 - Point 2)
  const pieData = [
    { name: 'Approved', value: approvedCount > 0 ? approvedCount : 0, color: '#10b981' },
    { name: 'Blocked', value: stats.blocked || 0, color: '#f43f5e' },
    { name: 'Flagged', value: stats.flagged || 0, color: '#f59e0b' },
  ];

  // Appeal Data: Breakdown (Instruction 4.5 - Point 3)
  const appealBreakdown = [
    { name: 'Accepted', value: stats.appeals?.accepted || 0, color: '#10b981' },
    { name: 'Rejected', value: stats.appeals?.rejected || 0, color: '#f43f5e' }
  ];

  // Mock Category Data (Placeholder for real backend category aggregate)
  const categoryData = [
    { name: 'Violence', count: 12, fill: '#6366f1' },
    { name: 'Weapons', count: 8, fill: '#8b5cf6' },
    { name: 'Hate', count: 5, fill: '#ec4899' },
    { name: 'Harass', count: 3, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 w-full overflow-hidden">
      
      {/* 4.5: TOP LEVEL KPI GRID (Responsive Column Mapping) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Requests', val: stats.total, icon: <Activity />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Appeal Volume', val: stats.appeals?.total, icon: <MessageSquare />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Integrity Rate', val: `${safetyRate}%`, icon: <ShieldCheck />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'System Blocks', val: stats.blocked, icon: <AlertOctagon />, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} className="bg-white/80 backdrop-blur-md p-5 md:p-6 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:rotate-6 transition-transform`}>
              {React.cloneElement(item.icon, { size: 20 })}
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
            <p className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter mt-1">{item.val || 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* 4.5: SUBMISSION VOLUME OVER TIME (Area Chart) - min-w-0 fixes SVG overflow */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden min-w-0">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" /> Volume Velocity (Last 7 Days)
              </h3>
           </div>
           <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={stats.volumeOverTime || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* 4.5: VERDICT DISTRIBUTION (Doughnut Chart) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col min-w-0">
          <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Node Integrity</h3>
          <div className="flex-1 relative min-h-[200px] md:min-h-[250px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <span className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter">{safetyRate}%</span>
              <span className="text-[8px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Safe</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius="70%" outerRadius="90%" paddingAngle={8} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
             {pieData.map((p, i) => (
               <div key={i} className="text-center p-2 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                  <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-tighter">{p.name}</p>
                  <p className="text-xs md:text-sm font-black text-slate-700">{p.value}</p>
               </div>
             ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        
        {/* 4.5: APPEAL RESOLUTION METRICS (Bar Chart) */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl min-w-0">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Appeal Oversight</h3>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] md:text-[9px] font-black uppercase">Rate: {stats.appeals?.rate}%</div>
           </div>
           <div className="h-[220px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={appealBreakdown}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                      {appealBreakdown.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
           <p className="mt-6 text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center italic">Calculated resolution success vs rejection ratio</p>
        </motion.div>

        {/* 4.5: CATEGORY BREAKDOWN */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl min-w-0">
           <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-10 text-right">Category Matrix</h3>
           <div className="h-[220px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} width={60} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 4.5: RANKED LIST OF USERS (Responsive Table) */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-2xl">
         <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center justify-center sm:justify-start gap-3">
                <Award className="text-amber-500" /> Security Leaderboard
              </h3>
              <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Operator Rankings</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time sync</span>
            </div>
         </div>
         <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
            <table className="w-full min-w-[500px]">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="px-4 py-4 text-left text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Operator</th>
                     <th className="px-4 py-4 text-center text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Volume</th>
                     <th className="px-4 py-4 text-right text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Risk Index</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {(stats.rankedUsers || []).map((rank, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-all duration-300">
                       <td className="px-4 py-5 flex items-center gap-4 md:gap-6">
                          <span className="text-lg md:text-xl font-black text-slate-200 group-hover:text-indigo-600 transition-colors italic w-6">0{i+1}</span>
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-black text-slate-700 uppercase tracking-tight">{rank.userDetails?.username}</span>
                            <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">Verified Node</span>
                          </div>
                       </td>
                       <td className="px-4 py-5 text-center">
                          <span className="text-base md:text-lg font-black text-slate-800">{rank.totalSubmissions}</span>
                          <span className="text-[8px] md:text-[9px] font-bold text-slate-400 block uppercase">Requests</span>
                       </td>
                       <td className="px-4 py-5 text-right">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white rounded-xl md:rounded-2xl border border-slate-100 shadow-sm group-hover:border-rose-100 transition-colors">
                            <AlertTriangle size={10} className={rank.violations > 0 ? "text-rose-500" : "text-emerald-500"} />
                            <span className={`text-[10px] font-black ${rank.violations > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                               {rank.violations} BLOCKS
                            </span>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </motion.div>
    </div>
  );
};

export default AdminCharts;