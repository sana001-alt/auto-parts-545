import React from 'react';
import { 
  Car, 
  Bike, 
  Truck, 
  Cpu, 
  Disc, 
  Lightbulb, 
  Sparkles, 
  CircleDot, 
  Gauge, 
  Flame, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import { PartCategory } from '../types';

interface OlxCategoryGridProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedVehicleType: string;
  setSelectedVehicleType: (v: string) => void;
}

const CATEGORIES: { name: PartCategory | 'All Categories'; icon: React.ReactNode; color: string }[] = [
  { name: 'All Categories', icon: <Layers className="w-5 h-5 text-cyan-500" />, color: 'bg-cyan-100 dark:bg-cyan-950/60' },
  { name: 'Engine & Transmission', icon: <Cpu className="w-5 h-5 text-sky-500" />, color: 'bg-sky-100 dark:bg-sky-950/60' },
  { name: 'Lights, Mirrors & Glass', icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, color: 'bg-yellow-100 dark:bg-yellow-950/60' },
  { name: 'Body Parts & Frame', icon: <ShieldAlert className="w-5 h-5 text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-950/60' },
  { name: 'Wheels, Tyres & Alloys', icon: <CircleDot className="w-5 h-5 text-emerald-500" />, color: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { name: 'Brakes & Suspension', icon: <Disc className="w-5 h-5 text-purple-500" />, color: 'bg-purple-100 dark:bg-purple-950/60' },
  { name: 'Electrical & Battery', icon: <Sparkles className="w-5 h-5 text-cyan-500" />, color: 'bg-cyan-100 dark:bg-cyan-950/60' },
  { name: 'Interior, AC & Comfort', icon: <Gauge className="w-5 h-5 text-teal-500" />, color: 'bg-teal-100 dark:bg-teal-950/60' },
  { name: 'Exhaust, Fuel & Cooling', icon: <Flame className="w-5 h-5 text-red-500" />, color: 'bg-red-100 dark:bg-red-950/60' }
];

const VEHICLE_QUICK_TABS = [
  { label: 'All', value: '', icon: <Layers className="w-3.5 h-3.5" /> },
  { label: 'Cars', value: 'Four Wheeler (Car)', icon: <Car className="w-3.5 h-3.5" /> },
  { label: 'Bikes', value: 'Two Wheeler (Bike/Scooter)', icon: <Bike className="w-3.5 h-3.5" /> },
  { label: 'Trucks/Commercial', value: 'Commercial (Truck/Bus/Auto)', icon: <Truck className="w-3.5 h-3.5" /> },
];

export const OlxCategoryGrid: React.FC<OlxCategoryGridProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedVehicleType,
  setSelectedVehicleType
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 py-3.5 px-3 space-y-3">
      
      {/* Vehicle Segment Quick Toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-4xl mx-auto">
        {VEHICLE_QUICK_TABS.map((vt) => {
          const isSelected = selectedVehicleType === vt.value;
          return (
            <button
              key={vt.label}
              onClick={() => setSelectedVehicleType(vt.value)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-200/80 dark:hover:bg-slate-700'
              }`}
            >
              {vt.icon}
              <span>{vt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Icon Grid (OLX Horizontal Scrollable / Clean Grid) */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-flow-col auto-cols-[82px] sm:auto-cols-[96px] gap-2 overflow-x-auto no-scrollbar py-1 text-center">
          {CATEGORIES.map((cat) => {
            const catValue = cat.name === 'All Categories' ? '' : cat.name;
            const isSelected = selectedCategory === catValue;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(catValue)}
                className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 transform group-hover:scale-105 ${
                    cat.color
                  } ${
                    isSelected 
                      ? 'ring-2 ring-amber-500 shadow-md scale-105' 
                      : 'hover:shadow-xs'
                  }`}
                >
                  {cat.icon}
                </div>
                <span className={`text-[10px] sm:text-[11px] leading-tight line-clamp-2 font-medium transition-colors ${
                  isSelected ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}>
                  {cat.name.replace(' & ', ' / ').replace('All Categories', 'All Parts')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
