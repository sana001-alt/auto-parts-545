import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
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
  Send,
  FileText,
  Info,
  LogOut,
  Plus,
  Shield,
  Star,
  CheckCircle,
  Moon,
  Sun,
  Lock,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { UserProfile, Listing, AppNotification } from '../types';
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations';

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
  onUpdateProfile: (updatedProfile: Partial<UserProfile>) => void;
  onClose: () => void;
  onLogout?: () => void;
}

type SubViewType = 
  | 'none'
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
  onUpdateProfile,
  onClose,
  onLogout
}) => {
  const [subView, setSubView] = useState<SubViewType>('none');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState(currentUser.displayName);
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');
  const [stateInput, setStateInput] = useState(currentUser.state || 'Delhi NCR');
  const [districtInput, setDistrictInput] = useState(currentUser.district || 'Central Delhi');

  // Interactive Form Inputs
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
      state: stateInput,
      district: districtInput
    });
    setShowEditProfile(false);
  };

  const SUPPORT_EMAIL = 'autoparts2@gmail.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Top App Bar Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {subView !== 'none' && (
              <button
                onClick={() => setSubView('none')}
                className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              {subView === 'none' && 'Account & Profile'}
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
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* MAIN PROFILE MENU DASHBOARD */}
          {subView === 'none' && (
            <div className="space-y-4">
              
              {/* User Profile Card Header */}
              <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden space-y-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.displayName}`}
                      alt={currentUser.displayName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md"
                    />
                    {currentUser.verified && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm" title="Verified Merchant">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black truncate">{currentUser.displayName}</h3>
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                        VERIFIED
                      </span>
                    </div>

                    <p className="text-xs text-blue-100/90 font-medium truncate flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      {currentUser.email || SUPPORT_EMAIL}
                    </p>

                    <p className="text-[11px] text-blue-200 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                      {currentUser.district || 'Mayapuri'}, {currentUser.state || 'Delhi NCR'}
                    </p>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="w-full py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl text-xs font-black text-white border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-amber-300" />
                  Edit Profile
                </button>
              </div>

              {/* SECTION 1: MY ACTIVITY */}
              <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">My Activity</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <button
                    onClick={() => setSubView('my-listings')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
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

                  <button
                    onClick={() => setSubView('favorites')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Favorites</p>
                        <p className="text-[10px] text-slate-400">Bookmarked parts & deals</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                        {favorites.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenChats) {
                        onOpenChats();
                      } else {
                        onClose();
                      }
                    }}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Chats</p>
                        <p className="text-[10px] text-slate-400">Inbox messages with buyers & sellers</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSubView('notifications')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Notifications</p>
                        <p className="text-[10px] text-slate-400">Marketplace offers & price alerts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                        {notifications.length}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 2: PREFERENCES */}
              <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Preferences</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <button
                    onClick={() => setSubView('settings')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Settings</p>
                        <p className="text-[10px] text-slate-400">App theme, account security & location</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: HELP & SUPPORT */}
              <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Help & Feedback</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <button
                    onClick={() => setSubView('help-support')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Help & Support</p>
                        <p className="text-[10px] text-slate-400">{SUPPORT_EMAIL}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSubView('contact-us')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Contact Us</p>
                        <p className="text-[10px] text-slate-400">Direct support at {SUPPORT_EMAIL}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSubView('report-issue')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Report Issue</p>
                        <p className="text-[10px] text-slate-400">Report fake ads or app bugs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSubView('feedback')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        <Star className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Feedback</p>
                        <p className="text-[10px] text-slate-400">Rate your experience</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* SECTION 4: ABOUT & LEGAL */}
              <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Legal & Information</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <button
                    onClick={() => setSubView('privacy-policy')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Privacy Policy</p>
                        <p className="text-[10px] text-slate-400">Data safety & permissions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSubView('terms-conditions')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Terms & Conditions</p>
                        <p className="text-[10px] text-slate-400">Marketplace usage guidelines</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setSubView('about')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">About</p>
                        <p className="text-[10px] text-slate-400">AutoParts India Mobile v2.4.0</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* SECTION 5: LOGOUT */}
              <button
                onClick={() => setShowLogoutDialog(true)}
                className="w-full p-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-3xl border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>

            </div>
          )}

          {/* SUB-VIEW 1: MY LISTINGS */}
          {subView === 'my-listings' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-400">Active & Sold Parts ({userListings.length})</h3>
                <button
                  onClick={onOpenAddListing}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5"
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
                      className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-xs"
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
                            className="text-[10px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          
                          <button
                            onClick={() => onToggleListingStatus(item.id, item.status)}
                            className="text-[10px] font-bold text-amber-600 hover:underline"
                          >
                            Mark {item.status === 'sold' ? 'Active' : 'Sold'}
                          </button>

                          <button
                            onClick={() => onDeleteListing(item.id)}
                            className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-1 ml-auto"
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

          {/* SUB-VIEW 2: FAVORITES */}
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
                      className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
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

          {/* SUB-VIEW 3: NOTIFICATIONS */}
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

          {/* SUB-VIEW 4: SETTINGS */}
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
                  <button onClick={() => setShowEditProfile(true)} className="text-xs font-bold text-blue-600">Change</button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Google Auth & Password</p>
                      <p className="text-[10px] text-slate-400">Secured via Google Firebase Auth</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 5: HELP & SUPPORT */}
          {subView === 'help-support' && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-3xl space-y-2">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-300" /> AutoParts Support Desk
                </h3>
                <p className="text-xs text-teal-100">
                  Have questions about listing an engine, gearbox fitment, or verifying OEM part numbers?
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Official Support Email</p>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs font-black text-blue-600 dark:text-blue-400 underline">
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Merchant Helpline</p>
                    <p className="text-[11px] text-slate-500">Available 9:00 AM - 8:00 PM IST (Mon-Sat)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 6: CONTACT US */}
          {subView === 'contact-us' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Get in Touch</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                For commercial spare part listings, bulk Mayapuri / Kurla scrap yard partnerships, or account inquiries:
              </p>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-1">
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200">Email Address</p>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-black text-blue-600 dark:text-blue-400 underline block">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          )}

          {/* SUB-VIEW 7: REPORT ISSUE */}
          {subView === 'report-issue' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Report an Issue or Fake Ad
              </h3>

              {reportSubmitted ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs space-y-1">
                  <p className="font-bold">✓ Report Received!</p>
                  <p>Our moderation team at {SUPPORT_EMAIL} will inspect this within 2 hours.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Describe the issue or ad title..."
                    className="w-full text-xs p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
                  />
                  <button
                    onClick={() => {
                      if (reportText.trim()) setReportSubmitted(true);
                    }}
                    className="w-full py-2.5 bg-orange-600 text-white font-bold text-xs rounded-2xl shadow-md"
                  >
                    Send Report to {SUPPORT_EMAIL}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 8: FEEDBACK */}
          {subView === 'feedback' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">App Experience Feedback</h3>

              {feedbackSubmitted ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs">
                  <p className="font-bold">Thank you for your feedback!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1"
                      >
                        <Star className={`w-6 h-6 ${star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you like or want improved..."
                    className="w-full text-xs p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none"
                  />

                  <button
                    onClick={() => setFeedbackSubmitted(true)}
                    className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-md"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 9: PRIVACY POLICY */}
          {subView === 'privacy-policy' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Privacy Policy</h3>
              <p>
                AutoParts India protects user and seller account information under the Digital Personal Data Protection (DPDP) Act.
              </p>
              <p>
                For data access or deletion requests, contact us at: <strong className="text-blue-600">{SUPPORT_EMAIL}</strong>.
              </p>
            </div>
          )}

          {/* SUB-VIEW 10: TERMS & CONDITIONS */}
          {subView === 'terms-conditions' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Terms & Conditions</h3>
              <p>• All listed spare parts must represent real stock with genuine photos.</p>
              <p>• Counterfeit or stolen auto parts are strictly prohibited and will be reported.</p>
              <p>• Support queries: <strong className="text-blue-600">{SUPPORT_EMAIL}</strong>.</p>
            </div>
          )}

          {/* SUB-VIEW 11: ABOUT */}
          {subView === 'about' && (
            <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">About AutoParts India</h3>
              <p>
                India's premier marketplace for used, OEM, and verified automotive spare parts. Connecting buyers directly with tested scrap yards across Mayapuri (Delhi), CST Road Kurla (Mumbai), and Pudupet (Chennai).
              </p>
              <p className="font-bold text-slate-900 dark:text-white pt-2">
                Version: 2.4.0 (Material 3 Native Build)
              </p>
              <p className="text-blue-600 font-medium">Official Contact: {SUPPORT_EMAIL}</p>
            </div>
          )}

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditProfile && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Edit Profile Details</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">State</label>
                  <select
                    value={stateInput}
                    onChange={(e) => {
                      setStateInput(e.target.value);
                      setDistrictInput('');
                    }}
                    className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                  >
                    {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">District / Hub</label>
                  <select
                    value={districtInput}
                    onChange={(e) => setDistrictInput(e.target.value)}
                    className="w-full text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-medium"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
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
