export type VehicleType = 
  | 'Four Wheeler (Car)'
  | 'Two Wheeler (Bike/Scooter)'
  | 'Commercial (Truck/Bus/Auto)'
  | 'Tractor & Heavy Equipment';

export type PartCategory =
  | 'Engine & Transmission'
  | 'Body Parts & Frame'
  | 'Lights, Mirrors & Glass'
  | 'Brakes & Suspension'
  | 'Electrical & Battery'
  | 'Wheels, Tyres & Alloys'
  | 'Interior, AC & Comfort'
  | 'Exhaust, Fuel & Cooling'
  | 'Accessories & Fluids';

export type PartCondition =
  | 'Brand New'
  | 'Used - Like New (Grade A)'
  | 'Used - Good (Grade B)'
  | 'Used - Fair (Grade C)'
  | 'Refurbished / Overhauled';

export interface LocationInfo {
  state: string;
  district: string;
  city: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  landmark?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  state?: string;
  district?: string;
  city?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  totalListings?: number;
  soldCount?: number;
  whatsappNumber?: string;
  address?: string;
  language?: string;
  responseRate?: string;
  responseTime?: string;
  followersCount?: number;
  followingCount?: number;
  blockedUsers?: string[];
  lastSeen?: string;
  isOnline?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Listing {
  id: string;
  title: string;
  category: PartCategory;
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  partNumber?: string;
  price: number;
  isNegotiable: boolean;
  condition: PartCondition;
  description: string;
  images: string[];
  videoUrl?: string;
  location: LocationInfo;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerPhoto?: string;
  sellerVerified?: boolean;
  status: 'active' | 'pending' | 'rejected' | 'sold' | 'reserved';
  views: number;
  reportCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ListingReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  buyerId: string;
  buyerName: string;
  buyerPhoto?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerPhoto?: string;
  sellerVerified?: boolean;
  sellerOnline?: boolean;
  sellerLastSeen?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountBuyer?: number;
  unreadCountSeller?: number;
  typing?: Record<string, boolean>;
  blockedBy?: string[];
  archivedBy?: string[];
  pinnedBy?: string[];
  mutedBy?: string[];
  deletedBy?: string[];
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  text: string;
  image?: string;
  images?: string[];
  audioUrl?: string;
  audioDuration?: number;
  documentUrl?: string;
  documentName?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  offerPrice?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
  read?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
    image?: string;
  };
  edited?: boolean;
  deleted?: boolean;
  deletedForUsers?: string[];
  reactions?: Record<string, string>;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'chat' | 'offer' | 'price_drop' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  vehicleType: string;
  make: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
  state: string;
  district: string;
  sortBy: 'newest' | 'price_low' | 'price_high' | 'popular';
}
