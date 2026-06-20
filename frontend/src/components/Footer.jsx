import Link from 'next/link';
import { Shield, Mail, Lock, ExternalLink } from 'lucide-react';
// MUI Icons for Socials to fix Error #130
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/X'; // Modern 'X' icon
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { 
      icon: <FacebookIcon fontSize="small" />, 
      href: "#", 
      color: "hover:bg-[#1877F2] text-[#1877F2]", 
      label: "Facebook" 
    },
    { 
      icon: <TwitterIcon sx={{ fontSize: 18 }} />, 
      href: "#", 
      color: "hover:bg-black text-black", 
      label: "X" 
    },
    { 
      icon: <LinkedInIcon fontSize="small" />, 
      href: "#", 
      color: "hover:bg-[#0A66C2] text-[#0A66C2]", 
      label: "LinkedIn" 
    },
    { 
      icon: <InstagramIcon fontSize="small" />, 
      href: "#", 
      color: "hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-[#ee2a7b]", 
      label: "Instagram" 
    },
  ];

  return (
    <footer className="mt-auto border-t border-slate-100 bg-white w-full font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* TOP SECTION: 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-black text-slate-800 tracking-tighter uppercase">MODERA</span>
            </div>
            <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-[200px]">
              Next-generation AI safety for the modern web. Built with precision.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-slate-900 font-bold text-[10px] uppercase tracking-widest">Platform</h4>
            <Link href="/" className="text-slate-500 hover:text-brand-primary text-xs font-bold transition-all flex items-center gap-1">
              Dashboard <ExternalLink size={10} />
            </Link>
            <Link href="/history" className="text-slate-500 hover:text-brand-primary text-xs font-bold transition-all flex items-center gap-1">
              History Log <ExternalLink size={10} />
            </Link>
          </div>

          {/* Column 3: Socials (Eye-Catching & Balanced) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-slate-900 font-bold text-[10px] uppercase tracking-widest">Connect</h4>
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 bg-slate-50 border border-slate-100 shadow-sm hover:text-white hover:shadow-lg hover:-translate-y-1 ${social.color}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: Support Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm text-brand-primary">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Support</p>
              <p className="text-xs font-bold text-slate-800">support@modera.ai</p>
            </div>
          </div>

        </div>

        {/* BOTTOM STRIP */}
        <div className="mt-10 pt-6 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400">© {currentYear} MODERA AI • GLOBAL COMPLIANCE</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
               <Lock size={12} className="text-brand-primary opacity-50" />
               <span className="text-[9px] font-bold uppercase tracking-wider">AES-256</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
               <Shield size={12} className="text-emerald-500 opacity-50" />
               <span className="text-[9px] font-bold uppercase tracking-wider">Secure Node</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}