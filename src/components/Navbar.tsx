import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  PlusCircle, 
  Heart, 
  MessageSquare, 
  Bell, 
  User as UserIcon, 
  Sun, 
  Moon, 
  Wrench, 
  ShieldCheck, 
  LogOut, 
  SlidersHorizontal,
  Cloud,
  ChevronDown
} from 'lucide-react';
import { UserProfile, AppNotification } from '../types';
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations';
import { auth } from '../lib/firebase';

interface NavbarProps {
  currentUser: UserProfile | null;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (dist: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  favoritesCount: number;
  unreadNotificationsCount: number;
  onOpenAuthModal: () => void;
  onOpenAddListing: () => void;
  onOpenFavorites: () => void;
  onOpenChats: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenCloudinarySettings: () => void;
  onLogout: () => void;
  onOpenFiltersModal?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  darkMode,
  setDarkMode,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  searchQuery,
  setSearchQuery,
  favoritesCount,
  unreadNotificationsCount,
  onOpenAuthModal,
  onOpenAddListing,
  onOpenFavorites,
  onOpenChats,
  onOpenNotifications,
  onOpenProfile,
  onOpenCloudinarySettings,
  onLogout,
  onOpenFiltersModal,
  onOpenAdminPanel
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const availableDistricts = selectedState && INDIA_STATES_DISTRICTS[selectedState] 
    ? INDIA_STATES_DISTRICTS[selectedState] 
    : [];

  const isAdmin = auth.currentUser?.email === 'autoparts2@gmail.com' || currentUser?.email === 'autoparts2@gmail.com';

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 transition-colors duration-200 shadow-md">
      {/* Top Banner Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1 px-4 text-center font-medium flex items-center justify-between border-b border-slate-800/80">
        <div className="hidden sm:flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-200">India's #1 Marketplace for Used & New Auto Spare Parts • 100% Verified Sellers</span>
          </span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            {isAdmin && (
              <>
                {onOpenAdminPanel && (
                  <button 
                    onClick={onOpenAdminPanel} 
                    className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:brightness-110 transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-3 h-3 text-slate-950" /> Super Admin Control Panel
                  </button>
                )}
                <button onClick={onOpenCloudinarySettings} className="hover:text-cyan-400 flex items-center gap-1 cursor-pointer transition-colors">
                  <Cloud className="w-3 h-3 text-cyan-400" /> Cloudinary CDN
                </button>
              </>
            )}
            <span>Mayapuri • Kurla • Pudupet • Shivajinagar</span>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => window.location.href = '/'}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-cyan-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30 transform hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5 text-cyan-200" />
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1">
              AutoParts<span className="text-cyan-400">India</span>
              <span className="text-[10px] uppercase font-bold bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded-full ml-1 border border-cyan-800">IN</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              Used & New Spare Parts
            </div>
          </div>
        </div>

        {/* Location Dropdown Selector */}
        <div className="relative shrink-0 hidden md:block">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="max-w-[120px] truncate">
              {selectedDistrict ? `${selectedDistrict}, ${selectedState}` : selectedState || 'All India'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showLocationDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 text-white">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Select Location
                </span>
                <button 
                  onClick={() => { setSelectedState(''); setSelectedDistrict(''); setShowLocationDropdown(false); }}
                  className="text-[11px] font-semibold text-cyan-400 hover:underline"
                >
                  Clear (All India)
                </button>
              </div>

              {/* State Select */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">State / Union Territory</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('');
                    }}
                    className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200 font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="">All India (28 States)</option>
                    {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* District Select */}
                {selectedState && availableDistricts.length > 0 && (
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 mb-1 block">District / Major Hub</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setShowLocationDropdown(false);
                      }}
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-200 font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="">All Districts in {selectedState}</option>
                      {availableDistricts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar Input */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parts (e.g. Swift Engine, Creta Headlight, Thar Bumper, Alloy Wheels)..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-800 text-white rounded-2xl border border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-400"
            />
            {onOpenFiltersModal && (
              <button
                onClick={onOpenFiltersModal}
                className="absolute right-2 text-slate-400 hover:text-cyan-400 p-1 rounded-lg"
                title="Filter options"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Saved Favorites"
          >
            <Heart className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Realtime Chat Button */}
          <button
            onClick={currentUser ? onOpenChats : onOpenAuthModal}
            className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Messages / Chats"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={currentUser ? onOpenNotifications : onOpenAuthModal}
            className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* User Profile or Login */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-cyan-400 transition-all"
              >
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400"
                />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 text-white">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  
                  <button
                    onClick={() => { setShowUserDropdown(false); onOpenProfile(); }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" /> My Profile & Listings
                  </button>

                  {isAdmin && (
                    <>
                      {onOpenAdminPanel && (
                        <button
                          onClick={() => { setShowUserDropdown(false); onOpenAdminPanel(); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-950/30 flex items-center gap-2 border-b border-slate-800"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Super Admin Control Panel
                        </button>
                      )}
                      <button
                        onClick={() => { setShowUserDropdown(false); onOpenCloudinarySettings(); }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Cloud className="w-3.5 h-3.5 text-cyan-400" /> Cloudinary Settings
                      </button>
                    </>
                  )}

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => { setShowUserDropdown(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="text-xs font-bold text-slate-200 hover:text-cyan-400 px-3 py-2 rounded-xl border border-slate-700 hover:border-cyan-400 transition-colors"
            >
              Login / Register
            </button>
          )}

          {/* Sell (+) CTA Button */}
          <button
            onClick={currentUser ? onOpenAddListing : onOpenAuthModal}
            className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-2xl shadow-md shadow-cyan-500/20 transform hover:scale-[1.03] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Sell Part</span>
          </button>

        </div>
      </div>
    </header>
  );
};
