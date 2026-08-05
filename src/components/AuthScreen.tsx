import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Loader2, 
  Wrench, 
  MessageSquare,
  Shield,
  FileText,
  X,
  Compass,
  Lock,
  Car
} from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onSuccess, 
  currentUser
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDocModal, setShowDocModal] = useState<'privacy' | 'terms' | null>(null);

  // If already logged in, automatically proceed
  useEffect(() => {
    if (currentUser) {
      onSuccess(currentUser);
    }
  }, [currentUser, onSuccess]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await loginWithGoogle();
      onSuccess(profile);
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.message) {
        setError(err.message);
      } else {
        setError('Google Sign-In was cancelled or failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto animate-in fade-in duration-300 select-none">
      
      {/* Background Decorative Metallic Grid & Red Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-slate-950/90 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 p-4 sm:p-6 flex items-center justify-between border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-500/40">
            <Wrench className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              AUTOPARTS <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">INDIA</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Premier Auto Spare Marketplace
            </p>
          </div>
        </div>
      </div>

      {/* Center Main Hero Container */}
      <div className="relative z-10 max-w-md mx-auto w-full px-5 py-8 space-y-6 flex-1 flex flex-col justify-center">
        
        {/* Value Prop Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/50 text-red-400 text-xs font-black uppercase tracking-wider shadow-inner">
            <Car className="w-3.5 h-3.5 text-red-500" />
            <span>Direct Scrapyard & OEM Network</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Genuine Auto Spare Parts at Trade Prices
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Direct access to verified auto dealers in <span className="text-slate-200 font-bold">Mayapuri</span>, <span className="text-slate-200 font-bold">Kurla</span>, & <span className="text-slate-200 font-bold">Pudupet</span>.
          </p>
        </div>

        {/* Feature Pillars */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl text-center space-y-1 shadow-md">
            <ShieldCheck className="w-5 h-5 text-red-500 mx-auto" />
            <p className="text-[10px] font-bold text-slate-200">100% Genuine</p>
            <p className="text-[9px] text-slate-400">Verified Parts</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl text-center space-y-1 shadow-md">
            <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto" />
            <p className="text-[10px] font-bold text-slate-200">Direct Chat</p>
            <p className="text-[9px] text-slate-400">0% Commission</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl text-center space-y-1 shadow-md">
            <Compass className="w-5 h-5 text-blue-400 mx-auto" />
            <p className="text-[10px] font-bold text-slate-200">Pan-India</p>
            <p className="text-[9px] text-slate-400">28+ States</p>
          </div>
        </div>

        {/* Primary Google Login Card */}
        <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-5">
          
          <div className="text-center space-y-1">
            <h3 className="text-base font-black text-white">Sign In to AutoParts India</h3>
            <p className="text-xs text-slate-400">Sign in with your Google Account to start browsing and trading</p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-950/90 border border-red-800/90 text-red-200 text-xs rounded-2xl space-y-1 animate-in fade-in">
              <p className="font-bold flex items-center gap-1.5 text-red-400">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Sign-In Error</span>
              </p>
              <p className="text-[11px] text-red-300 leading-normal">{error}</p>
            </div>
          )}

          {/* Exclusive Single Google Sign-In Action Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer group border border-slate-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
            ) : (
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span className="tracking-tight">
              {loading ? 'Connecting with Google...' : 'Continue with Google Account'}
            </span>
          </button>

          {/* Quick Demo Sign-In as Admin (autoparts2@gmail.com) */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                const adminProfile: UserProfile = {
                  uid: 'admin_autoparts2',
                  displayName: 'Super Admin (AutoParts)',
                  email: 'autoparts2@gmail.com',
                  phone: '+91 98110 45892',
                  verified: true,
                  createdAt: new Date().toISOString()
                };
                onSuccess(adminProfile);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Sign In as Super Admin (autoparts2@gmail.com)</span>
            </button>
          </div>

        </div>

      </div>

      {/* Bottom Footer with Privacy & Terms links */}
      <div className="relative z-10 p-4 text-center border-t border-slate-900 bg-slate-950/90 space-y-2">
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-medium">
          <button 
            type="button"
            onClick={() => setShowDocModal('terms')}
            className="hover:text-red-400 transition-colors underline cursor-pointer"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => setShowDocModal('privacy')}
            className="hover:text-red-400 transition-colors underline cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>

        <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          Protected by Google Firebase Security Standards & Data Privacy Laws
        </p>
      </div>

      {/* Privacy Policy & Terms Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[80vh] flex flex-col text-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                {showDocModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </span>
              <button 
                onClick={() => setShowDocModal(null)} 
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 text-xs leading-relaxed text-slate-300 flex-1">
              {showDocModal === 'terms' ? (
                <>
                  <p className="font-bold text-white">AutoParts India User Agreement</p>
                  <p>By accessing or using AutoParts India, you agree to comply with our community terms for automotive spare parts trade.</p>
                  <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="font-semibold text-slate-100">1. Verification & Authentic Postings</p>
                    <p className="text-[11px] text-slate-400">All listings must accurately represent real OEM or aftermarket vehicle spare parts. Counterfeit listings will be blocked.</p>
                  </div>
                  <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="font-semibold text-slate-100">2. Direct Communication</p>
                    <p className="text-[11px] text-slate-400">AutoParts India provides direct messaging between buyers and sellers. Users are responsible for inspecting parts prior to payment.</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-bold text-white">AutoParts India Data Protection Policy</p>
                  <p>Your privacy and identity security are fundamental to our platform.</p>
                  <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="font-semibold text-slate-100">1. Data Storage & Google OAuth</p>
                    <p className="text-[11px] text-slate-400">We utilize official Google Authentication for secure login. We only request basic user identity (Name, Email, Profile Picture) to create your verified trader badge.</p>
                  </div>
                  <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <p className="font-semibold text-slate-100">2. Zero Third-Party Selling</p>
                    <p className="text-[11px] text-slate-400">We never sell, rent, or trade your phone number or personal details to unauthorized advertisers.</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowDocModal(null)}
              className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close Document
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
