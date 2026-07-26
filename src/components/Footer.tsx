import React from 'react';
import { Wrench, ShieldCheck, MapPin, Phone, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-white">AutoParts<span className="text-amber-500">India</span></span>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            India's dedicated marketplace for used, OEM, and brand new automotive spare parts. Connecting mechanics, garages, individual buyers, and spare parts scrap merchants across 28 states.
          </p>

          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
            <ShieldCheck className="w-4 h-4" /> 100% Verified Parts & Sellers
          </div>
        </div>

        {/* Col 2: Major Spare Part Markets in India */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Top Auto Spare Part Hubs</h4>
          <ul className="space-y-1.5 text-slate-400 text-[11px]">
            <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> Mayapuri Auto Market, Delhi NCR</li>
            <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> CST Road Kurla, Mumbai</li>
            <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> Pudupet Spare Hub, Chennai</li>
            <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> Shivajinagar, Bengaluru</li>
            <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> Mullick Bazar, Kolkata</li>
            <li className="flex items-center gap-1"><MapPin className="w-3 h-3 text-amber-500" /> Ludhiana Auto Market, Punjab</li>
          </ul>
        </div>

        {/* Col 3: Categories */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Popular Categories</h4>
          <ul className="space-y-1.5 text-slate-400 text-[11px]">
            <li>• Car Engines & Cylinder Heads</li>
            <li>• Royal Enfield & Bike Exhausts</li>
            <li>• Thar & SUV Offroad Bumpers</li>
            <li>• Original LED Headlights & DRLs</li>
            <li>• Alloy Wheels & Tubeless Tyres</li>
            <li>• Commercial Truck Turbos & Gearboxes</li>
          </ul>
        </div>

        {/* Col 4: Safety & Support */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Help & Safety</h4>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Always verify part code compatibility with your mechanic before purchase. Inspect heavy engine units in person.
          </p>
          <div className="pt-2 text-slate-400 text-[11px] space-y-1">
            <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-500" /> support@autopartsindia.in</p>
            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-500" /> +91 1800-SPARE-PARTS</p>
          </div>
        </div>

      </div>

      <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-[11px]">
        © 2026 AutoParts India. Built for Indian Automotive Community.
      </div>
    </footer>
  );
};
