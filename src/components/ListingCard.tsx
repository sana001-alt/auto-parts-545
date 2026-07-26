import React from 'react';
import { Heart, MapPin, ShieldCheck, MessageCircle, Star, Image as ImageIcon } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
  onQuickChat?: (e: React.MouseEvent) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onClick,
  onQuickChat
}) => {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(listing.price);

  const timeAgo = (dateStr: string) => {
    try {
      const diffDays = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return 'Recently';
    } catch {
      return 'Recently';
    }
  };

  // Simulated distance based on ID hash for realistic native feel
  const simulatedDistance = `${((listing.title.length * 3 + 7) % 18 / 10 + 0.8).toFixed(1)} km`;

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 active:scale-[0.98] relative"
    >
      <div>
        {/* Main Image Container */}
        <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Condition & Verified Badges (Top Left) */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap max-w-[70%]">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-slate-950/85 text-white backdrop-blur-md shadow-xs uppercase tracking-wider">
              {listing.condition.includes('Brand New') ? 'NEW' : listing.condition.split(' ')[0]}
            </span>
            {listing.sellerVerified && (
              <span className="p-1 rounded-lg bg-emerald-500 text-white shadow-xs flex items-center gap-0.5 text-[9px] font-black px-1.5" title="Verified Merchant">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </span>
            )}
          </div>

          {/* Photo Count Badge (Bottom Left) */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-cyan-400" />
              <span>{listing.images.length}</span>
            </div>
          )}

          {/* Distance Tag (Bottom Right Image) */}
          <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-extrabold flex items-center gap-0.5">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>{simulatedDistance}</span>
          </div>

          {/* Heart Favorite Toggle (Top Right) */}
          <button
            onClick={onToggleFavorite}
            aria-label="Toggle favorite"
            className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500 text-white shadow-md' 
                : 'bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Sold Overlay */}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="bg-rose-600 text-white font-black text-xs uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Card Content Details */}
        <div className="p-3 space-y-1.5">
          
          {/* Price & Negotiable Badge */}
          <div className="flex items-center justify-between gap-1">
            <div className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              ₹ {formattedPrice}
            </div>
            {listing.isNegotiable && (
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider shrink-0 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                NEGOTIABLE
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
            {listing.title}
          </h3>

          {/* Vehicle Compatibility & Rating Row */}
          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
            <span className="truncate">{listing.make} {listing.model}</span>
            <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>4.8</span>
            </span>
          </div>

        </div>
      </div>

      {/* Card Footer: Location & Quick Chat CTA */}
      <div className="px-3 py-2 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="flex items-center gap-1 font-medium truncate min-w-0 flex-1">
          <MapPin className="w-3 h-3 text-cyan-500 shrink-0" />
          <span className="truncate">{listing.location.district || listing.location.city} • {timeAgo(listing.createdAt)}</span>
        </span>

        {/* Quick Chat Button */}
        {onQuickChat && (
          <button
            onClick={onQuickChat}
            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 font-black rounded-xl text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-xs shrink-0"
            title="Chat directly with seller"
          >
            <MessageCircle className="w-3 h-3" /> Chat
          </button>
        )}
      </div>

    </div>
  );
};


