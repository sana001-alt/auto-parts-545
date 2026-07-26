import React from 'react';
import { 
  Car, 
  Bike, 
  Truck, 
  Tractor, 
  Cpu, 
  Disc, 
  Sparkles, 
  Lightbulb, 
  ShieldAlert, 
  Gauge, 
  CircleDot, 
  Layers, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { VehicleType, PartCategory } from '../types';

interface CategoryBarProps {
  selectedVehicleType: string;
  setSelectedVehicleType: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedCondition: string;
  setSelectedCondition: (c: string) => void;
  onClearFilters: () => void;
}

const VEHICLE_TYPES: { label: VehicleType | 'All Vehicles'; icon: React.ReactNode; value: string }[] = [
  { label: 'All Vehicles', icon: <Flame className="w-4 h-4 text-amber-500" />, value: '' },
  { label: 'Four Wheeler (Car)', icon: <Car className="w-4 h-4 text-blue-500" />, value: 'Four Wheeler (Car)' },
  { label: 'Two Wheeler (Bike/Scooter)', icon: <Bike className="w-4 h-4 text-emerald-500" />, value: 'Two Wheeler (Bike/Scooter)' },
  { label: 'Commercial (Truck/Bus/Auto)', icon: <Truck className="w-4 h-4 text-orange-500" />, value: 'Commercial (Truck/Bus/Auto)' },
  { label: 'Tractor & Heavy Equipment', icon: <Tractor className="w-4 h-4 text-purple-500" />, value: 'Tractor & Heavy Equipment' }
];

const CATEGORIES: { name: PartCategory | 'All Categories'; icon: React.ReactNode }[] = [
  { name: 'All Categories', icon: <Layers className="w-4 h-4" /> },
  { name: 'Engine & Transmission', icon: <Cpu className="w-4 h-4" /> },
  { name: 'Body Parts & Frame', icon: <ShieldAlert className="w-4 h-4" /> },
  { name: 'Lights, Mirrors & Glass', icon: <Lightbulb className="w-4 h-4" /> },
  { name: 'Brakes & Suspension', icon: <Disc className="w-4 h-4" /> },
  { name: 'Electrical & Battery', icon: <Sparkles className="w-4 h-4" /> },
  { name: 'Wheels, Tyres & Alloys', icon: <CircleDot className="w-4 h-4" /> },
  { name: 'Interior, AC & Comfort', icon: <Gauge className="w-4 h-4" /> },
  { name: 'Exhaust, Fuel & Cooling', icon: <Flame className="w-4 h-4" /> }
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedVehicleType,
  setSelectedVehicleType,
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  onClearFilters
}) => {
  const hasActiveFilters = selectedVehicleType || selectedCategory || selectedCondition;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-3 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Vehicle Type Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {VEHICLE_TYPES.map((vt) => {
            const isSelected = selectedVehicleType === vt.value;
            return (
              <button
                key={vt.label}
                onClick={() => setSelectedVehicleType(vt.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {vt.icon}
                <span>{vt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const catValue = cat.name === 'All Categories' ? '' : cat.name;
            const isSelected = selectedCategory === catValue;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(catValue)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-cyan-400'
                }`}
              >
                <span className={isSelected ? 'text-slate-950' : 'text-slate-400'}>
                  {cat.icon}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Condition Filter Bar & Clear Button */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" /> Condition:
            </span>
            {['', 'Brand New', 'Used - Like New (Grade A)', 'Used - Good (Grade B)', 'Refurbished / Overhauled'].map(cond => (
              <button
                key={cond || 'all'}
                onClick={() => setSelectedCondition(cond)}
                className={`px-2.5 py-0.5 rounded-md font-medium text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCondition === cond
                    ? 'bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-300 dark:border-cyan-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cond || 'All Conditions'}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline shrink-0 ml-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
