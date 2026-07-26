import React, { useState, useRef } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Heart, 
  Share2, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Video,
  Eye,
  Award,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Loader2
} from 'lucide-react';
import { Listing, UserProfile } from '../types';
import { LocationMap } from './LocationMap';
import { reportListingInFirestore } from '../lib/firebase';

interface ListingDetailModalProps {
  listing: Listing;
  currentUser: UserProfile | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onStartChat: () => void;
  onClose: () => void;
  onMakeOfferSubmit?: (amount: number) => void;
  onReportListing?: (listingId: string, reason: string) => void;
  allListings?: Listing[];
  onSelectRecommended?: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  currentUser,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onClose,
  onMakeOfferSubmit,
  onReportListing,
  allListings = [],
  onSelectRecommended
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious or fake spare part ad');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [offerPriceInput, setOfferPriceInput] = useState(Math.round(listing.price * 0.9));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Fullscreen Zoom & Pan States
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Swipe Gesture Ref & States for Main Image Gallery
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const formattedPrice = new Intl.NumberFormat('en-IN').format(listing.price);
  const formattedDate = new Date(listing.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out ${listing.title} for ₹${formattedPrice} on AutoParts India`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const cleanPhone = listing.sellerPhone ? listing.sellerPhone.replace(/[^0-9]/g, '') : '';
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(`Hi, I am interested in your spare part listing on AutoParts India: ${listing.title} (₹${formattedPrice}). Is it still available?`)}`
    : '';

  // Touch Swipe Handlers for Gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && listing.images.length > 1) {
      setSelectedImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0));
      setImageLoaded(false);
    }
    if (isRightSwipe && listing.images.length > 1) {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1));
      setImageLoaded(false);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Double Tap Zoom in Full Screen
  const handleDoubleTapFullScreen = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanPosition({ x: 0, y: 0 });
    } else {
      setZoomScale(2.5);
    }
  };

  // Pan Handlers in Fullscreen Zoom
  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDraggingPan(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (!isDraggingPan || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpPan = () => {
    setIsDraggingPan(false);
  };

  const handleCopyPhone = () => {
    if (listing.sellerPhone) {
      navigator.clipboard.writeText(listing.sellerPhone);
      showToast(`Phone number copied: ${listing.sellerPhone}`);
    }
  };

  const handleReportSubmit = async () => {
    if (currentUser) {
      await reportListingInFirestore(listing.id, listing.title, currentUser.uid, reportReason);
    }
    if (onReportListing) {
      onReportListing(listing.id, reportReason);
    }
    setReportSubmitted(true);
  };

  return (
    <div className="absolute inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden select-none">
      <div className="bg-white dark:bg-slate-950 w-full h-full flex flex-col overflow-hidden">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* App Bar Navigation Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="truncate">
              <h2 className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                {listing.title}
              </h2>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                {listing.category} • {listing.location.city || listing.location.district}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm scale-105' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from Saved' : 'Save Listing'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Share Listing"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
              title="Report Ad"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-20 p-3 sm:p-5">
          
          {/* Media Header (Gallery & Video Switcher) */}
          <div className="space-y-2">
            {listing.videoUrl && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setActiveMedia('image')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    activeMedia === 'image'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Photos ({listing.images.length})
                </button>
                <button
                  onClick={() => setActiveMedia('video')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    activeMedia === 'video'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-amber-400" /> Video Demo
                </button>
              </div>
            )}

            {activeMedia === 'image' ? (
              <div 
                className="relative aspect-[4/3] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group shadow-inner touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Image Skeleton / Loading Spinner */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                )}

                <img
                  src={listing.images[selectedImageIndex] || listing.images[0]}
                  alt={listing.title}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  className={`w-full h-full object-contain cursor-zoom-in transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onClick={() => setShowFullScreenImage(true)}
                />

                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-md">
                    {listing.category}
                  </span>
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Tested OK
                  </span>
                </div>

                <button
                  onClick={() => setShowFullScreenImage(true)}
                  className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full backdrop-blur-md opacity-80 hover:opacity-100 cursor-pointer"
                  title="Fullscreen Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Prev/Next Gallery Navigation */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1));
                        setImageLoaded(false);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0));
                        setImageLoaded(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white p-2 rounded-full backdrop-blur-md transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[11px] font-black px-2.5 py-1 rounded-full backdrop-blur-md">
                  {selectedImageIndex + 1} / {listing.images.length}
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
                <iframe
                  src={listing.videoUrl}
                  title="Part Video Demo"
                  className="w-full h-full rounded-xl"
                  allowFullScreen
                />
              </div>
            )}

            {/* Thumbnail Strip */}
            {listing.images.length > 1 && activeMedia === 'image' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setImageLoaded(false);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === idx 
                        ? 'border-blue-600 scale-105 shadow-md' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Material Card */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                ₹{formattedPrice}
              </div>
              {listing.isNegotiable && (
                <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
                  Negotiable
                </span>
              )}
            </div>

            <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
              {listing.title}
            </h1>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {listing.location.city || listing.location.district}, {listing.location.state}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-slate-400" /> {listing.views || 14} views</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Key Part Specifications Table */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Overview & Fitment Specs</span>
              <span className="text-[10px] text-blue-600 font-bold">OEM Guaranteed</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Vehicle Brand / Make</span>
                <span className="font-bold text-slate-900 dark:text-white">{listing.make}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Model & Year</span>
                <span className="font-bold text-slate-900 dark:text-white">{listing.model} ({listing.year})</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Condition Grade</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{listing.condition}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Part Code / OEM Number</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{listing.partNumber || 'Verified Match'}</span>
              </div>
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={listing.sellerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.sellerName}`}
                  alt={listing.sellerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-600 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{listing.sellerName}</h4>
                    {listing.sellerVerified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified Merchant" />
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" /> Verified Auto Merchant (Mayapuri / Kurla)
                  </p>
                  <p className="text-[10px] text-slate-400">Member since 2023 • 98% Positive Feedback</p>
                </div>
              </div>

              <button
                onClick={onStartChat}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-xs rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Chat Seller
              </button>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Detailed Description</h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Location Map View */}
          <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" /> Seller Location Map
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Pincode: {listing.location.pincode || '110064'}</span>
            </div>
            
            <LocationMap
              lat={listing.location.lat || 28.6139}
              lng={listing.location.lng || 77.2090}
              addressName={`${listing.location.city || listing.location.district}, ${listing.location.state}`}
              className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
            />
          </div>

          {/* Recommended Parts Section */}
          {allListings.filter(item => item.id !== listing.id && (item.category === listing.category || item.make === listing.make)).length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Recommended Similar Parts
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {allListings
                  .filter(item => item.id !== listing.id && (item.category === listing.category || item.make === listing.make))
                  .slice(0, 4)
                  .map(rec => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectRecommended && onSelectRecommended(rec)}
                      className="bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all space-y-1 group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-900">
                        <img src={rec.images[0]} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <p className="text-xs font-black text-blue-600 dark:text-blue-400">₹{rec.price.toLocaleString('en-IN')}</p>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{rec.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Buyer Safety Tips */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Spare Part Verification Safety Tips</p>
              <p className="text-[11px] opacity-90">
                Verify OEM part numbers with your mechanic before payment. Inspect used engine cylinder heads & gearboxes in person at Mayapuri or Kurla before dispatch.
              </p>
            </div>
          </div>

        </div>

        {/* STICKY BOTTOM ACTION BAR (Native OLX Android Experience) */}
        <div className="fixed sm:sticky bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 border-t border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-2">
          
          <button
            onClick={() => setShowOfferModal(true)}
            className="flex-1 py-3 px-2 sm:px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4 text-amber-500" />
            <span>Make Offer</span>
          </button>

          <button
            onClick={onStartChat}
            className="flex-1 py-3 px-2 sm:px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}

          {listing.sellerPhone ? (
            <a
              href={`tel:${listing.sellerPhone}`}
              className="py-3 px-3.5 rounded-2xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span className="hidden sm:inline">Call</span>
            </a>
          ) : (
            <button
              onClick={handleCopyPhone}
              className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-300 dark:border-slate-700"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Full Screen Pinch & Double-Tap Zoom Lightbox */}
      {showFullScreenImage && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 animate-in fade-in">
          
          <div className="w-full flex items-center justify-between text-white z-10">
            <span className="text-xs font-bold">{selectedImageIndex + 1} / {listing.images.length}</span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.5, 4))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.5, 1))}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setZoomScale(1); setPanPosition({ x: 0, y: 0 }); }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => { setShowFullScreenImage(false); setZoomScale(1); setPanPosition({ x: 0, y: 0 }); }} 
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable & Pannable Image Stage */}
          <div 
            className="relative flex-1 w-full flex items-center justify-center p-2 overflow-hidden cursor-grab active:cursor-grabbing"
            onDoubleClick={handleDoubleTapFullScreen}
            onMouseDown={handleMouseDownPan}
            onMouseMove={handleMouseMovePan}
            onMouseUp={handleMouseUpPan}
          >
            <img
              src={listing.images[selectedImageIndex]}
              alt="Fullscreen Zoom"
              style={{
                transform: `scale(${zoomScale}) translate(${panPosition.x / zoomScale}px, ${panPosition.y / zoomScale}px)`,
                transition: isDraggingPan ? 'none' : 'transform 0.2s ease-out'
              }}
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none"
            />
          </div>

          <div className="text-[11px] text-slate-400 mb-2">Double-tap image or scroll to zoom & pan</div>

          {listing.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto p-2 no-scrollbar max-w-full z-10">
              {listing.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setZoomScale(1);
                    setPanPosition({ x: 0, y: 0 });
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${selectedImageIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Make an Offer Screen View */}
      {showOfferModal && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col h-full w-full p-4 overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowOfferModal(false)}
              className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" /> Make Price Offer
            </h3>
            <div className="w-8" />
          </div>

          <div className="py-6 space-y-5 max-w-sm mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 space-y-1 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Listed Price</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">₹{formattedPrice}</p>
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{listing.title}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Your Proposed Price (₹)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-blue-600 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 text-lg font-black bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  if (onMakeOfferSubmit) onMakeOfferSubmit(offerPriceInput);
                  onStartChat();
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Submit & Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Listing Screen View */}
      {showReportModal && (
        <div className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col h-full w-full p-4 overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowReportModal(false)}
              className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <h3 className="text-sm font-black text-rose-600 flex items-center gap-2">
              <Flag className="w-4 h-4" /> Report Listing
            </h3>
            <div className="w-8" />
          </div>

          <div className="py-6 space-y-4 max-w-sm mx-auto w-full flex-1">
            {reportSubmitted ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-3xl text-xs text-emerald-800 dark:text-emerald-200 space-y-3 text-center my-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="font-bold text-sm">Listing Reported to Moderators</p>
                <p className="text-xs leading-relaxed">Thank you for keeping AutoParts India safe. Our verification team will investigate this ad within 24 hours.</p>
                <button
                  onClick={() => { setShowReportModal(false); setReportSubmitted(false); }}
                  className="mt-3 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl cursor-pointer"
                >
                  Return to Listing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Select reason for reporting <strong>{listing.title}</strong>:
                </p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 font-medium outline-none text-slate-900 dark:text-white"
                >
                  <option value="Suspicious or fake spare part ad">Suspicious or fake spare part ad</option>
                  <option value="Inaccurate part fitment or model details">Inaccurate part fitment or model details</option>
                  <option value="Unreachable or abusive seller">Unreachable or abusive seller</option>
                  <option value="Prohibited or stolen part">Prohibited or stolen part</option>
                </select>

                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReportSubmit}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};


