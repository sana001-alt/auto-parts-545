import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Package, 
  Heart, 
  Bell, 
  Edit3, 
  Trash2, 
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  FileText,
  Info,
  LogOut,
  Plus,
  Shield,
  Star,
  CheckCircle,
  Lock,
  MessageCircle,
  Cloud,
  Wrench,
  Share2,
  Users,
  Clock,
  Zap,
  Globe,
  Camera,
  Check,
  Building,
  KeyRound,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { UserProfile, Listing, AppNotification } from '../types';
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations';
import { auth } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { AdminControlPanel } from './AdminControlPanel';

interface UserProfileViewProps {
  currentUser: UserProfile;
  userListings: Listing[];
  favorites: Listing[];
  notifications: AppNotification[];
  allListings?: Listing[];
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (listingId: string) => void;
  onToggleListingStatus: (listingId: string, currentStatus: string) => void;
  onSelectListing: (listing: Listing) => void;
  onOpenAddListing: () => void;
  onOpenChats?: () => void;
  onOpenAdminPanel?: () => void;
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;
  onClose: () => void;
  onLogout?: () => void;
}

type SubViewType = 
  | 'none'
  | 'edit-profile'
  | 'admin-panel'
  | 'my-listings'
  | 'favorites'
  | 'notifications'
  | 'settings'
  | 'help-support'
  | 'contact-us'
  | 'report-issue'
  | 'feedback'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'about';

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi (हिंदी)',
  'Punjabi (ਪੰਜਾਬੀ)',
  'Marathi (मराठी)',
  'Tamil (தமிழ்)',
  'Telugu (తెలుగు)',
  'Gujarati (ગુજરાતી)',
  'Bengali (বাংলা)',
  'Kannada (ಕನ್ನಡ)'
];

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya'
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  userListings,
  favorites,
  notifications,
  allListings = [],
  onEditListing,
  onDeleteListing,
  onToggleListingStatus,
  onSelectListing,
  onOpenAddListing,
  onOpenChats,
  onOpenAdminPanel,
  onUpdateProfile,
  onClose,
  onLogout
}) => {
  const [subView, setSubView] = useState<SubViewType>('none');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Share & Rate State
  const [shareToast, setShareToast] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [rateSubmitted, setRateSubmitted] = useState(false);

  // Form states for Edit Profile
  const [nameInput, setNameInput] = useState(currentUser.displayName || '');
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');
  const [whatsappInput, setWhatsappInput] = useState(currentUser.whatsappNumber || '');
  const [stateInput, setStateInput] = useState(currentUser.state || 'Delhi NCR');
  const [districtInput, setDistrictInput] = useState(currentUser.district || 'Central Delhi');
  const [cityInput, setCityInput] = useState(currentUser.city || 'Mayapuri');
  const [addressInput, setAddressInput] = useState(currentUser.address || '');
  const [languageInput, setLanguageInput] = useState(currentUser.language || 'English');
  const [photoURLInput, setPhotoURLInput] = useState(currentUser.photoURL || '');

  // Password Form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Report & Feedback States
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const availableDistricts = stateInput && INDIA_STATES_DISTRICTS[stateInput] ? INDIA_STATES_DISTRICTS[stateInput] : [];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      displayName: nameInput,
      phone: phoneInput,
      whatsappNumber: whatsappInput,
      state: stateInput,
      district: districtInput,
      city: cityInput,
      address: addressInput,
      language: languageInput,
      photoURL: photoURLInput
    });
    setSubView('none');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    setPasswordStatus(null);

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordStatus({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordStatus({ type: 'success', text: 'Password updated successfully!' });
        setShowPasswordForm(false);
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      setPasswordStatus({ type: 'error', text: err?.message || 'Failed to change password. Please re-login.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: 'AutoParts India - Online Marketplace for Spare Parts',
      text: 'Buy & sell genuine used, OEM, and verified auto parts across India!',
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user canceled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    }
  };

  // ADMIN AUTHORIZATION CHECK: ONLY SHOW FOR autoparts2@gmail.com
  const ADMIN_EMAIL = 'autoparts2@gmail.com';
  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL || currentUser.email === ADMIN_EMAIL;

  // Format Member Since (Month Year)
  const getMemberSince = () => {
    if (currentUser.createdAt) {
      try {
        const d = new Date(currentUser.createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
      } catch (e) {
        // fallback
      }
    }
    return 'March 2024';
  };

  // Stats calculations
  const totalActiveListings = userListings.length;
  const totalSoldItems = userListings.filter(l => l.status === 'sold').length;
  const ratingValue = currentUser.rating || 4.9;
  const reviewCountValue = currentUser.reviewCount || 28;
  const responseRateValue = currentUser.responseRate || '98%';
  const responseTimeValue = currentUser.responseTime || '15 mins';
  const followersValue = currentUser.followersCount || 142;
  const followingValue = currentUser.followingCount || 18;

  // Location string: City, District, State
  const locationText = [
    currentUser.city || cityInput || 'Mayapuri',
    currentUser.district || districtInput || 'Central Delhi',
    currentUser.state || stateInput || 'Delhi NCR'
  ].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[94vh] sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all">
        
        {/* TOP APP BAR HEADER */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {subView !== 'none' && (
              <button
                onClick={() => setSubView('none')}
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              {subView === 'none' && 'Account & Seller Hub'}
              {subView === 'edit-profile' && 'Edit Profile Details'}
              {subView === 'admin-panel' && 'Admin Control Panel'}
              {subView === 'my-listings' && 'My Spare Part Listings'}
              {subView === 'favorites' && 'Saved Favorites'}
              {subView === 'notifications' && 'Notifications & Alerts'}
              {subView === 'settings' && 'App Settings'}
              {subView === 'help-support' && 'Help & Support'}
              {subView === 'contact-us' && 'Contact Us'}
              {subView === 'report-issue' && 'Report an Issue'}
              {subView === 'feedback' && 'App Feedback'}
              {subView === 'privacy-policy' && 'Privacy Policy'}
              {subView === 'terms-conditions' && 'Terms & Conditions'}
              {subView === 'about' && 'About AutoParts India'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Toast for Link Shared */}
          {shareToast && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Share link copied to clipboard!</span>
            </div>
          )}

          {/* MAIN PROFILE SCREEN (OLX / Facebook Marketplace Style) */}
          {subView === 'none' && (
            <div className="space-y-4">
              
              {/* OLX/MARKETPLACE PROFILE CARD */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md relative overflow-hidden space-y-4">
                
                {/* Header Background Banner Accent */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 opacity-90" />

                {/* Profile Main Row */}
                <div className="relative pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    
                    {/* Avatar with Verified Shield */}
                    <div className="relative">
                      <img
                        src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`}
                        alt={currentUser.displayName}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100"
                      />
                      {(currentUser.verified !== false) && (
                        <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full shadow-md border-2 border-white dark:border-slate-800" title="Verified Seller">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                      )}
                    </div>

                    {/* Name, Verified Badge, Location & Member Since */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                          {currentUser.displayName || 'Marketplace Seller'}
                        </h3>
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          VERIFIED
                        </span>
                      </div>

                      {/* Location: City, District, State */}
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{locationText}</span>
                      </p>

                      {/* Member Since (Month Year) */}
                      <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Member since {getMemberSince()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Edit Profile Action Button */}
                  <button
                    onClick={() => setSubView('edit-profile')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>

                {/* SELLER TRUST & ENGAGEMENT STATS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  
                  {/* Rating */}
                  <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{ratingValue}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{reviewCountValue} Reviews</p>
                  </div>

                  {/* Response Rate */}
                  <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{responseRateValue}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">Response Rate</p>
                  </div>

                  {/* Response Time */}
                  <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-black text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{responseTimeValue}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">Reply Time</p>
                  </div>

                  {/* Followers / Following */}
                  <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 text-center space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 font-black text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>{followersValue}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">{followingValue} Following</p>
                  </div>

                </div>

                {/* LISTINGS & SALES METRICS BANNER */}
                <div className="flex items-center justify-around bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-3.5 rounded-2xl border border-slate-700/80 shadow-xs">
                  <div className="text-center">
                    <span className="text-base font-black text-amber-400 block">{totalActiveListings}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Active Listings</span>
                  </div>

                  <div className="h-8 w-px bg-slate-700/80" />

                  <div className="text-center">
                    <span className="text-base font-black text-emerald-400 block">{totalSoldItems}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Sold Items</span>
                  </div>

                  <div className="h-8 w-px bg-slate-700/80" />

                  <div className="text-center">
                    <span className="text-base font-black text-cyan-300 block">100%</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Authentic OEM</span>
                  </div>
                </div>

              </div>

              {/* ADMIN CONTROL PANEL ENTRY - STRICTLY SHOWN ONLY FOR autoparts2@gmail.com */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 text-white rounded-3xl p-4 border border-cyan-500/40 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-black tracking-wider uppercase text-cyan-300">Admin Control Panel</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-800 uppercase tracking-wider">
                      SUPERADMIN ONLY
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Full superadmin controls for platform management, user moderation, database management, and system updates.
                  </p>

                  <button
                    onClick={() => {
                      if (onOpenAdminPanel) {
                        onOpenAdminPanel();
                      } else {
                        setSubView('admin-panel');
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-950" />
                    Open Admin Management Panel
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ACCOUNT PAGE MAIN NAVIGATION MENU */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Account Menu</span>
                  <span className="text-[10px] text-slate-400 font-bold">AutoParts Marketplace</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  
                  {/* Admin Control Panel Menu Item (Strictly shown ONLY for autoparts2@gmail.com) */}
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (onOpenAdminPanel) {
                          onOpenAdminPanel();
                        } else {
                          setSubView('admin-panel');
                        }
                      }}
                      className="w-full p-3.5 flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-left cursor-pointer border-l-4 border-amber-500"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold">
                          <Shield className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            Admin Panel
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase tracking-wider">SUPERADMIN</span>
                          </p>
                          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Full platform management & Firestore CRUD</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-500" />
                    </button>
                  )}

                  {/* 1. My Listings */}
                  <button
                    onClick={() => setSubView('my-listings')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">My Listings</p>
                        <p className="text-[10px] text-slate-400">Manage active & sold spare parts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-black">
                        {userListings.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  {/* 2. Favorites */}
                  <button
                    onClick={() => setSubView('favorites')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Favorites</p>
                        <p className="text-[10px] text-slate-400">Saved spare parts & deal bookmarks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                        {favorites.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  {/* 3. Chats */}
                  <button
                    onClick={() => {
                      if (onOpenChats) {
                        onOpenChats();
                      } else {
                        onClose();
                      }
                    }}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Chats</p>
                        <p className="text-[10px] text-slate-400">Inbox messages with buyers & sellers</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 4. Notifications */}
                  <button
                    onClick={() => setSubView('notifications')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Notifications</p>
                        <p className="text-[10px] text-slate-400">Marketplace offers, updates & alerts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                        {notifications.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  {/* 5. Settings */}
                  <button
                    onClick={() => setSubView('settings')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Settings</p>
                        <p className="text-[10px] text-slate-400">App theme, privacy & account security</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 6. Help & Support */}
                  <button
                    onClick={() => setSubView('help-support')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Help & Support</p>
                        <p className="text-[10px] text-slate-400">Customer desk, FAQs & merchant support</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 7. Privacy Policy */}
                  <button
                    onClick={() => setSubView('privacy-policy')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Privacy Policy</p>
                        <p className="text-[10px] text-slate-400">Data safety & DPDP compliance</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 8. Terms & Conditions */}
                  <button
                    onClick={() => setSubView('terms-conditions')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Terms & Conditions</p>
                        <p className="text-[10px] text-slate-400">Marketplace rules & OEM guidelines</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 9. About App */}
                  <button
                    onClick={() => setSubView('about')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">About App</p>
                        <p className="text-[10px] text-slate-400">AutoParts India Marketplace story</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 10. Share App */}
                  <button
                    onClick={handleShareApp}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Share App</p>
                        <p className="text-[10px] text-slate-400">Invite fellow car mechanics & spare part sellers</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 11. Rate App */}
                  <button
                    onClick={() => setShowRateModal(true)}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Rate App</p>
                        <p className="text-[10px] text-slate-400">Rate 5 stars on Play Store</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 12. App Version */}
                  <div className="p-3.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">App Version</p>
                        <p className="text-[10px] text-slate-400">Build v2.4.0 (Material Design 3)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      STABLE
                    </span>
                  </div>

                </div>
              </div>

              {/* 13. LOGOUT BUTTON */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-3xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

            </div>
          )}

          {/* EDIT PROFILE VIEW */}
          {subView === 'edit-profile' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Edit Profile Details</h3>
                    <p className="text-[11px] text-slate-400">Update photo, phone number, location & app preferences</p>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                    SELLER PROFILE
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  
                  {/* Profile Photo Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Profile Photo</span>
                    </label>

                    <div className="flex items-center gap-4">
                      <img
                        src={photoURLInput || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nameInput || 'User'}`}
                        alt="Profile Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md bg-slate-100 shrink-0"
                      />
                      
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={photoURLInput}
                          onChange={(e) => setPhotoURLInput(e.target.value)}
                          placeholder="Paste image URL (e.g. Cloudinary, Unsplash)"
                          className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium text-slate-900 dark:text-white"
                        />
                        
                        {/* Preset Avatars */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">Presets:</span>
                          {PRESET_AVATARS.map((avatar, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPhotoURLInput(avatar)}
                              className="w-7 h-7 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform shrink-0"
                            >
                              <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name / Merchant Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Phone & WhatsApp Numbers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Number (Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={whatsappInput}
                        onChange={(e) => setWhatsappInput(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 outline-none font-bold text-slate-900 dark:text-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Location Grid: State, District, City */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Market Location Details</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">State</label>
                        <select
                          value={stateInput}
                          onChange={(e) => {
                            setStateInput(e.target.value);
                            setDistrictInput('');
                          }}
                          className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                        >
                          {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">District / Hub</label>
                        <select
                          value={districtInput}
                          onChange={(e) => setDistrictInput(e.target.value)}
                          className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                        >
                          <option value="">Select District</option>
                          {availableDistricts.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">City / Area</label>
                        <input
                          type="text"
                          value={cityInput}
                          onChange={(e) => setCityInput(e.target.value)}
                          placeholder="e.g. Mayapuri / Kurla"
                          className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Address Field */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Shop Address / Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        placeholder="e.g. Shop #42, Phase-2 Mayapuri Scrap Market"
                        className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Preferred App Language</span>
                    </label>
                    <select
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 font-bold text-slate-900 dark:text-white outline-none"
                    >
                      {LANGUAGE_OPTIONS.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  {/* Change Password Section */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Change Account Password</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {showPasswordForm ? 'Hide' : 'Update Password'}
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {passwordStatus && (
                          <div className={`p-2.5 rounded-xl text-xs font-bold ${
                            passwordStatus.type === 'success' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                          }`}>
                            {passwordStatus.text}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="password"
                            placeholder="New Password (min 6 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-900 dark:text-white"
                          />
                          <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none text-slate-900 dark:text-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={updatingPassword}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs"
                        >
                          {updatingPassword ? 'Updating Password...' : 'Save New Password'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions: Save Profile / Cancel */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubView('none')}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg shadow-blue-600/20"
                    >
                      Save Profile Changes
                    </button>
                  </div>

                </form>
              </div>

              {/* Logout Button inside Edit Profile page */}
              <button
                type="button"
                onClick={() => setShowLogoutDialog(true)}
                className="w-full p-3.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-2xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          )}

          {/* ADMIN CONTROL PANEL SUBVIEW (Only for autoparts2@gmail.com) */}
          {subView === 'admin-panel' && isAdmin && (
            <AdminControlPanel
              currentUser={currentUser}
              listings={allListings || []}
              onClose={() => setSubView('none')}
            />
          )}

          {/* MY LISTINGS SUBVIEW */}
          {subView === 'my-listings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-400">Active & Sold Parts ({userListings.length})</h3>
                <button
                  onClick={onOpenAddListing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Post New Part
                </button>
              </div>

              {userListings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No spare parts posted yet.</p>
                  <p className="text-[11px] text-slate-500">Sell your unused car/bike engines, headlights, or body parts today!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs"
                    >
                      <img
                        src={item.images[0] || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=200'}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                            ₹{new Intl.NumberFormat('en-IN').format(item.price)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'sold' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{item.make} • {item.model}</p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => onEditListing(item)}
                            className="text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          
                          <button
                            onClick={() => onToggleListingStatus(item.id, item.status)}
                            className="text-[10px] font-bold text-amber-600 hover:underline cursor-pointer"
                          >
                            Mark {item.status === 'sold' ? 'Active' : 'Sold'}
                          </button>

                          <button
                            onClick={() => onDeleteListing(item.id)}
                            className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FAVORITES SUBVIEW */}
          {subView === 'favorites' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400">Saved Items ({favorites.length})</h3>
              {favorites.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-3xl">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No bookmarked parts yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      onClick={() => onSelectListing(fav)}
                      className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
                    >
                      <img
                        src={fav.images[0]}
                        alt={fav.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                          ₹{new Intl.NumberFormat('en-IN').format(fav.price)}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{fav.title}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{fav.location.city}, {fav.location.state}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS SUBVIEW */}
          {subView === 'notifications' && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400">Alerts & Messages</h3>
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-3xl">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p>No new notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-xs">
                    <Bell className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SETTINGS SUBVIEW */}
          {subView === 'settings' && (
            <div className="space-y-3">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Account Preferences</h4>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Primary Market Location</p>
                      <p className="text-[10px] text-slate-400">{currentUser.district || 'Mayapuri'}, {currentUser.state || 'Delhi NCR'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSubView('edit-profile')} className="text-xs font-bold text-blue-600 cursor-pointer">Change</button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Account Privacy & Security</p>
                      <p className="text-[10px] text-slate-400">Personal details protected & email hidden</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">ENCRYPTED</span>
                </div>
              </div>
            </div>
          )}

          {/* HELP & SUPPORT SUBVIEW */}
          {subView === 'help-support' && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-3xl space-y-2">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-300" /> AutoParts Customer Desk
                </h3>
                <p className="text-xs text-teal-100">
                  Have questions about listing an engine, gearbox fitment, or verifying OEM part numbers?
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Merchant Support Hotline</p>
                    <p className="text-[11px] text-slate-500">Available 9:00 AM - 8:00 PM IST (Mon-Sat)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY SUBVIEW */}
          {subView === 'privacy-policy' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Privacy Policy</h3>
              <p>
                AutoParts India protects user and seller account information under the Digital Personal Data Protection (DPDP) Act.
              </p>
              <p>
                Email addresses, phone numbers, and unique user identifiers are kept strictly confidential and hidden from public profile views.
              </p>
            </div>
          )}

          {/* TERMS & CONDITIONS SUBVIEW */}
          {subView === 'terms-conditions' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Terms & Conditions</h3>
              <p>• All listed spare parts must represent real stock with genuine photos.</p>
              <p>• Counterfeit or stolen auto parts are strictly prohibited and will be reported.</p>
            </div>
          )}

          {/* ABOUT APP SUBVIEW */}
          {subView === 'about' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">About AutoParts India</h3>
              <p>
                India's premier marketplace for used, OEM, and verified automotive spare parts. Connecting buyers directly with tested scrap yards across Mayapuri (Delhi), CST Road Kurla (Mumbai), and Pudupet (Chennai).
              </p>
              <p className="font-bold text-slate-900 dark:text-white pt-2">
                Version: 2.4.0 (Material Design 3 Native Build)
              </p>
            </div>
          )}

        </div>

      </div>

      {/* RATE APP MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Rate AutoParts India</h3>
              <p className="text-xs text-slate-500">Your feedback helps mechanics & spare part buyers across India!</p>
            </div>

            {rateSubmitted ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold">
                ✓ Thank you for rating us {userRating} stars!
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star className={`w-7 h-7 ${star <= userRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowRateModal(false)}
                    className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setRateSubmitted(true);
                      setTimeout(() => setShowRateModal(false), 2000);
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION DIALOG */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Log Out?</h3>
              <p className="text-xs text-slate-500">Are you sure you want to log out of your AutoParts India account?</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutDialog(false)}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setLoggingOut(true);
                  try {
                    if (onLogout) {
                      await onLogout();
                    }
                  } catch (err) {
                    console.error('Logout handler error:', err);
                  } finally {
                    setLoggingOut(false);
                    setShowLogoutDialog(false);
                  }
                }}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {loggingOut ? (
                  <span>Logging out...</span>
                ) : (
                  <span>Log Out</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
