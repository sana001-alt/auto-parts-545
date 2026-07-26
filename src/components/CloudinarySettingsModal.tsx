import React, { useState } from 'react';
import { X, Cloud, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';
import { getSavedCloudinaryConfig, saveCloudinaryConfig } from '../lib/cloudinary';

interface CloudinarySettingsModalProps {
  onClose: () => void;
}

export const CloudinarySettingsModal: React.FC<CloudinarySettingsModalProps> = ({ onClose }) => {
  const current = getSavedCloudinaryConfig();
  const [cloudName, setCloudName] = useState(current?.cloudName || '');
  const [uploadPreset, setUploadPreset] = useState(current?.uploadPreset || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCloudinaryConfig({ cloudName: cloudName.trim(), uploadPreset: uploadPreset.trim() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-40 bg-white dark:bg-slate-950 flex flex-col h-full w-full overflow-hidden">
      <div className="bg-white dark:bg-slate-950 w-full h-full flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Media Storage Settings</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Configure an unsigned Cloudinary upload preset to store up to 20 high-res spare part photos directly on Cloudinary CDN. (Optional — local high-speed image compression fallback is active by default).
          </p>

        {saved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved Successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cloudinary Cloud Name</label>
            <input
              type="text"
              value={cloudName}
              onChange={(e) => setCloudName(e.target.value)}
              placeholder="e.g. my-autoparts-cloud"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unsigned Upload Preset</label>
            <input
              type="text"
              value={uploadPreset}
              onChange={(e) => setUploadPreset(e.target.value)}
              placeholder="e.g. spare_parts_preset"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/20"
            >
              Save Configuration
            </button>
          </div>
        </form>

        </div>
      </div>
    </div>
  );
};
