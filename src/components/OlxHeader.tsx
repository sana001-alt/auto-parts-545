import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Bell, 
  Sun, 
  Moon, 
  Wrench, 
  ChevronDown, 
  X, 
  SlidersHorizontal,
  Cloud,
  Heart,
  Mic,
  QrCode,
  ShieldCheck
} from 'lucide-react';
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';

import { LocationBottomSheet } from './LocationBottomSheet';

interface OlxHeaderProps {
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
  onOpenNotifications: () => void;
  onOpenFavorites: () => void;
  onOpenCloudinarySettings: () => void;
  onOpenFiltersModal: () => void;
  onOpenSearchModal?: () => void;
  onOpenProfile?: () => void;
  onOpenAdminPanel?: () => void;
}

export const OlxHeader: React.FC<OlxHeaderProps> = ({
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
  onOpenNotifications,
  onOpenFavorites,
  onOpenCloudinarySettings,
  onOpenFiltersModal,
  onOpenSearchModal,
  onOpenProfile,
  onOpenAdminPanel
}) => {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const availableDistricts = selectedState && INDIA_STATES_DISTRICTS[selectedState]
    ? INDIA_STATES_DISTRICTS[selectedState]
    : [];

  const locationText = selectedDistrict 
    ? `${selectedDistrict}, ${selectedState}`
    : selectedState 
    ? selectedState 
    : 'India (All Cities)';

  return (
    <header className="sticky top-0 z-30 bg-[#0F172A] text-white border-b border-slate-800 transition-colors duration-200 shadow-md">
      <div className="max-w-4xl mx-auto px-3 py-2.5 space-y-2.5">
        
        {/* Top Row: Location Selector + Logo + Actions */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Location Selector Button */}
          <button
            onClick={() => setShowLocationModal(!showLocationModal)}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-700/60 transition-all cursor-pointer text-left"
          >
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">Location</span>
              <span className="text-xs font-bold text-white max-w-[140px] sm:max-w-[180px] truncate leading-tight flex items-center gap-1">
                {locationText}
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </span>
            </div>
          </button>

          {/* App Brand Title */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 via-cyan-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-xs ring-1 ring-cyan-400/30">
              <Wrench className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              AutoParts<span className="text-cyan-400">IN</span>
            </span>
          </div>

          {/* Quick Actions (Notifications, Favorites, Dark Mode, CDN) */}
          <div className="flex items-center gap-1">
            
            {/* Bookmarks */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors"
              title="Saved Parts"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-cyan-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0F172A]" />
              )}
            </button>

            {/* Admin Control Panel Button */}
            {(auth.currentUser?.email === 'autoparts2@gmail.com' || currentUser?.email === 'autoparts2@gmail.com') && (
              <>
                {onOpenAdminPanel && (
                  <button
                    onClick={onOpenAdminPanel}
                    className="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                    title="Super Admin Control Panel"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-black hidden lg:inline uppercase tracking-wider">Admin</span>
                  </button>
                )}
                <button
                  onClick={onOpenCloudinarySettings}
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors hidden sm:block"
                  title="CDN Settings"
                >
                  <Cloud className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-cyan-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfile}
              className="p-1 hover:ring-2 hover:ring-cyan-400 rounded-full transition-all cursor-pointer shrink-0 ml-0.5"
              title="Profile & Account"
            >
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-7 h-7 rounded-full object-cover border border-cyan-400" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-cyan-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                  {currentUser?.displayName?.[0] || 'U'}
                </div>
              )}
            </button>

          </div>

        </div>

        {/* Search Input Bar */}
        <div className="flex items-center gap-2">
          <div 
            onClick={onOpenSearchModal}
            className="relative flex-1 flex items-center cursor-pointer group"
          >
            <Search className="w-4 h-4 absolute left-3.5 text-cyan-400 pointer-events-none" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              onClick={onOpenSearchModal}
              placeholder="Search Swift DDiS, Creta LED, 55810-M74L00, Thar 4x4..."
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm bg-slate-800/90 text-white rounded-2xl border border-slate-700/80 group-hover:border-cyan-400 focus:border-cyan-400 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-400 cursor-pointer"
            />

            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Quick Voice Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenSearchModal) onOpenSearchModal();
                }}
                className="text-slate-400 hover:text-cyan-400 p-1 rounded-lg"
                title="Voice Search"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Quick Barcode Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenSearchModal) onOpenSearchModal();
                }}
                className="text-slate-400 hover:text-cyan-400 p-1 rounded-lg"
                title="Barcode Scanner"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={onOpenFiltersModal}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black rounded-2xl shadow-xs transition-colors shrink-0 flex items-center gap-1 text-xs cursor-pointer"
            title="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

      </div>

      {/* Material Design 3 Location Bottom Sheet */}
      <LocationBottomSheet
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        selectedState={selectedState}
        setSelectedState={setSelectedState}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
      />
    </header>
  );
};
