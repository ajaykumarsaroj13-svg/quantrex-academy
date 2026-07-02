/**
 * /api/v2/content.js
 * Content API for Mobile App - Serves syllabus, chapters, tests data
 * Does NOT affect existing website API routes
 */
import { connectToDatabase } from '../utils/db.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-app-version',
};

// Vercel Blob public base URL (same as website uses)
const BLOB_BASE = 'https://9fpwnwwgz32ufqdo.public.blob.vercel-storage.com/db';

async function fetchFromBlob(key) {
  try {
    const res = await fetch(`${BLOB_BASE}/${key}.json?t=${Date.now()}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.error(`Blob fetch error for ${key}:`, e);
  }
  return null;
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, exam, chapter, limit = 50, offset = 0 } = req.query;

  try {
    // ── GET SYLLABUS ──────────────────────────────────────────────────────────
    if (type === 'syllabus') {
      const data = await fetchFromBlob('syllabusData');
      if (!data) return res.status(404).json({ error: 'Syllabus not found' });

      // Filter by exam if specified
      if (exam) {
        const filtered = data.filter
          ? data.filter(course => course.id?.toLowerCase().includes(exam.toLowerCase()) ||
              course.name?.toLowerCase().includes(exam.toLowerCase()))
          : data;
        return res.status(200).json({ success: true, data: filtered, exam });
      }

      return res.status(200).json({ success: true, data, count: Array.isArray(data) ? data.length : 1 });
    }

    // ── GET TESTS LIST ────────────────────────────────────────────────────────
    if (type === 'tests') {
      const testsData = await fetchFromBlob('testsData');
      if (!testsData) return res.status(404).json({ error: 'Tests not found' });

      // Return structured tests
      let result = testsData;
      if (exam && testsData[exam]) result = testsData[exam];
      else if (exam && Array.isArray(testsData)) {
        result = testsData.filter(t =>
          (t.examType || '').toLowerCase().includes(exam.toLowerCase())
        );
      }

      return res.status(200).json({ success: true, data: result });
    }

    // ── GET BOOKS / STUDY MATERIAL ────────────────────────────────────────────
    if (type === 'books') {
      const data = await fetchFromBlob('booksData');
      return res.status(200).json({ success: true, data: data || [] });
    }

    // ── GET HOME DATA (banners, toppers, announcements) ───────────────────────
    if (type === 'home') {
      const [homeData, toppersData] = await Promise.all([
        fetchFromBlob('homeData'),
        fetchFromBlob('toppersData')
      ]);
      return res.status(200).json({
        success: true,
        data: {
          home: homeData || {},
          toppers: toppersData || []
        }
      });
    }

    // ── GET TEST QUESTIONS (by test ID) ───────────────────────────────────────
    if (type === 'test-questions' && req.query.testId) {
      const { testId } = req.query;
      // Try to fetch from public data folder
      try {
        const res2 = await fetch(`https://quantrexacademy.vercel.app/data/tests/${testId}.json`);
        if (res2.ok) {
          const data = await res2.json();
          return res.status(200).json({ success: true, data });
        }
      } catch (e) {}
      return res.status(404).json({ error: 'Test not found', testId });
    }

    // ── GET APP CONFIG (version, features, announcements) ─────────────────────
    if (type === 'app-config') {
      return res.status(200).json({
        success: true,
        data: {
          version: '1.0.0',
          features: {
            ai_doubt_solver: true,
            offline_mode: true,
            push_notifications: true,
            video_lectures: false,   // Coming soon
            live_tests: false         // Coming soon
          },
          announcement: null,
          maintenance: false,
          blob_base: BLOB_BASE,
          api_version: 'v2'
        }
      });
    }

    // ── GET CHAPTERS (from syllabus, filtered) ────────────────────────────────
    if (type === 'chapters') {
      const syllabusData = await fetchFromBlob('syllabusData');
      if (!syllabusData) return res.status(404).json({ error: 'Syllabus not found' });

      // Extract all chapters across all courses
      const chapters = [];
      const courses = Array.isArray(syllabusData) ? syllabusData : [syllabusData];
      for (const course of courses) {
        if (exam && !course.id?.toLowerCase().includes(exam.toLowerCase()) &&
            !course.name?.toLowerCase().includes(exam.toLowerCase())) continue;
        for (const subject of (course.subjects || [])) {
          for (const ch of (subject.chapters || [])) {
            chapters.push({
              ...ch,
              subject: subject.name,
              subjectId: subject.id,
              course: course.name,
              courseId: course.id
            });
          }
        }
      }

      const paginated = chapters.slice(Number(offset), Number(offset) + Number(limit));
      return res.status(200).json({
        success: true,
        data: paginated,
        total: chapters.length,
        limit: Number(limit),
        offset: Number(offset)
      });
    }

    return res.status(400).json({ error: 'Invalid type parameter. Use: syllabus | tests | books | home | chapters | test-questions | app-config' });

  } catch (err) {
    console.error('Content API v2 Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
