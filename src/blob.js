// Hardcoded for this specific project as Vercel doesn't prefix it with VITE_ by default
const BLOB_TOKEN = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

export const uploadToBlob = async (file, onProgress) => {
  try {
    const filename = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    if (onProgress) onProgress(50);
    
    const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: 'PUT',
      headers: {
        'authorization': `Bearer ${BLOB_TOKEN}`,
        'x-api-version': '7',
        'x-add-random-suffix': '1',
      },
      body: file
    });
    
    if (!response.ok) throw new Error(`Blob upload failed: ${response.statusText}`);
    const blob = await response.json();
    
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
    const file = new File([jsonStr], `${key}.json`, { type: 'application/json' });
    const filename = `db/${key}.json`;
    
    const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
      method: 'PUT',
      headers: {
        'authorization': `Bearer ${BLOB_TOKEN}`,
        'x-api-version': '7',
        'x-add-random-suffix': '0',
      },
      body: file
    });

    if (!response.ok) throw new Error(`DB Save failed: ${response.statusText}`);
    const blob = await response.json();
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
