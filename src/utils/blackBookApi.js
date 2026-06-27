/**
 * blackBookApi.js
 * API utility for Black Book data and progress — talks to MongoDB via backend.
 */

const BASE = import.meta.env.VITE_BACKEND_URL || '';

/**
 * Fetch all questions for a chapter from MongoDB.
 * Falls back to local JSON if API fails.
 */
export async function fetchBlackBookQuestions(chapterId = 'function') {
  try {
    const res = await fetch(import.meta.env.BASE_URL + `data/blackbook/${chapterId}.json`);
    if (!res.ok) throw new Error('Failed to fetch blackbook questions: ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('[BlackBook] Local JSON fetch failed:', e.message);
    return [];
  }
}

/**
 * Fetch user progress for a chapter from MongoDB.
 * Returns object: { exerciseName: { questionIndex: { selectedIdx, isChecked, isCorrect, revealed } } }
 */
export async function fetchBlackBookProgress(chapterId, userId) {
  if (!userId) return {};
  try {
    const res = await fetch(`${BASE}/api/blackbook/${chapterId}/progress?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('API error: ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('[BlackBook] Progress fetch failed:', e.message);
    return {};
  }
}

/**
 * Save progress for a single question to MongoDB.
 */
export async function saveBlackBookProgress(chapterId, userId, exerciseName, questionIndex, state) {
  if (!userId) return;
  try {
    await fetch(`${BASE}/api/blackbook/${chapterId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        exerciseName,
        questionIndex,
        selectedIdx: state.selectedIdx ?? -1,
        isChecked: state.isChecked ?? false,
        isCorrect: state.isCorrect ?? null,
        revealed: state.revealed ?? false,
      }),
    });
  } catch (e) {
    console.warn('[BlackBook] Progress save failed:', e.message);
  }
}

/**
 * Reset progress for a question (or whole exercise/chapter) in MongoDB.
 */
export async function resetBlackBookProgress(chapterId, userId, exerciseName, questionIndex) {
  if (!userId) return;
  try {
    let url = `${BASE}/api/blackbook/${chapterId}/progress?userId=${encodeURIComponent(userId)}`;
    if (exerciseName) url += `&exerciseName=${encodeURIComponent(exerciseName)}`;
    if (questionIndex !== undefined) url += `&questionIndex=${questionIndex}`;
    await fetch(url, { method: 'DELETE' });
  } catch (e) {
    console.warn('[BlackBook] Progress reset failed:', e.message);
  }
}
