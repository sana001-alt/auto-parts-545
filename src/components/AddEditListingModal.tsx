import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  MapPin, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  Cloud, 
  ChevronLeft,
  Image as ImageIcon 
} from 'lucide-react';
import { Listing, UserProfile, PartCategory, VehicleType, PartCondition } from '../types';
import { INDIA_STATES_DISTRICTS, POPULAR_BRANDS } from '../data/indiaLocations';
import { uploadImageFile, getSavedCloudinaryConfig } from '../lib/cloudinary';
import { LocationMap } from './LocationMap';

interface AddEditListingModalProps {
  currentUser: UserProfile;
  editingListing?: Listing | null;
  onSave: (listingData: Omit<Listing, 'id' | 'createdAt' | 'views' | 'status'>) => Promise<void>;
  onClose: () => void;
}

export const AddEditListingModal: React.FC<AddEditListingModalProps> = ({
  currentUser,
  editingListing,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(editingListing?.title || '');
  const [category, setCategory] = useState<PartCategory>(editingListing?.category || 'Engine & Transmission');
  const [vehicleType, setVehicleType] = useState<VehicleType>(editingListing?.vehicleType || 'Four Wheeler (Car)');
  const [make, setMake] = useState(editingListing?.make || 'Maruti Suzuki');
  const [model, setModel] = useState(editingListing?.model || '');
  const [year, setYear] = useState<number>(editingListing?.year || new Date().getFullYear());
  const [partNumber, setPartNumber] = useState(editingListing?.partNumber || '');
  const [price, setPrice] = useState<number>(editingListing?.price || 1500);
  const [isNegotiable, setIsNegotiable] = useState(editingListing?.isNegotiable ?? true);
  const [condition, setCondition] = useState<PartCondition>(editingListing?.condition || 'Used - Like New (Grade A)');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [images, setImages] = useState<string[]>(editingListing?.images || []);
  const [videoUrl, setVideoUrl] = useState(editingListing?.videoUrl || '');

  const [state, setState] = useState(editingListing?.location.state || currentUser.state || 'Delhi NCR');
  const [district, setDistrict] = useState(editingListing?.location.district || currentUser.district || 'Central Delhi');
  const [city, setCity] = useState(editingListing?.location.city || currentUser.city || 'Mayapuri');
  const [pincode, setPincode] = useState(editingListing?.location.pincode || '110064');
  const [lat, setLat] = useState<number>(editingListing?.location.lat || 28.6139);
  const [lng, setLng] = useState<number>(editingListing?.location.lng || 77.2090);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableDistricts = state && INDIA_STATES_DISTRICTS[state] ? INDIA_STATES_DISTRICTS[state] : [];
  const availableBrands = POPULAR_BRANDS[vehicleType] || POPULAR_BRANDS['Four Wheeler (Car)'];

  // Handle Multi-file Upload (up to 20 images)
  const handleImageFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files: File[] = Array.from(e.target.files);
    if (images.length + files.length > 20) {
      setError('You can upload a maximum of 20 images per listing.');
      return;
    }

    setUploading(true);
    setError('');
    const cloudinaryConfig = getSavedCloudinaryConfig();

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const url = await uploadImageFile(files[i], cloudinaryConfig);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a listing title.');
      return;
    }
    if (images.length === 0) {
      setError('Please upload at least 1 image of the spare part.');
      return;
    }
    if (price <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        title,
        category,
        vehicleType,
        make,
        model,
        year: Number(year),
        partNumber,
        price: Number(price),
        isNegotiable,
        condition,
        description,
        images,
        videoUrl,
        location: {
          state,
          district,
          city,
          pincode,
          lat,
          lng
        },
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName,
        sellerPhone: currentUser.phone || '',
        sellerPhoto: currentUser.photoURL || '',
        sellerVerified: currentUser.verified ?? true
      });
      onClose();
    } catch (err) {
      setError('Error saving listing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden">
      <div className="bg-white dark:bg-slate-950 w-full h-full flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose} 
              className="p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingListing ? 'Edit Spare Part Listing' : 'Post Spare Part Listing'}
              </h2>
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Sell used or new auto parts across India</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Photos (Up to 20 images) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" /> Upload Photos (Up to 20 images)
              </label>
              <span className="text-[11px] font-semibold text-slate-500">{images.length}/20 uploaded</span>
            </div>

            {/* Photo Grid & Uploader Dropzone */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800">
                  <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {images.length < 20 && (
                <label className="relative aspect-square rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700/80 hover:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFilesSelect}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="space-y-1">
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin mx-auto" />
                      <span className="text-[10px] text-slate-500 font-medium block">{uploadProgress}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 mt-1">+ Add Photos</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Video Demonstration Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Video Demonstration URL (Optional)</span>
              <span className="text-[10px] text-amber-600 font-semibold">Engine Sound / Part Walkthrough Video</span>
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://res.cloudinary.com/... or video link showing working engine/part"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-mono font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Section 2: Basic Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Item Details</h3>
            
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Listing Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Maruti Swift 1.3L Diesel Cylinder Head Assembly"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>

            {/* Vehicle Type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => {
                    const vt = e.target.value as VehicleType;
                    setVehicleType(vt);
                    if (POPULAR_BRANDS[vt] && !POPULAR_BRANDS[vt].includes(make)) {
                      setMake(POPULAR_BRANDS[vt][0]);
                    }
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Four Wheeler (Car)">Four Wheeler (Car)</option>
                  <option value="Two Wheeler (Bike/Scooter)">Two Wheeler (Bike/Scooter)</option>
                  <option value="Commercial (Truck/Bus/Auto)">Commercial (Truck/Bus/Auto)</option>
                  <option value="Tractor & Heavy Equipment">Tractor & Heavy Equipment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Part Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PartCategory)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Engine & Transmission">Engine & Transmission</option>
                  <option value="Body Parts & Frame">Body Parts & Frame</option>
                  <option value="Lights, Mirrors & Glass">Lights, Mirrors & Glass</option>
                  <option value="Brakes & Suspension">Brakes & Suspension</option>
                  <option value="Electrical & Battery">Electrical & Battery</option>
                  <option value="Wheels, Tyres & Alloys">Wheels, Tyres & Alloys</option>
                  <option value="Interior, AC & Comfort">Interior, AC & Comfort</option>
                  <option value="Exhaust, Fuel & Cooling">Exhaust, Fuel & Cooling</option>
                  <option value="Accessories & Fluids">Accessories & Fluids</option>
                </select>
              </div>
            </div>

            {/* Make / Brand & Model & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand / Make *</label>
                <select
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {availableBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="Other Brand">Other Brand</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Model *</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Swift / Creta / Thar"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Year of Manufacture</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={1990}
                  max={2026}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Part Number & Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">OEM Part Number (Optional)</label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="e.g. MS-D13A-9811"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-mono font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as PartCondition)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Used - Like New (Grade A)">Used - Like New (Grade A)</option>
                  <option value="Used - Good (Grade B)">Used - Good (Grade B)</option>
                  <option value="Used - Fair (Grade C)">Used - Fair (Grade C)</option>
                  <option value="Refurbished / Overhauled">Refurbished / Overhauled</option>
                </select>
              </div>
            </div>

            {/* Price & Negotiable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Selling Price (₹) *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-amber-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="negotiable" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Price is Negotiable
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description & Condition Details *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Mention working condition, mileage/usage, warranty status if any, and compatible variants..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

          </div>

          {/* Section 3: Location & OpenStreetMap Pin */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" /> Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">State *</label>
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict('');
                  }}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                >
                  {Object.keys(INDIA_STATES_DISTRICTS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">District / Hub *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                >
                  <option value="">Select District</option>
                  {availableDistricts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">City / Area Name</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mayapuri / Kurla / Pudupet"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-medium"
                />
              </div>
            </div>

            {/* OpenStreetMap Interactive Pin Selection */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                OpenStreetMap Location Pin (Click map to select location)
              </label>
              <LocationMap
                lat={lat}
                lng={lng}
                interactive={true}
                addressName={`${city || district}, ${state}`}
                onLocationSelect={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                className="h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
              />
            </div>
          </div>

          {/* Form Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Listing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Publish Listing
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
