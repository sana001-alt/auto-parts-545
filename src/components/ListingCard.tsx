import React from 'react';
import { Heart, MapPin, ShieldCheck, MessageCircle, Image as ImageIcon } from 'lucide-react';
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

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer transform active:scale-[0.98] relative h-full"
    >
      <div>
        {/* Main Image Container - Compact Aspect Ratio for Max Listings Density */}
        <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Condition & Verified Badges (Top Left) */}
          <div className="absolute top-1 left-1 z-10 flex items-center gap-0.5 flex-wrap max-w-[75%]">
            <span className="text-[7.5px] font-black px-1 py-0.2 rounded bg-slate-950/85 text-white backdrop-blur-xs uppercase tracking-wider">
              {listing.condition.includes('Brand New') ? 'NEW' : listing.condition.split(' ')[0]}
            </span>
            {listing.sellerVerified && (
              <span className="p-0.2 rounded bg-emerald-500 text-white flex items-center gap-0.5 text-[7.5px] font-black px-1" title="Verified Merchant">
                <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
              </span>
            )}
          </div>

          {/* Photo Count Badge (Bottom Left) */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-1 left-1 z-10 px-1 py-0.2 rounded bg-black/60 backdrop-blur-xs text-white text-[7.5px] font-bold flex items-center gap-0.5">
              <ImageIcon className="w-2.5 h-2.5 text-cyan-400" />
              <span>{listing.images.length}</span>
            </div>
          )}

          {/* Heart Favorite Toggle (Top Right) */}
          <button
            onClick={onToggleFavorite}
            aria-label="Toggle favorite"
            className={`absolute top-1 right-1 z-10 p-1 rounded-full backdrop-blur-xs transition-all active:scale-90 cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500 text-white shadow-xs' 
                : 'bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white'
            }`}
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Sold Overlay */}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="bg-rose-600 text-white font-black text-[9px] uppercase tracking-widest px-2 py-0.5 rounded shadow-xs">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Card Content Details */}
        <div className="p-2 space-y-0.5">
          
          {/* Price & Negotiable Badge */}
          <div className="flex items-center justify-between gap-1">
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight">
              ₹ {formattedPrice}
            </div>
            {listing.isNegotiable && (
              <span className="text-[7.5px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider shrink-0 bg-amber-50 dark:bg-amber-950/80 px-1 py-0.2 rounded border border-amber-200/50 dark:border-amber-800/50">
                NEGOTIABLE
              </span>
            )}
          </div>

          {/* Title - Strict 2 lines with ellipsis */}
          <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
            {listing.title}
          </h3>

          {/* Vehicle Compatibility Row */}
          {(listing.make || listing.model) && (
            <div className="text-[8.5px] text-slate-500 dark:text-slate-400 font-semibold truncate pt-0.2">
              {listing.make} {listing.model}
            </div>
          )}

        </div>
      </div>

      {/* Card Footer: Location & Quick Chat CTA */}
      <div className="px-2 py-1 text-[8.5px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 bg-slate-50/50 dark:bg-slate-900/50">
        <span className="flex items-center gap-0.5 font-medium truncate min-w-0 flex-1">
          <MapPin className="w-2.5 h-2.5 text-cyan-500 shrink-0" />
          <span className="truncate">{listing.location.district || listing.location.city || listing.location.state || 'India'} • {timeAgo(listing.createdAt)}</span>
        </span>

        {/* Quick Chat Button */}
        {onQuickChat && (
          <button
            onClick={onQuickChat}
            className="px-1.5 py-0.2 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black rounded text-[8px] flex items-center gap-0.5 cursor-pointer transition-all shrink-0 shadow-2xs"
            title="Chat directly with seller"
          >
            <MessageCircle className="w-2.5 h-2.5" /> Chat
          </button>
        )}
      </div>

    </div>
  );
};


