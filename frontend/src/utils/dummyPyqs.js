// JEE Main PYQ Database - Now fetched from the Backend MongoDB Database!

export let PYQ_DATABASE = [];
export let PYQ_CHAPTERS = { mathematics: [], physics: [], chemistry: [] };

let isChaptersLoaded = false;
const qsCache = new Map();

// Convert friendly exam name to DB slug format
function toExamSlug(exam) {
  if (!exam || exam === 'All') return null;
  if (exam === 'JEE Main') return 'jee-main';
  if (exam === 'JEE Advanced') return 'jee-advanced';
  if (exam === 'BITSAT') return 'bitsat';
  if (exam === 'NDA') return 'nda';
  return exam.toLowerCase().replace(/\s+/g, '-');
}

export async function fetchChapters(exam = 'JEE Main') {
  try {
    const slug = toExamSlug(exam);
    const url = slug
      ? `/api/pyqs/chapters?exam=${encodeURIComponent(slug)}`
      : `/api/pyqs/chapters`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch chapters:', err);
  }
  return { mathematics: [], physics: [], chemistry: [] };
}

export async function fetchPyqsByChapter(chapterId, exam = null) {
  const cacheKey = exam ? `${chapterId}_${exam}` : chapterId;
  if (qsCache.has(cacheKey)) {
    return qsCache.get(cacheKey);
  }
  try {
    const slug = toExamSlug(exam);
    const url = slug
      ? `/api/pyqs/questions?chapterId=${encodeURIComponent(chapterId)}&exam=${encodeURIComponent(slug)}`
      : `/api/pyqs/questions?chapterId=${encodeURIComponent(chapterId)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      qsCache.set(cacheKey, data);
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

export function getPyqsByChapter(chapterTitle) {
  const targetId = chapterTitle ? chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '') : '';
  if (qsCache.has(targetId)) {
    return qsCache.get(targetId);
  }
  return [];
}

export default PYQ_DATABASE;
