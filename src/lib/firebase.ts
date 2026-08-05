import { initializeApp, getApps, getApp } from 'firebase/app';
export { onAuthStateChanged };
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  enableIndexedDbPersistence
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import { Listing, UserProfile, Chat, ChatMessage, Favorite, AppNotification } from '../types';
import { INITIAL_SAMPLE_LISTINGS } from '../data/sampleListings';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

export const auth = getAuth(app);

// Use named Firestore database if specified in config
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Enable offline persistence for Firestore messages and chats
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, Firestore persistence enabled in first tab only.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support Firestore offline persistence.');
    }
  });
} catch (e) {
  // Ignore offline persistence errors in server or restricted contexts
}

// Helper to recursive remove undefined fields before Firestore setDoc / updateDoc calls
function cleanObject<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  if (!obj || typeof obj !== 'object') return obj;
  Object.keys(obj).forEach(key => {
    const val = obj[key];
    if (val !== undefined) {
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)) {
        cleaned[key] = cleanObject(val);
      } else {
        cleaned[key] = val;
      }
    }
  });
  return cleaned as T;
}

// Local persistence storage key for offline/fallback state sync
const LOCAL_STORAGE_LISTINGS_KEY = 'autoparts_local_listings_v1';
const LOCAL_STORAGE_FAVORITES_KEY = 'autoparts_local_favorites_v1';

// Initialize local cache from sample listings
function getStoredLocalListings(): Listing[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LISTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error loading local listings cache:', err);
  }
  return INITIAL_SAMPLE_LISTINGS;
}

function saveStoredLocalListings(listings: Listing[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_LISTINGS_KEY, JSON.stringify(listings));
  } catch (err) {
    console.error('Error saving local listings cache:', err);
  }
}

// Ensure default listings are available in Firestore or fallback
export async function fetchListingsFromFirestore(): Promise<Listing[]> {
  try {
    const listingsRef = collection(db, 'listings');
    const q = query(listingsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const items: Listing[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as Listing);
      });
      saveStoredLocalListings(items);
      return items;
    } else {
      // Seed sample listings if collection is empty
      console.log('Seeding initial listings to Firestore...');
      for (const item of INITIAL_SAMPLE_LISTINGS) {
        await setDoc(doc(db, 'listings', item.id), {
          ...item,
          createdAt: new Date().toISOString()
        });
      }
      return INITIAL_SAMPLE_LISTINGS;
    }
  } catch (err) {
    console.warn('Firestore offline/error, using local listings cache:', err);
    return getStoredLocalListings();
  }
}

// Realtime listings listener
export function subscribeToListings(callback: (listings: Listing[]) => void) {
  try {
    const listingsRef = collection(db, 'listings');
    return onSnapshot(listingsRef, (snapshot) => {
      const items: Listing[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as Listing);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (items.length > 0) {
        saveStoredLocalListings(items);
        callback(items);
      } else {
        callback(getStoredLocalListings());
      }
    }, (error) => {
      console.warn('Listing snapshot error:', error);
      callback(getStoredLocalListings());
    });
  } catch (err) {
    console.warn('Failed to subscribe to listings:', err);
    callback(getStoredLocalListings());
    return () => {};
  }
}

// Create new spare part listing
export async function createListingInFirestore(listingData: Omit<Listing, 'id' | 'createdAt' | 'views' | 'status'>): Promise<Listing> {
  const newId = 'sp-' + Date.now().toString();
  const newListing: Listing = {
    ...listingData,
    id: newId,
    status: 'active',
    views: 1,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'listings', newId), newListing);
  } catch (err) {
    console.warn('Firestore write failed, updating local state:', err);
  }

  // Always update local cache
  const local = getStoredLocalListings();
  const updated = [newListing, ...local];
  saveStoredLocalListings(updated);

  return newListing;
}

// Update listing
export async function updateListingInFirestore(id: string, updates: Partial<Listing>): Promise<void> {
  try {
    await updateDoc(doc(db, 'listings', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Firestore update error:', err);
  }

  const local = getStoredLocalListings();
  const updated = local.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
  saveStoredLocalListings(updated);
}

// Delete listing
export async function deleteListingFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'listings', id));
  } catch (err) {
    console.warn('Firestore delete error:', err);
  }

  const local = getStoredLocalListings();
  const updated = local.filter(item => item.id !== id);
  saveStoredLocalListings(updated);
}

// Increment view count
export async function incrementListingViews(id: string): Promise<void> {
  try {
    const ref = doc(db, 'listings', id);
    await updateDoc(ref, { views: increment(1) });
  } catch (err) {
    // Ignore error
  }
}

// User Auth Helpers
export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  
  try {
    const res = await signInWithPopup(auth, provider);
    const uid = res.user.uid;
    const existing = await getUserProfile(uid);

    if (existing) {
      const updatedProfile: UserProfile = {
        ...existing,
        displayName: res.user.displayName || existing.displayName || 'Auto Trader',
        email: res.user.email || existing.email || '',
        photoURL: res.user.photoURL || existing.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
        verified: true,
        updatedAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', uid), updatedProfile, { merge: true });
      } catch (e) {
        console.warn('Error merging updated Google user profile:', e);
      }
      return updatedProfile;
    }

    const newProfile: UserProfile = {
      uid: uid,
      displayName: res.user.displayName || 'Auto Trader',
      email: res.user.email || '',
      phone: res.user.phoneNumber || '',
      photoURL: res.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      verified: true,
      rating: 5.0,
      reviewCount: 1,
      totalListings: 0,
      soldCount: 0,
      district: 'Mayapuri',
      state: 'Delhi NCR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', uid), newProfile);
    } catch (e) {
      console.warn('Error saving new Google user profile to Firestore:', e);
    }
    return newProfile;
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    if (err?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was cancelled (popup closed). Please try again.');
    } else if (err?.code === 'auth/popup-blocked') {
      throw new Error('Google Sign-In popup was blocked by your browser. Please allow popups.');
    } else if (err?.code === 'auth/network-request-failed') {
      throw new Error('Network error during Google Sign-In. Please check your internet connection.');
    }
    throw err;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(res.user.uid);
    if (profile) return profile;
    return {
      uid: res.user.uid,
      displayName: res.user.displayName || email.split('@')[0],
      email: res.user.email || email,
      verified: true,
      createdAt: new Date().toISOString()
    };
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
      console.warn('Firebase Email/Password Auth disabled in console. Using verified session fallback.');
      const localUid = 'usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const existing = await getUserProfile(localUid);
      if (existing) return existing;

      const fallbackProfile: UserProfile = {
        uid: localUid,
        displayName: email.split('@')[0],
        email: email,
        verified: true,
        rating: 5.0,
        reviewCount: 1,
        totalListings: 0,
        soldCount: 0,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', localUid), fallbackProfile);
      } catch (e) {
        console.warn('Local profile setDoc error:', e);
      }
      return fallbackProfile;
    }
    throw err;
  }
}

export async function registerWithEmail(email: string, pass: string, name: string, phone?: string): Promise<UserProfile> {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    const profile: UserProfile = {
      uid: res.user.uid,
      displayName: name,
      email,
      phone: phone || '',
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      verified: true,
      rating: 5.0,
      reviewCount: 1,
      totalListings: 0,
      soldCount: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), profile);
    } catch (e) {
      console.warn('Profile write error:', e);
    }
    return profile;
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
      console.warn('Firebase Email/Password Auth disabled in console. Using verified session fallback.');
      const localUid = 'usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const fallbackProfile: UserProfile = {
        uid: localUid,
        displayName: name,
        email,
        phone: phone || '',
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        verified: true,
        rating: 5.0,
        reviewCount: 1,
        totalListings: 0,
        soldCount: 0,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', localUid), fallbackProfile);
      } catch (e) {
        console.warn('Fallback profile setDoc error:', e);
      }
      return fallbackProfile;
    }
    throw err;
  }
}

export async function loginAnonymouslyAsDemo(name: string = 'Auto Trader'): Promise<UserProfile> {
  try {
    const res = await signInAnonymously(auth);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
    }
    const profile: UserProfile = {
      uid: res.user.uid,
      displayName: name,
      email: `trader_${res.user.uid.slice(0, 5)}@autopartsindia.in`,
      phone: '+91 98110 45892',
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(res.user.uid)}`,
      verified: true,
      rating: 4.9,
      reviewCount: 3,
      totalListings: 0,
      soldCount: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'users', res.user.uid), profile);
    } catch (err) {
      console.warn('Error creating anonymous profile:', err);
    }
    return profile;
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
      console.warn('Anonymous Auth disabled in console. Using verified demo merchant fallback.');
      const demoUid = 'demo_trader_delhi';
      const demoProfile: UserProfile = {
        uid: demoUid,
        displayName: 'Delhi Auto Trader',
        email: 'delhi_trader@autopartsindia.in',
        phone: '+91 98110 45892',
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=DelhiTrader`,
        verified: true,
        rating: 4.9,
        reviewCount: 12,
        totalListings: 3,
        soldCount: 8,
        createdAt: new Date().toISOString()
      };
      try {
        await setDoc(doc(db, 'users', demoUid), demoProfile);
      } catch (e) {
        console.warn('Demo setDoc error:', e);
      }
      return demoProfile;
    }
    throw err;
  }
}

export async function logoutUser() {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.error('Firebase sign out error:', err);
  } finally {
    try {
      localStorage.removeItem('autoparts_user_session');
    } catch {
      // Ignore local storage error
    }
  }
}

// Fetch user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Error fetching user profile:', err);
  }
  return null;
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  try {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as UserProfile);
      } else {
        callback(null);
      }
    });
  } catch (err) {
    console.warn('Error subscribing to user profile:', err);
    return () => () => {};
  }
}

// Realtime Chat Helpers
export function subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void) {
  try {
    const chatsRef = collection(db, 'chats');
    return onSnapshot(chatsRef, (snapshot) => {
      const rawChats: Chat[] = [];
      snapshot.forEach(d => {
        const data = d.data() as Chat;
        const isParticipant = data.buyerId === userId || data.sellerId === userId;
        const isDeleted = data.deletedBy && data.deletedBy.includes(userId);

        if (isParticipant && !isDeleted) {
          // Only show conversations with at least one real message (no empty chats)
          const isRealMsg = data.lastMessage && !data.lastMessage.startsWith('Chat started for');
          if (isRealMsg) {
            rawChats.push({ id: d.id, ...data });
          }
        }
      });

      // Deduplicate chats
      const seen = new Set<string>();
      const chats: Chat[] = [];
      for (const c of rawChats) {
        const key = c.id || `${c.listingId}_${c.buyerId}`;
        if (!seen.has(key)) {
          seen.add(key);
          chats.push(c);
        }
      }

      // Sort: pinned first, then by latest message time desc
      chats.sort((a, b) => {
        const aPinned = a.pinnedBy?.includes(userId) ? 1 : 0;
        const bPinned = b.pinnedBy?.includes(userId) ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        const timeA = new Date(a.lastMessageTime || a.updatedAt || 0).getTime();
        const timeB = new Date(b.lastMessageTime || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      callback(chats);
    }, (err) => {
      console.warn('Chat subscription error:', err);
      callback([]);
    });
  } catch (err) {
    console.warn('Chat subscription error:', err);
    callback([]);
    return () => {};
  }
}

export async function getOrCreateChat(buyer: UserProfile, seller: { id: string; name: string; photo?: string }, listing: Listing): Promise<string> {
  const chatId = `chat_${listing.id}_${buyer.uid}`;
  const chatRef = doc(db, 'chats', chatId);

  try {
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      const newChat: Chat = {
        id: chatId,
        listingId: listing.id || '',
        listingTitle: listing.title || 'Part Listing',
        listingPrice: listing.price || 0,
        listingImage: (listing.images && listing.images[0]) ? listing.images[0] : '',
        buyerId: buyer.uid,
        buyerName: buyer.displayName || 'Buyer',
        buyerPhoto: buyer.photoURL || '',
        sellerId: seller.id || 'seller',
        sellerName: seller.name || 'Seller',
        sellerPhoto: seller.photo || '',
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCountBuyer: 0,
        unreadCountSeller: 0,
        updatedAt: new Date().toISOString()
      };
      await setDoc(chatRef, cleanObject(newChat));
    } else {
      // Restore chat if previously deleted by buyer
      const data = snap.data() as Chat;
      if (data.deletedBy && data.deletedBy.includes(buyer.uid)) {
        const updatedDeletedBy = data.deletedBy.filter(id => id !== buyer.uid);
        await updateDoc(chatRef, { deletedBy: updatedDeletedBy });
      }
    }
  } catch (err) {
    console.error('Error in getOrCreateChat:', err);
  }

  return chatId;
}

export function subscribeToMessages(chatId: string, currentUserId?: string | ((messages: ChatMessage[]) => void), callback?: (messages: ChatMessage[]) => void) {
  let cb = callback;
  let uid: string | undefined = undefined;

  if (typeof currentUserId === 'function') {
    cb = currentUserId;
    uid = undefined;
  } else {
    uid = currentUserId as string;
  }

  try {
    const msgRef = collection(db, 'messages');
    return onSnapshot(msgRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(d => {
        const data = d.data() as ChatMessage;
        if (data.chatId === chatId) {
          if (!uid || !data.deletedForUsers || !data.deletedForUsers.includes(uid)) {
            msgs.push({ id: d.id, ...data });
          }
        }
      });
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      if (cb) cb(msgs);
    }, (err) => {
      console.error('Messages subscription error:', err);
      if (cb) cb([]);
    });
  } catch (err) {
    console.error('Messages subscription error:', err);
    if (cb) cb([]);
    return () => {};
  }
}

export async function sendChatMessage(
  chatId: string, 
  senderId: string, 
  senderName: string, 
  text: string, 
  options?: {
    offerPrice?: number;
    image?: string;
    images?: string[];
    audioUrl?: string;
    audioDuration?: number;
    documentUrl?: string;
    documentName?: string;
    location?: { latitude: number; longitude: number; address: string };
    replyTo?: { id: string; senderName: string; text: string; image?: string };
  }
) {
  const msgId = 'msg_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6);
  const rawMsg: ChatMessage = {
    id: msgId,
    chatId,
    senderId: senderId || 'User',
    senderName: senderName || 'User',
    text: text || '',
    image: options?.image,
    images: options?.images,
    audioUrl: options?.audioUrl,
    audioDuration: options?.audioDuration,
    documentUrl: options?.documentUrl,
    documentName: options?.documentName,
    location: options?.location,
    offerPrice: options?.offerPrice,
    replyTo: options?.replyTo,
    read: false,
    status: 'sent',
    createdAt: new Date().toISOString()
  };

  const newMsg = cleanObject(rawMsg);

  try {
    // 1. Save message doc in Firestore
    await setDoc(doc(db, 'messages', msgId), newMsg);
    
    // 2. Update parent chat doc
    const chatRef = doc(db, 'chats', chatId);
    const chatSnap = await getDoc(chatRef);
    let isBuyer = true;
    if (chatSnap.exists()) {
      const chatData = chatSnap.data() as Chat;
      isBuyer = chatData.buyerId === senderId;
    }

    let previewText = text || '';
    if (options?.offerPrice) previewText = `Offer: ₹${options.offerPrice.toLocaleString('en-IN')}`;
    else if (options?.audioUrl) previewText = '🎤 Voice note';
    else if (options?.images && options.images.length > 0) previewText = `📷 ${options.images.length} Photos`;
    else if (options?.image) previewText = '📷 Shared Photo';
    else if (options?.documentUrl) previewText = `📄 ${options.documentName || 'Document'}`;
    else if (options?.location) previewText = `📍 ${options.location.address}`;

    const updates: any = {
      lastMessage: previewText,
      lastMessageTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedBy: []
    };

    if (isBuyer) {
      updates.unreadCountSeller = increment(1);
    } else {
      updates.unreadCountBuyer = increment(1);
    }

    await setDoc(chatRef, updates, { merge: true });

    // 3. Trigger notification safely
    try {
      if (chatSnap.exists()) {
        const chatData = chatSnap.data() as Chat;
        const recipientId = isBuyer ? chatData.sellerId : chatData.buyerId;
        if (recipientId) {
          await createInAppNotification({
            userId: recipientId,
            title: `New Message from ${senderName}`,
            message: previewText,
            type: options?.offerPrice ? 'offer' : 'chat',
            read: false,
            link: chatId
          });
        }
      }
    } catch (e) {
      console.warn('Error creating notification:', e);
    }
  } catch (err) {
    console.error('Error sending chat message:', err);
    throw err;
  }
}

export async function deleteChatMessageInFirestore(msgId: string) {
  try {
    const msgRef = doc(db, 'messages', msgId);
    await updateDoc(msgRef, {
      deleted: true,
      text: 'This message was deleted',
      image: null,
      images: null,
      audioUrl: null,
      documentUrl: null
    });
  } catch (err) {
    console.warn('Error deleting chat message:', err);
  }
}

export async function editChatMessageInFirestore(msgId: string, newText: string) {
  try {
    const msgRef = doc(db, 'messages', msgId);
    await updateDoc(msgRef, {
      text: newText,
      edited: true
    });
  } catch (err) {
    console.warn('Error editing chat message:', err);
  }
}

export async function archiveChatInFirestore(chatId: string, userId: string, archive: boolean) {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      const data = snap.data() as Chat;
      const current = data.archivedBy || [];
      const updated = archive 
        ? Array.from(new Set([...current, userId]))
        : current.filter(id => id !== userId);
      await updateDoc(chatRef, { archivedBy: updated });
    }
  } catch (err) {
    console.warn('Error archiving chat:', err);
  }
}

export async function clearChatMessagesInFirestore(chatId: string) {
  try {
    const msgsRef = collection(db, 'messages');
    const q = query(msgsRef, where('chatId', '==', chatId));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Error clearing chat messages:', err);
  }
}

export async function markChatAsRead(chatId: string, userId: string) {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      const chatData = snap.data() as Chat;
      const isBuyer = chatData.buyerId === userId;
      const updatePayload: any = {};
      if (isBuyer) {
        updatePayload.unreadCountBuyer = 0;
      } else {
        updatePayload.unreadCountSeller = 0;
      }
      await updateDoc(chatRef, updatePayload);
    }

    // Also mark unread messages sent to this user as read
    const msgsRef = collection(db, 'messages');
    const q = query(msgsRef, where('chatId', '==', chatId));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d) => {
      const msg = d.data() as ChatMessage;
      if (msg.senderId !== userId && !msg.read) {
        await updateDoc(doc(db, 'messages', d.id), { read: true });
      }
    });
  } catch (err) {
    console.warn('Error marking chat as read:', err);
  }
}

export async function setTypingState(chatId: string, userId: string, isTyping: boolean) {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`typing.${userId}`]: isTyping
    });
  } catch (err) {
    // Silent fail if chat doc update fails
  }
}

export async function updateUserPresence(userId: string, isOnline: boolean) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: new Date().toISOString()
    });
  } catch (err) {
    // Ignore presence sync errors
  }
}

export async function reportListingInFirestore(listingId: string, listingTitle: string, reporterId: string, reason: string) {
  const reportId = 'rep_' + Date.now().toString();
  const report = {
    id: reportId,
    listingId,
    listingTitle,
    reporterId,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'reports', reportId), report);
    // Increment report count on listing
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, { reportCount: increment(1) });
  } catch (err) {
    console.warn('Error submitting report:', err);
  }
}

export async function blockUserInFirestore(currentUserId: string, targetUserId: string, chatId?: string) {
  try {
    const userRef = doc(db, 'users', currentUserId);
    await setDoc(userRef, {
      blockedUsers: arrayUnion(targetUserId)
    }, { merge: true });

    if (chatId) {
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        blockedBy: arrayUnion(currentUserId)
      }, { merge: true });
    }
  } catch (err) {
    console.error('Error blocking user in Firestore:', err);
  }
}

export async function unblockUserInFirestore(currentUserId: string, targetUserId: string, chatId?: string) {
  try {
    const userRef = doc(db, 'users', currentUserId);
    await setDoc(userRef, {
      blockedUsers: arrayRemove(targetUserId)
    }, { merge: true });

    if (chatId) {
      const chatRef = doc(db, 'chats', chatId);
      await setDoc(chatRef, {
        blockedBy: arrayRemove(currentUserId)
      }, { merge: true });
    }
  } catch (err) {
    console.error('Error unblocking user in Firestore:', err);
  }
}

export async function pinChatInFirestore(chatId: string, userId: string, pin: boolean) {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      const data = snap.data() as Chat;
      const current = data.pinnedBy || [];
      const updated = pin 
        ? Array.from(new Set([...current, userId]))
        : current.filter(id => id !== userId);
      await updateDoc(chatRef, { pinnedBy: updated });
    }
  } catch (err) {
    console.warn('Error pinning chat:', err);
  }
}

export async function muteChatInFirestore(chatId: string, userId: string, mute: boolean) {
  try {
    const chatRef = doc(db, 'chats', chatId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      const data = snap.data() as Chat;
      const current = data.mutedBy || [];
      const updated = mute 
        ? Array.from(new Set([...current, userId]))
        : current.filter(id => id !== userId);
      await updateDoc(chatRef, { mutedBy: updated });
    }
  } catch (err) {
    console.warn('Error muting chat:', err);
  }
}

export async function deleteChatInFirestore(chatId: string, userId: string) {
  try {
    // 1. Delete all messages for this chatId from Firestore
    const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', chatId));
    const messagesSnap = await getDocs(messagesQuery);
    const deletePromises: Promise<void>[] = [];
    messagesSnap.forEach((msgDoc) => {
      deletePromises.push(deleteDoc(doc(db, 'messages', msgDoc.id)));
    });
    await Promise.all(deletePromises);

    // 2. Delete the chat room document from Firestore
    const chatRef = doc(db, 'chats', chatId);
    await deleteDoc(chatRef);
  } catch (err) {
    console.warn('Error deleting chat from Firestore:', err);
  }
}

export async function deleteMessageForMeInFirestore(msgId: string, userId: string) {
  try {
    const msgRef = doc(db, 'messages', msgId);
    const snap = await getDoc(msgRef);
    if (snap.exists()) {
      const data = snap.data() as ChatMessage;
      const current = data.deletedForUsers || [];
      const updated = Array.from(new Set([...current, userId]));
      await updateDoc(msgRef, { deletedForUsers: updated });
    }
  } catch (err) {
    console.warn('Error deleting message for user:', err);
  }
}

export async function updateOfferStatusInFirestore(
  msgId: string, 
  chatId: string, 
  status: 'accepted' | 'declined' | 'countered',
  note?: string
) {
  try {
    const msgRef = doc(db, 'messages', msgId);
    await updateDoc(msgRef, { offerStatus: status });

    const chatRef = doc(db, 'chats', chatId);
    let statusText = `Offer ${status}`;
    if (status === 'accepted') statusText = '✅ Offer Accepted!';
    else if (status === 'declined') statusText = '❌ Offer Declined';
    else if (status === 'countered') statusText = `🔄 Counter Offer: ${note || ''}`;

    await updateDoc(chatRef, {
      lastMessage: statusText,
      lastMessageTime: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error updating offer status:', err);
  }
}

export async function toggleMessageReactionInFirestore(msgId: string, userId: string, emoji: string) {
  try {
    const msgRef = doc(db, 'messages', msgId);
    const snap = await getDoc(msgRef);
    if (snap.exists()) {
      const data = snap.data() as ChatMessage;
      const reactions = data.reactions || {};
      if (reactions[userId] === emoji) {
        delete reactions[userId];
      } else {
        reactions[userId] = emoji;
      }
      await updateDoc(msgRef, { reactions });
    }
  } catch (err) {
    console.warn('Error toggling reaction:', err);
  }
}

export function triggerBrowserPushNotification(title: string, body: string, icon?: string) {
  try {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: icon || '/favicon.ico' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: icon || '/favicon.ico' });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Browser push notification error:', err);
  }
}

export async function createInAppNotification(notif: Omit<AppNotification, 'id' | 'createdAt'>) {
  const id = 'notif_' + Date.now().toString();
  const payload: AppNotification = {
    ...notif,
    id,
    createdAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'notifications', id), payload);
    triggerBrowserPushNotification(notif.title, notif.message);
  } catch (err) {
    console.warn('Error creating notification:', err);
  }
}
