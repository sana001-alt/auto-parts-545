import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProfile, Listing, ListingReport, AppNotification } from '../types';

export interface AdminLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  timestamp: string;
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  badge: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface AppSettingsConfig {
  maintenanceMode: boolean;
  maintenanceReason?: string;
  forceUpdate: boolean;
  minimumAppVersion: string;
  updateMessage?: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  termsContent: string;
  privacyContent: string;
  updatedAt: string;
  updatedBy: string;
}

const SUPER_ADMIN_EMAIL = 'autoparts2@gmail.com';

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();
}

// Log admin action to Firestore
export async function logAdminAction(
  action: string, 
  targetType: string, 
  targetId: string, 
  details?: string
): Promise<void> {
  const currentEmail = auth.currentUser?.email || SUPER_ADMIN_EMAIL;
  const logId = 'log_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6);
  const logEntry: AdminLog = {
    id: logId,
    adminEmail: currentEmail,
    action,
    targetType,
    targetId,
    details: details || '',
    timestamp: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'adminLogs', logId), logEntry);
  } catch (err) {
    console.warn('Error saving admin log to Firestore:', err);
  }
}

// Realtime User Subscription
export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  try {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((d) => {
        users.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      users.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(users);
    }, (err) => {
      console.warn('Error fetching users from Firestore:', err);
      callback([]);
    });
  } catch (err) {
    console.warn('Users subscription error:', err);
    callback([]);
    return () => {};
  }
}

// Verify or Unverify Seller
export async function toggleVerifySeller(uid: string, verify: boolean): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      verified: verify,
      updatedAt: new Date().toISOString()
    });
    await logAdminAction(
      verify ? 'Verify Seller' : 'Revoke Verification', 
      'User', 
      uid, 
      `Seller verification set to ${verify}`
    );
  } catch (err) {
    console.error('Error toggling seller verification:', err);
    throw err;
  }
}

// Block or Unblock User
export async function toggleBlockUser(uid: string, block: boolean, reason?: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      blocked: block,
      blockReason: reason || '',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await logAdminAction(
      block ? 'Block User' : 'Unblock User', 
      'User', 
      uid, 
      `User blocked status: ${block}. Reason: ${reason || 'N/A'}`
    );
  } catch (err) {
    console.error('Error toggling user block:', err);
    throw err;
  }
}

// Delete User Profile
export async function deleteUserByAdmin(uid: string, userEmail?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid));
    await logAdminAction('Delete User', 'User', uid, `Deleted user profile ${userEmail || uid}`);
  } catch (err) {
    console.error('Error deleting user by admin:', err);
    throw err;
  }
}

// Realtime Reports Subscription
export function subscribeToReports(callback: (reports: ListingReport[]) => void) {
  try {
    const reportsRef = collection(db, 'reports');
    return onSnapshot(reportsRef, (snapshot) => {
      const reports: ListingReport[] = [];
      snapshot.forEach((d) => {
        reports.push({ id: d.id, ...d.data() } as ListingReport);
      });
      reports.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(reports);
    }, (err) => {
      console.warn('Reports subscription error:', err);
      callback([]);
    });
  } catch (err) {
    console.warn('Reports subscription error:', err);
    callback([]);
    return () => {};
  }
}

// Update Report Status (Resolved / Dismissed)
export async function updateReportStatusByAdmin(
  reportId: string, 
  status: 'resolved' | 'dismissed', 
  notes?: string
): Promise<void> {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      adminNotes: notes || '',
      resolvedAt: new Date().toISOString()
    });
    await logAdminAction('Update Report Status', 'Report', reportId, `Status set to ${status}. Note: ${notes || ''}`);
  } catch (err) {
    console.error('Error updating report status:', err);
    throw err;
  }
}

// Realtime Categories Subscription
export function subscribeToCategories(callback: (categories: string[]) => void) {
  const DEFAULT_CATEGORIES = [
    'Engine & Transmission',
    'Body Parts & Frame',
    'Lights, Mirrors & Glass',
    'Brakes & Suspension',
    'Electrical & Battery',
    'Wheels, Tyres & Alloys',
    'Interior, AC & Comfort',
    'Exhaust, Fuel & Cooling',
    'Accessories & Fluids'
  ];

  try {
    const docRef = doc(db, 'appData', 'categories');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && Array.isArray(snapshot.data().items)) {
        callback(snapshot.data().items);
      } else {
        // Seed initial categories
        setDoc(docRef, { items: DEFAULT_CATEGORIES, updatedAt: new Date().toISOString() })
          .catch(err => console.warn('Categories seed error:', err));
        callback(DEFAULT_CATEGORIES);
      }
    }, (err) => {
      console.warn('Categories subscription error:', err);
      callback(DEFAULT_CATEGORIES);
    });
  } catch (err) {
    console.warn('Categories subscription error:', err);
    callback(DEFAULT_CATEGORIES);
    return () => {};
  }
}

export async function saveCategoriesList(categories: string[]): Promise<void> {
  try {
    const docRef = doc(db, 'appData', 'categories');
    await setDoc(docRef, {
      items: categories,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || SUPER_ADMIN_EMAIL
    });
    await logAdminAction('Update Categories', 'Categories', 'master_categories', `Total categories: ${categories.length}`);
  } catch (err) {
    console.error('Error saving categories:', err);
    throw err;
  }
}

// Realtime Brands Subscription
export function subscribeToBrands(callback: (brands: string[]) => void) {
  const DEFAULT_BRANDS = [
    'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'Volkswagen', 'Skoda',
    'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Renault', 'MG', 'Nissan', 'Hero', 'TVS', 'Bajaj',
    'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM', 'Honda 2 Wheelers', 'Ather', 'Tata Motors', 'Ashok Leyland',
    'BharatBenz', 'Force Motors', 'Piaggio', 'Eicher', 'Swaraj', 'Sonalika', 'John Deere'
  ];

  try {
    const docRef = doc(db, 'appData', 'brands');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && Array.isArray(snapshot.data().items)) {
        callback(snapshot.data().items);
      } else {
        setDoc(docRef, { items: DEFAULT_BRANDS, updatedAt: new Date().toISOString() })
          .catch(err => console.warn('Brands seed error:', err));
        callback(DEFAULT_BRANDS);
      }
    }, (err) => {
      console.warn('Brands subscription error:', err);
      callback(DEFAULT_BRANDS);
    });
  } catch (err) {
    console.warn('Brands subscription error:', err);
    callback(DEFAULT_BRANDS);
    return () => {};
  }
}

export async function saveBrandsList(brands: string[]): Promise<void> {
  try {
    const docRef = doc(db, 'appData', 'brands');
    await setDoc(docRef, {
      items: brands,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || SUPER_ADMIN_EMAIL
    });
    await logAdminAction('Update Brands', 'Brands', 'master_brands', `Total brands: ${brands.length}`);
  } catch (err) {
    console.error('Error saving brands:', err);
    throw err;
  }
}

// Locations (States & Districts)
export function subscribeToLocations(callback: (locations: Record<string, string[]>) => void) {
  try {
    const docRef = doc(db, 'appData', 'locations');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data().data) {
        callback(snapshot.data().data);
      } else {
        callback({});
      }
    }, (err) => {
      console.warn('Locations subscription error:', err);
      callback({});
    });
  } catch (err) {
    console.warn('Locations subscription error:', err);
    callback({});
    return () => {};
  }
}

export async function saveLocationsData(locations: Record<string, string[]>): Promise<void> {
  try {
    const docRef = doc(db, 'appData', 'locations');
    await setDoc(docRef, {
      data: locations,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || SUPER_ADMIN_EMAIL
    });
    await logAdminAction('Update Locations', 'Locations', 'master_locations', `Total states: ${Object.keys(locations).length}`);
  } catch (err) {
    console.error('Error saving locations:', err);
    throw err;
  }
}

// Banners Subscription
export function subscribeToBanners(callback: (banners: AdminBanner[]) => void) {
  try {
    const bannersRef = collection(db, 'banners');
    return onSnapshot(bannersRef, (snapshot) => {
      const items: AdminBanner[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as AdminBanner);
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(items);
    }, (err) => {
      console.warn('Banners subscription error:', err);
      callback([]);
    });
  } catch (err) {
    console.warn('Banners subscription error:', err);
    callback([]);
    return () => {};
  }
}

export async function saveBannerInAdmin(banner: Partial<AdminBanner>): Promise<void> {
  const bannerId = banner.id || 'banner_' + Date.now().toString();
  const payload: AdminBanner = {
    id: bannerId,
    title: banner.title || 'Special Auto Parts Sale',
    subtitle: banner.subtitle || 'Up to 50% Off Verified OEM Spare Parts',
    imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=1200',
    ctaText: banner.ctaText || 'Browse Marketplace',
    ctaLink: banner.ctaLink || '#marketplace',
    badge: banner.badge || 'PROMO',
    active: banner.active !== undefined ? banner.active : true,
    order: banner.order || 1,
    createdAt: banner.createdAt || new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'banners', bannerId), payload);
    await logAdminAction(banner.id ? 'Edit Banner' : 'Add Banner', 'Banner', bannerId, `Title: ${payload.title}`);
  } catch (err) {
    console.error('Error saving banner:', err);
    throw err;
  }
}

export async function deleteBannerInAdmin(bannerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
    await logAdminAction('Delete Banner', 'Banner', bannerId);
  } catch (err) {
    console.error('Error deleting banner:', err);
    throw err;
  }
}

// Global App Settings
export function subscribeToAppSettings(callback: (settings: AppSettingsConfig | null) => void) {
  try {
    const docRef = doc(db, 'appSettings', 'config');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as AppSettingsConfig);
      } else {
        callback(null);
      }
    }, (err) => {
      console.warn('App settings subscription error:', err);
      callback(null);
    });
  } catch (err) {
    console.warn('App settings subscription error:', err);
    callback(null);
    return () => {};
  }
}

export async function saveAppSettingsInAdmin(settings: Partial<AppSettingsConfig>): Promise<void> {
  const payload: AppSettingsConfig = {
    maintenanceMode: settings.maintenanceMode || false,
    maintenanceReason: settings.maintenanceReason || 'Scheduled system updates in progress. We will be back online shortly!',
    forceUpdate: settings.forceUpdate || false,
    minimumAppVersion: settings.minimumAppVersion || '1.0.0',
    updateMessage: settings.updateMessage || 'A mandatory security update is available for AutoPartsIndia.',
    supportPhone: settings.supportPhone || '+91 98110 45892',
    supportEmail: settings.supportEmail || 'support@autopartsindia.in',
    whatsappNumber: settings.whatsappNumber || '+91 98110 45892',
    termsContent: settings.termsContent || 'Terms and conditions for buying and selling genuine auto parts on AutoPartsIndia...',
    privacyContent: settings.privacyContent || 'Privacy policy details regarding user data security, location privacy, and transaction safety...',
    updatedAt: new Date().toISOString(),
    updatedBy: auth.currentUser?.email || SUPER_ADMIN_EMAIL
  };

  try {
    await setDoc(doc(db, 'appSettings', 'config'), payload);
    await logAdminAction('Update App Settings', 'AppSettings', 'config', `Maintenance: ${payload.maintenanceMode}, ForceUpdate: ${payload.forceUpdate}`);
  } catch (err) {
    console.error('Error saving app settings:', err);
    throw err;
  }
}

// Activity Logs Subscription
export function subscribeToAdminLogs(callback: (logs: AdminLog[]) => void) {
  try {
    const logsRef = collection(db, 'adminLogs');
    return onSnapshot(logsRef, (snapshot) => {
      const items: AdminLog[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as AdminLog);
      });
      items.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      callback(items);
    }, (err) => {
      console.warn('Admin logs subscription error:', err);
      callback([]);
    });
  } catch (err) {
    console.warn('Admin logs subscription error:', err);
    callback([]);
    return () => {};
  }
}

// Broadcast announcement to users
export async function broadcastNotificationToUsers(
  title: string, 
  message: string, 
  targetUserId?: string,
  link?: string
): Promise<number> {
  try {
    let userIds: string[] = [];
    if (targetUserId) {
      userIds = [targetUserId];
    } else {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((d) => {
        userIds.push(d.id);
      });
    }

    if (userIds.length === 0) {
      userIds = ['all_users'];
    }

    let sentCount = 0;
    for (const uid of userIds) {
      const notifId = 'notif_admin_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6);
      const notifData: AppNotification = {
        id: notifId,
        userId: uid,
        title,
        message,
        type: 'system',
        read: false,
        link: link || '#',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'notifications', notifId), notifData);
      sentCount++;
    }

    await logAdminAction('Broadcast Notification', 'Notification', targetUserId || 'ALL_USERS', `Sent to ${sentCount} user(s). Title: ${title}`);
    return sentCount;
  } catch (err) {
    console.error('Error broadcasting notification:', err);
    throw err;
  }
}
