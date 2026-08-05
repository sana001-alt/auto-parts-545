import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Tag, 
  ImageIcon, 
  ChevronLeft,
  ShieldCheck, 
  MoreVertical,
  UserX,
  Lock,
  Loader2,
  Trash2,
  Search,
  Check,
  CheckCheck,
  MessageCircle,
  ExternalLink,
  Plus,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Chat, ChatMessage } from '../types';
import { 
  subscribeToUserChats, 
  subscribeToMessages, 
  sendChatMessage,
  markChatAsRead,
  setTypingState,
  blockUserInFirestore,
  unblockUserInFirestore,
  deleteChatInFirestore,
  updateOfferStatusInFirestore
} from '../lib/firebase';
import { uploadImageFile } from '../lib/cloudinary';

interface ChatViewProps {
  currentUser: UserProfile;
  initialChatId?: string | null;
  onClose: () => void;
  onViewListing?: (listingId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  initialChatId,
  onClose,
  onViewListing
}) => {
  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Menus & Modals
  const [showMenu, setShowMenu] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [longPressedChat, setLongPressedChat] = useState<Chat | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Long Press Timer Ref
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActiveRef = useRef<boolean>(false);

  const handlePressStart = (chat: Chat) => {
    isLongPressActiveRef.current = false;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    longPressTimerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      setLongPressedChat(chat);
      setShowBottomSheet(true);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 450);
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleChatItemClick = (chat: Chat) => {
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      return;
    }
    setSelectedChatId(chat.id);
  };
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Subscribe to User's Recent Chats
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToUserChats(currentUser.uid, (data) => {
      setChats(data);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]);

  // Active Chat Metadata
  const activeChat = chats.find(c => c.id === selectedChatId) || null;
  const isBuyer = activeChat ? activeChat.buyerId === currentUser.uid : true;
  const otherPartyId = activeChat 
    ? (isBuyer ? activeChat.sellerId : activeChat.buyerId) 
    : '';
  const otherPartyName = activeChat 
    ? (isBuyer ? activeChat.sellerName : activeChat.buyerName) 
    : 'User';
  const otherPartyPhoto = activeChat 
    ? (isBuyer ? activeChat.sellerPhoto : activeChat.buyerPhoto) 
    : '';

  // Block status
  const isBlockedByMe = (currentUser.blockedUsers || []).includes(otherPartyId) || 
    (activeChat?.blockedBy || []).includes(currentUser.uid);
  const isBlockedByOther = (activeChat?.blockedBy || []).includes(otherPartyId);
  const isBlocked = isBlockedByMe || isBlockedByOther;

  // 2. Subscribe to Messages of Selected Chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    // Mark as read when opening
    markChatAsRead(selectedChatId, currentUser.uid);

    const unsubscribe = subscribeToMessages(selectedChatId, currentUser.uid, (data) => {
      setMessages(data);
      scrollToBottom();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedChatId, currentUser.uid]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Typing state updates
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!selectedChatId) return;

    setTypingState(selectedChatId, currentUser.uid, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setTypingState(selectedChatId, currentUser.uid, false);
    }, 2000);
  };

  // Send Text Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatId || isBlocked) return;
    const textToSend = inputText.trim();
    if (!textToSend) return;

    setInputText('');
    setTypingState(selectedChatId, currentUser.uid, false);
    setIsSending(true);

    try {
      await sendChatMessage(
        selectedChatId,
        currentUser.uid,
        currentUser.displayName || 'Buyer',
        textToSend
      );
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Send Offer
  const handleSendOffer = async () => {
    if (!selectedChatId || !offerPrice || isBlocked) return;
    const priceNum = parseInt(offerPrice.replace(/[^0-9]/g, ''), 10);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setShowOfferModal(false);
    setOfferPrice('');
    setIsSending(true);

    try {
      await sendChatMessage(
        selectedChatId,
        currentUser.uid,
        currentUser.displayName || 'User',
        `Offered ₹${priceNum.toLocaleString('en-IN')}`,
        { offerPrice: priceNum }
      );
      scrollToBottom();
    } catch (err) {
      console.error('Error sending offer:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Image Upload Handler
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChatId || isBlocked) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageFile(file);
      if (imageUrl) {
        await sendChatMessage(
          selectedChatId,
          currentUser.uid,
          currentUser.displayName || 'User',
          '',
          { image: imageUrl }
        );
        scrollToBottom();
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Block User Action
  const handleBlockUserClick = () => {
    setShowMenu(false);
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!selectedChatId || !otherPartyId) return;
    setShowBlockModal(false);
    await blockUserInFirestore(currentUser.uid, otherPartyId, selectedChatId);
  };

  // Unblock User Action
  const handleUnblockUserClick = () => {
    setShowUnblockModal(true);
  };

  const confirmUnblockUser = async () => {
    if (!selectedChatId || !otherPartyId) return;
    setShowUnblockModal(false);
    await unblockUserInFirestore(currentUser.uid, otherPartyId, selectedChatId);
  };

  // Delete Chat Action
  const handleDeleteChatClick = (chatToDel?: Chat) => {
    if (chatToDel) {
      setLongPressedChat(chatToDel);
    }
    setShowMenu(false);
    setShowBottomSheet(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    const targetChat = longPressedChat || activeChat;
    const targetChatId = targetChat ? targetChat.id : selectedChatId;
    if (!targetChatId) return;

    setShowDeleteModal(false);
    setShowBottomSheet(false);

    // 1. Instant local state refresh (remove from Recent Chats immediately)
    setChats(prev => prev.filter(c => c.id !== targetChatId));
    if (selectedChatId === targetChatId) {
      setSelectedChatId(null);
    }
    setLongPressedChat(null);

    // 2. Delete all messages and chat room from Firestore
    try {
      await deleteChatInFirestore(targetChatId, currentUser.uid);
    } catch (err) {
      console.error('Error deleting chat from Firestore:', err);
    }
  };

  // Filter chats by search query
  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = chat.buyerId === currentUser.uid ? chat.sellerName : chat.buyerName;
    return (
      (otherName && otherName.toLowerCase().includes(q)) ||
      (chat.listingTitle && chat.listingTitle.toLowerCase().includes(q))
    );
  });

  // Date Divider helper
  const formatDateGroup = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Format timestamp helper
  const formatTime = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="w-full max-w-4xl h-full sm:h-[90vh] bg-slate-900 text-white sm:rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">

        {/* =========================================================================
            SCREEN 1: RECENT CHATS LIST (When selectedChatId is null)
           ========================================================================= */}
        {!selectedChatId ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900">
            {/* Top Bar */}
            <div className="p-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-black text-white tracking-tight">Recent Chats</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-slate-900/80 border-b border-slate-800/80">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chats by seller or listing title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/90 text-xs font-bold text-white pl-9 pr-4 py-2.5 rounded-2xl border border-slate-700/60 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {filteredChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="p-4 bg-slate-800/80 rounded-full text-slate-500 border border-slate-700/50">
                    <MessageCircle className="w-8 h-8 text-cyan-500/80" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-sm font-bold text-slate-200">No Recent Chats</h3>
                    <p className="text-xs text-slate-400">
                      When you tap <span className="text-cyan-400 font-bold">Chat</span> on any spare part listing and send a message, your conversation will appear here instantly.
                    </p>
                  </div>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const amIBuyer = chat.buyerId === currentUser.uid;
                  const name = amIBuyer ? chat.sellerName : chat.buyerName;
                  const photo = amIBuyer ? chat.sellerPhoto : chat.buyerPhoto;
                  const unreadCount = amIBuyer ? (chat.unreadCountBuyer || 0) : (chat.unreadCountSeller || 0);

                  return (
                    <div
                      key={chat.id}
                      onMouseDown={() => handlePressStart(chat)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onTouchStart={() => handlePressStart(chat)}
                      onTouchEnd={handlePressEnd}
                      onTouchMove={handlePressEnd}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setLongPressedChat(chat);
                        setShowBottomSheet(true);
                      }}
                      onClick={() => handleChatItemClick(chat)}
                      className="p-3.5 hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3 group select-none relative"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {photo ? (
                          <img 
                            src={photo} 
                            alt={name} 
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-700/80"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-black text-sm">
                            {(name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
                      </div>

                      {/* Info & Last Message */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-black text-white truncate group-hover:text-cyan-400 transition-colors">
                            {name || 'AutoParts Seller'}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {chat.lastMessageTime ? formatDateGroup(chat.lastMessageTime) : ''}
                          </span>
                        </div>

                        {/* Listing Title Chip */}
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400/90 truncate">
                          {chat.listingImage && (
                            <img src={chat.listingImage} alt="" className="w-4 h-4 rounded-md object-cover shrink-0" />
                          )}
                          <span className="truncate">{chat.listingTitle || 'Spare Part Listing'}</span>
                        </div>

                        {/* Last Message Preview */}
                        <p className={`text-xs truncate ${unreadCount > 0 ? 'font-black text-white' : 'text-slate-400'}`}>
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <div className="shrink-0 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* =========================================================================
              SCREEN 2: CONVERSATION SCREEN (When selectedChatId is active)
             ========================================================================= */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 relative">

            {/* Top Bar Header */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 z-20 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Back to Recent Chats"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  {otherPartyPhoto ? (
                    <img src={otherPartyPhoto} alt={otherPartyName} className="w-10 h-10 rounded-2xl object-cover border border-slate-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-black text-xs">
                      {(otherPartyName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-white truncate">{otherPartyName}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </div>
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online</span>
                  </p>
                </div>
              </div>

              {/* Header Right Action: Direct Block/Unblock Button */}
              <div className="shrink-0">
                {!isBlockedByMe ? (
                  <button
                    onClick={handleBlockUserClick}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Block User"
                  >
                    <UserX className="w-3.5 h-3.5 text-amber-400" />
                    <span>Block</span>
                  </button>
                ) : (
                  <button
                    onClick={handleUnblockUserClick}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-extrabold text-xs border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Unblock User"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Unblock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sticky Listing Banner at top of chat */}
            {activeChat && (
              <div className="bg-slate-900/90 border-b border-slate-800 p-2.5 flex items-center justify-between gap-3 shrink-0 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  {activeChat.listingImage && (
                    <img 
                      src={activeChat.listingImage} 
                      alt={activeChat.listingTitle} 
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700/80 shrink-0" 
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">{activeChat.listingTitle || 'Spare Part Listing'}</p>
                    <p className="text-[11px] font-bold text-cyan-400">₹{activeChat.listingPrice ? activeChat.listingPrice.toLocaleString('en-IN') : '0'}</p>
                  </div>
                </div>

                {onViewListing && activeChat.listingId && (
                  <button
                    onClick={() => onViewListing(activeChat.listingId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-slate-700 shrink-0"
                  >
                    <span>View Part</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-cyan-400">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Start the conversation</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Send a message or make an offer to enquire about this spare part listing.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser.uid;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[82%] sm:max-w-[70%] p-3 rounded-2xl text-xs space-y-1.5 shadow-md ${
                          isMe 
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs' 
                            : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/80'
                        }`}
                      >
                        {/* Offer Box */}
                        {msg.offerPrice && (
                          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-white/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                              <Tag className="w-3.5 h-3.5" />
                              <span>PRICE OFFER</span>
                            </div>
                            <p className="text-base font-black text-white">₹{msg.offerPrice.toLocaleString('en-IN')}</p>
                          </div>
                        )}

                        {/* Image Attachment */}
                        {msg.image && (
                          <div 
                            onClick={() => setZoomedImage(msg.image || null)}
                            className="rounded-xl overflow-hidden cursor-pointer max-h-60 border border-black/20"
                          >
                            <img src={msg.image} alt="Attachment" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </div>
                        )}

                        {/* Text Message */}
                        {msg.text && (
                          <p className="leading-relaxed whitespace-pre-wrap break-words font-medium">{msg.text}</p>
                        )}

                        {/* Timestamp & Status */}
                        <div className={`flex items-center justify-end gap-1 text-[9px] ${isMe ? 'text-cyan-100/80' : 'text-slate-400'}`}>
                          <span>{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            msg.read ? (
                              <CheckCheck className="w-3 h-3 text-cyan-300" title="Read" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3 h-3 opacity-80" title="Delivered" />
                            ) : (
                              <Check className="w-3 h-3 opacity-80" title="Sent" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area or Blocked Banner */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
              {isBlockedByMe ? (
                <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" /> You blocked this user.
                  </p>
                  <button
                    onClick={handleUnblockUserClick}
                    className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl transition-colors cursor-pointer"
                  >
                    Unblock User
                  </button>
                </div>
              ) : isBlockedByOther ? (
                <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
                  <p className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4 text-slate-500" /> Messaging is disabled for this chat.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Attachment / Image Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer shrink-0 border border-slate-700/80"
                      title="Send Image"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> : <ImageIcon className="w-4 h-4" />}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Quick Offer Button */}
                    <button
                      type="button"
                      onClick={() => setShowOfferModal(true)}
                      className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer shrink-0 border border-slate-700/80 flex items-center gap-1 text-xs font-bold"
                      title="Make Offer"
                    >
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Offer</span>
                    </button>

                    {/* Text Field */}
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={inputText}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="flex-1 bg-slate-800/90 text-xs font-bold text-white px-4 py-2.5 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="p-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-black transition-all cursor-pointer shrink-0 shadow-md shadow-cyan-500/20"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL 1: OFFER INPUT MODAL
         ========================================================================= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Make a Price Offer</h3>
              </div>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Enter your offer price (₹):</label>
              <input
                type="number"
                placeholder="e.g. 4500"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full bg-slate-800 text-sm font-black text-white p-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                disabled={!offerPrice}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-2xl shadow-md"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: FULLSCREEN IMAGE ZOOM MODAL
         ========================================================================= */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <button 
            onClick={() => setZoomedImage(null)} 
            className="absolute top-4 right-4 p-2 bg-slate-800 text-white rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={zoomedImage} alt="Enlarged" className="max-w-full max-h-full object-contain rounded-2xl" />
        </div>
      )}

      {/* =========================================================================
          BOTTOM SHEET FOR LONG PRESS ON RECENT CHAT (WhatsApp / OLX Style)
         ========================================================================= */}
      {showBottomSheet && longPressedChat && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col justify-end p-0 sm:p-4 transition-all"
          onClick={() => setShowBottomSheet(false)}
        >
          <div 
            className="w-full max-w-md mx-auto bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto" />

            {/* Target Chat Summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700/50">
              {longPressedChat.listingImage ? (
                <img src={longPressedChat.listingImage} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-700" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-cyan-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate">
                  {longPressedChat.buyerId === currentUser.uid ? longPressedChat.sellerName : longPressedChat.buyerName}
                </p>
                <p className="text-[11px] font-bold text-cyan-400 truncate">
                  {longPressedChat.listingTitle || 'Spare Part Listing'}
                </p>
              </div>
            </div>

            {/* Action Options - Only Delete Chat */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowBottomSheet(false);
                  setShowDeleteModal(true);
                }}
                className="w-full p-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-black text-sm rounded-2xl border border-rose-500/30 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-rose-400">Delete Chat</span>
                    <span className="block text-[10px] text-slate-400 font-normal">Remove all messages & chat room permanently</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-400/60" />
              </button>

              <button
                onClick={() => setShowBottomSheet(false)}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: BLOCK USER CONFIRMATION MODAL
         ========================================================================= */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 p-5 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Block {otherPartyName}?</h3>
                <p className="text-[11px] text-slate-400">You will no longer receive messages or calls from this user.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 leading-relaxed">
              This action updates Firestore in real-time. Messaging will be disabled for both users and will persist across logins.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlockUser}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-colors cursor-pointer"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: UNBLOCK USER CONFIRMATION MODAL
         ========================================================================= */}
      {showUnblockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 p-5 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Unblock {otherPartyName}?</h3>
                <p className="text-[11px] text-slate-400">Allow messaging and interactions again.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowUnblockModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnblockUser}
                className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-colors cursor-pointer"
              >
                Unblock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: DELETE CHAT CONFIRMATION MODAL
         ========================================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 p-5 rounded-3xl space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Delete Conversation?</h3>
                <p className="text-[11px] text-rose-400 font-bold">This cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 leading-relaxed">
              This will permanently delete all messages and the chat room from Firestore. It will be removed immediately from your Recent Chats and will never reappear after app restart.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteChat}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-lg transition-colors cursor-pointer"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
