import { put } from '@vercel/blob';

// Hardcoded for this specific project as Vercel doesn't prefix it with VITE_ by default
const BLOB_TOKEN = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

export const uploadToBlob = async (file, onProgress) => {
  try {
    const filename = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // @vercel/blob `put` doesn't support onProgress natively in the client wrapper without a backend,
    // so we just call onProgress(50) and then 100 when done.
    if (onProgress) onProgress(50);
    
    const blob = await put(filename, file, {
      access: 'public',
      token: BLOB_TOKEN,
    });
    
    if (onProgress) onProgress(100);
    return blob.url;
  } catch (error) {
    console.error("Blob upload error:", error);
    throw error;
  }
};
export const saveDbToBlob = async (key, data) => {
  try {
    const jsonStr = JSON.stringify(data);
    // Use File object for better browser compatibility when uploading to blob
    const file = new File([jsonStr], `${key}.json`, { type: 'application/json' });
    const filename = `db/${key}.json`;
    const blob = await put(filename, file, {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: false
    });
    return blob.url;
  } catch (err) {
    console.error("DB Save error:", err);
    throw err;
  }
};

export const loadDbFromBlob = async (key) => {
  try {
    // Append timestamp to bypass cache
    const url = `https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/${key}.json?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("DB Load error:", err);
  }
  return null;
};
