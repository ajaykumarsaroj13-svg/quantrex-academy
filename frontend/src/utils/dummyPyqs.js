// JEE Main PYQ Database - Now fetched from the Backend SQLite Database!

export let PYQ_DATABASE = [];
export let PYQ_CHAPTERS = { mathematics: [], physics: [], chemistry: [] };

let isChaptersLoaded = false;
const qsCache = new Map();

export async function fetchChapters() {
  if (isChaptersLoaded) return PYQ_CHAPTERS;
  try {
    const res = await fetch('/api/pyqs/chapters');
    if (res.ok) {
      PYQ_CHAPTERS = await res.json();
      isChaptersLoaded = true;
    }
  } catch (err) {
    console.error('Failed to fetch chapters:', err);
  }
  return PYQ_CHAPTERS;
}

export async function fetchPyqsByChapter(chapterId) {
  if (qsCache.has(chapterId)) {
    return qsCache.get(chapterId);
  }
  try {
    const res = await fetch(`/api/pyqs/questions?chapterId=${encodeURIComponent(chapterId)}`);
    if (res.ok) {
      const data = await res.json();
      qsCache.set(chapterId, data);
      return data;
    }
  } catch (err) {
    console.error('Failed to fetch questions for chapter:', chapterId, err);
  }
  return [];
}

export async function fetchPyqsBySearch(title) {
  try {
    const res = await fetch(`/api/pyqs/search?q=${encodeURIComponent(title)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to search questions for:', title, err);
  }
  return [];
}

// For backward compatibility where synchronous get was expected, we return from cache if available.
// However, the UI should be updated to use the async functions above.
export function getPyqsByChapter(chapterTitle) {
  const targetId = chapterTitle ? chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') : '';
  if (qsCache.has(targetId)) {
    return qsCache.get(targetId);
  }
  // If not in cache, try fuzzy match on ALL cached questions as fallback
  let allQs = [];
  qsCache.forEach(qs => { allQs = allQs.concat(qs); });
  const words = targetId.split('_').filter(w => w.length > 3);
  return allQs.filter(q => words.some(w => q.chapterId.includes(w)));
}

export default PYQ_DATABASE;
