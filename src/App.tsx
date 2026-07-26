import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OlxHeader } from './components/OlxHeader';
import { OlxCategoryGrid } from './components/OlxCategoryGrid';
import { BottomNav } from './components/BottomNav';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { AddEditListingModal } from './components/AddEditListingModal';
import { ChatView } from './components/ChatView';
import { UserProfileView } from './components/UserProfileView';
import { AuthScreen } from './components/AuthScreen';
import { CloudinarySettingsModal } from './components/CloudinarySettingsModal';
import { OlxFilterModal } from './components/OlxFilterModal';
import { EnhancedSearchModal } from './components/EnhancedSearchModal';
import { SplashScreen } from './components/SplashScreen';
import { BannerCarousel } from './components/BannerCarousel';
import { MarketplaceHomeScreen } from './components/MarketplaceHomeScreen';
import { filterListings } from './utils/searchEngine';

import { Listing, UserProfile, AppNotification } from './types';
import { doc, setDoc } from 'firebase/firestore';
import { 
  subscribeToListings, 
  createListingInFirestore, 
  updateListingInFirestore, 
  deleteListingFromFirestore, 
  incrementListingViews,
  getOrCreateChat,
  sendChatMessage,
  onAuthStateChanged,
  auth,
  db,
  getUserProfile,
  logoutUser
} from './lib/firebase';
import { INITIAL_SAMPLE_LISTINGS } from './data/sampleListings';
import { 
  Sparkles, 
  PackageSearch, 
  Bell, 
  X, 
  SlidersHorizontal,
  PlusCircle,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('autoparts_seen_splash');
    } catch {
      return true;
    }
  });

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem('autoparts_seen_splash', 'true');
    } catch {
      // Ignore
    }
    setShowSplash(false);
  };

  // Recently Viewed Listings state
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autoparts_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_mode') === 'dark' || true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  }, [darkMode]);

  // Auth & User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
        } else {
          setCurrentUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Auto Trader',
            email: firebaseUser.email || 'trader@autopartsindia.in',
            verified: true,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'sell' | 'chats' | 'profile'>('home');

  // Realtime Firestore Listings
  const [listings, setListings] = useState<Listing[]>(INITIAL_SAMPLE_LISTINGS);

  useEffect(() => {
    const unsub = subscribeToListings((updatedListings) => {
      setListings(updatedListings);
    });
    return () => unsub();
  }, []);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autoparts_favorites');
      return saved ? JSON.parse(saved) : ['sp-101', 'sp-103'];
    } catch {
      return ['sp-101'];
    }
  });

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('autoparts_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      userId: 'user-1',
      title: 'Welcome to AutoParts India!',
      message: 'Explore verified used & OEM auto spare parts directly from Mayapuri, Kurla, Pudupet & verified sellers across India.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      userId: 'user-1',
      title: 'Price Drop Alert',
      message: 'Maruti Suzuki Swift Cylinder Head price updated to ₹34,500 in Mayapuri',
      type: 'price_drop',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);

  // Filters & Search Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'part' | 'oem' | 'brand' | 'model' | 'engine'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'popular'>('newest');

  // Modals State
  const [selectedListingDetail, setSelectedListingDetail] = useState<Listing | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [pendingTab, setPendingTab] = useState<'home' | 'search' | 'sell' | 'chats' | 'profile' | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatsTabKey, setChatsTabKey] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showCloudinarySettings, setShowCloudinarySettings] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleTabClick = (tab: 'home' | 'search' | 'sell' | 'chats' | 'profile') => {
    if (tab === 'search') {
      setShowSearchModal(true);
      return;
    }

    if (tab === 'sell') {
      if (!currentUser) {
        setPendingTab('sell');
        setShowAuthScreen(true);
        return;
      }
      handleOpenSellModal();
      return;
    }

    if ((tab === 'chats' || tab === 'profile') && !currentUser) {
      setPendingTab(tab);
      setShowAuthScreen(true);
      return;
    }

    if (tab === 'chats') {
      // Bottom "Chats" tab MUST always open the Recent Chats (Conversation List), regardless of screen.
      setActiveChatId(null);
      setChatsTabKey(prev => prev + 1);
    }

    setActiveTab(tab);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setShowAuthScreen(false);

    if (pendingTab) {
      const target = pendingTab;
      setPendingTab(null);
      if (target === 'sell') {
        setActiveTab('home');
        setEditingListing(null);
        setShowAddEditModal(true);
      } else if (target === 'chats') {
        setActiveChatId(null);
        setChatsTabKey(prev => prev + 1);
        setActiveTab('chats');
      } else {
        setActiveTab(target);
      }
    } else if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      action();
    } else {
      setActiveTab('profile');
    }
  };

  // Computed Filtered & Sorted Listings with Advanced Fuzzy Search Engine
  const filteredListings = useMemo(() => {
    let baseList = listings;

    if (showFavoritesOnly) {
      baseList = baseList.filter(item => favorites.includes(item.id));
    }

    const searched = filterListings(baseList, {
      searchQuery,
      searchType,
      vehicleType: selectedVehicleType,
      category: selectedCategory,
      condition: selectedCondition,
      state: selectedState,
      district: selectedDistrict,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      verifiedOnly
    });

    return searched.sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    listings, 
    searchQuery, 
    searchType, 
    selectedVehicleType, 
    selectedCategory, 
    selectedCondition, 
    selectedState, 
    selectedDistrict, 
    minPrice, 
    maxPrice, 
    verifiedOnly, 
    sortBy, 
    showFavoritesOnly, 
    favorites
  ]);

  // Handlers
  const handleOpenListingDetail = (listing: Listing) => {
    setSelectedListingDetail(listing);
    incrementListingViews(listing.id);
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter(id => id !== listing.id);
      const updated = [listing.id, ...filtered].slice(0, 8);
      localStorage.setItem('autoparts_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveListing = async (data: Omit<Listing, 'id' | 'createdAt' | 'views' | 'status'>) => {
    if (editingListing) {
      await updateListingInFirestore(editingListing.id, data);
    } else {
      await createListingInFirestore(data);
    }
    setShowAddEditModal(false);
    setEditingListing(null);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this spare part listing?')) {
      await deleteListingFromFirestore(listingId);
    }
  };

  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'sold' ? 'active' : 'sold';
    await updateListingInFirestore(listingId, { status: nextStatus });
  };

  const handleStartChatWithSeller = async (listing: Listing) => {
    if (!currentUser) {
      setPendingAction(() => () => handleStartChatWithSeller(listing));
      setShowAuthScreen(true);
      return;
    }

    const chatId = await getOrCreateChat(
      currentUser,
      { id: listing.sellerId, name: listing.sellerName, photo: listing.sellerPhoto },
      listing
    );

    setActiveChatId(chatId);
    setChatsTabKey(prev => prev + 1);
    setSelectedListingDetail(null);
    setActiveTab('chats');
  };

  const handleMakeOfferSubmit = async (listing: Listing, amount: number) => {
    if (!currentUser) {
      setPendingAction(() => () => handleMakeOfferSubmit(listing, amount));
      setShowAuthScreen(true);
      return;
    }
    const chatId = await getOrCreateChat(
      currentUser,
      { id: listing.sellerId, name: listing.sellerName, photo: listing.sellerPhoto },
      listing
    );
    await sendChatMessage(chatId, currentUser.uid, currentUser.displayName, `Proposed Offer Price: ₹${amount.toLocaleString('en-IN')}`, { offerPrice: amount });
    setActiveChatId(chatId);
    setChatsTabKey(prev => prev + 1);
    setSelectedListingDetail(null);
    setActiveTab('chats');
  };

  const handleReportListing = (listingId: string, reason: string) => {
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: currentUser?.uid || 'guest',
        title: 'Listing Report Submitted',
        message: `Thank you for reporting ad #${listingId.slice(-6)}. Reason: "${reason}". Our moderators are investigating.`,
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleOpenSellModal = () => {
    if (!currentUser) {
      setPendingTab('sell');
      setShowAuthScreen(true);
      return;
    }
    setEditingListing(null);
    setShowAddEditModal(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setCurrentUser(null);
      setActiveTab('home');
      setShowAuthScreen(true);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSearchType('all');
    setVerifiedOnly(false);
    setSelectedVehicleType('');
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedState('');
    setSelectedDistrict('');
    setMinPrice('');
    setMaxPrice('');
    setShowFavoritesOnly(false);
  };

  const myUserListings = listings.filter(l => currentUser && l.sellerId === currentUser.uid);
  const myFavoriteListings = listings.filter(l => favorites.includes(l.id));

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-0 sm:py-4 font-sans transition-colors duration-200 select-none overflow-hidden">
      
      {/* Animated Mobile Splash Screen (shown only once on initial app load) */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      
      {/* App Shell Container (Android Mobile Viewport Frame) */}
      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[92vh] sm:max-h-[920px] bg-slate-50 dark:bg-slate-950 shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 dark:sm:border-slate-800 text-slate-900 dark:text-slate-100">
        
        {/* Simulated Android Top Status Bar */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-black text-slate-800 dark:text-slate-200 select-none z-30 shrink-0">
          <span>11:45</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-md tracking-wider">5G</span>
            <span className="text-[10px]">98%</span>
          </div>
        </div>

        {/* Scrollable View Container */}
        <div className="flex-1 overflow-y-auto flex flex-col pb-16">
          {/* Top Header Bar */}
          <OlxHeader
            currentUser={currentUser}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            favoritesCount={favorites.length}
            unreadNotificationsCount={notifications.filter(n => !n.read).length}
            onOpenNotifications={() => setShowNotificationsModal(true)}
            onOpenFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            onOpenCloudinarySettings={() => setShowCloudinarySettings(true)}
            onOpenFiltersModal={() => setShowFiltersModal(true)}
            onOpenSearchModal={() => setShowSearchModal(true)}
            onOpenProfile={() => setActiveTab('account')}
          />

          {/* Category Icons Grid */}
          <OlxCategoryGrid
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedVehicleType={selectedVehicleType}
            setSelectedVehicleType={setSelectedVehicleType}
          />

        {/* MAIN BODY CONTENTS BY ACTIVE TAB */}
        <div className="flex-1 px-3 sm:px-4 py-3">

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <MarketplaceHomeScreen
              listings={filteredListings}
              favorites={favorites}
              onToggleFavorite={(id, e) => toggleFavorite(id, e)}
              onOpenListingDetail={(listing) => handleOpenListingDetail(listing)}
              onStartChatWithSeller={(listing) => handleStartChatWithSeller(listing)}
              onOpenCategory={(cat) => { setSelectedCategory(cat); setActiveTab('home'); }}
              onOpenVehicleType={(vt) => { setSelectedVehicleType(vt); setActiveTab('home'); }}
              recentlyViewedIds={recentlyViewedIds}
              onClearRecentlyViewed={() => {
                setRecentlyViewedIds([]);
                localStorage.removeItem('autoparts_recently_viewed');
              }}
              onOpenSell={handleOpenSellModal}
              selectedCategory={selectedCategory}
              selectedVehicleType={selectedVehicleType}
              showFavoritesOnly={showFavoritesOnly}
            />
          )}

          {/* SEARCH / EXPLORE TAB */}
          {activeTab === 'search' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Explore Spare Parts Market</span>
                  <button
                    onClick={() => setShowFiltersModal(true)}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> All Filters
                  </button>
                </h2>

                {/* Filter Options */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Search Keywords</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Swift Engine, Creta LED Headlight..."
                      className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); }}
                        className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none font-medium"
                      >
                        <option value="">All India</option>
                        <option value="Delhi NCR">Delhi NCR</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Punjab">Punjab</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-1">Vehicle</label>
                      <select
                        value={selectedVehicleType}
                        onChange={(e) => setSelectedVehicleType(e.target.value)}
                        className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 outline-none font-medium"
                      >
                        <option value="">All Vehicles</option>
                        <option value="Four Wheeler (Car)">Cars</option>
                        <option value="Two Wheeler (Bike/Scooter)">Bikes</option>
                        <option value="Commercial (Truck/Bus/Auto)">Trucks/Commercial</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorite={favorites.includes(listing.id)}
                    onToggleFavorite={(e) => toggleFavorite(listing.id, e)}
                    onClick={() => handleOpenListingDetail(listing)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CHATS TAB */}
          {activeTab === 'chats' && currentUser && (
            <div className="fixed inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden">
              <ChatView
                key={`chat_view_${chatsTabKey}`}
                currentUser={currentUser}
                initialChatId={activeChatId}
                onClose={() => setActiveTab('home')}
                onViewListing={(listingId) => {
                  const found = listings.find(l => l.id === listingId);
                  if (found) setSelectedListingDetail(found);
                }}
              />
            </div>
          )}

          {/* PROFILE / ACCOUNT TAB */}
          {activeTab === 'profile' && currentUser && (
            <div className="animate-in fade-in">
              <UserProfileView
                currentUser={currentUser}
                userListings={myUserListings}
                favorites={myFavoriteListings}
                notifications={notifications}
                allListings={listings}
                onEditListing={(item) => {
                  setEditingListing(item);
                  setShowAddEditModal(true);
                }}
                onDeleteListing={handleDeleteListing}
                onToggleListingStatus={handleToggleListingStatus}
                onSelectListing={(item) => setSelectedListingDetail(item)}
                onOpenAddListing={() => handleOpenSellModal()}
                onOpenChats={() => {
                  setActiveChatId(null);
                  setChatsTabKey(prev => prev + 1);
                  setActiveTab('chats');
                }}
                onUpdateProfile={async (updated) => {
                  if (currentUser) {
                    const merged = { ...currentUser, ...updated };
                    setCurrentUser(merged);
                    try {
                      await setDoc(doc(db, 'users', currentUser.uid), merged, { merge: true });
                    } catch (e) {
                      console.warn('Failed to sync profile update to Firestore:', e);
                    }
                  }
                }}
                onClose={() => setActiveTab('home')}
                onLogout={handleLogout}
              />
            </div>
          )}

        </div>

      </div>

      {/* BOTTOM NAVIGATION BAR (OLX SIGNATURE) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabClick}
        onOpenSellModal={handleOpenSellModal}
        isLoggedIn={!!currentUser}
        userAvatar={currentUser?.photoURL}
      />

      {/* FULL-SCREEN NATIVE PAGES WITH ANIMATED SLIDE TRANSITIONS */}
      <AnimatePresence>
        {/* Listing Detail Page */}
        {selectedListingDetail && (
          <motion.div
            key="listing-detail-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40"
          >
            <ListingDetailModal
              listing={selectedListingDetail}
              currentUser={currentUser}
              isFavorite={favorites.includes(selectedListingDetail.id)}
              onToggleFavorite={() => toggleFavorite(selectedListingDetail.id)}
              onStartChat={() => handleStartChatWithSeller(selectedListingDetail)}
              onClose={() => setSelectedListingDetail(null)}
              onMakeOfferSubmit={(amount) => handleMakeOfferSubmit(selectedListingDetail, amount)}
              onReportListing={handleReportListing}
              allListings={listings}
              onSelectRecommended={(rec) => setSelectedListingDetail(rec)}
            />
          </motion.div>
        )}

        {/* Add / Edit Listing Page */}
        {showAddEditModal && currentUser && (
          <motion.div
            key="add-edit-listing-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40"
          >
            <AddEditListingModal
              currentUser={currentUser}
              editingListing={editingListing}
              onSave={handleSaveListing}
              onClose={() => { setShowAddEditModal(false); setEditingListing(null); }}
            />
          </motion.div>
        )}

        {/* Cloudinary Settings Page */}
        {showCloudinarySettings && (
          <motion.div
            key="cloudinary-settings-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40"
          >
            <CloudinarySettingsModal onClose={() => setShowCloudinarySettings(false)} />
          </motion.div>
        )}

        {/* Enhanced Automotive Search Page */}
        {showSearchModal && (
          <motion.div
            key="search-modal-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40"
          >
            <EnhancedSearchModal
              isOpen={showSearchModal}
              onClose={() => setShowSearchModal(false)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchType={searchType}
              setSearchType={setSearchType}
              onApplySearch={(query, type) => {
                setSearchQuery(query);
                if (type) setSearchType(type);
                setShowSearchModal(false);
              }}
              onOpenFilters={() => {
                setShowSearchModal(false);
                setShowFiltersModal(true);
              }}
            />
          </motion.div>
        )}

        {/* Olx Filter Page */}
        {showFiltersModal && (
          <motion.div
            key="filters-modal-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40"
          >
            <OlxFilterModal
              isOpen={showFiltersModal}
              onClose={() => setShowFiltersModal(false)}
              selectedVehicleType={selectedVehicleType}
              setSelectedVehicleType={setSelectedVehicleType}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              selectedState={selectedState}
              setSelectedState={setSelectedState}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              onClearAll={clearAllFilters}
            />
          </motion.div>
        )}

        {/* Notifications Page */}
        {showNotificationsModal && (
          <motion.div
            key="notifications-page"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</h2>
                </div>
              </div>
              <button onClick={() => setShowNotificationsModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full-Screen Google Sign-In Launch Screen */}
        {(!currentUser || showAuthScreen) && !showSplash && (
          <motion.div
            key="auth-screen-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-y-auto"
          >
            <AuthScreen
              currentUser={currentUser}
              onSuccess={handleAuthSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  </div>
  );
}
