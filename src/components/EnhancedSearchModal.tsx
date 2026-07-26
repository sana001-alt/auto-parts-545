import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Mic, 
  MicOff, 
  QrCode, 
  History, 
  Trash2, 
  TrendingUp, 
  Car, 
  Bike, 
  Truck, 
  Bus, 
  Tag, 
  Check, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Camera,
  Layers,
  Wrench,
  Compass
} from 'lucide-react';
import { 
  INDIA_VEHICLE_DATABASE, 
  POPULAR_SEARCHES, 
  TRENDING_TAGS, 
  ALL_AUTOMOTIVE_BRANDS,
  VehicleDatabaseEntry 
} from '../data/indiaAutoDatabase';
import { getInstantSearchSuggestions, SearchSuggestion } from '../utils/searchEngine';

interface EnhancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchType: 'all' | 'part' | 'oem' | 'brand' | 'model' | 'engine';
  setSearchType: (type: 'all' | 'part' | 'oem' | 'brand' | 'model' | 'engine') => void;
  onApplySearch: (query: string, type?: 'all' | 'part' | 'oem' | 'brand' | 'model' | 'engine') => void;
  onOpenFilters: () => void;
}

export const EnhancedSearchModal: React.FC<EnhancedSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  onApplySearch,
  onOpenFilters
}) => {
  const [localInput, setLocalInput] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autoparts_search_history');
      return saved ? JSON.parse(saved) : ['Swift DDiS Engine Block', 'Creta Headlight Assembly', '55810-M74L00'];
    } catch {
      return ['Swift DDiS Engine Block', 'Creta Headlight Assembly'];
    }
  });

  // Voice Search state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  // Barcode / QR Scanner state
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(false);

  // Vehicle Finder state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalInput(searchQuery);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, searchQuery]);

  // Update suggestions on input change
  useEffect(() => {
    if (localInput.trim().length > 0) {
      const sugs = getInstantSearchSuggestions(localInput);
      setSuggestions(sugs);
    } else {
      setSuggestions([]);
    }
  }, [localInput]);

  // Handle Search Submission
  const handleExecuteSearch = (queryToSearch: string, overrideType?: 'all' | 'part' | 'oem' | 'brand' | 'model' | 'engine') => {
    const q = queryToSearch.trim();
    if (!q) return;

    // Save to Search History
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== q.toLowerCase());
      const updated = [q, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('autoparts_search_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setSearchQuery(q);
    if (overrideType) setSearchType(overrideType);
    onApplySearch(q, overrideType || searchType);
    onClose();
  };

  const removeHistoryItem = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== itemToRemove);
      localStorage.setItem('autoparts_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('autoparts_search_history');
  };

  // Voice Search Handler (Web Speech API)
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      alert('Voice Search is not supported in this browser. Please type your search query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('Listening... Speak part name or car model');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        setVoiceTranscript(transcript);
        setLocalInput(transcript);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
        setVoiceTranscript('Speech error. Try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (voiceTranscript && !voiceTranscript.startsWith('Listening')) {
          handleExecuteSearch(voiceTranscript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Barcode / QR scan simulator & sample trigger
  const triggerSampleBarcode = (code: string) => {
    setScannedBarcode(code);
    setIsScanningActive(true);
    setTimeout(() => {
      setIsScanningActive(false);
      setShowQrScanner(false);
      setLocalInput(code);
      handleExecuteSearch(code, 'oem');
    }, 1200);
  };

  if (!isOpen) return null;

  // Available brands & models based on selection
  const filteredVehicles = INDIA_VEHICLE_DATABASE.filter(v => {
    if (selectedCategory && v.category !== selectedCategory) return false;
    if (selectedBrand && v.brand !== selectedBrand) return false;
    return true;
  });

  const availableBrands = Array.from(new Set(
    INDIA_VEHICLE_DATABASE
      .filter(v => !selectedCategory || v.category === selectedCategory)
      .map(v => v.brand)
  ));

  return (
    <div className="absolute inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden">
      <div className="w-full h-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
        
        {/* Header Search Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 absolute left-3.5 text-amber-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteSearch(localInput)}
                placeholder="Search Swift DDiS, Creta LED, 55810-M74L00, Thar 4x4..."
                className="w-full pl-11 pr-24 py-3 text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl border border-amber-300/60 dark:border-amber-700/60 focus:ring-2 focus:ring-amber-500 outline-none shadow-xs placeholder:text-slate-400"
              />

              <div className="absolute right-2 flex items-center gap-1">
                {localInput && (
                  <button
                    onClick={() => setLocalInput('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Voice Search Button */}
                <button
                  onClick={startVoiceSearch}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title="Voice Search (Speak)"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* QR / Barcode Scanner */}
                <button
                  onClick={() => setShowQrScanner(true)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                  title="Barcode / QR Scanner"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => handleExecuteSearch(localInput)}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer shrink-0"
            >
              Search
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Mode Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Mode:</span>
            {[
              { id: 'all', label: 'All Parts & Vehicles' },
              { id: 'part', label: 'Part Name' },
              { id: 'oem', label: 'OEM Number' },
              { id: 'brand', label: 'Vehicle Brand' },
              { id: 'model', label: 'Model' },
              { id: 'engine', label: 'Engine Code' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSearchType(m.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  searchType === m.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Search Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Voice Search Feedback Banner */}
          {isListening && (
            <div className="p-4 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl text-white flex items-center justify-between shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Listening Voice Command...</p>
                  <p className="text-sm font-extrabold italic">{voiceTranscript || "Say 'Swift front brake pad' or '55810-M74L00'..."}</p>
                </div>
              </div>
              <button
                onClick={() => setIsListening(false)}
                className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Instant Auto-Complete Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Instant Database Suggestions
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-amber-50/50 dark:bg-slate-800/50 rounded-2xl border border-amber-200/80 dark:border-slate-700 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      const query = s.oemPartNumber || s.title;
                      handleExecuteSearch(query, s.oemPartNumber ? 'oem' : 'all');
                    }}
                    className="w-full p-3 text-left hover:bg-amber-100/60 dark:hover:bg-slate-700/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {s.title}
                        {s.badge && (
                          <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-md">
                            {s.badge}
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" /> Recent Search History
                </h3>
                <button
                  onClick={clearAllHistory}
                  className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <div
                    key={item}
                    onClick={() => handleExecuteSearch(item)}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
                  >
                    <span>{item}</span>
                    <button
                      onClick={(e) => removeHistoryItem(item, e)}
                      className="text-slate-400 hover:text-rose-500 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Auto Searches */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Popular Auto Part Queries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {POPULAR_SEARCHES.map((pop) => (
                <button
                  key={pop.query}
                  onClick={() => handleExecuteSearch(pop.query, pop.type === 'oem' ? 'oem' : 'all')}
                  className="p-3 bg-white dark:bg-slate-800 hover:border-amber-500 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-left group"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
                      {pop.query}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{pop.category} • {pop.count}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Vehicle Compatibility Explorer */}
          <div className="p-4 bg-gradient-to-br from-slate-900 to-amber-950 rounded-3xl text-white space-y-4 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black tracking-tight">India Automotive Database Finder</h3>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                30+ Brands
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Filter exact spare parts by selecting vehicle segment, brand, or model:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Category */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedBrand('');
                  setSelectedModel('');
                }}
                className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-xl p-2.5 outline-none font-bold cursor-pointer"
              >
                <option value="">All Vehicle Types</option>
                <option value="Car">Cars</option>
                <option value="Bike">Bikes</option>
                <option value="Scooter">Scooters</option>
                <option value="Truck">Trucks</option>
                <option value="Bus">Buses</option>
                <option value="Pickup">Pickups</option>
                <option value="Van">Vans</option>
                <option value="Auto Rickshaw">Auto Rickshaws</option>
                <option value="Tractor">Tractors</option>
              </select>

              {/* Brand */}
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('');
                }}
                className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-xl p-2.5 outline-none font-bold cursor-pointer"
              >
                <option value="">All Brands</option>
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>

              {/* Model */}
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  if (e.target.value) handleExecuteSearch(e.target.value, 'model');
                }}
                className="text-xs bg-slate-800/90 text-white border border-slate-700 rounded-xl p-2.5 outline-none font-bold cursor-pointer"
              >
                <option value="">Select Model</option>
                {filteredVehicles.map(v => (
                  <option key={v.id} value={`${v.brand} ${v.model}`}>{v.model} ({v.years})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Trending Market Tags */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Trending Parts & Scrap Hubs
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const clean = tag.replace(/^[^\w\s]+/, '').trim();
                    handleExecuteSearch(clean);
                  }}
                  className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
          <button
            onClick={onOpenFilters}
            className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" /> Open Full Filters Modal
          </button>
          <span className="text-[11px] text-slate-400 font-medium">AutoParts India Database v2.5</span>
        </div>

      </div>

      {/* Barcode / QR Scanner Modal View */}
      {showQrScanner && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl border border-amber-500/40 p-6 max-w-md w-full text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" /> Part Barcode & QR Scanner
              </span>
              <button onClick={() => setShowQrScanner(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Viewfinder */}
            <div className="relative aspect-square w-full max-w-[260px] mx-auto border-2 border-dashed border-amber-500 rounded-2xl flex flex-col items-center justify-center overflow-hidden bg-slate-950/80">
              {isScanningActive ? (
                <div className="space-y-3 p-4">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-black text-amber-400">Scanning Barcode: {scannedBarcode}</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  <Camera className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
                  <p className="text-xs text-slate-300 font-bold">Align Part Packaging QR or OEM Barcode inside frame</p>
                </div>
              )}
              {/* Target Reticle corners */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
            </div>

            <p className="text-xs text-slate-400">Tap sample barcodes below to test QR resolution:</p>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => triggerSampleBarcode('55810-M74L00')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Maruti Swift Pads (55810-M74L00)
              </button>
              <button
                onClick={() => triggerSampleBarcode('92101-C9000')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Creta Headlight (92101-C9000)
              </button>
              <button
                onClick={() => triggerSampleBarcode('12100-KCC-900')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Splendor Piston Kit (12100-KCC-900)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
