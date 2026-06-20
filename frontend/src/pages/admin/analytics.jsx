import dynamic from 'next/dynamic';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const ChartWrapper = dynamic(() => import('../../components/AdminCharts'), { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center h-[600px]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
});

export default function Analytics() {
    const [stats, setStats] = useState({ total: 0, blocked: 0, flagged: 0 });

    useEffect(() => {
        api.get('/analytics').then(res => setStats(res.data));
    }, []);

    return (
        <div className="flex bg-[#F1F5F9] min-h-screen font-sans selection:bg-indigo-100">
            <Sidebar />
            
            <main className="flex-1 flex flex-col min-h-screen">
                <div className="p-6 md:p-12 flex-grow">
                    
                    {/* TOP HEADER SECTION */}
                    <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                className="text-4xl font-black text-slate-800 tracking-tighter"
                            >
                                Platform <span className="text-indigo-600 italic">Oversight</span>
                            </motion.h1>
                            <p className="text-slate-500 font-medium mt-2">Real-time intelligence and node integrity monitoring.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-white rounded-2xl border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Region: <span className="text-indigo-600 font-black">Global-01</span>
                            </span>
                        </div>
                    </div>

                    {/* DASHBOARD CHARTS COMPONENT */}
                    <ChartWrapper stats={stats} />

                </div>
                
                <Footer />
            </main>
        </div>
    );
}