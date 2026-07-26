import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  cta: string;
  image: string;
  category: string;
}

const BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'Verified Scrap Markets',
    subtitle: 'Direct from Mayapuri (Delhi), Kurla (Mumbai) & Pudupet (Chennai)',
    badge: '100% Genuine OEM',
    gradient: 'from-blue-700 via-blue-600 to-indigo-800',
    cta: 'Explore Markets',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    category: 'Engine, Gearbox & Transmission'
  },
  {
    id: 'b2',
    title: 'Cars24 & Insurance Claims',
    subtitle: 'Tested engine blocks, gearboxes & ECM sets with 30-day warranty',
    badge: 'Upto 70% Off MRP',
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    cta: 'View Engine Deals',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    category: 'Engine, Gearbox & Transmission'
  },
  {
    id: 'b3',
    title: 'Instant Cash for Spare Parts',
    subtitle: 'Have unused car lights, bumpers or alloy wheels? List & sell in 60s!',
    badge: 'Free Seller Ad',
    gradient: 'from-emerald-700 via-teal-700 to-cyan-800',
    cta: 'Sell Parts Now',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    category: 'Headlights, Tail Lights & Indicators'
  }
];

interface BannerCarouselProps {
  onBannerClick: (category: string) => void;
  onOpenSell: () => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onBannerClick, onOpenSell }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const banner = BANNERS[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-md border border-slate-200/80 dark:border-slate-800 my-2.5 group">
      <div className={`relative min-h-[140px] sm:min-h-[160px] bg-gradient-to-r ${banner.gradient} px-4 py-4 sm:px-6 sm:py-5 text-white transition-all duration-500 flex items-center justify-between gap-3`}>
        
        {/* Background Image Texture */}
        <div className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url(${banner.image})` }} />

        {/* Content Section with Controlled Width to Avoid Text Overlap */}
        <div className="relative z-10 flex-1 min-w-0 pr-2 pl-4 sm:pl-6 space-y-1 sm:space-y-1.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase text-amber-300 border border-white/10">
            <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
            <span className="truncate">{banner.badge}</span>
          </div>

          <h2 className="text-sm sm:text-lg font-black leading-tight drop-shadow-xs line-clamp-1">
            {banner.title}
          </h2>

          <p className="text-[11px] sm:text-xs text-blue-100/90 font-medium line-clamp-2 leading-snug">
            {banner.subtitle}
          </p>

          <button
            onClick={() => banner.cta.includes('Sell') ? onOpenSell() : onBannerClick(banner.category)}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>{banner.cta}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Thumbnail Image - Scales gracefully on mobile */}
        <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 shrink-0 transform rotate-1 hidden xs:block">
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
        </div>

        {/* Chevron Controls */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity z-20 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity z-20 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

