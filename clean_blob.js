
const BLOB_TOKEN = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

const saveDbToBlob = async (key, data) => {
  const jsonStr = JSON.stringify(data);
  const blobData = new Blob([jsonStr], { type: 'application/json' });
  const filename = `db/${key}.json`;
  
  const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
    method: 'PUT',
    headers: {
      'authorization': `Bearer ${BLOB_TOKEN}`,
      'x-api-version': '7',
      'x-add-random-suffix': '0',
    },
    body: blobData
  });

  if (!response.ok) throw new Error(`DB Save failed: ${response.statusText}`);
  const blob = await response.json();
  return blob.url;
};

const loadDbFromBlob = async (key) => {
  const url = `https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db/${key}.json?t=${Date.now()}`;
  const res = await fetch(url);
  if (res.ok) {
    return await res.json();
  }
  return null;
};

(async () => {
  const data = await loadDbFromBlob('testsData');
  if (!data) return;
  
  const validAdv = [];
  data.advanced.forEach(t => {
    const title = t.title.toLowerCase();
    if (title.includes('cbse') || title.includes('bitsat')) return;
    if (title.includes('iit-jee 2007') || title.includes('iit-jee 2006') || title.includes('iit-jee 2005')) return;
    if (!title.includes('jee') && !title.includes('iit-jee')) return;

    validAdv.push(t);
  });
  
  data.advanced = validAdv;
  const url = await saveDbToBlob('testsData', data);
  console.log('Cleaned tests saved to:', url);
})();
