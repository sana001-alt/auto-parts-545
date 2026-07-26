import React from 'react';
import { X, SlidersHorizontal, RotateCcw, ShieldCheck, ChevronLeft } from 'lucide-react';
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations';
import { VehicleType, PartCategory } from '../types';

interface OlxFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicleType: string;
  setSelectedVehicleType: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedCondition: string;
  setSelectedCondition: (c: string) => void;
  selectedState: string;
  setSelectedState: (s: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  minPrice: string;
  setMinPrice: (p: string) => void;
  maxPrice: string;
  setMaxPrice: (p: string) => void;
  verifiedOnly?: boolean;
  setVerifiedOnly?: (val: boolean) => void;
  onClearAll: () => void;
}

const VEHICLE_OPTIONS: { label: string; value: VehicleType | '' }[] = [
  { label: 'All Vehicles', value: '' },
  { label: 'Four Wheeler (Car)', value: 'Four Wheeler (Car)' },
  { label: 'Two Wheeler (Bike/Scooter)', value: 'Two Wheeler (Bike/Scooter)' },
  { label: 'Commercial (Truck/Bus/Auto)', value: 'Commercial (Truck/Bus/Auto)' },
  { label: 'Tractor & Heavy Equipment', value: 'Tractor & Heavy Equipment' },
];

const CATEGORY_OPTIONS: PartCategory[] = [
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

const CONDITION_OPTIONS = [
  'Brand New (Genuine OEM)',
  'OEM Surplus / Unused',
  'Grade A Used (Tested)',
  'Refurbished / Rebuilt'
];

export const OlxFilterModal: React.FC<OlxFilterModalProps> = ({
  isOpen,
  onClose,
  selectedVehicleType,
  setSelectedVehicleType,
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  verifiedOnly = false,
  setVerifiedOnly,
  onClearAll
}) => {
  if (!isOpen) return null;

  const availableDistricts = selectedState && INDIA_STATES_DISTRICTS[selectedState]
    ? INDIA_STATES_DISTRICTS[selectedState]
    : [];

  return (
    <div className="absolute inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden">
      <div className="bg-white dark:bg-slate-950 w-full h-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Filter Spare Parts</h2>
            </div>
          </div>
          
          <button 
            type="button" 
            onClick={onClearAll} 
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            Reset
          </button>
        </div>

        {/* Filters Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Vehicle Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Vehicle Type</label>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_OPTIONS.map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => setSelectedVehicleType(v.value)}
                  className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                    selectedVehicleType === v.value
                      ? 'bg-amber-500 text-white border-amber-500 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Part Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Condition</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="">Any Condition</option>
              {CONDITION_OPTIONS.map((cond) => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

          {/* Location State & District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('');
                }}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium"
              >
                <option value="">All India</option>
                {Object.keys(INDIA_STATES_DISTRICTS).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {selectedState && availableDistricts.length > 0 && (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">District / Hub</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium"
                >
                  <option value="">All Districts</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Price Range (₹)</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₹"
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium"
              />
              <span className="text-xs text-slate-400 font-bold">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₹"
                className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-medium"
              />
            </div>

            {/* Price Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Under ₹2,000', min: '', max: '2000' },
                { label: '₹2k - ₹10k', min: '2000', max: '10000' },
                { label: '₹10k - ₹50k', min: '10000', max: '50000' },
                { label: '₹50k+', min: '50000', max: '' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinPrice(preset.min);
                    setMaxPrice(preset.max);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Seller Toggle */}
          {setVerifiedOnly && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Verified Auto Merchants Only</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Only show listings from verified GST / scrap market traders</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 sticky bottom-0 z-30">
          <button
            type="button"
            onClick={onClearAll}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
};
