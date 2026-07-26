import React, { useEffect, useState } from 'react';
import { Wrench, ShieldCheck, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFading(true), 1200);
    const timer2 = setTimeout(() => onFinish(), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 via-blue-600 to-indigo-900 text-white transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4 animate-in zoom-in-90 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-white text-blue-600 flex items-center justify-center shadow-2xl shadow-blue-900/50 ring-4 ring-white/30 animate-pulse">
          <Wrench className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-1.5">
            AutoParts <span className="text-amber-400">IN</span>
          </h1>
          <p className="text-xs font-semibold text-blue-100/80 tracking-wide uppercase">
            India's #1 Auto Spare Parts Marketplace
          </p>
        </div>

        <div className="flex items-center gap-2 pt-6 text-[11px] font-bold text-blue-200 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Mayapuri • Kurla • Pudupet Verified
        </div>
      </div>

      <div className="absolute bottom-8 flex flex-col items-center space-y-2">
        <div className="w-6 h-6 border-2 border-white/30 border-t-amber-400 rounded-full animate-spin" />
        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-200/70">
          Powered by Material 3
        </span>
      </div>
    </div>
  );
};
