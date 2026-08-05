import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Tag, 
  Car, 
  MapPin, 
  Flag, 
  Bell, 
  Image as ImageIcon, 
  BarChart3, 
  Settings, 
  FileText, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Megaphone, 
  AlertTriangle, 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  RotateCcw, 
  Download, 
  Globe, 
  ChevronRight,
  LogOut,
  UserCheck,
  UserX,
  Layers,
  Sparkles,
  PhoneCall,
  Mail,
  Smartphone
} from 'lucide-react';
import { Listing, UserProfile, ListingReport } from '../types';
import { auth, updateListingInFirestore, deleteListingFromFirestore } from '../lib/firebase';
import { 
  subscribeToAllUsers, 
  toggleVerifySeller, 
  toggleBlockUser, 
  deleteUserByAdmin, 
  subscribeToReports, 
  updateReportStatusByAdmin, 
  subscribeToCategories, 
  saveCategoriesList, 
  subscribeToBrands, 
  saveBrandsList, 
  subscribeToLocations, 
  saveLocationsData, 
  subscribeToBanners, 
  saveBannerInAdmin, 
  deleteBannerInAdmin, 
  subscribeToAppSettings, 
  saveAppSettingsInAdmin, 
  subscribeToAdminLogs, 
  broadcastNotificationToUsers, 
  logAdminAction,
  AdminLog,
  AdminBanner,
  AppSettingsConfig,
  isSuperAdmin
} from '../lib/adminServices';

interface AdminControlPanelProps {
  currentUser: UserProfile | null;
  listings: Listing[];
  onClose: () => void;
  onSelectListing?: (listing: Listing) => void;
}

type TabType = 
  | 'dashboard' 
  | 'listings' 
  | 'users' 
  | 'categories' 
  | 'brands' 
  | 'locations' 
  | 'reports' 
  | 'notifications' 
  | 'banners' 
  | 'analytics' 
  | 'settings' 
  | 'force-update'
  | 'logs';

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  currentUser,
  listings,
  onClose,
  onSelectListing
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Admin Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<ListingReport[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [locations, setLocations] = useState<Record<string, string[]>>({});
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettingsConfig | null>(null);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  // Filtering & Search
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'sold'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'verified' | 'blocked'>('all');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'danger' | 'warning' | 'success';
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'danger',
    onConfirm: () => {}
  });

  // Action Loading State & Toast
  const [loadingAction, setLoadingAction] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit / Add Modals State
  const [editListingModal, setEditListingModal] = useState<Listing | null>(null);
  const [editUserModal, setEditUserModal] = useState<UserProfile | null>(null);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newBrandInput, setNewBrandInput] = useState('');
  const [newStateInput, setNewStateInput] = useState('');
  const [newDistrictInput, setNewDistrictInput] = useState({ state: '', district: '' });
  
  // Banner Form State
  const [bannerForm, setBannerForm] = useState<Partial<AdminBanner> | null>(null);

  // Broadcast Notification Form State
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    targetUserId: '',
    link: ''
  });

  // App Settings Form State
  const [settingsForm, setSettingsForm] = useState<Partial<AppSettingsConfig>>({});

  const superAdminEmail = 'autoparts2@gmail.com';
  const currentEmail = auth.currentUser?.email || currentUser?.email;
  const hasAccess = isSuperAdmin(currentEmail);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Subscriptions
  useEffect(() => {
    if (!hasAccess) return;

    // Log admin login once
    logAdminAction('Admin Dashboard Accessed', 'System', 'login_session');

    const unsubUsers = subscribeToAllUsers(setUsers);
    const unsubReports = subscribeToReports(setReports);
    const unsubCat = subscribeToCategories(setCategories);
    const unsubBrands = subscribeToBrands(setBrands);
    const unsubLoc = subscribeToLocations(setLocations);
    const unsubBanners = subscribeToBanners(setBanners);
    const unsubSettings = subscribeToAppSettings((s) => {
      setAppSettings(s);
      if (s) setSettingsForm(s);
    });
    const unsubLogs = subscribeToAdminLogs(setAdminLogs);

    return () => {
      unsubUsers();
      unsubReports();
      unsubCat();
      unsubBrands();
      unsubLoc();
      unsubBanners();
      unsubSettings();
      unsubLogs();
    };
  }, [hasAccess]);

  // Security Access Guard
  if (!hasAccess) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-800/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 text-rose-500 border border-rose-800 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-2">Access Denied</h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            The Admin Control Panel is strictly reserved for Super Admin <span className="font-bold text-rose-400">{superAdminEmail}</span>.
            Your account ({currentEmail || 'Not Authenticated'}) is not authorized to access this panel.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl border border-slate-700 transition-colors"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  // Trigger Confirmation Modal
  const openConfirm = (
    title: string, 
    description: string, 
    onConfirm: () => Promise<void> | void,
    actionType: 'danger' | 'warning' | 'success' = 'danger'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      description,
      actionType,
      onConfirm
    });
  };

  const handleExecuteConfirm = async () => {
    setLoadingAction(true);
    try {
      await confirmModal.onConfirm();
    } catch (err: any) {
      showToast(err?.message || 'Action failed', 'error');
    } finally {
      setLoadingAction(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Listing Handlers
  const handleListingStatusChange = (listing: Listing, status: 'active' | 'rejected' | 'sold') => {
    openConfirm(
      `${status === 'active' ? 'Approve' : status === 'rejected' ? 'Reject' : 'Mark Sold'} Listing`,
      `Are you sure you want to change status of "${listing.title}" to ${status.toUpperCase()}? This will update Firestore immediately.`,
      async () => {
        await updateListingInFirestore(listing.id, { status });
        await logAdminAction(`Set Listing Status to ${status}`, 'Listing', listing.id, listing.title);
        showToast(`Listing status updated to ${status}`);
      },
      status === 'rejected' ? 'danger' : 'success'
    );
  };

  const handleDeleteListing = (listing: Listing) => {
    openConfirm(
      'Delete Listing Permanently',
      `Are you sure you want to delete "${listing.title}" (ID: ${listing.id}) from Firestore? This action cannot be undone.`,
      async () => {
        await deleteListingFromFirestore(listing.id);
        await logAdminAction('Delete Listing', 'Listing', listing.id, listing.title);
        showToast(`Listing "${listing.title}" deleted successfully`);
      },
      'danger'
    );
  };

  const handleSaveListingEdit = async () => {
    if (!editListingModal) return;
    setLoadingAction(true);
    try {
      await updateListingInFirestore(editListingModal.id, {
        title: editListingModal.title,
        price: editListingModal.price,
        category: editListingModal.category,
        condition: editListingModal.condition,
        vehicleType: editListingModal.vehicleType,
        make: editListingModal.make,
        description: editListingModal.description,
        isNegotiable: editListingModal.isNegotiable
      });
      await logAdminAction('Edit Listing', 'Listing', editListingModal.id, editListingModal.title);
      showToast('Listing updated successfully!');
      setEditListingModal(null);
    } catch (err: any) {
      showToast(err?.message || 'Error updating listing', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // User Handlers
  const handleToggleVerify = (user: UserProfile) => {
    const targetState = !user.verified;
    openConfirm(
      `${targetState ? 'Verify' : 'Unverify'} Seller`,
      `Are you sure you want to ${targetState ? 'grant Verified Badge' : 'revoke Verification'} for ${user.displayName} (${user.email})?`,
      async () => {
        await toggleVerifySeller(user.uid, targetState);
        showToast(`Verification status updated for ${user.displayName}`);
      },
      'success'
    );
  };

  const handleToggleBlock = (user: UserProfile) => {
    const isBlocked = (user as any).blocked;
    openConfirm(
      `${isBlocked ? 'Unblock' : 'Block'} User`,
      `Are you sure you want to ${isBlocked ? 'unblock' : 'block'} user ${user.displayName} (${user.email})? ${!isBlocked ? 'Blocked users will be prevented from placing listings or contacting buyers.' : ''}`,
      async () => {
        await toggleBlockUser(user.uid, !isBlocked, 'Admin moderation action');
        showToast(`User ${user.displayName} is now ${isBlocked ? 'Unblocked' : 'Blocked'}`);
      },
      isBlocked ? 'success' : 'danger'
    );
  };

  const handleDeleteUser = (user: UserProfile) => {
    openConfirm(
      'Delete User Profile',
      `Are you sure you want to delete profile for ${user.displayName} (${user.email}) from Firestore?`,
      async () => {
        await deleteUserByAdmin(user.uid, user.email);
        showToast(`User ${user.displayName} deleted from system`);
      },
      'danger'
    );
  };

  // Category Handlers
  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;
    const cat = newCategoryInput.trim();
    if (categories.includes(cat)) {
      showToast('Category already exists!', 'error');
      return;
    }
    openConfirm(
      'Add Category',
      `Add new category "${cat}" to master categories list?`,
      async () => {
        const updated = [...categories, cat];
        await saveCategoriesList(updated);
        setNewCategoryInput('');
        showToast(`Category "${cat}" added successfully`);
      },
      'success'
    );
  };

  const handleDeleteCategory = (cat: string) => {
    openConfirm(
      'Delete Category',
      `Are you sure you want to delete category "${cat}"?`,
      async () => {
        const updated = categories.filter(c => c !== cat);
        await saveCategoriesList(updated);
        showToast(`Category "${cat}" removed`);
      },
      'danger'
    );
  };

  // Brand Handlers
  const handleAddBrand = () => {
    if (!newBrandInput.trim()) return;
    const brd = newBrandInput.trim();
    if (brands.includes(brd)) {
      showToast('Brand already exists!', 'error');
      return;
    }
    openConfirm(
      'Add Automotive Brand',
      `Add brand "${brd}" to automotive brands database?`,
      async () => {
        const updated = [...brands, brd];
        await saveBrandsList(updated);
        setNewBrandInput('');
        showToast(`Brand "${brd}" added successfully`);
      },
      'success'
    );
  };

  const handleDeleteBrand = (brd: string) => {
    openConfirm(
      'Delete Brand',
      `Delete brand "${brd}" from system?`,
      async () => {
        const updated = brands.filter(b => b !== brd);
        await saveBrandsList(updated);
        showToast(`Brand "${brd}" removed`);
      },
      'danger'
    );
  };

  // Location Handlers
  const handleAddState = () => {
    if (!newStateInput.trim()) return;
    const st = newStateInput.trim();
    if (locations[st]) {
      showToast('State already exists', 'error');
      return;
    }
    openConfirm(
      'Add State / Region',
      `Add state "${st}" to locations database?`,
      async () => {
        const updated = { ...locations, [st]: [] };
        await saveLocationsData(updated);
        setNewStateInput('');
        showToast(`State "${st}" added`);
      },
      'success'
    );
  };

  const handleAddDistrict = () => {
    const { state, district } = newDistrictInput;
    if (!state || !district.trim()) return;
    const dist = district.trim();
    const currentDistricts = locations[state] || [];
    if (currentDistricts.includes(dist)) {
      showToast('District already exists in this state', 'error');
      return;
    }
    openConfirm(
      'Add District / Hub',
      `Add district "${dist}" under state "${state}"?`,
      async () => {
        const updated = { ...locations, [state]: [...currentDistricts, dist] };
        await saveLocationsData(updated);
        setNewDistrictInput({ state: '', district: '' });
        showToast(`District "${dist}" added under ${state}`);
      },
      'success'
    );
  };

  const handleDeleteDistrict = (state: string, dist: string) => {
    openConfirm(
      'Delete District',
      `Delete district "${dist}" from ${state}?`,
      async () => {
        const current = locations[state] || [];
        const updated = { ...locations, [state]: current.filter(d => d !== dist) };
        await saveLocationsData(updated);
        showToast(`District "${dist}" deleted`);
      },
      'danger'
    );
  };

  // Report Resolution
  const handleResolveReport = (report: ListingReport, status: 'resolved' | 'dismissed') => {
    openConfirm(
      `${status === 'resolved' ? 'Resolve' : 'Dismiss'} Report`,
      `Mark report for "${report.listingTitle}" as ${status.toUpperCase()}?`,
      async () => {
        await updateReportStatusByAdmin(report.id, status, 'Resolved by Super Admin');
        showToast(`Report marked as ${status}`);
      },
      'success'
    );
  };

  // Banner Handlers
  const handleSaveBanner = async () => {
    if (!bannerForm?.title || !bannerForm?.imageUrl) {
      showToast('Please provide a title and image URL for the banner', 'error');
      return;
    }
    setLoadingAction(true);
    try {
      await saveBannerInAdmin(bannerForm);
      showToast('Banner saved successfully!');
      setBannerForm(null);
    } catch (err: any) {
      showToast(err?.message || 'Error saving banner', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteBanner = (bannerId: string, title: string) => {
    openConfirm(
      'Delete Promo Banner',
      `Are you sure you want to delete banner "${title}"?`,
      async () => {
        await deleteBannerInAdmin(bannerId);
        showToast('Banner deleted successfully');
      },
      'danger'
    );
  };

  // App Settings Handler
  const handleSaveAppSettings = () => {
    openConfirm(
      'Save App Settings',
      'Are you sure you want to update global app settings in Firestore? Changes take effect immediately for all app visitors.',
      async () => {
        await saveAppSettingsInAdmin(settingsForm);
        showToast('App Settings updated and synced with Firestore!');
      },
      'warning'
    );
  };

  // Broadcast Notification
  const handleSendBroadcastNotification = () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast('Please enter both notification title and message', 'error');
      return;
    }
    openConfirm(
      'Send Push Notification / Broadcast',
      `Are you sure you want to send this push notification to ${notifForm.targetUserId ? `User ID ${notifForm.targetUserId}` : 'ALL USERS'}?`,
      async () => {
        const count = await broadcastNotificationToUsers(
          notifForm.title,
          notifForm.message,
          notifForm.targetUserId || undefined,
          notifForm.link
        );
        showToast(`Notification broadcasted to ${count} user(s)!`);
        setNotifForm({ title: '', message: '', targetUserId: '', link: '' });
      },
      'warning'
    );
  };

  // Filtered Listings
  const filteredListings = listings.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(listingSearch.toLowerCase()) ||
      item.make.toLowerCase().includes(listingSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(listingSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (listingStatusFilter === 'all') return true;
    return item.status === listingStatusFilter;
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.uid.toLowerCase().includes(userSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (userRoleFilter === 'verified') return u.verified;
    if (userRoleFilter === 'blocked') return (u as any).blocked;
    return true;
  });

  // Filtered Reports
  const filteredReports = reports.filter(r => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  // Calculated Analytics Metrics
  const totalUsersCount = users.length || 1;
  const totalListingsCount = listings.length;
  const activeListingsCount = listings.filter(l => l.status === 'active').length;
  const soldListingsCount = listings.filter(l => l.status === 'sold').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const verifiedSellersCount = users.filter(u => u.verified).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
            : 'bg-rose-950 text-rose-300 border-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          {toast.message}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-2xl ${
                confirmModal.actionType === 'danger' ? 'bg-rose-950/80 text-rose-400 border border-rose-800' : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {confirmModal.description}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                disabled={loadingAction}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteConfirm}
                disabled={loadingAction}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-slate-950 flex items-center gap-2 transition-transform transform active:scale-95 ${
                  confirmModal.actionType === 'danger' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                }`}
              >
                {loadingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col shrink-0">
        
        {/* Admin Header Branding */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-slate-950 font-extrabold shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1">
                Admin Panel
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold border border-emerald-800">LIVE</span>
              </h1>
              <p className="text-[10px] text-cyan-400 font-semibold truncate max-w-[140px]">{superAdminEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'listings', label: 'Listings Control', icon: Package, badge: listings.length },
            { id: 'users', label: 'Users & Sellers', icon: Users, badge: users.length },
            { id: 'categories', label: 'Part Categories', icon: Tag, badge: categories.length },
            { id: 'brands', label: 'Automotive Brands', icon: Car, badge: brands.length },
            { id: 'locations', label: 'Locations & Hubs', icon: MapPin },
            { id: 'reports', label: 'Reported Content', icon: Flag, badge: pendingReportsCount > 0 ? pendingReportsCount : undefined, alert: pendingReportsCount > 0 },
            { id: 'notifications', label: 'Push & Broadcasts', icon: Bell },
            { id: 'banners', label: 'Promo Banners', icon: ImageIcon, badge: banners.length },
            { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
            { id: 'settings', label: 'App Settings', icon: Settings },
            { id: 'force-update', label: 'Force App Update', icon: RefreshCw, badge: appSettings?.forceUpdate ? 'ACTIVE' : undefined, alert: appSettings?.forceUpdate },
            { id: 'logs', label: 'Admin Audit Logs', icon: FileText, badge: adminLogs.length },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.alert 
                      ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' 
                      : isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Admin Info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <button
            onClick={onClose}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-slate-400" /> Back to App
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </aside>

      {/* Main Content View Container */}
      <main className="flex-1 bg-slate-950 flex flex-col overflow-y-auto p-4 md:p-6 custom-scrollbar">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  System Overview
                  <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-800">
                    Realtime Firestore Connected
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Super Admin Command Center • Registered Email: {superAdminEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
                >
                  <Megaphone className="w-3.5 h-3.5" /> Broadcast Push Notice
                </button>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Users', val: users.length, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/60' },
                { label: 'Total Listings', val: listings.length, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/60' },
                { label: 'Active Listings', val: activeListingsCount, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60' },
                { label: 'Verified Sellers', val: verifiedSellersCount, icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/60' },
                { label: 'Reported Content', val: reports.length, icon: Flag, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60' },
                { label: 'Active Banners', val: banners.filter(b => b.active).length, icon: ImageIcon, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/60' },
              ].map((st, i) => {
                const Icon = st.icon;
                return (
                  <div key={i} className={`p-4 rounded-2xl border ${st.bg} flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{st.label}</span>
                      <Icon className={`w-4 h-4 ${st.color}`} />
                    </div>
                    <div className="text-2xl font-black text-white">{st.val}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions & System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Quick Action Shortcuts */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
                <h3 className="text-sm font-extrabold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Admin Quick Control Shortcuts
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-left text-xs transition-all group"
                  >
                    <Package className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white">Manage Listings</div>
                    <div className="text-[10px] text-slate-400">Approve or reject listings</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-left text-xs transition-all group"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white">Verify Sellers</div>
                    <div className="text-[10px] text-slate-400">Grant verified badge</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-left text-xs transition-all group"
                  >
                    <Flag className="w-4 h-4 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white">Moderation Reports</div>
                    <div className="text-[10px] text-slate-400">{pendingReportsCount} pending review</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('banners')}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-left text-xs transition-all group"
                  >
                    <ImageIcon className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white">Homepage Banners</div>
                    <div className="text-[10px] text-slate-400">Add or edit promos</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-left text-xs transition-all group"
                  >
                    <Settings className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white">Maintenance Mode</div>
                    <div className="text-[10px] text-slate-400">System configuration</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('logs')}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl text-left text-xs transition-all group"
                  >
                    <FileText className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-white">Audit Logs</div>
                    <div className="text-[10px] text-slate-400">Track all admin actions</div>
                  </button>
                </div>
              </div>

              {/* Maintenance & System Status Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-2 flex items-center justify-between">
                    <span>System Status</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      appSettings?.maintenanceMode ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {appSettings?.maintenanceMode ? 'MAINTENANCE MODE' : 'ONLINE'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    {appSettings?.maintenanceMode 
                      ? 'App is currently locked for non-admins.' 
                      : 'Marketplace is active and accepting new user listings.'}
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const next = !appSettings?.maintenanceMode;
                      openConfirm(
                        `${next ? 'Enable' : 'Disable'} Maintenance Mode`,
                        `Are you sure you want to ${next ? 'enable maintenance mode' : 'restore normal operations'}?`,
                        async () => {
                          await saveAppSettingsInAdmin({ maintenanceMode: next });
                          showToast(`Maintenance mode ${next ? 'ENABLED' : 'DISABLED'}`);
                        },
                        next ? 'warning' : 'success'
                      );
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      appSettings?.maintenanceMode 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' 
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {appSettings?.maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                  </button>
                </div>
              </div>

            </div>

            {/* Recent Audit Logs Snapshot */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Recent Admin Audit Logs
                </h3>
                <button
                  onClick={() => setActiveTab('logs')}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  View All Logs ({adminLogs.length})
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Admin Email</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Target</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {adminLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-cyan-300">{log.adminEmail}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{log.action}</td>
                        <td className="py-2.5 px-3 text-slate-400">{log.targetType}: {log.targetId}</td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{log.details || 'N/A'}</td>
                      </tr>
                    ))}
                    {adminLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">No admin logs recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LISTINGS CONTROL */}
        {activeTab === 'listings' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  Listings Management
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                    {filteredListings.length} Total
                  </span>
                </h2>
                <p className="text-xs text-slate-400">View, search, edit, approve, reject, delete or restore user spare part listings.</p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="Search listings by title, seller name, make or ID..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <select
                  value={listingStatusFilter}
                  onChange={(e) => setListingStatusFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Listings Data Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Item</th>
                      <th className="py-3 px-3">Category / Vehicle</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Seller</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {filteredListings.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.images?.[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=120'}
                              alt={item.title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white max-w-xs truncate">{item.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-300">{item.category}</div>
                          <div className="text-[10px] text-slate-400">{item.make} {item.model} ({item.year})</div>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-emerald-400">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{item.sellerName}</div>
                          <div className="text-[10px] text-slate-400">{item.location?.district}, {item.location?.state}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.status === 'active' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            item.status === 'rejected' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {onSelectListing && (
                              <button
                                onClick={() => onSelectListing(item)}
                                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                                title="View Item"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => setEditListingModal(item)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                              title="Edit Listing"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {item.status !== 'active' && (
                              <button
                                onClick={() => handleListingStatusChange(item, 'active')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-950/50 rounded-lg"
                                title="Approve Listing"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {item.status === 'active' && (
                              <button
                                onClick={() => handleListingStatusChange(item, 'rejected')}
                                className="p-1.5 text-amber-400 hover:bg-amber-950/50 rounded-lg"
                                title="Reject Listing"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteListing(item)}
                              className="p-1.5 text-rose-400 hover:bg-rose-950/50 rounded-lg"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredListings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">No listings found matching your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USERS & SELLERS */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  User Directory
                  <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                    {filteredUsers.length} Users
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Manage registered buyers & sellers, grant verification badges, or block bad actors.</p>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by name, email, phone or UID..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none w-full sm:w-auto"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified Sellers Only</option>
                <option value="blocked">Blocked Users Only</option>
              </select>
            </div>

            {/* Users Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredUsers.map((u) => {
                const isBlocked = (u as any).blocked;
                return (
                  <div key={u.uid} className={`bg-slate-900 border ${isBlocked ? 'border-rose-900/80 bg-rose-950/10' : 'border-slate-800'} rounded-2xl p-4 flex flex-col justify-between shadow-md`}>
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.displayName}`}
                            alt={u.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                              {u.displayName}
                              {u.verified && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <div className="text-[11px] text-cyan-400">{u.email || 'No Email'}</div>
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isBlocked ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {isBlocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1 mb-4 border-t border-slate-800/80 pt-2.5">
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span className="text-slate-200 font-mono">{u.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="text-slate-200">{u.district ? `${u.district}, ${u.state}` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Joined:</span>
                          <span className="text-slate-200">{new Date(u.createdAt || 0).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-800/80 pt-3">
                      <button
                        onClick={() => handleToggleVerify(u)}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
                          u.verified 
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800 hover:bg-amber-950' 
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-950'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {u.verified ? 'Revoke Verified' : 'Verify Seller'}
                      </button>

                      <button
                        onClick={() => handleToggleBlock(u)}
                        className={`py-1.5 px-3 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 ${
                          isBlocked 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isBlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isBlocked ? 'Unblock' : 'Block'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-rose-400 hover:bg-rose-950 rounded-xl"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">No users found in directory.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Part Categories Management</h2>
              <p className="text-xs text-slate-400">Add, edit, or remove master spare part categories synced with Firestore.</p>
            </div>

            {/* Add Category Input */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Enter new category name..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleAddCategory}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">{cat}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BRANDS */}
        {activeTab === 'brands' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Automotive Brands Database</h2>
              <p className="text-xs text-slate-400">Manage supported car, bike, scooter, truck, and tractor manufacturers.</p>
            </div>

            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={newBrandInput}
                onChange={(e) => setNewBrandInput(e.target.value)}
                placeholder="Enter brand name (e.g. BMW, Royal Enfield)..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleAddBrand}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Brand
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {brands.map((brd, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200 truncate">{brd}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteBrand(brd)}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LOCATIONS & HUBS */}
        {activeTab === 'locations' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Locations & Auto Spare Parts Hubs</h2>
              <p className="text-xs text-slate-400">Manage Indian states and scrap market districts (Mayapuri, Kurla, Pudupet, etc.).</p>
            </div>

            {/* Add State & District Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl bg-slate-900 p-4 border border-slate-800 rounded-2xl">
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Add New State / UT</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStateInput}
                    onChange={(e) => setNewStateInput(e.target.value)}
                    placeholder="e.g. Punjab, Goa..."
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                  <button
                    onClick={handleAddState}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Add District under State</label>
                <div className="space-y-2">
                  <select
                    value={newDistrictInput.state}
                    onChange={(e) => setNewDistrictInput(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 outline-none"
                  >
                    <option value="">Select State...</option>
                    {Object.keys(locations).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDistrictInput.district}
                      onChange={(e) => setNewDistrictInput(prev => ({ ...prev, district: e.target.value }))}
                      placeholder="e.g. Mayapuri Auto Market..."
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                    />
                    <button
                      onClick={handleAddDistrict}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Display Locations Tree */}
            <div className="space-y-3">
              {Object.keys(locations).map((state) => (
                <div key={state} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <div className="font-extrabold text-sm text-cyan-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {state}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {locations[state]?.map((dist) => (
                      <span key={dist} className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                        {dist}
                        <button
                          onClick={() => handleDeleteDistrict(state, dist)}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Content Moderation & Reports</h2>
              <p className="text-xs text-slate-400">Review reported listings and flag suspicious behavior.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none"
              >
                <option value="all">All Reports ({reports.length})</option>
                <option value="pending">Pending ({pendingReportsCount})</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flag className="w-4 h-4 text-rose-400" />
                      <span className="font-extrabold text-white text-xs">{rep.listingTitle}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rep.status === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1">Reason: <span className="font-semibold text-rose-300">{rep.reason}</span></p>
                    <div className="text-[10px] text-slate-500">Report ID: {rep.id} • Date: {new Date(rep.createdAt).toLocaleString()}</div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(rep, 'resolved')}
                        className="bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 px-3 py-1.5 rounded-xl text-xs font-bold"
                      >
                        Resolve & Action
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep, 'dismissed')}
                        className="bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredReports.length === 0 && (
                <div className="py-12 text-center text-slate-500">No moderation reports found.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: NOTIFICATIONS & BROADCASTS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in max-w-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Push & Broadcast Announcements</h2>
              <p className="text-xs text-slate-400">Send system notifications directly to user notification feeds in Firestore.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Notification Title *</label>
                <input
                  type="text"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. ⚡ Special Discount on Engine Spare Parts!"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Notification Message *</label>
                <textarea
                  rows={3}
                  value={notifForm.message}
                  onChange={(e) => setNotifForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter broadcast message details for AutoPartsIndia buyers and sellers..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Target Specific User ID (Optional)</label>
                  <input
                    type="text"
                    value={notifForm.targetUserId}
                    onChange={(e) => setNotifForm(prev => ({ ...prev, targetUserId: e.target.value }))}
                    placeholder="Leave empty to send to ALL users..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">CTA Link / Route (Optional)</label>
                  <input
                    type="text"
                    value={notifForm.link}
                    onChange={(e) => setNotifForm(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="e.g. #marketplace or #chat_123"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSendBroadcastNotification}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <Megaphone className="w-4 h-4" /> Send Broadcast Notification
              </button>
            </div>
          </div>
        )}

        {/* TAB 9: BANNERS */}
        {activeTab === 'banners' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-xl font-black text-white">Homepage Promo Banners</h2>
                <p className="text-xs text-slate-400">Manage promotional slides displayed on top of the marketplace home screen.</p>
              </div>
              <button
                onClick={() => setBannerForm({ active: true, order: banners.length + 1 })}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Promo Banner
              </button>
            </div>

            {/* Banner Form Modal */}
            {bannerForm && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xl space-y-3 shadow-xl">
                <h3 className="text-sm font-extrabold text-white">
                  {bannerForm.id ? 'Edit Promo Banner' : 'Create New Promo Banner'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Banner Title *</label>
                    <input
                      type="text"
                      value={bannerForm.title || ''}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Mayapuri Mega Clearance"
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={bannerForm.subtitle || ''}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g. Up to 40% Off Certified OEM Parts"
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div className="col-span-full">
                    <label className="text-slate-400 block mb-1">Image URL *</label>
                    <input
                      type="text"
                      value={bannerForm.imageUrl || ''}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={bannerForm.ctaText || ''}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, ctaText: e.target.value }))}
                      placeholder="e.g. Shop Now"
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Badge Label</label>
                    <input
                      type="text"
                      value={bannerForm.badge || ''}
                      onChange={(e) => setBannerForm(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. MAYAPURI SALE"
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setBannerForm(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBanner}
                    className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-xl"
                  >
                    Save Banner
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                  <div className="h-32 bg-slate-800 relative">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {b.badge || 'PROMO'}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{b.title}</h4>
                      <p className="text-xs text-slate-400 mb-3">{b.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                      <span className="text-[10px] text-slate-500">CTA: {b.ctaText}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBannerForm(b)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id, b.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">No promo banners configured yet.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Platform Growth & Analytics</h2>
              <p className="text-xs text-slate-400">Statistical distribution of auto spare part inventory and market metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" /> Listings by Part Category
                </h3>
                <div className="space-y-3">
                  {categories.slice(0, 6).map((cat) => {
                    const count = listings.filter(l => l.category === cat).length;
                    const pct = totalListingsCount ? Math.round((count / totalListingsCount) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{cat}</span>
                          <span className="text-cyan-400 font-bold">{count} items ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${pct || 10}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vehicle Type Breakdown */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-400" /> Inventory by Vehicle Segment
                </h3>
                <div className="space-y-3">
                  {['Four Wheeler (Car)', 'Two Wheeler (Bike/Scooter)', 'Commercial (Truck/Bus/Auto)', 'Tractor & Heavy Equipment'].map((vt) => {
                    const count = listings.filter(l => l.vehicleType === vt).length;
                    const pct = totalListingsCount ? Math.round((count / totalListingsCount) * 100) : 0;
                    return (
                      <div key={vt} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{vt}</span>
                          <span className="text-emerald-400 font-bold">{count} items ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${pct || 15}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 11: APP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in max-w-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">App Settings & Controls</h2>
              <p className="text-xs text-slate-400">Global system maintenance, force update policies, and contact information.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              
              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div>
                  <div className="font-bold text-white text-xs">Maintenance Mode</div>
                  <div className="text-[11px] text-slate-400">Lock app for non-admin visitors</div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.maintenanceMode || false}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Force Update Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700">
                <div>
                  <div className="font-bold text-white text-xs">Force App Update</div>
                  <div className="text-[11px] text-slate-400">Require users to reload / update client</div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.forceUpdate || false}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, forceUpdate: e.target.checked }))}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Support Helpline Phone</label>
                  <input
                    type="text"
                    value={settingsForm.supportPhone || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, supportPhone: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Support Email</label>
                  <input
                    type="text"
                    value={settingsForm.supportEmail || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, supportEmail: e.target.value }))}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              {/* Terms Content */}
              <div className="text-xs">
                <label className="text-slate-400 block mb-1 font-semibold">Terms & Conditions Text</label>
                <textarea
                  rows={3}
                  value={settingsForm.termsContent || ''}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, termsContent: e.target.value }))}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <button
                onClick={handleSaveAppSettings}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Settings className="w-4 h-4" /> Save Global Settings
              </button>
            </div>
          </div>
        )}

        {/* TAB 12: FORCE APP UPDATE MANAGEMENT */}
        {activeTab === 'force-update' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                  Force App Update Manager
                </h2>
                <p className="text-xs text-slate-400">
                  Configure minimum required version numbers and enforce instant app updates across all client devices via Firestore configuration.
                </p>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${
                settingsForm.forceUpdate 
                  ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {settingsForm.forceUpdate ? 'FORCE UPDATE ENFORCED' : 'NORMAL MODE'}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
              
              {/* Force Update Toggle Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${settingsForm.forceUpdate ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className="text-sm font-bold text-white">Enforce Mandatory Client Update</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    When active, users with app versions lower than the minimum required version will be prompted to update immediately.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.forceUpdate || false}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, forceUpdate: e.target.checked }))}
                  className="w-6 h-6 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Version Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Minimum Required Version</label>
                  <input
                    type="text"
                    value={settingsForm.minimumAppVersion || '2.4.0'}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, minimumAppVersion: e.target.value }))}
                    placeholder="e.g. 2.4.0"
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Users below this version will be blocked until updated.</p>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Release / Play Store Download Link</label>
                  <input
                    type="text"
                    value={settingsForm.updateMessage ? (settingsForm as any).updateUrl || 'https://play.google.com/store/apps/details?id=com.autopartsindia.app' : 'https://play.google.com/store/apps/details?id=com.autopartsindia.app'}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, updateUrl: e.target.value } as any))}
                    placeholder="https://play.google.com/store/apps/..."
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Direct link to APK or Store listing.</p>
                </div>
              </div>

              {/* Release Notes / Message */}
              <div className="text-xs space-y-1">
                <label className="text-slate-300 block font-bold">Mandatory Update Release Notes / Description</label>
                <textarea
                  rows={4}
                  value={settingsForm.updateMessage || ''}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, updateMessage: e.target.value }))}
                  placeholder="Explain critical security patches, performance upgrades, or new features..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              {/* Broadcast Force Update Alert Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={async () => {
                    openConfirm(
                      'Broadcast Force Update Alert',
                      'This will send a mandatory update notification to all registered users and update app settings in Firestore.',
                      async () => {
                        await saveAppSettingsInAdmin(settingsForm);
                        await broadcastNotificationToUsers(
                          '🚨 Mandatory App Update Required',
                          settingsForm.updateMessage || `Version ${settingsForm.minimumAppVersion} is now live! Please update to continue using AutoParts India.`,
                          undefined,
                          '#update'
                        );
                        showToast('Force update published & broadcast notification sent to all users!');
                      },
                      'warning'
                    );
                  }}
                  className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Megaphone className="w-4 h-4 text-slate-950" />
                  Save & Broadcast Update Alert to All Users
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 12: ADMIN AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">Admin Activity Audit Logs</h2>
              <p className="text-xs text-slate-400">Complete immutable record of all super admin logins and modification actions in Firestore.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Admin Email</th>
                      <th className="py-3 px-3">Action</th>
                      <th className="py-3 px-3">Target Entity</th>
                      <th className="py-3 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {adminLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-cyan-300">{log.adminEmail}</td>
                        <td className="py-3 px-3 font-semibold text-white">{log.action}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{log.targetType}: {log.targetId}</td>
                        <td className="py-3 px-3 text-slate-300 max-w-sm truncate">{log.details || 'N/A'}</td>
                      </tr>
                    ))}
                    {adminLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">No logs recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Edit Listing Modal */}
      {editListingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Listing (Admin Override)
              </h3>
              <button onClick={() => setEditListingModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  value={editListingModal.title}
                  onChange={(e) => setEditListingModal(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Price (₹)</label>
                  <input
                    type="number"
                    value={editListingModal.price}
                    onChange={(e) => setEditListingModal(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Category</label>
                  <input
                    type="text"
                    value={editListingModal.category}
                    onChange={(e) => setEditListingModal(prev => prev ? ({ ...prev, category: e.target.value as any }) : null)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  value={editListingModal.description}
                  onChange={(e) => setEditListingModal(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditListingModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveListingEdit}
                disabled={loadingAction}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-xl flex items-center gap-1.5"
              >
                {loadingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
