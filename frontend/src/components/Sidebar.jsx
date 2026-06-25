import { 
  LayoutDashboard, Shield, History, BarChart, 
  LogOut, MessageSquare, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modera Sidebar Component
 * - Instruction 5: Non-overlapping role capabilities.
 * - Instruction 6: Fully functional and responsive for every screen.
 */
export default function Sidebar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false); // Mobile menu state
    const [showLogoutNotif, setShowLogoutNotif] = useState(false);

    // Function to handle logout with Tailwind notification
    const handleLogout = () => {
        setShowLogoutNotif(true);
        setTimeout(() => {
            logout();
            router.push('/auth');
        }, 1500);
    };

    // Base menu items (Requirement: View personal submission history)
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20}/>, path: '/' },
        { name: 'History', icon: <History size={20}/>, path: '/history' },
    ];

    /**
     * Instruction 5: Admin Roles
     * Plus access to the appeals queue, manual verdict overrides, 
     * policy configuration, and the analytics dashboard.
     */
    if (user?.role === 'admin') {
        menuItems.push(
            { name: 'Policies', icon: <Shield size={20}/>, path: '/admin/policies' },
            { name: 'Analytics', icon: <BarChart size={20}/>, path: '/admin/analytics' },
            { name: 'Appeals', icon: <MessageSquare size={20}/>, path: '/admin/appeals' } 
        );
    }

    return (
        <>
            {/* --- MOBILE TOGGLE BAR --- */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-dark z-[100] px-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <span className="text-white font-black tracking-tighter">MODERA</span>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 p-2 bg-white/5 rounded-xl">
                    {isOpen ? <X size={20}/> : <Menu size={20}/>}
                </button>
            </div>

            {/* --- SIDEBAR CONTAINER --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-[90] w-72 bg-brand-dark text-slate-400 p-8 flex flex-col 
                border-r border-white/5 transition-transform duration-500 ease-in-out
                lg:relative lg:translate-x-0 
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                {/* Classy Brand Section */}
                <div className="hidden lg:flex items-center gap-4 mb-14 px-2">
                    <div className="w-11 h-11 bg-brand-primary rounded-[1rem] flex items-center justify-center text-white font-bold shadow-lg shadow-brand-primary/20 ring-4 ring-brand-primary/10">
                        M
                    </div>
                    <div>
                        <span className="text-white font-black text-2xl tracking-tighter block leading-none">MODERA</span>
                    </div>
                </div>
                
                {/* Navigation Section */}
                <nav className="flex-1 space-y-3 pt-12 lg:pt-0">
                    {menuItems.map((item) => {
                        const isActive = router.pathname === item.path;
                        return (
                            <Link 
                                key={item.name} 
                                href={item.path} 
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-bold group relative ${
                                    isActive 
                                    ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/20' 
                                    : 'hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className={`${isActive ? 'text-white' : 'group-hover:text-brand-primary transition-colors'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-wide">{item.name}</span>
                                {isActive && (
                                    <motion.div layoutId="activeGlow" className="absolute left-0 w-1 h-6 bg-white rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out Logic (Instruction 5 Capability) */}
                <div className="mt-auto border-t border-white/5 pt-8">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-4 p-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/>
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* --- LOGOUT TAILWIND NOTIFICATION --- */}
            <AnimatePresence>
                {showLogoutNotif && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-md"
                    >
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm mx-4 border border-white">
                            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                                <LogOut size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Signing Out</h3>
                            <p className="text-slate-400 text-sm font-medium mt-2">Securing your node and clearing local cache...</p>
                            <div className="mt-8 flex justify-center">
                                <div className="w-12 h-1 border-2 border-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5 }}
                                        className="h-full bg-brand-primary" 
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[80]" />
            )}
        </>
    );
}