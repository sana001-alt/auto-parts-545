import React from 'react';
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'search' | 'sell' | 'chats' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'sell' | 'chats' | 'profile') => void;
  onOpenSellModal: () => void;
  unreadChatsCount?: number;
  isLoggedIn: boolean;
  userAvatar?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSellModal,
  unreadChatsCount = 0,
  isLoggedIn,
  userAvatar
}) => {
  const handleTabClick = (tab: 'home' | 'search' | 'sell' | 'chats' | 'profile') => {
    if (tab === 'sell') {
      onOpenSellModal();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg transition-colors duration-200">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative">
        
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-cyan-500 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* Search Tab */}
        <button
          onClick={() => handleTabClick('search')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'search'
              ? 'text-cyan-500 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Search className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Explore</span>
        </button>

        {/* Center Floating SELL (+ Button) */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={() => handleTabClick('sell')}
            className="group relative flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-500 text-white shadow-lg shadow-cyan-500/30 ring-4 ring-white dark:ring-slate-900 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            title="Post an Ad / Sell Spare Part"
          >
            <div className="flex items-center justify-center">
              <Plus className="w-7 h-7 stroke-[3] transform group-hover:rotate-90 transition-transform duration-300 text-cyan-400" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-cyan-200 -mt-1">SELL</span>
          </button>
        </div>

        {/* Chats Tab */}
        <button
          onClick={() => handleTabClick('chats')}
          className={`relative flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'chats'
              ? 'text-cyan-500 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === 'chats' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Chats</span>
          {unreadChatsCount > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadChatsCount}
            </span>
          )}
        </button>

        {/* Profile / Account Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'text-cyan-500 font-extrabold scale-105'
              : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isLoggedIn && userAvatar ? (
            <img
              src={userAvatar}
              alt="Profile"
              className={`w-5 h-5 rounded-full object-cover border ${
                activeTab === 'profile' ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
          ) : (
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          )}
          <span className="text-[10px] tracking-tight mt-0.5">Account</span>
        </button>

      </div>
    </div>
  );
};
