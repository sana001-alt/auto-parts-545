import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Check, 
  X, 
  Clock, 
  Compass, 
  Loader2, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations';

interface LocationBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
}

export const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<{ state: string; district: string }[]>([]);

  // Temp selection before pressing "Apply"
  const [tempState, setTempState] = useState(selectedState);
  const [tempDistrict, setTempDistrict] = useState(selectedDistrict);

  // Sync state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTempState(selectedState);
      setTempDistrict(selectedDistrict);
      loadRecentLocations();
    }
  }, [isOpen, selectedState, selectedDistrict]);

  // Load recent locations from localStorage
  const loadRecentLocations = () => {
    try {
      const stored = localStorage.getItem('autoparts_recent_locations');
      if (stored) {
        setRecentLocations(JSON.parse(stored));
      } else {
        // Pre-populate with popular scrap hubs
        const defaults = [
          { state: 'Delhi', district: 'Mayapuri' },
          { state: 'Maharashtra', district: 'Mumbai' },
          { state: 'Tamil Nadu', district: 'Chennai' },
          { state: 'Karnataka', district: 'Bengaluru' },
        ];
        setRecentLocations(defaults);
      }
    } catch {
      // ignore
    }
  };

  // Save location to recent history
  const saveToRecent = (state: string, district: string) => {
    if (!state) return;
    try {
      const existing = recentLocations.filter(
        loc => !(loc.state === state && loc.district === district)
      );
      const updated = [{ state, district }, ...existing].slice(0, 6);
      setRecentLocations(updated);
      localStorage.setItem('autoparts_recent_locations', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  // Handle Detect Current Location using Geolocation
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setDetectError(null);

    if (!navigator.geolocation) {
      setDetectError('Geolocation is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Attempt reverse geocoding via free Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const state = address.state || address.region || '';
            const district = address.state_district || address.county || address.city || address.town || '';

            // Match state against available INDIA_STATES_DISTRICTS keys
            const matchedStateKey = Object.keys(INDIA_STATES_DISTRICTS).find(
              s => s.toLowerCase() === state.toLowerCase() || state.toLowerCase().includes(s.toLowerCase())
            ) || '';

            let matchedDistrictKey = '';
            if (matchedStateKey) {
              const districtsList = INDIA_STATES_DISTRICTS[matchedStateKey] || [];
              matchedDistrictKey = districtsList.find(
                d => d.toLowerCase() === district.toLowerCase() || district.toLowerCase().includes(d.toLowerCase())
              ) || '';
            }

            if (matchedStateKey) {
              setTempState(matchedStateKey);
              setTempDistrict(matchedDistrictKey);
            } else {
              // Fallback to Delhi NCR as default
              setTempState('Delhi');
              setTempDistrict('Mayapuri');
            }
          } else {
            setTempState('Delhi');
            setTempDistrict('Mayapuri');
          }
        } catch {
          // Fallback location
          setTempState('Delhi');
          setTempDistrict('Mayapuri');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setDetectError('Location permission denied. Please select manually below.');
        } else {
          setDetectError('Unable to detect GPS position. Select state/district manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Apply location and auto-close sheet
  const handleApply = (stateToApply = tempState, districtToApply = tempDistrict) => {
    setSelectedState(stateToApply);
    setSelectedDistrict(districtToApply);
    if (stateToApply) {
      saveToRecent(stateToApply, districtToApply);
    }
    onClose();
  };

  // Clear location
  const handleReset = () => {
    setTempState('');
    setTempDistrict('');
    handleApply('', '');
  };

  // Filtered lists based on search term
  const allStates = Object.keys(INDIA_STATES_DISTRICTS);
  const availableDistricts = tempState && INDIA_STATES_DISTRICTS[tempState]
    ? INDIA_STATES_DISTRICTS[tempState]
    : [];

  const filteredStates = searchTerm
    ? allStates.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    : allStates;

  const filteredDistricts = searchTerm && tempState
    ? availableDistricts.filter(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
    : availableDistricts;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      
      {/* Backdrop overlay touch to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Material Design 3 Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* M3 Sheet Drag Handle Indicator */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-500" />
              Select Location
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Find spare parts near your city or scrap market hub
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">

          {/* ACTIVE / SAVED LOCATION BADGE */}
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500 text-slate-950 rounded-xl font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-wider block">
                  Currently Selected
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {selectedDistrict ? `${selectedDistrict}, ${selectedState}` : selectedState ? selectedState : 'All India (All Markets)'}
                </span>
              </div>
            </div>

            {(selectedState || selectedDistrict) && (
              <button
                onClick={handleReset}
                className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* DETECT CURRENT GPS LOCATION BUTTON */}
          <button
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full py-3 px-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 hover:from-slate-800 hover:to-slate-700 text-white font-black text-xs rounded-2xl border border-slate-700/80 shadow-md flex items-center justify-between transition-all active:scale-98 cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2.5">
              {isDetecting ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              )}
              <div className="text-left">
                <span className="block text-xs font-black">
                  {isDetecting ? 'Detecting GPS Position...' : 'Use Current Location'}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  Auto-detect nearest city & state via GPS
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {detectError && (
            <p className="text-[10px] font-bold text-rose-500 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              {detectError}
            </p>
          )}

          {/* RECENT / POPULAR LOCATIONS CHIPS */}
          {recentLocations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Recent & Popular Hubs
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleApply('', '')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !tempState && !tempDistrict
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500'
                  }`}
                >
                  All India
                </button>
                {recentLocations.map((loc, idx) => {
                  const isSelected = tempState === loc.state && tempDistrict === loc.district;
                  return (
                    <button
                      key={`${loc.state}_${loc.district}_${idx}`}
                      onClick={() => {
                        setTempState(loc.state);
                        setTempDistrict(loc.district);
                        handleApply(loc.state, loc.district);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 border-cyan-500 font-black shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-500'
                      }`}
                    >
                      <span>{loc.district ? `${loc.district}, ${loc.state}` : loc.state}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SEARCH BOX FOR STATES & DISTRICTS */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search State, District or Scrap Hub (e.g., Delhi, Mayapuri)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* STATE SELECTION */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
              1. Choose State / Union Territory
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto no-scrollbar p-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setTempState('');
                  setTempDistrict('');
                }}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer ${
                  !tempState
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                All States (India)
              </button>
              {filteredStates.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setTempState(st);
                    setTempDistrict('');
                  }}
                  className={`p-2 rounded-xl text-[11px] font-bold text-left truncate transition-all cursor-pointer ${
                    tempState === st
                      ? 'bg-cyan-500 text-slate-950 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* DISTRICT / SCRAP MARKET SELECTION */}
          {tempState && availableDistricts.length > 0 && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">
                2. Choose District / Auto Hub in {tempState}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto no-scrollbar p-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setTempDistrict('')}
                  className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer ${
                    !tempDistrict
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  All {tempState} Districts
                </button>
                {filteredDistricts.map((dist) => (
                  <button
                    key={dist}
                    onClick={() => setTempDistrict(dist)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-left truncate transition-all cursor-pointer ${
                      tempDistrict === dist
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sheet Footer Action Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            Clear All
          </button>
          <button
            onClick={() => handleApply()}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg shadow-cyan-500/20 cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4" />
            Apply Location
          </button>
        </div>

      </div>
    </div>
  );
};
