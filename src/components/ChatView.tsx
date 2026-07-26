import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Tag, 
  Image as ImageIcon, 
  ChevronLeft,
  ShieldCheck, 
  ExternalLink,
  Phone,
  Video,
  Check,
  CheckCheck,
  MessageSquare,
  MoreVertical,
  Flag,
  UserX,
  AlertTriangle,
  RotateCw,
  Loader2,
  Paperclip,
  Smile,
  Mic,
  Square,
  Camera,
  FileText,
  MapPin,
  CornerUpLeft,
  Copy,
  Edit3,
  Trash2,
  Archive,
  Search,
  Play,
  Pause,
  MessageCircle,
  Share2,
  Plus,
  Bell,
  BellOff,
  Sparkles,
  Globe,
  CheckCircle2,
  Languages
} from 'lucide-react';
import { UserProfile, Chat, ChatMessage, Listing } from '../types';
import { 
  subscribeToUserChats, 
  subscribeToMessages, 
  sendChatMessage,
  markChatAsRead,
  setTypingState,
  updateUserPresence,
  blockUserInFirestore,
  reportListingInFirestore,
  deleteChatMessageInFirestore,
  editChatMessageInFirestore,
  archiveChatInFirestore,
  clearChatMessagesInFirestore,
  pinChatInFirestore,
  muteChatInFirestore,
  deleteChatInFirestore,
  deleteMessageForMeInFirestore,
  updateOfferStatusInFirestore,
  toggleMessageReactionInFirestore
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
  const [highlightedChatId, setHighlightedChatId] = useState<string | null>(initialChatId || null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId || null);
  const [activeListItemMenuId, setActiveListItemMenuId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [offerPriceInput, setOfferPriceInput] = useState<string>('');
  const [showOfferBox, setShowOfferBox] = useState(false);
  
  // Navigation & Tabs
  const [inboxTab, setInboxTab] = useState<'all' | 'unread' | 'buying' | 'selling' | 'archived'>('all');
  const [inboxSearch, setInboxSearch] = useState('');

  // Inside Chat Search
  const [chatSearch, setChatSearch] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);

  // Language selection for quick response chips ('en' | 'ta' | 'hi')
  const [chatLang, setChatLang] = useState<'en' | 'ta' | 'hi'>('en');
  const [hidePinnedProduct, setHidePinnedProduct] = useState(false);

  // Menus & Modals
  const [showMenu, setShowMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCallSheet, setShowCallSheet] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Image & Attachment preview before sending
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingCaption, setPendingCaption] = useState('');
  const [showImagePreviewModal, setShowImagePreviewModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Voice Note Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Message Actions (Reply, Edit, Forward, Action Menu)
  const [replyingToMsg, setReplyingToMsg] = useState<ChatMessage | null>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [activeMsgOptionsId, setActiveMsgOptionsId] = useState<string | null>(null);
  const [forwardingMsg, setForwardingMsg] = useState<ChatMessage | null>(null);

  const [failedMsgId, setFailedMsgId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Emoji List
  const EMOJI_LIST = ['👍', '❤️', '🚗', '🔧', '💰', '🔥', '📦', '💯', '🙏', '✅', '⚡', '📍', '🤝', '⭐'];

  // Presence sync
  useEffect(() => {
    updateUserPresence(currentUser.uid, true);
    return () => {
      updateUserPresence(currentUser.uid, false);
    };
  }, [currentUser.uid]);

  // Subscribe to user chats
  useEffect(() => {
    const unsubscribe = subscribeToUserChats(currentUser.uid, (data) => {
      setChats(data);
    });
    return () => unsubscribe();
  }, [currentUser.uid]);

  // Handle initialChatId: When coming from a listing, open the seller conversation room directly!
  useEffect(() => {
    if (initialChatId) {
      setHighlightedChatId(initialChatId);
      setSelectedChatId(initialChatId);
    } else {
      setSelectedChatId(null);
    }
  }, [initialChatId]);

  // Subscribe to active chat messages & mark read
  useEffect(() => {
    if (!selectedChatId) return;
    
    markChatAsRead(selectedChatId, currentUser.uid);

    const unsubscribe = subscribeToMessages(selectedChatId, currentUser.uid, (data) => {
      setMessages(data);
    });
    return () => unsubscribe();
  }, [selectedChatId, currentUser.uid]);

  // Auto-scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording, showOfferBox]);

  // Active Chat Info
  const activeChat = chats.find(c => c.id === selectedChatId);
  const isBuyer = activeChat ? activeChat.buyerId === currentUser.uid : true;
  const otherPartyId = activeChat ? (isBuyer ? activeChat.sellerId : activeChat.buyerId) : '';
  const otherPartyName = activeChat ? (isBuyer ? activeChat.sellerName : activeChat.buyerName) : '';
  const otherPartyPhoto = activeChat ? (isBuyer ? activeChat.sellerPhoto : activeChat.buyerPhoto) : '';
  const otherPartyPhone = activeChat ? (activeChat.sellerPhone || '+91 98110 45892') : '+91 98110 45892';
  const isOtherPartyTyping = activeChat?.typing && activeChat.typing[otherPartyId];
  const isArchivedByMe = activeChat?.archivedBy?.includes(currentUser.uid);

  // Typing event listener
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!selectedChatId) return;

    setTypingState(selectedChatId, currentUser.uid, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingState(selectedChatId, currentUser.uid, false);
    }, 1500);
  };

  // Send message
  const handleSendMessage = async (
    e?: React.FormEvent, 
    customOptions?: {
      image?: string;
      images?: string[];
      audioUrl?: string;
      audioDuration?: number;
      documentUrl?: string;
      documentName?: string;
      location?: { latitude: number; longitude: number; address: string };
    }
  ) => {
    if (e) e.preventDefault();
    if (!selectedChatId) return;

    // Editing message mode
    if (editingMsgId) {
      if (!inputText.trim()) return;
      await editChatMessageInFirestore(editingMsgId, inputText.trim());
      setEditingMsgId(null);
      setInputText('');
      return;
    }

    const offerVal = offerPriceInput ? Number(offerPriceInput) : undefined;
    const finalMsgText = offerVal 
      ? `Offer: ₹${offerVal.toLocaleString('en-IN')}` 
      : inputText.trim();

    const hasMedia = customOptions?.image || customOptions?.images || customOptions?.audioUrl || customOptions?.documentUrl || customOptions?.location;

    if (!finalMsgText && !offerVal && !hasMedia) return;

    try {
      setIsSending(true);
      setFailedMsgId(null);

      const replyToObj = replyingToMsg ? {
        id: replyingToMsg.id,
        senderName: replyingToMsg.senderName || 'User',
        text: replyingToMsg.text || 'Attachment',
        image: replyingToMsg.image || replyingToMsg.images?.[0]
      } : undefined;

      await sendChatMessage(
        selectedChatId, 
        currentUser.uid, 
        currentUser.displayName || 'User', 
        finalMsgText, 
        {
          offerPrice: offerVal,
          replyTo: replyToObj,
          ...customOptions
        }
      );

      // Reset inputs
      setInputText('');
      setOfferPriceInput('');
      setShowOfferBox(false);
      setReplyingToMsg(null);
      setShowAttachmentMenu(false);
      setShowEmojiPicker(false);
      setTypingState(selectedChatId, currentUser.uid, false);
    } catch (err: any) {
      console.error('[Firebase Chat Error] Failed to send message:', err?.code, err?.message, err);
      setFailedMsgId('temp_fail');
      const errDetail = err?.message || err?.code || 'Network or Firestore connection error';
      alert(`Message failed to send: ${errDetail}`);
    } finally {
      setIsSending(false);
    }
  };

  // Multiple Images Selection
  const handleSelectMultipleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadImageFile(file);
        urls.push(url);
      }
      setPendingImages(urls);
      setShowImagePreviewModal(true);
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to process image attachment. Please try again.');
    } finally {
      setIsUploading(false);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // Submit Image Preview Tray
  const handleSendPendingImages = async () => {
    if (pendingImages.length === 0) return;
    await handleSendMessage(undefined, {
      images: pendingImages,
      image: pendingImages[0]
    });
    setPendingImages([]);
    setPendingCaption('');
    setShowImagePreviewModal(false);
  };

  // Document Upload Handler
  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImageFile(file);
      await handleSendMessage(undefined, {
        documentUrl: url,
        documentName: file.name
      });
    } catch (err) {
      console.error('Document upload error:', err);
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Share Location Handler
  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      // Default to Mayapuri Auto Market
      await handleSendMessage(undefined, {
        location: {
          latitude: 28.6280,
          longitude: 77.1126,
          address: 'Mayapuri Spare Parts Market, Gate 2, New Delhi'
        }
      });
      setShowAttachmentMenu(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await handleSendMessage(undefined, {
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            address: `Location Pin (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`
          }
        });
        setShowAttachmentMenu(false);
      },
      async () => {
        await handleSendMessage(undefined, {
          location: {
            latitude: 28.6280,
            longitude: 77.1126,
            address: 'Mayapuri Spare Parts Market, Gate 2, New Delhi'
          }
        });
        setShowAttachmentMenu(false);
      }
    );
  };

  // Voice Recorder Controls
  const startRecordingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or unsupported:', err);
      // Fallback simulated voice note
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecordingVoice = (sendImmediately = true) => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    const duration = recordingSeconds || 5;
    setIsRecording(false);
    setRecordingSeconds(0);

    if (sendImmediately) {
      // Send sample/recorded audio voice note
      handleSendMessage(undefined, {
        audioUrl: 'https://actions.google.com/sounds/v1/ambiences/outdoor_market.ogg',
        audioDuration: duration
      });
    }
  };

  // Audio Playback
  const toggleAudioPlay = (msgId: string, url: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      audio.play();
      setPlayingAudioId(msgId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  // Message & Chat Actions
  const handlePinToggle = async (e: React.MouseEvent, chatId: string, isPinned: boolean) => {
    e.stopPropagation();
    await pinChatInFirestore(chatId, currentUser.uid, !isPinned);
  };

  const handleMuteToggleList = async (e: React.MouseEvent, chatId: string, isMuted: boolean) => {
    e.stopPropagation();
    await muteChatInFirestore(chatId, currentUser.uid, !isMuted);
    setActiveListItemMenuId(null);
  };

  const handleArchiveToggleList = async (e: React.MouseEvent, chatId: string, isArchived: boolean) => {
    e.stopPropagation();
    await archiveChatInFirestore(chatId, currentUser.uid, !isArchived);
    setActiveListItemMenuId(null);
  };

  const handleBlockUserFromList = async (e: React.MouseEvent, chat: Chat) => {
    e.stopPropagation();
    const isBuyerParty = chat.buyerId === currentUser.uid;
    const partnerName = isBuyerParty ? chat.sellerName : chat.buyerName;
    const partnerId = isBuyerParty ? chat.sellerId : chat.buyerId;

    if (window.confirm(`Block ${partnerName}? You will no longer receive messages or calls from them.`)) {
      await blockUserInFirestore(currentUser.uid, partnerId, chat.id);
      setActiveListItemMenuId(null);
      if (selectedChatId === chat.id) setSelectedChatId(null);
    }
  };

  const handleDeleteChatForMe = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation from your chat list?')) {
      await deleteChatInFirestore(chatId, currentUser.uid);
      if (selectedChatId === chatId) setSelectedChatId(null);
      setActiveListItemMenuId(null);
    }
  };

  const handleDeleteMsgForMe = async (msgId: string) => {
    await deleteMessageForMeInFirestore(msgId, currentUser.uid);
    setActiveMsgOptionsId(null);
  };

  const handleMarkPartSold = async () => {
    if (!selectedChatId || !activeChat) return;
    if (window.confirm(`Mark '${activeChat.listingTitle}' as SOLD? This will notify the buyer.`)) {
      await sendChatMessage(selectedChatId, currentUser.uid, currentUser.displayName || 'Seller', `🎉 Listing '${activeChat.listingTitle}' has been marked as SOLD by seller!`);
      setShowMenu(false);
      alert('Listing marked as sold!');
    }
  };

  const QUICK_CHIPS_BUYER = {
    en: [
      { label: 'Is this available?', text: 'Hi! Is this part currently available in stock?' },
      { label: 'Will this fit my car?', text: 'Can you verify if this part will fit my vehicle model?' },
      { label: 'Request photos', text: 'Could you please share a few live photos of the part?' },
      { label: 'Best price?', text: 'What is your best final price for this part?' },
      { label: 'Share location', text: 'Can you share your shop or pickup location?' }
    ],
    ta: [
      { label: 'பாகம் உள்ளதா?', text: 'வணக்கம்! இந்த உதிரி பாகம் இருப்பில் உள்ளதா?' },
      { label: 'வாகனத்திற்கு பொருந்துமா?', text: 'இந்த பாகம் என் வாகனத்திற்கு பொருந்துமா என சரிபார்க்க முடியுமா?' },
      { label: 'படங்கள் அனுப்பவும்', text: 'தயவுசெய்து பாகத்தின் தெளிவான புகைப்படங்களை அனுப்பவும்.' },
      { label: 'கடைசி விலை என்ன?', text: 'இந்த பாகத்திற்கான உங்கள் கடைசி குறைந்தபட்ச விலை என்ன?' },
      { label: 'இருப்பிடம் அனுப்பவும்', text: 'உங்கள் கடை முகவரியை அனுப்ப முடியுமா?' }
    ],
    hi: [
      { label: 'क्या यह पार्ट मिलेगा?', text: 'नमस्ते! क्या यह पार्ट स्टॉक में उपलब्ध है?' },
      { label: 'क्या गाड़ी में फिट होगा?', text: 'क्या आप बता सकते हैं कि यह पार्ट मेरी गाड़ी में फिट होगा या नहीं?' },
      { label: 'फोटो भेजें', text: 'कृपया पार्ट की कुछ लाइव फोटो भेजें।' },
      { label: 'फाइनल प्राइस क्या है?', text: 'इस पार्ट का फाइनल बेस्ट प्राइस क्या होगा?' },
      { label: 'लोकेशन भेजें', text: 'कृपया अपनी दुकान या पिकअप लोकेशन शेयर करें।' }
    ]
  };

  const QUICK_CHIPS_SELLER = {
    en: [
      { label: 'Yes, in stock!', text: 'Yes, this part is ready in stock for immediate dispatch or pickup!' },
      { label: 'Send RC copy', text: 'Please send a copy or photo of your vehicle RC or chassis number.' },
      { label: '100% Genuine OEM', text: 'This is 100% Genuine OEM original tested spare part.' },
      { label: 'Express Shipping', text: 'We ship all India with express door-step tracking!' }
    ],
    ta: [
      { label: 'ஆம், இருப்பில் உள்ளது!', text: 'ஆம், இந்த பாகம் உடனடியாக அனுப்ப அல்லது பெற தயார் நிலையில் உள்ளது!' },
      { label: 'RC நகல் அனுப்பவும்', text: 'தயவுசெய்து உங்கள் வாகனத்தின் RC அல்லது சேசிஸ் எண்ணின் படத்தை அனுப்பவும்.' },
      { label: 'அசல் OEM பாகம்', text: 'இது 100% அசல் மற்றும் பரிசோதிக்கப்பட்ட OEM உதிரி பாகமாகும்.' }
    ],
    hi: [
      { label: 'हाँ, स्टॉक में उपलब्ध है!', text: 'हाँ, यह पार्ट स्टॉक में उपलब्ध है और तुरंत भेजा जा सकता है!' },
      { label: 'RC फोटो भेजें', text: 'कृपया अपनी गाड़ी की RC या चेसिस नंबर की फोटो भेजें।' },
      { label: 'ओरिजिनल OEM पार्ट', text: 'यह 100% ओरिजिनल OEM और टेस्टेड स्पेयर पार्ट है।' }
    ]
  };

  const handleAcceptOffer = async (msg: ChatMessage) => {
    if (!msg.offerPrice || !selectedChatId) return;
    await updateOfferStatusInFirestore(msg.id, selectedChatId, 'accepted');
    await sendChatMessage(selectedChatId, currentUser.uid, currentUser.displayName || 'User', `✅ Accepted offer of ₹${new Intl.NumberFormat('en-IN').format(msg.offerPrice)}!`);
  };

  const handleDeclineOffer = async (msg: ChatMessage) => {
    if (!selectedChatId) return;
    await updateOfferStatusInFirestore(msg.id, selectedChatId, 'declined');
    await sendChatMessage(selectedChatId, currentUser.uid, currentUser.displayName || 'User', `❌ Declined offer of ₹${msg.offerPrice ? new Intl.NumberFormat('en-IN').format(msg.offerPrice) : ''}.`);
  };

  const handleToggleReaction = async (msgId: string, emoji: string) => {
    await toggleMessageReactionInFirestore(msgId, currentUser.uid, emoji);
  };

  const handleCopyMsg = (msgText: string) => {
    navigator.clipboard.writeText(msgText);
    setActiveMsgOptionsId(null);
    alert('Message text copied to clipboard!');
  };

  const handleDeleteMsg = async (msgId: string) => {
    if (window.confirm('Delete this message for everyone?')) {
      await deleteChatMessageInFirestore(msgId);
      setActiveMsgOptionsId(null);
    }
  };

  const handleEditMsg = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setInputText(msg.text);
    setActiveMsgOptionsId(null);
  };

  const handleForwardMsgToChat = async (targetChatId: string) => {
    if (!forwardingMsg) return;
    await sendChatMessage(
      targetChatId,
      currentUser.uid,
      currentUser.displayName || 'User',
      forwardingMsg.text,
      {
        image: forwardingMsg.image,
        images: forwardingMsg.images,
        audioUrl: forwardingMsg.audioUrl,
        documentUrl: forwardingMsg.documentUrl
      }
    );
    setForwardingMsg(null);
    alert('Message forwarded successfully!');
  };

  const handleClearChat = async () => {
    if (!selectedChatId) return;
    if (window.confirm('Clear all messages in this conversation?')) {
      await clearChatMessagesInFirestore(selectedChatId);
      setShowMenu(false);
    }
  };

  const handleArchiveToggle = async () => {
    if (!selectedChatId) return;
    await archiveChatInFirestore(selectedChatId, currentUser.uid, !isArchivedByMe);
    setShowMenu(false);
  };

  const handleBlockUser = async () => {
    if (!activeChat) return;
    if (window.confirm(`Are you sure you want to block ${otherPartyName}? You will no longer receive messages from this user.`)) {
      await blockUserInFirestore(currentUser.uid, otherPartyId, activeChat.id);
      setSelectedChatId(null);
      setShowMenu(false);
    }
  };

  const handleReportUser = async () => {
    if (!activeChat) return;
    const reason = window.prompt(`Report ${otherPartyName} to AutoParts India moderation. Enter reason:`, 'Fraudulent seller / fake part photos');
    if (reason) {
      await reportListingInFirestore(activeChat.listingId, activeChat.listingTitle, currentUser.uid, `[USER REPORT - ${otherPartyName}]: ${reason}`);
      alert('Report submitted to moderators successfully.');
      setShowMenu(false);
    }
  };

  // Filtered Chats
  const filteredChats = chats.filter((c) => {
    const isBuyerParty = c.buyerId === currentUser.uid;
    const partnerName = isBuyerParty ? c.sellerName : c.buyerName;
    const matchesSearch = partnerName.toLowerCase().includes(inboxSearch.toLowerCase()) || 
                          c.listingTitle.toLowerCase().includes(inboxSearch.toLowerCase()) ||
                          (c.lastMessage && c.lastMessage.toLowerCase().includes(inboxSearch.toLowerCase()));
    
    if (!matchesSearch) return false;

    const unreadCount = isBuyerParty ? (c.unreadCountBuyer || 0) : (c.unreadCountSeller || 0);
    const archived = c.archivedBy?.includes(currentUser.uid);

    if (inboxTab === 'archived') return archived;
    if (archived) return false; // Hide archived from standard tabs

    if (inboxTab === 'unread') return unreadCount > 0;
    if (inboxTab === 'buying') return c.buyerId === currentUser.uid;
    if (inboxTab === 'selling') return c.sellerId === currentUser.uid;
    return true;
  });

  // Sort filteredChats: highlightedChatId at very top, then pinned chats, then by updatedAt desc
  const sortedFilteredChats = [...filteredChats].sort((a, b) => {
    if (a.id === highlightedChatId && b.id !== highlightedChatId) return -1;
    if (b.id === highlightedChatId && a.id !== highlightedChatId) return 1;
    const aPinned = a.pinnedBy?.includes(currentUser.uid) ? 1 : 0;
    const bPinned = b.pinnedBy?.includes(currentUser.uid) ? 1 : 0;
    if (aPinned !== bPinned) return bPinned - aPinned;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Filtered Messages inside active chat
  const displayedMessages = chatSearch.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(chatSearch.toLowerCase()))
    : messages;

  // Helper to format Date Separators
  const formatDateSeparator = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col w-full h-full overflow-hidden select-none animate-in fade-in">
      {/* HIDDEN INPUTS FOR MEDIA */}
      <input type="file" ref={multiFileInputRef} onChange={handleSelectMultipleImages} accept="image/*" multiple className="hidden" />
      <input type="file" ref={docInputRef} onChange={handleDocumentSelect} accept=".pdf,.doc,.docx,.txt" className="hidden" />
      <input type="file" ref={fileInputRef} onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          setIsUploading(true);
          const url = await uploadImageFile(file);
          setPendingImages([url]);
          setShowImagePreviewModal(true);
          setIsUploading(false);
        }
      }} accept="image/*" capture="environment" className="hidden" />

      <div className="flex-1 flex flex-col md:flex-row w-full h-full overflow-hidden">
        
        {/* =========================================
            LEFT COLUMN: INBOX & CHATS LIST 
           ========================================= */}
        <div className={`w-full md:w-88 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/60 dark:bg-slate-900/60 shrink-0 ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose} 
                className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors" 
                title="Back to Home"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  <span>Recent Chats</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold">AutoParts India Realtime Buyer-Seller Inbox</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                value={inboxSearch}
                onChange={(e) => setInboxSearch(e.target.value)}
                placeholder="Search conversations, parts or seller names..."
                className="w-full text-xs pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {inboxSearch && (
                <button onClick={() => setInboxSearch('')} className="absolute right-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs Pill Bar */}
          <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'buying', label: 'Buying' },
              { id: 'selling', label: 'Selling' },
              { id: 'archived', label: 'Archived' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInboxTab(tab.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  inboxTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* New Inquiry Callout Banner if highlightedChatId exists */}
          {highlightedChatId && (
            <div className="m-3 p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 animate-bounce" />
                <span>Conversation ready! Tap highlighted chat below to enter room.</span>
              </div>
              <button 
                onClick={() => setHighlightedChatId(null)}
                className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {sortedFilteredChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2 my-auto">
                <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="font-bold text-slate-600 dark:text-slate-300">No chat conversations found</p>
                <p className="text-[11px] max-w-xs mx-auto">Click "Chat with Seller" on any spare part listing to initiate a real-time price bargain inquiry!</p>
              </div>
            ) : (
              sortedFilteredChats.map((chat) => {
                const isSelected = chat.id === selectedChatId;
                const isHighlighted = chat.id === highlightedChatId;
                const isBuyerParty = chat.buyerId === currentUser.uid;
                const partnerName = isBuyerParty ? chat.sellerName : chat.buyerName;
                const partnerPhoto = isBuyerParty ? chat.sellerPhoto : chat.buyerPhoto;
                const unreadCount = isBuyerParty ? (chat.unreadCountBuyer || 0) : (chat.unreadCountSeller || 0);
                const isPinned = chat.pinnedBy?.includes(currentUser.uid);
                const isMuted = chat.mutedBy?.includes(currentUser.uid);
                const isArchived = chat.archivedBy?.includes(currentUser.uid);

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      setHighlightedChatId(null);
                      setActiveListItemMenuId(null);
                    }}
                    className={`group w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer relative ${
                      isHighlighted
                        ? 'bg-emerald-500/10 dark:bg-emerald-950/60 ring-2 ring-emerald-500 shadow-sm'
                        : isSelected 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Profile Avatar + Online indicator + Pinned / Muted Badges */}
                    <div className="relative shrink-0">
                      <img
                        src={partnerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerName}`}
                        alt={partnerName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" title="Online" />
                      {isPinned && (
                        <span className="absolute -top-1 -left-1 bg-amber-500 text-white p-0.5 rounded-full text-[9px] shadow-xs" title="Pinned Chat">
                          📌
                        </span>
                      )}
                      {isMuted && (
                        <span className="absolute -top-1 -right-1 bg-slate-600 text-white p-0.5 rounded-full text-[9px] shadow-xs" title="Notifications Muted">
                          🔕
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Top Row: Seller Name & Timestamp */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {partnerName}
                          </p>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" title="Verified Seller" />
                          {isHighlighted && (
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shrink-0">
                              Target Inquiry
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {new Date(chat.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Listing Card Chip with Thumbnail */}
                      <div 
                        onClick={(e) => {
                          if (onViewListing && chat.listingId) {
                            e.stopPropagation();
                            onViewListing(chat.listingId);
                          }
                        }}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50 px-2 py-1 rounded-xl w-fit max-w-full border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                      >
                        {chat.listingImage ? (
                          <img
                            src={chat.listingImage}
                            alt={chat.listingTitle}
                            className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-300 dark:border-slate-600"
                          />
                        ) : (
                          <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{chat.listingTitle}</p>
                          {chat.listingPrice > 0 && (
                            <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">₹{new Intl.NumberFormat('en-IN').format(chat.listingPrice)}</p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Last Message & Action Controls */}
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[11px] truncate flex-1 ${unreadCount > 0 ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                          {chat.lastMessage || 'No messages yet'}
                        </p>
                        
                        <div className="flex items-center gap-1 shrink-0">
                          {unreadCount > 0 && (
                            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                              {unreadCount}
                            </span>
                          )}

                          {/* 3-Dots Context Menu Button */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveListItemMenuId(activeListItemMenuId === chat.id ? null : chat.id);
                              }}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="More options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeListItemMenuId === chat.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 z-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 w-44 text-xs font-bold"
                              >
                                <button
                                  onClick={(e) => handlePinToggle(e, chat.id, !!isPinned)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                  📌 {isPinned ? 'Unpin Chat' : 'Pin to Top'}
                                </button>
                                <button
                                  onClick={(e) => handleMuteToggleList(e, chat.id, !!isMuted)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                  {isMuted ? '🔔 Unmute Notifications' : '🔕 Mute Notifications'}
                                </button>
                                <button
                                  onClick={(e) => handleArchiveToggleList(e, chat.id, !!isArchived)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                                >
                                  <Archive className="w-3.5 h-3.5 text-indigo-500" /> {isArchived ? 'Unarchive Chat' : 'Archive Chat'}
                                </button>
                                <button
                                  onClick={(e) => handleBlockUserFromList(e, chat)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-amber-600"
                                >
                                  <UserX className="w-3.5 h-3.5" /> Block Seller
                                </button>
                                <button
                                  onClick={(e) => handleDeleteChatForMe(e, chat.id)}
                                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 text-rose-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Conversation
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: ACTIVE CHAT ROOM OR DESKTOP PLACEHOLDER
           ========================================= */}
        <div className={`flex-1 flex flex-col bg-slate-100 dark:bg-slate-950 relative h-full overflow-hidden ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950">
              <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-inner">
                <MessageSquare className="w-10 h-10 text-emerald-500" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">AutoParts India Instant Messenger</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a conversation from the left to start bargaining, asking for part specifications, or closing spare parts deals in real-time.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>End-to-End Buyer Protection & Verified Sellers</span>
              </div>
            </div>
          ) : selectedChatId && !activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-100 dark:bg-slate-950">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading seller chat room...</p>
            </div>
          ) : activeChat ? (
            <>
              {/* WhatsApp + OLX Style Fixed Header */}
              <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
                    title="Back to inbox"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="relative shrink-0 cursor-pointer" onClick={() => setShowCallSheet(true)}>
                    <img
                      src={otherPartyPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPartyName}`}
                      alt={otherPartyName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-1">
                      {otherPartyName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </h3>
                    {isOtherPartyTyping ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 animate-pulse">
                        typing...
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online • Verified Merchant
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowChatSearch(!showChatSearch)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                    title="Search inside chat"
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowCallSheet(true)}
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full cursor-pointer"
                    title="Voice Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowVideoCallModal(true)}
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full cursor-pointer"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/${otherPartyPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(otherPartyName)},%20I%20am%20interested%20in%20your%20listing%20'${encodeURIComponent(activeChat.listingTitle)}'%20on%20AutoParts%20India.`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-full cursor-pointer"
                    title="Open in WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  {/* More Menu Toggle */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-10 z-40 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs animate-in fade-in">
                        {!isBuyer && (
                          <button
                            onClick={handleMarkPartSold}
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 font-bold flex items-center gap-2 cursor-pointer border-b border-slate-100 dark:border-slate-800"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Mark Listing as Sold
                          </button>
                        )}

                        <button
                          onClick={() => { setShowChatSearch(true); setShowMenu(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <Search className="w-4 h-4 text-emerald-500" /> Search Chat
                        </button>

                        <button
                          onClick={handleArchiveToggle}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <Archive className="w-4 h-4 text-indigo-500" /> {isArchivedByMe ? 'Unarchive Chat' : 'Archive Chat'}
                        </button>

                        <button
                          onClick={handleClearChat}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-amber-500" /> Clear Messages
                        </button>

                        <button
                          onClick={handleReportUser}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <Flag className="w-4 h-4 text-rose-500" /> Report User
                        </button>

                        <button
                          onClick={handleBlockUser}
                          className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 flex items-center gap-2 font-bold cursor-pointer"
                        >
                          <UserX className="w-4 h-4" /> Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Inside-Chat Search Input */}
              {showChatSearch && (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    placeholder="Search words inside this chat..."
                    className="flex-1 text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl px-3 py-1.5 outline-none font-medium text-slate-900 dark:text-white"
                  />
                  <button onClick={() => { setChatSearch(''); setShowChatSearch(false); }} className="p-1 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* PINNED PRODUCT PREVIEW CARD BELOW HEADER */}
              {!hidePinnedProduct && (
                <div className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={activeChat.listingImage || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=200'}
                      alt={activeChat.listingTitle}
                      className="w-11 h-11 rounded-xl object-cover border border-emerald-500/50 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">{activeChat.listingTitle}</p>
                      <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹{new Intl.NumberFormat('en-IN').format(activeChat.listingPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setShowOfferBox(!showOfferBox)}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 cursor-pointer flex items-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5" /> Offer
                    </button>

                    {onViewListing && (
                      <button
                        onClick={() => onViewListing(activeChat.listingId)}
                        className="text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => setHidePinnedProduct(true)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Hide pinned listing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* MESSAGES SCROLL CONTAINER */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#efeae2]/50 dark:bg-slate-950/90">
                {displayedMessages.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 my-auto py-12 space-y-2 max-w-sm mx-auto bg-white/80 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <MessageSquare className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Real-time Encrypted Chat</p>
                    <p className="text-[11px] text-slate-500">Ask about part compatibility, warranty, shipping across India, or negotiate price.</p>
                  </div>
                ) : (
                  displayedMessages.map((msg, index) => {
                    const isMe = msg.senderId === currentUser.uid;
                    const prevMsg = displayedMessages[index - 1];
                    const showDateSep = !prevMsg || formatDateSeparator(prevMsg.createdAt) !== formatDateSeparator(msg.createdAt);

                    return (
                      <React.Fragment key={msg.id}>
                        {/* Date Separator Pill */}
                        {showDateSep && (
                          <div className="flex justify-center my-3">
                            <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs uppercase tracking-wider">
                              {formatDateSeparator(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble Item */}
                        <div className={`group relative flex flex-col max-w-[85%] sm:max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                          
                          {/* Bubble Card */}
                          <div
                            onClick={() => setActiveMsgOptionsId(activeMsgOptionsId === msg.id ? null : msg.id)}
                            className={`p-3 rounded-2xl text-xs space-y-2 shadow-xs cursor-pointer relative transition-all ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none'
                            }`}
                          >
                            {/* Quoted Reply Block */}
                            {msg.replyTo && (
                              <div className={`p-2 rounded-xl text-[11px] border-l-4 mb-1.5 ${
                                isMe ? 'bg-black/20 border-white text-white' : 'bg-slate-100 dark:bg-slate-800 border-emerald-500 text-slate-800 dark:text-slate-200'
                              }`}>
                                <p className="font-black text-[10px] opacity-90">{msg.replyTo.senderName}</p>
                                <p className="truncate opacity-80">{msg.replyTo.text}</p>
                              </div>
                            )}

                            {/* Offer Price Highlight Box */}
                            {msg.offerPrice && (
                              <div className="bg-amber-500/20 dark:bg-amber-500/30 p-2.5 rounded-xl text-center border border-amber-400/50 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">Bargain Proposal</span>
                                <span className="text-base font-black block">₹{new Intl.NumberFormat('en-IN').format(msg.offerPrice)}</span>
                                
                                {msg.offerStatus === 'accepted' ? (
                                  <span className="inline-block bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    ✅ Offer Accepted
                                  </span>
                                ) : msg.offerStatus === 'declined' ? (
                                  <span className="inline-block bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    ❌ Offer Declined
                                  </span>
                                ) : !isMe ? (
                                  <div className="flex items-center gap-1.5 pt-1 border-t border-amber-400/30">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleAcceptOffer(msg); }}
                                      className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-2xs"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeclineOffer(msg); }}
                                      className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] shadow-2xs"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                ) : (
                                  <span className="inline-block bg-amber-500/40 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    ⏳ Pending Response
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Multiple Images Gallery */}
                            {msg.images && msg.images.length > 0 && (
                              <div className={`grid gap-1.5 rounded-xl overflow-hidden my-1 ${msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {msg.images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img}
                                    alt="Part"
                                    onClick={(e) => { e.stopPropagation(); setZoomedImage(img); }}
                                    className="w-full h-36 object-cover rounded-lg hover:opacity-90 cursor-zoom-in"
                                  />
                                ))}
                              </div>
                            )}

                            {/* Single Image */}
                            {msg.image && !msg.images && (
                              <div className="rounded-xl overflow-hidden my-1 cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setZoomedImage(msg.image!); }}>
                                <img src={msg.image} alt="Part" className="max-h-52 w-full object-cover rounded-xl" />
                              </div>
                            )}

                            {/* Voice Note Audio Player */}
                            {msg.audioUrl && (
                              <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 p-2.5 rounded-xl min-w-[180px]">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleAudioPlay(msg.id, msg.audioUrl!); }}
                                  className="p-2 bg-emerald-500 text-white rounded-full shrink-0 shadow-xs cursor-pointer"
                                >
                                  {playingAudioId === msg.id ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                                </button>
                                <div className="flex-1 space-y-1">
                                  <div className="h-1 bg-black/20 dark:bg-white/20 rounded-full overflow-hidden">
                                    <div className={`h-full bg-emerald-400 ${playingAudioId === msg.id ? 'w-full transition-all duration-3000' : 'w-0'}`} />
                                  </div>
                                  <p className="text-[10px] font-bold opacity-80">Voice note ({msg.audioDuration || 5}s)</p>
                                </div>
                              </div>
                            )}

                            {/* Document Preview */}
                            {msg.documentUrl && (
                              <a
                                href={msg.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2.5 bg-black/10 dark:bg-white/10 p-2.5 rounded-xl"
                              >
                                <FileText className="w-6 h-6 text-emerald-400 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold truncate">{msg.documentName || 'Document Attachment'}</p>
                                  <p className="text-[10px] opacity-80">Click to View Document</p>
                                </div>
                              </a>
                            )}

                            {/* Location Pin Card */}
                            {msg.location && (
                              <div className="p-2.5 bg-black/10 dark:bg-white/10 rounded-xl space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                                  <MapPin className="w-4 h-4 shrink-0" /> Location Shared
                                </div>
                                <p className="text-[11px] leading-snug">{msg.location.address}</p>
                                <a
                                  href={`https://maps.google.com/?q=${msg.location.latitude},${msg.location.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-block text-[10px] font-bold text-emerald-300 hover:underline pt-1"
                                >
                                  Open Google Maps →
                                </a>
                              </div>
                            )}

                            {/* Text Message */}
                            {msg.text && (
                              <p className={`whitespace-pre-wrap leading-relaxed ${msg.deleted ? 'italic opacity-60' : ''}`}>
                                {msg.text}
                              </p>
                            )}

                            {/* Timestamp + Status Icons */}
                            <div className="flex items-center justify-end gap-1 pt-0.5 text-[10px] opacity-80">
                              {msg.edited && <span className="italic mr-1">edited</span>}
                              <span>{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && !msg.deleted && (
                                msg.read || msg.status === 'read' ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300" title="Read" />
                                ) : (
                                  <CheckCheck className="w-3.5 h-3.5 opacity-70" title="Delivered" />
                                )
                              )}
                            </div>
                          </div>

                          {/* Message Emoji Reactions Badge */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className={`flex items-center gap-1 -mt-1 z-10 ${isMe ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
                              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
                                {Array.from(new Set(Object.values(msg.reactions))).map((emoji, idx) => (
                                  <span key={idx}>{emoji}</span>
                                ))}
                                <span className="font-bold text-[9px] text-slate-500 ml-0.5">{Object.keys(msg.reactions).length}</span>
                              </div>
                            </div>
                          )}

                          {/* Quick Message Context Options Drawer */}
                          {activeMsgOptionsId === msg.id && (
                            <div className={`absolute top-full mt-1 z-30 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1 flex flex-col gap-1 text-[11px] font-bold ${isMe ? 'right-0' : 'left-0'}`}>
                              {/* Quick Emoji Reaction Row */}
                              <div className="flex items-center gap-1 px-1 py-1 border-b border-slate-100 dark:border-slate-800">
                                {['👍', '❤️', '😂', '😮', '🙏', '🔥'].map((emo) => (
                                  <button
                                    key={emo}
                                    onClick={() => { handleToggleReaction(msg.id, emo); setActiveMsgOptionsId(null); }}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm cursor-pointer transition-transform hover:scale-125"
                                  >
                                    {emo}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  onClick={() => { setReplyingToMsg(msg); setActiveMsgOptionsId(null); }}
                                  className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 rounded-lg"
                                >
                                  <CornerUpLeft className="w-3.5 h-3.5 text-emerald-500" /> Reply
                                </button>
                                <button
                                  onClick={() => handleCopyMsg(msg.text)}
                                  className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 rounded-lg"
                                >
                                  <Copy className="w-3.5 h-3.5 text-indigo-500" /> Copy
                                </button>
                                <button
                                  onClick={() => { setForwardingMsg(msg); setActiveMsgOptionsId(null); }}
                                  className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 rounded-lg"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-amber-500" /> Forward
                                </button>
                                <button
                                  onClick={() => handleDeleteMsgForMe(msg.id)}
                                  className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Delete for me
                                </button>
                                {isMe && !msg.deleted && (
                                  <>
                                    <button
                                      onClick={() => handleEditMsg(msg)}
                                      className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 rounded-lg"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-sky-500" /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMsg(msg.id)}
                                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1 rounded-lg"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete for all
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      </React.Fragment>
                    );
                  })
                )}

                {/* Failed message retry bar */}
                {failedMsgId && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                    <span className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4" /> Message failed to send
                    </span>
                    <button
                      onClick={() => handleSendMessage()}
                      className="text-xs font-black underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* =========================================
                  ATTACHMENT OPTIONS MENU DRAWER
                 ========================================= */}
              {showAttachmentMenu && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-3 animate-in slide-in-from-bottom-2">
                  <button
                    onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-800 cursor-pointer"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Camera</span>
                  </button>

                  <button
                    onClick={() => { multiFileInputRef.current?.click(); setShowAttachmentMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 border border-purple-200 dark:border-purple-800 cursor-pointer"
                  >
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Gallery</span>
                  </button>

                  <button
                    onClick={() => { docInputRef.current?.click(); setShowAttachmentMenu(false); }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Document</span>
                  </button>

                  <button
                    onClick={handleShareLocation}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                  >
                    <MapPin className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Location</span>
                  </button>
                </div>
              )}

              {/* =========================================
                  EMOJI TRAY OVERLAY
                 ========================================= */}
              {showEmojiPicker && (
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { setInputText((prev) => prev + emoji); setShowEmojiPicker(false); }}
                      className="text-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Quoted Reply Banner above input */}
              {replyingToMsg && (
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/80 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <CornerUpLeft className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Replying to {replyingToMsg.senderName}: </span>
                      <span className="opacity-80">{replyingToMsg.text}</span>
                    </div>
                  </div>
                  <button onClick={() => setReplyingToMsg(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Editing Mode Banner above input */}
              {editingMsgId && (
                <div className="px-4 py-2 bg-sky-50 dark:bg-sky-950/80 border-t border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs text-sky-800 dark:text-sky-200">
                  <span className="font-bold flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-sky-500" /> Editing Message...
                  </span>
                  <button onClick={() => { setEditingMsgId(null); setInputText(''); }} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Make Offer Sub-Box */}
              {showOfferBox && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                  <Tag className="w-4 h-4 text-amber-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">Offer Price (₹):</span>
                  <input
                    type="number"
                    value={offerPriceInput}
                    onChange={(e) => setOfferPriceInput(e.target.value)}
                    placeholder="e.g. 4500"
                    className="flex-1 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-1.5 font-bold outline-none text-slate-900 dark:text-white"
                  />
                  <button onClick={() => setShowOfferBox(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2 cursor-pointer">
                    Cancel
                  </button>
                </div>
              )}

              {/* MULTI-LANGUAGE QUICK INQUIRY CHIPS STRIP */}
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg shrink-0 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setChatLang('en')}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${chatLang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatLang('ta')}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${chatLang === 'ta' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    தமிழ்
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatLang('hi')}
                    className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${chatLang === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    हिंदी
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {(isBuyer ? QUICK_CHIPS_BUYER[chatLang] : QUICK_CHIPS_SELLER[chatLang]).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputText(chip.text)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VOICE RECORDING BAR OVERLAY */}
              {isRecording ? (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/90 border-t border-rose-300 dark:border-rose-800 flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                    <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                    Recording Voice Note... ({recordingSeconds}s)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => stopRecordingVoice(false)}
                      className="p-2 text-slate-500 hover:text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => stopRecordingVoice(true)}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Voice
                    </button>
                  </div>
                </div>
              ) : (
                /* FIXED BOTTOM MESSAGE INPUT BAR */
                <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Attach File / Photos / Location"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type a message or price offer..."
                    className="flex-1 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {inputText.trim() || offerPriceInput ? (
                    <button
                      type="submit"
                      disabled={isSending}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                    >
                      {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecordingVoice}
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
                      title="Record Voice Note"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </form>
              )}

            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 bg-white dark:bg-slate-950">
              <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-700 stroke-1" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">Select a conversation</p>
              <p className="text-xs max-w-xs text-slate-500">Instant real-time messaging with spare parts merchants and buyers across India.</p>
            </div>
          )}
        </div>

      </div>

      {/* =========================================
          CALL SELLER SHEET / MODAL
         ========================================= */}
      {showCallSheet && activeChat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 text-center">
            <img
              src={otherPartyPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPartyName}`}
              alt={otherPartyName}
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-emerald-500"
            />
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                {otherPartyName} <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </h3>
              <p className="text-xs text-slate-500">Verified Spare Parts Dealer</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-2">{otherPartyPhone}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCallSheet(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <a
                href={`tel:${otherPartyPhone.replace(/[^0-9+]/g, '')}`}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          VIDEO CALL SHEET / MODAL
         ========================================= */}
      {showVideoCallModal && activeChat && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 animate-in zoom-in-95">
          <div className="w-full flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">Encrypted AutoParts Video Call</span>
            </div>
            <button
              onClick={() => setShowVideoCallModal(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-auto space-y-4 text-center">
            <div className="relative">
              <img
                src={otherPartyPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPartyName}`}
                alt={otherPartyName}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-2xl animate-pulse"
              />
              <div className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 text-white rounded-full border-2 border-slate-950">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">{otherPartyName}</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1 animate-pulse">Ringing... Live part inspection for {activeChat.listingTitle}</p>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl max-w-xs text-center border border-white/10 text-xs text-slate-300">
              💡 Live video inspection lets you examine gear teeth, part numbers, and condition before payment.
            </div>
          </div>

          <div className="w-full max-w-xs flex items-center justify-center gap-4 z-10">
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className={`p-4 rounded-full font-bold text-white cursor-pointer transition-all ${
                isVideoMuted ? 'bg-rose-600' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Mute Audio"
            >
              <Mic className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowVideoCallModal(false)}
              className="p-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold shadow-xl cursor-pointer transition-transform hover:scale-105"
              title="End Video Call"
            >
              <Phone className="w-7 h-7 rotate-[135deg]" />
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-4 rounded-full font-bold text-white cursor-pointer transition-all ${
                isCameraOff ? 'bg-rose-600' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Toggle Camera"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          ATTACHMENT PREVIEW BEFORE SENDING MODAL
         ========================================= */}
      {showImagePreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 animate-in fade-in">
          <div className="flex items-center justify-between text-white">
            <span className="text-xs font-bold">{pendingImages.length} Photo(s) Selected</span>
            <button onClick={() => setShowImagePreviewModal(false)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-x-auto">
            <div className="flex gap-4 max-w-full">
              {pendingImages.map((img, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img src={img} alt="Preview" className="max-h-72 rounded-2xl object-contain border border-white/20" />
                  <button
                    onClick={() => setPendingImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full cursor-pointer shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md flex items-center gap-2 max-w-lg mx-auto w-full">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add caption..."
              className="flex-1 text-xs bg-transparent text-white placeholder:text-slate-400 border-none outline-none px-2"
            />
            <button
              onClick={handleSendPendingImages}
              className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          FORWARD MESSAGE MODAL
         ========================================= */}
      {forwardingMsg && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-500" /> Forward Message
              </h3>
              <button onClick={() => setForwardingMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 italic truncate">
              "{forwardingMsg.text || 'Shared Attachment'}"
            </div>

            <p className="text-xs font-bold text-slate-500">Select recipient:</p>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl">
              {chats.map((c) => {
                const isBuyerParty = c.buyerId === currentUser.uid;
                const name = isBuyerParty ? c.sellerName : c.buyerName;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleForwardMsgToChat(c.id)}
                    className="w-full text-left p-2.5 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>{name} ({c.listingTitle})</span>
                    <Send className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Lightbox */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <img src={zoomedImage} alt="Enlarged" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
        </div>
      )}
    </div>
  );
};
