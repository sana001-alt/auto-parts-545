/**
 * Cloudinary image upload utility for auto spare parts marketplace.
 * Supports unsigned uploads to Cloudinary or falls back to optimized data URLs / Blob storage.
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

const DEFAULT_CLOUDINARY_CONFIG_KEY = 'autoparts_cloudinary_config';

export function getSavedCloudinaryConfig(): CloudinaryConfig | null {
  try {
    const raw = localStorage.getItem(DEFAULT_CLOUDINARY_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading saved Cloudinary config:', err);
  }
  return null;
}

export function saveCloudinaryConfig(config: CloudinaryConfig) {
  try {
    localStorage.setItem(DEFAULT_CLOUDINARY_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving Cloudinary config:', err);
  }
}

/**
 * Uploads a file to Cloudinary if configured, or compresses to a lightweight Data URL string.
 */
export async function uploadImageFile(file: File, config?: CloudinaryConfig | null): Promise<string> {
  const activeConfig = config || getSavedCloudinaryConfig();

  // If user provided Cloudinary Cloud Name and Upload Preset
  if (activeConfig && activeConfig.cloudName && activeConfig.uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', activeConfig.uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${activeConfig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      } else {
        console.warn('Cloudinary upload returned non-ok status, using fallback compressor');
      }
    } catch (err) {
      console.warn('Cloudinary upload network error, using fallback compressor', err);
    }
  }

  // Fallback: Compress image to JPEG Data URL (max 1200px width/height, 0.82 quality)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
