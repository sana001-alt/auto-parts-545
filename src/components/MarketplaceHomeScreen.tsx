import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Clock, 
  Layers, 
  ArrowDownCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Listing } from '../types';
import { ListingCard } from './ListingCard';
import { BannerCarousel } from './BannerCarousel';

interface MarketplaceHomeScreenProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenListingDetail: (listing: Listing) => void;
  onStartChatWithSeller: (listing: Listing) => void;
  onOpenCategory: (cat: string) => void;
  onOpenVehicleType: (vt: string) => void;
  recentlyViewedIds: string[];
  onClearRecentlyViewed: () => void;
  onOpenSell: () => void;
  selectedCategory: string;
  selectedVehicleType: string;
  showFavoritesOnly: boolean;
}

export const MarketplaceHomeScreen: React.FC<MarketplaceHomeScreenProps> = ({
  listings,
  favorites,
  onToggleFavorite,
  onOpenListingDetail,
  onStartChatWithSeller,
  onOpenCategory,
  recentlyViewedIds,
  onClearRecentlyViewed,
  onOpenSell,
  showFavoritesOnly
}) => {
  const [visibleItemsCount, setVisibleItemsCount] = useState(20);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number>(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleItemsCount((prev) => Math.min(prev + 20, listings.length));
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [listings.length]);

  // Touch pull-to-refresh implementation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY.current > 0) {
      const currentY = e.touches[0].clientY;
      if (currentY - touchStartY.current > 70 && !isRefreshing) {
        setIsPulling(true);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling) {
      setIsPulling(false);
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
    touchStartY.current = 0;
  };

  const recentlyViewedListings = recentlyViewedIds
    .map((id) => listings.find((l) => l.id === id))
    .filter((l): l is Listing => Boolean(l));

  const displayedListings = listings.slice(0, visibleItemsCount);

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="space-y-3 pb-16 animate-in fade-in select-none max-w-7xl mx-auto px-2 sm:px-3"
    >
      {/* PULL TO REFRESH INDICATOR */}
      {(isPulling || isRefreshing) && (
        <div className="flex items-center justify-center gap-2 py-2 text-cyan-500 font-extrabold text-xs animate-in slide-in-from-top duration-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{isRefreshing ? 'Refreshing listings...' : 'Release to refresh'}</span>
        </div>
      )}

      {/* SINGLE HERO BANNER */}
      {!showFavoritesOnly && (
        <BannerCarousel
          onBannerClick={(cat) => onOpenCategory(cat)}
          onOpenSell={onOpenSell}
        />
      )}

      {/* RECENTLY VIEWED ROW */}
      {recentlyViewedListings.length > 0 && !showFavoritesOnly && (
        <section className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-cyan-500" /> Recently Viewed
            </h2>
            <button
              onClick={onClearRecentlyViewed}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {recentlyViewedListings.map((rv) => (
              <div
                key={`rv_${rv.id}`}
                onClick={() => onOpenListingDetail(rv)}
                className="w-28 shrink-0 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-cyan-500 transition-all space-y-0.5 group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  <img src={rv.images[0]} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-black/75 backdrop-blur-xs text-amber-400 text-[8px] font-bold rounded">
                    ₹{rv.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{rv.title}</p>
                <p className="text-[8px] text-slate-400 truncate">{rv.location.district || rv.location.city || rv.location.state}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MAIN OLX RECOMMENDATIONS GRID */}
      <section className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              {showFavoritesOnly ? 'Saved Favorites' : 'Fresh Recommendations'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold">
              Showing {displayedListings.length} of {listings.length} verified listings
            </p>
          </div>
        </div>

        {/* COMPACT 2-COLUMN GRID ON MOBILE */}
        {displayedListings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs space-y-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
            <Layers className="w-10 h-10 text-cyan-500 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No spare parts match your active search / location filter.</p>
            <button onClick={() => onOpenCategory('')} className="px-4 py-2 bg-cyan-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2">
            {displayedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.includes(listing.id)}
                onToggleFavorite={(e) => onToggleFavorite(listing.id, e)}
                onClick={() => onOpenListingDetail(listing)}
                onQuickChat={(e) => {
                  e.stopPropagation();
                  onStartChatWithSeller(listing);
                }}
              />
            ))}
          </div>
        )}

        {/* INFINITE SCROLL SENTINEL & LOAD MORE BUTTON */}
        {displayedListings.length < listings.length && (
          <div ref={loadMoreRef} className="pt-3 text-center">
            <button
              onClick={() => setVisibleItemsCount((prev) => Math.min(prev + 20, listings.length))}
              className="w-full sm:w-auto px-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-cyan-500 font-extrabold text-xs rounded-xl shadow-2xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <ArrowDownCircle className="w-4 h-4 text-cyan-500" />
              Load More Listings ({listings.length - displayedListings.length} remaining)
            </button>
          </div>
        )}
      </section>

    </div>
  );
};
