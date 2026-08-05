import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface BannerCarouselProps {
  onBannerClick: (category: string) => void;
  onOpenSell: () => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onBannerClick, onOpenSell }) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 my-2 group">
      <div className="relative min-h-[120px] sm:min-h-[140px] bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 px-4 py-4 sm:px-6 text-white flex items-center justify-between gap-3">
        
        {/* Background Image Texture */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80)' }} 
        />

        {/* Content Section */}
        <div className="relative z-10 flex-1 min-w-0 space-y-1">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-300 border border-cyan-400/20">
            <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Verified Spare Parts Hub</span>
          </div>

          <h2 className="text-sm sm:text-base font-black leading-tight drop-shadow-xs">
            India's Largest OEM & Used Parts Market
          </h2>

          <p className="text-[10px] sm:text-xs text-slate-300 font-medium line-clamp-1">
            Direct deals from Mayapuri, Pudupet, Kurla & 50+ auto scrap hubs
          </p>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => onBannerClick('')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore Market</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenSell}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all cursor-pointer border border-white/20"
            >
              <span>Sell Spare Parts</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Thumbnail */}
        <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shadow-lg border border-white/20 shrink-0 hidden sm:block">
          <img 
            src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=300&q=80" 
            alt="OEM Auto Spare Parts" 
            className="w-full h-full object-cover" 
          />
        </div>

      </div>
    </div>
  );
};

