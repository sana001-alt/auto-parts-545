import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Zap, 
  Tag, 
  ShieldCheck, 
  Truck, 
  Bike, 
  Tractor, 
  Clock, 
  RefreshCw, 
  ChevronRight, 
  Star, 
  Award,
  Layers,
  ArrowDownCircle,
  MessageCircle
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

// Simulated Top Verified Hub Sellers
const VERIFIED_SELLERS = [
  {
    id: 's1',
    name: 'Mayapuri Motors Hub',
    city: 'New Delhi',
    rating: 4.9,
    reviews: 420,
    specialty: 'Engine & Gearbox Specialist',
    verifiedSince: '2021',
    badge: 'Super Merchant',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's2',
    name: 'Karol Bagh Auto Electricals',
    city: 'Delhi NCR',
    rating: 4.8,
    reviews: 310,
    specialty: 'LED Lights, ECU & Sensors',
    verifiedSince: '2022',
    badge: 'Verified Dealer',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's3',
    name: 'Pudupet Spares Chennai',
    city: 'Chennai, TN',
    rating: 4.9,
    reviews: 580,
    specialty: 'Commercial & Tractor Engines',
    verifiedSince: '2020',
    badge: 'Gold Seller',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 's4',
    name: 'Opera House Alloys & Tyres',
    city: 'Mumbai, MH',
    rating: 4.8,
    reviews: 260,
    specialty: 'Original OEM Alloy Wheels',
    verifiedSince: '2023',
    badge: 'Alloy Specialist',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  }
];

export const MarketplaceHomeScreen: React.FC<MarketplaceHomeScreenProps> = ({
  listings,
  favorites,
  onToggleFavorite,
  onOpenListingDetail,
  onStartChatWithSeller,
  onOpenCategory,
  onOpenVehicleType,
  recentlyViewedIds,
  onClearRecentlyViewed,
  onOpenSell,
  selectedCategory,
  selectedVehicleType,
  showFavoritesOnly
}) => {
  // Pull-to-refresh & Shimmer loading simulation state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(12);

  // Pull-to-refresh handler
  const handlePullToRefresh = () => {
    setIsRefreshing(true);
    setRefreshSuccessMessage(false);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshSuccessMessage(true);
      setTimeout(() => setRefreshSuccessMessage(false), 2500);
    }, 900);
  };

  // Categorized item filtering
  const trendingParts = listings.slice(0, 6);
  const recommendedParts = listings.slice(0, visibleItemsCount);
  const nearbyParts = listings.filter((_, i) => i % 2 === 0).slice(0, 6);
  const newlyAddedParts = [...listings].reverse().slice(0, 6);
  const bestDealsParts = listings.filter((l) => l.isNegotiable || l.price < 8000).slice(0, 6);

  // Vehicle Specific Sub-Groups
  const commercialParts = listings.filter((l) => 
    l.vehicleType?.includes('Commercial') || l.title.toLowerCase().includes('truck') || l.title.toLowerCase().includes('eicher') || l.title.toLowerCase().includes('tata')
  );
  const bikeParts = listings.filter((l) => 
    l.vehicleType?.includes('Two Wheeler') || l.title.toLowerCase().includes('bike') || l.title.toLowerCase().includes('bullet') || l.title.toLowerCase().includes('ktm') || l.title.toLowerCase().includes('activa')
  );
  const tractorParts = listings.filter((l) => 
    l.vehicleType?.includes('Tractor') || l.title.toLowerCase().includes('tractor') || l.title.toLowerCase().includes('mahindra') || l.title.toLowerCase().includes('swaraj')
  );

  const recentlyViewedListings = recentlyViewedIds
    .map((id) => listings.find((l) => l.id === id))
    .filter((l): l is Listing => Boolean(l));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in select-none">

      {/* PULL TO REFRESH TRIGGER BAR */}
      <div className="flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
            {isRefreshing ? 'Syncing latest live marketplace deals...' : 'Swipe down or tap to refresh'}
          </span>
        </div>
        <button
          onClick={handlePullToRefresh}
          disabled={isRefreshing}
          className="text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3 py-1 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          {isRefreshing ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* REFRESH TOAST NOTIFICATION */}
      {refreshSuccessMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-lg text-center animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" /> Updated with 100% verified auto market listings!
        </div>
      )}

      {/* SHIMMER SKELETON STATE DURING REFRESH */}
      {isRefreshing ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-3xl p-3 space-y-3 animate-pulse border border-slate-200 dark:border-slate-800">
              <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* BANNER CAROUSEL */}
          {!showFavoritesOnly && (
            <BannerCarousel
              onBannerClick={(cat) => onOpenCategory(cat)}
              onOpenSell={onOpenSell}
            />
          )}

          {/* 1. 🕒 RECENTLY VIEWED PARTS */}
          {recentlyViewedListings.length > 0 && !showFavoritesOnly && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-4 h-4 text-indigo-500" /> Recently Viewed
                </h2>
                <button
                  onClick={onClearRecentlyViewed}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear History
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {recentlyViewedListings.map((rv) => (
                  <div
                    key={rv.id}
                    onClick={() => onOpenListingDetail(rv)}
                    className="w-36 shrink-0 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-500 transition-all space-y-1 group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img src={rv.images[0]} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-md text-amber-400 text-[9px] font-bold rounded-md">
                        ₹{rv.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{rv.title}</p>
                    <p className="text-[9px] text-slate-400 truncate">{rv.location.city}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 2. 🔥 TRENDING PARTS */}
          {!showFavoritesOnly && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <TrendingUp className="w-4 h-4 text-amber-500" /> 🔥 Trending Auto Parts
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold">High inquiry speed in Indian wholesale hubs</p>
                </div>
                <button 
                  onClick={() => onOpenCategory('')}
                  className="text-[11px] font-extrabold text-amber-500 hover:underline flex items-center gap-0.5"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trendingParts.slice(0, 4).map((listing) => (
                  <ListingCard
                    key={`trending_${listing.id}`}
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
            </section>
          )}

          {/* 3. 🏷️ BEST DEALS & BARGAINS */}
          {!showFavoritesOnly && bestDealsParts.length > 0 && (
            <section className="p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-3xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Discount Zone
                  </span>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
                    <Tag className="w-4 h-4 text-amber-500" /> Best Deals & Negotiable Prices
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {bestDealsParts.slice(0, 2).map((listing) => (
                  <ListingCard
                    key={`deal_${listing.id}`}
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
            </section>
          )}

          {/* 4. 🛡️ VERIFIED SELLERS SPOTLIGHT */}
          {!showFavoritesOnly && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Auto Hubs
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold">100% On-site inspected stockists & scrap yards</p>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                {VERIFIED_SELLERS.map((seller) => (
                  <div
                    key={seller.id}
                    className="w-56 shrink-0 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={seller.photo} alt={seller.name} className="w-10 h-10 rounded-xl object-cover border border-emerald-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-1">
                          {seller.name}
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{seller.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl font-bold">
                      <span className="text-amber-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {seller.rating} ({seller.reviews})
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{seller.badge}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{seller.specialty}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. 🚚 COMMERCIAL VEHICLE PARTS */}
          {!showFavoritesOnly && commercialParts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Truck className="w-4 h-4 text-blue-500" /> Commercial Vehicle Spares
                </h2>
                <button onClick={() => onOpenVehicleType('Commercial (Truck/Bus/Auto)')} className="text-[11px] font-extrabold text-amber-500 hover:underline">
                  See All →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {commercialParts.slice(0, 2).map((listing) => (
                  <ListingCard
                    key={`comm_${listing.id}`}
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
            </section>
          )}

          {/* 6. 🏍️ BIKE & SCOOTER PARTS */}
          {!showFavoritesOnly && bikeParts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Bike className="w-4 h-4 text-rose-500" /> Bike & Two-Wheeler Parts
                </h2>
                <button onClick={() => onOpenVehicleType('Two Wheeler (Bike/Scooter)')} className="text-[11px] font-extrabold text-amber-500 hover:underline">
                  See All →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {bikeParts.slice(0, 2).map((listing) => (
                  <ListingCard
                    key={`bike_${listing.id}`}
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
            </section>
          )}

          {/* 7. 🚜 TRACTOR & AGRICULTURAL PARTS */}
          {!showFavoritesOnly && tractorParts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Tractor className="w-4 h-4 text-emerald-500" /> Tractor & Agri Machinery
                </h2>
                <button onClick={() => onOpenVehicleType('Tractor & Agri Equipment')} className="text-[11px] font-extrabold text-amber-500 hover:underline">
                  See All →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {tractorParts.slice(0, 2).map((listing) => (
                  <ListingCard
                    key={`trac_${listing.id}`}
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
            </section>
          )}

          {/* 8. 🌟 RECOMMENDED FOR YOU (MAIN FEED) */}
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Recommended For You
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold">
                  {listings.length} verified items listed across India
                </p>
              </div>
            </div>

            {recommendedParts.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs space-y-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Layers className="w-10 h-10 text-amber-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No spare parts match your selected filters.</p>
                <button onClick={() => onOpenCategory('')} className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs">
                  Reset Category Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recommendedParts.map((listing) => (
                  <ListingCard
                    key={`rec_${listing.id}`}
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

            {/* INFINITE SCROLL / LOAD MORE BUTTON */}
            {recommendedParts.length < listings.length && (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setVisibleItemsCount((prev) => prev + 8)}
                  className="w-full py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-500 font-black text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ArrowDownCircle className="w-4 h-4 text-amber-500" /> Load More Recommended Parts
                </button>
              </div>
            )}
          </section>
        </>
      )}

    </div>
  );
};
