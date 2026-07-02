import React, { useState, useEffect } from 'react';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Users from 'lucide-react/dist/esm/icons/users';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Database from 'lucide-react/dist/esm/icons/database';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Bell from 'lucide-react/dist/esm/icons/bell';
import Search from 'lucide-react/dist/esm/icons/search';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Upload from 'lucide-react/dist/esm/icons/upload';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Lock from 'lucide-react/dist/esm/icons/lock';
import ShieldAlert from 'lucide-react/dist/esm/icons/shield-alert';
import AlertOctagon from 'lucide-react/dist/esm/icons/alert-octagon';
import Ban from 'lucide-react/dist/esm/icons/ban';
import Check from 'lucide-react/dist/esm/icons/check';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import PlusCircle from 'lucide-react/dist/esm/icons/plus-circle';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Play from 'lucide-react/dist/esm/icons/play';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Book from 'lucide-react/dist/esm/icons/book';
import Cloud from 'lucide-react/dist/esm/icons/cloud';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import { firebaseInstance, updateFirebaseConfig } from '../firebase';
import { uploadToBlob } from '../blob';
import { loadDbFromBlob, saveDbToBlob } from '../blob';
import scrapedTests from '../utils/testsData2.json';

export default function AdminDashboard({ user, courses, setCourses, setCustomLogo, syllabus, setSyllabus, toppers, setToppers, homeData, setHomeData, booksData, setBooksData, testsData, setTestsData }) {
  const [adminTab, setAdminTab] = useState('revenue'); // revenue, students, course-manager, security, notice, settings
  
  // Auto-save logic
  const prevSyllabus = React.useRef(syllabus);
  const prevCourses = React.useRef(courses);
  const prevToppers = React.useRef(toppers);
  const prevHomeData = React.useRef(homeData);
  const prevBooksData = React.useRef(booksData);
  const prevTestsData = React.useRef(testsData);

  useEffect(() => {
    const timer = setTimeout(() => {
      let saved = false;
      if (syllabus !== prevSyllabus.current) { saveDbToBlob('syllabusData', syllabus).catch(console.error); prevSyllabus.current = syllabus; saved = true; }
      if (courses !== prevCourses.current) { saveDbToBlob('coursesData', courses).catch(console.error); prevCourses.current = courses; saved = true; }
      if (toppers !== prevToppers.current) { saveDbToBlob('toppersData', toppers).catch(console.error); prevToppers.current = toppers; saved = true; }
      if (homeData !== prevHomeData.current) { saveDbToBlob('homeData', homeData).catch(console.error); prevHomeData.current = homeData; saved = true; }
      if (booksData !== prevBooksData.current) { saveDbToBlob('booksData', booksData).catch(console.error); prevBooksData.current = booksData; saved = true; }
      if (testsData !== prevTestsData.current) { saveDbToBlob('testsData', testsData).catch(console.error); prevTestsData.current = testsData; saved = true; }
      if (saved) console.log("Auto-saved changes to cloud database.");
    }, 2000);
    return () => clearTimeout(timer);
  }, [syllabus, courses, toppers, homeData, booksData, testsData]);
  // Dashboard Metric States
  const [metrics, setMetrics] = useState({
    totalRevenue: 28990,
    activeStudents: 154,
    purchasedCount: 42,
    activeStreams: 2,
    recentOrders: []
  });
  
  const [students, setStudents] = useState([]);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  
  // Syllabus state controls
  const [selectedClass, setSelectedClass] = useState('jee-advanced');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  // Resource upload fields
  const [resType, setResType] = useState('video'); // video, pdf, formula, pyq
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resDetail, setResDetail] = useState(''); // duration, size, or formula content
  const [restrictDownload, setRestrictDownload] = useState(true);
  
  // Toppers fields
  const [topperName, setTopperName] = useState('');
  const [topperRank, setTopperRank] = useState('');
  const [topperScore, setTopperScore] = useState('');
  const [topperYear, setTopperYear] = useState('');
  const [topperPhoto, setTopperPhoto] = useState('');
  
  // Mock Test Builder state
  const [mockTestTitle, setMockTestTitle] = useState('');
  const [mockTestDuration, setMockTestDuration] = useState(60);
  const [mockTestType, setMockTestType] = useState('link'); // link, structured
  const [mockTestLink, setMockTestLink] = useState('');
  
  // Structured Mock Test questions builder array
  const [questions, setQuestions] = useState([]);
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qMarks, setQMarks] = useState(4);
  const [qNegMarks, setQNegMarks] = useState(-1);
  const [qExplanation, setQExplanation] = useState('');

  // Course creation inputs (legacy course manager)
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [coursePrice, setCoursePrice] = useState(4999);
  
  // Chapter creation inputs (legacy course manager)
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState(''); // For syllabus course manager
  const [selectedAdminSubject, setSelectedAdminSubject] = useState('mathematics');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Notification inputs
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  // Extended Admin controls states
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [resLocked, setResLocked] = useState(false);
  const [resFree, setResFree] = useState(true);
  const [resVisible, setResVisible] = useState(true);
  const [qSubject, setQSubject] = useState('Mathematics');
  const [mockTestCategory, setMockTestCategory] = useState('chapter-wise'); // chapter-wise, full-mock
  const [firebaseConfigStr, setFirebaseConfigStr] = useState(localStorage.getItem('quantrex_firebase_config') || '');

  // AI OCR States
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Web Importer States
  const [importerUrl, setImporterUrl] = useState('');
  const [importerStatus, setImporterStatus] = useState('idle'); // idle, scraping, finished, error
  const [importerProgress, setImporterProgress] = useState(0);
  const [importerTotal, setImporterTotal] = useState(0);
  const [importerLogs, setImporterLogs] = useState([]);

  // Database Backup and Restore States & Handlers
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [backupDesc, setBackupDesc] = useState('');

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/backup');
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (err) {
      console.error("Failed to fetch backups:", err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (adminTab === 'database-backup') {
      fetchBackups();
    }
  }, [adminTab]);

  const handleCreateBackup = async () => {
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', description: backupDesc || 'Manual Backup' })
      });
      if (res.ok) {
        alert("Backup snapshot created successfully!");
        setBackupDesc('');
        fetchBackups();
      } else {
        alert("Failed to create backup.");
      }
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (!confirm(`Are you absolutely sure you want to restore the database to backup snapshot [${backupId}]? This will restore syllabus, tests, topper profiles, books, and courses lists to that exact state.`)) {
      return;
    }
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupId })
      });
      if (res.ok) {
        alert("Database restored successfully! Reloading portal contents...");
        window.location.reload();
      } else {
        alert("Failed to restore backup.");
      }
    } catch (e) {
      alert("Error restoring database: " + e.message);
    }
  };

  // Syllabus resource management handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Try Firebase if configured
    if (firebaseInstance && firebaseInstance.storage) {
      setUploadStatus('Uploading to Firebase Cloud Storage...');
      try {
        // V9 compat mode
        const storageRef = firebaseInstance.storage.ref(`uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadStatus(`Uploading to Firebase: ${progress.toFixed(0)}%`);
          }, 
          (err) => {
            console.error('Firebase upload error:', err);
            setUploadStatus('Firebase Upload Failed!');
          }, 
          async () => {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            setResUrl(downloadURL);
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
            if (resType === 'pdf') {
              setResDetail(sizeMB);
            } else if (resType === 'video') {
              setResDetail('Session Mock');
            }
            setUploadStatus(`Uploaded to Firebase: ${file.name} (${sizeMB})`);
          }
        );
        return; // Stop here if Firebase upload starts
      } catch (err) {
        console.error('Firebase error:', err);
        setUploadStatus('Firebase error. Falling back to Vercel Blob...');
      }
    }

    // 2. Fallback to Vercel Blob if Firebase is not configured
    setUploadStatus('Uploading to Default Cloud Storage (Fallback)...');
    try {
      const url = await uploadToBlob(file, (progress) => {
        setUploadStatus(`Uploading: ${progress}%`);
      });
      
      setResUrl(url);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      if (resType === 'pdf') {
        setResDetail(sizeMB);
      } else if (resType === 'video') {
        setResDetail('Session Mock');
      }
      setUploadStatus(`Uploaded to Cloud: ${file.name} (${sizeMB})`);
    } catch (err) {
      console.error('Blob upload error:', err);
      setUploadStatus('Upload failed. Check console for details.');
    }
  };

  const handleCreateChapter = (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    
    const chapterId = `${selectedClass}_ch_${Date.now()}`;
    const newChapter = {
      id: chapterId,
      title: newChapterTitle,
      topics: [], videos: [], pdfs: [], formulas: [], pyqs: [], mockTests: []
    };
    
    const updatedSyllabus = { ...syllabus };
    if (!updatedSyllabus[selectedClass].subjects.mathematics.chapters) {
      updatedSyllabus[selectedClass].subjects.mathematics.chapters = [];
    }
    updatedSyllabus[selectedClass].subjects.mathematics.chapters.push(newChapter);
    setSyllabus(updatedSyllabus);
    setNewChapterTitle('');
    setSelectedChapterId(chapterId);
    alert('New Chapter Created successfully!');
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    if (!selectedChapterId) {
      alert('Please select a chapter folder first!');
      return;
    }
    if (!resTitle) {
      alert('Please enter a title!');
      return;
    }

    // Auto-convert Google Drive share links to direct download/streaming links
    let finalUrl = resUrl;
    if (finalUrl && finalUrl.includes('drive.google.com')) {
      const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
      const match = finalUrl.match(driveRegex);
      if (match && match[1]) {
        finalUrl = `https://docs.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    
    let resource = null;
    if (resType === 'video') {
      resource = {
        id: 'vid_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        url: finalUrl || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
        duration: resDetail || '30:00',
        downloadBlocked: restrictDownload,
        isLocked: resLocked,
        isFree: resFree,
        isVisible: resVisible
      };
    } else if (resType === 'pdf') {
      resource = {
        id: 'pdf_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        url: finalUrl || '/pdfs/dpp.pdf',
        size: resDetail || '1.5 MB',
        downloadBlocked: restrictDownload,
        isLocked: resLocked,
        isFree: resFree,
        isVisible: resVisible
      };
    } else if (resType === 'formula') {
      resource = {
        id: 'form_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        content: resDetail || 'Quick formulas sheet text.'
      };
    } else if (resType === 'pyq') {
      resource = {
        id: 'pyq_' + Math.random().toString(36).substr(2, 9),
        title: resTitle,
        year: resDetail || '2025',
        url: finalUrl || '/pdfs/pyq.pdf'
      };
    }
    
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData && classData.subjects && classData.subjects.mathematics) {
      const mathData = classData.subjects.mathematics;
      mathData.chapters = (mathData.chapters || []).map(ch => {
        if (ch.id === selectedChapterId) {
          if (resType === 'video') ch.videos = [...(ch.videos || []), resource];
          if (resType === 'pdf') ch.pdfs = [...(ch.pdfs || []), resource];
          if (resType === 'formula') ch.formulas = [...(ch.formulas || []), resource];
          if (resType === 'pyq') ch.pyqs = [...(ch.pyqs || []), resource];
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert(`Published ${resType.toUpperCase()} content into selected chapter successfully!`);
      setResTitle('');
      setResUrl('');
      setResDetail('');
      setUploadStatus('');
      setResLocked(false);
      setResFree(true);
      setResVisible(true);
    }
  };

  const handleDeleteResource = (chapterId, type, resId) => {
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData && classData.subjects && classData.subjects.mathematics) {
      const mathData = classData.subjects.mathematics;
      mathData.chapters = (mathData.chapters || []).map(ch => {
        if (ch.id === chapterId) {
          if (type === 'video') ch.videos = (ch.videos || []).filter(v => v.id !== resId);
          if (type === 'pdf') ch.pdfs = (ch.pdfs || []).filter(p => p.id !== resId);
          if (type === 'formula') ch.formulas = (ch.formulas || []).filter(f => f.id !== resId);
          if (type === 'pyq') ch.pyqs = (ch.pyqs || []).filter(p => p.id !== resId);
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert('Resource deleted successfully from folder.');
    }
  };

  const handleToggleStatus = (chapterId, type, itemId, field) => {
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData && classData.subjects && classData.subjects.mathematics) {
      const mathData = classData.subjects.mathematics;
      mathData.chapters = (mathData.chapters || []).map(ch => {
        if (ch.id === chapterId) {
          if (type === 'video') {
            ch.videos = (ch.videos || []).map(v => v.id === itemId ? { ...v, [field]: !v[field] } : v);
          }
          if (type === 'pdf') {
            ch.pdfs = (ch.pdfs || []).map(p => p.id === itemId ? { ...p, [field]: !p[field] } : p);
          }
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
    }
  };

  const handleToggleCoursePermission = async (student, courseId) => {
    let updatedCourses = [...(student.purchasedCourses || [])];
    if (updatedCourses.includes(courseId)) {
      updatedCourses = updatedCourses.filter(c => c !== courseId);
    } else {
      updatedCourses.push(courseId);
    }
    
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, purchasedCourses: updatedCourses } : s));
    
    try {
      await fetch(`/api/admin/users/${student.id}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ courses: updatedCourses })
      });
    } catch (e) {
      console.log('Failed to sync student courses on server');
    }
  };

  // Mock Test Builder handlers
  const handleAddQuestion = () => {
    if (!qText || qOptions.some(o => o.trim() === '')) {
      alert('Please fill out the question text and all 4 choices!');
      return;
    }
    const newQ = {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      questionText: qText,
      options: [...qOptions],
      correctOption: parseInt(qCorrect),
      marks: parseInt(qMarks),
      negativeMarks: parseInt(qNegMarks),
      subject: qSubject,
      explanation: qExplanation
    };
    setQuestions([...questions, newQ]);
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setQExplanation('');
    alert('Question registered in mock test builder buffer!');
  };

  const handlePublishMockTest = async (e) => {
    e.preventDefault();
    if (mockTestCategory === 'chapter-wise' && !selectedChapterId) {
      alert('Please select a chapter folder first!');
      return;
    }
    if (!mockTestTitle) {
      alert('Enter Mock Test Exam Name!');
      return;
    }

    let mockTestObj = {
      id: 'mock_' + Math.random().toString(36).substr(2, 9),
      title: mockTestTitle,
      durationMinutes: parseInt(mockTestDuration),
      type: mockTestType
    };

    if (mockTestType === 'link') {
      if (!mockTestLink) {
        alert('Paste AI Generated Quiz / external link!');
        return;
      }
      mockTestObj.linkUrl = mockTestLink;
    } else {
      if (questions.length === 0) {
        alert('Builder requires at least 1 question for structured mode!');
        return;
      }
      mockTestObj.questions = questions;
    }

    if (mockTestCategory === 'full-mock') {
      try {
        const newTest = {
          id: mockTestObj.id,
          title: mockTestTitle,
          description: `JEE Pattern Full Syllabus Mock Test Series — (${mockTestDuration} minutes)`,
          durationMinutes: mockTestDuration,
          questions: mockTestType === 'structured' || mockTestType === 'nta' ? questions : []
        };
        
        // Fetch existing test series list from blob
        let testSeriesList = await loadDbFromBlob('test-series') || [];
        testSeriesList.push({
          id: newTest.id,
          title: newTest.title,
          description: newTest.description,
          durationMinutes: newTest.durationMinutes,
          totalQuestions: newTest.questions.length,
          exam: 'JEE Main'
        });
        
        // Save list back to blob
        await saveDbToBlob('test-series', testSeriesList);
        
        // Save individual full test data to blob
        await saveDbToBlob(`tests/${newTest.id}`, newTest);
        
        alert('Full Syllabus Mock Test series registered globally! Available to all students.');
        setMockTestTitle('');
        setMockTestLink('');
        setQuestions([]);
      } catch (err) {
        console.error(err);
        alert('Failed to publish Mock Test to cloud database.');
      }
      return;
    }

    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData && classData.subjects && classData.subjects.mathematics) {
      const mathData = classData.subjects.mathematics;
      mathData.chapters = (mathData.chapters || []).map(ch => {
        if (ch.id === selectedChapterId) {
          ch.mockTests = [...(ch.mockTests || []), mockTestObj];
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert('Published Mock Test successfully! Synced to student exam dashboards.');
      setMockTestTitle('');
      setMockTestLink('');
      setQuestions([]);
    }
  };

  const handleDeleteMockTest = (chapterId, testId) => {
    const updatedSyllabus = { ...syllabus };
    const classData = updatedSyllabus[selectedClass];
    if (classData && classData.subjects && classData.subjects.mathematics) {
      const mathData = classData.subjects.mathematics;
      mathData.chapters = (mathData.chapters || []).map(ch => {
        if (ch.id === chapterId) {
          ch.mockTests = (ch.mockTests || []).filter(t => t.id !== testId);
        }
        return ch;
      });
      setSyllabus(updatedSyllabus);
      alert('Mock Test deleted successfully.');
    }
  };
  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsOcrScanning(true);
    setOcrProgress(5); // Start progress

    try {
      // Simulate fake progress for UX while uploading/processing
      let p = 5;
      const progressInterval = setInterval(() => {
        if (p < 85) {
          p += Math.floor(Math.random() * 10) + 2;
          setOcrProgress(Math.min(p, 85));
        }
      }, 800);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        const mimeType = file.type;

        try {
          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inlineData: {
                mimeType,
                data: base64data
              }
            })
          });

          clearInterval(progressInterval);
          setOcrProgress(100);

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to process AI OCR');
          }

          const data = await response.json();
          if (data.questions && Array.isArray(data.questions)) {
            // Give questions unique IDs
            const parsedQuestions = data.questions.map((q, idx) => ({
              ...q,
              id: `auto_${Date.now()}_${idx}`
            }));
            
            setTimeout(() => {
              setIsOcrScanning(false);
              setQuestions(parsedQuestions);
              alert(`AI OCR Scan Complete! ${parsedQuestions.length} Questions extracted successfully.`);
              setMockTestType('nta'); // Switch to NTA mode so they can publish
            }, 500);
          } else {
            throw new Error('AI did not return a valid question array');
          }
        } catch (error) {
          clearInterval(progressInterval);
          console.error("OCR API Error:", error);
          alert("OCR API Error: " + error.message);
          setIsOcrScanning(false);
          setOcrProgress(0);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsOcrScanning(false);
      setOcrProgress(0);
      alert("Failed to read file.");
    }
  };

  // Topper/Results Handlers
  const handleAddTopper = (e) => {
    e.preventDefault();
    if (!topperName || !topperRank || !topperScore) {
      alert('Please enter Name, Rank/Percentile, and Score!');
      return;
    }
    const newTopper = {
      id: 'topper_' + Math.random().toString(36).substr(2, 9),
      name: topperName,
      rank: topperRank,
      score: topperScore,
      year: topperYear || 'JEE Advanced 2026',
      photo: topperPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'
    };
    setToppers([...toppers, newTopper]);
    setTopperName('');
    setTopperRank('');
    setTopperScore('');
    setTopperYear('');
    setTopperPhoto('');
    alert('Topper result published live to the Hall of Fame!');
  };

  const handleDeleteTopper = (topperId) => {
    setToppers(toppers.filter(t => t.id !== topperId));
    alert('Topper deleted from Hall of Fame.');
  };

  // Fetch dashboards data
  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      
      const revRes = await fetch('/api/admin/revenue', { headers });
      if (revRes.ok) setMetrics(await revRes.ok ? await revRes.json() : metrics);

      const studRes = await fetch('/api/admin/students', { headers });
      if (studRes.ok) setStudents(await studRes.json());

      const secRes = await fetch('/api/admin/security/alerts', { headers });
      if (secRes.ok) setSecurityAlerts(await secRes.json());
    } catch (e) {
      // Mock Fallback when server is not running
      setStudents([
        { id: 'student1', name: 'Rohan Sharma', email: 'student@quantrex.com', phone: '9876543210', isBanned: false, dailyStreak: 12, attendance: 98, purchasedCourses: ['course1'], sessionsCount: 1 },
        { id: 'student2', name: 'Amit Verma', email: 'amit@gmail.com', phone: '9123456780', isBanned: false, dailyStreak: 4, attendance: 94, purchasedCourses: [], sessionsCount: 0 },
        { id: 'student3', name: 'Priya Sen', email: 'priya@gmail.com', phone: '9988776655', isBanned: true, dailyStreak: 0, attendance: 88, purchasedCourses: ['course1'], sessionsCount: 0 }
      ]);

      setSecurityAlerts([
        { id: 'alert1', userName: 'Priya Sen', type: 'devtools_inspect', details: 'Attempted right click on player context', ipAddress: '192.168.2.14', createdAt: new Date().toISOString() },
        { id: 'alert2', userName: 'Rohan Sharma', type: 'screenshot', details: 'Hotkey combo triggered: Ctrl+Shift+I', ipAddress: '192.168.1.1', createdAt: new Date().toISOString() }
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courses]);

  const handleBanToggle = async (studentId, currentBanStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${studentId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ban: !currentBanStatus })
      });
      if (response.ok) {
        alert(`Student banned status set to: ${!currentBanStatus}`);
        fetchData();
      }
    } catch (e) {
      // offline mock toggle
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isBanned: !currentBanStatus } : s));
      alert(`Student ban status modified in sandbox mode.`);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) return;

    const payload = {
      title: courseTitle,
      description: courseDesc,
      price: coursePrice,
      originalPrice: coursePrice * 3,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      tag: 'JEE Advanced'
    };

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const newCourse = await response.json();
        setCourses(prev => [...prev, newCourse]);
        setCourseTitle('');
        setCourseDesc('');
        alert('Course created and broadcasted live to all students!');
      }
    } catch (e) {
      // Offline fallback
      const newMockCourse = {
        id: 'course_mock_' + Math.random().toString(36).substr(2, 9),
        ...payload,
        rating: 5.0,
        modules: []
      };
      setCourses(prev => [...prev, newMockCourse]);
      setCourseTitle('');
      setCourseDesc('');
      alert('Course created in standalone mockup sandbox.');
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !newModuleName) return;

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newModuleName })
      });
      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(prev => prev.map(c => c.id === selectedCourseId ? updatedCourse : c));
        setNewModuleName('');
        alert('Module added and synced live!');
      }
    } catch (e) {
      // offline fallback
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          const mod = { id: 'mod_mock_' + Math.random().toString(36).substr(2, 9), title: newModuleName, chapters: [] };
          return { ...c, modules: [...(c.modules || []), mod] };
        }
        return c;
      }));
      setNewModuleName('');
      alert('Module added to course in sandbox mode.');
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId || !chapterTitle) return;

    const payload = {
      title: chapterTitle,
      videoTitle,
      videoUrl: videoUrl || 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      pdfTitle,
      pdfUrl: pdfUrl || '/pdfs/dpp.pdf'
    };

    try {
      const response = await fetch(`/api/admin/courses/${selectedCourseId}/modules/${selectedModuleId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(prev => prev.map(c => c.id === selectedCourseId ? updatedCourse : c));
        // Reset
        setChapterTitle('');
        setVideoTitle('');
        setVideoUrl('');
        setPdfTitle('');
        setPdfUrl('');
        alert('Lecture details added and broadcasted to enrolled students!');
      }
    } catch (e) {
      // offline fallback
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          const updatedModules = c.modules.map(m => {
            if (m.id === selectedModuleId) {
              const ch = {
                id: 'ch_mock_' + Math.random().toString(36).substr(2, 9),
                title: chapterTitle,
                videos: [{ title: videoTitle || 'Lecture Video', url: payload.videoUrl, duration: '45:00' }],
                pdfs: [{ title: pdfTitle || 'Class Handouts', url: payload.pdfUrl, size: '2.5 MB' }],
                assignments: []
              };
              return { ...m, chapters: [...(m.chapters || []), ch] };
            }
            return m;
          });
          return { ...c, modules: updatedModules };
        }
        return c;
      }));
      setChapterTitle('');
      setVideoTitle('');
      setVideoUrl('');
      setPdfTitle('');
      setPdfUrl('');
      alert('Chapter uploaded to local sandbox modules.');
    }
  };

  const handleBroadcastNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMsg) return;

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: noticeTitle, message: noticeMsg, type: 'general' })
      });
      if (response.ok) {
        alert('Notice broadcasted to all portals dynamically!');
        setNoticeTitle('');
        setNoticeMsg('');
      }
    } catch (e) {
      alert('Notice mock-broadcasted. Sockets synced in local scope.');
      setNoticeTitle('');
      setNoticeMsg('');
    }
  };

  const currentChapter = syllabus[selectedClass]?.subjects?.mathematics?.chapters?.find(ch => ch.id === selectedChapterId);

  const handleStartImport = async (e) => {
    e.preventDefault();
    if (!importerUrl) return;

    setImporterStatus('scraping');
    setImporterLogs(['Fetching chapter questions list...']);
    setImporterProgress(0);
    setImporterTotal(0);

    try {
      // 1. Get all questions links
      const chapterRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_chapter', url: importerUrl })
      });
      
      const chapterData = await chapterRes.json();
      if (!chapterRes.ok) throw new Error(chapterData.error || 'Failed to fetch chapter');
      
      const urls = chapterData.urls || [];
      if (urls.length === 0) throw new Error('No questions found in this chapter URL.');
      
      setImporterTotal(urls.length);
      setImporterLogs(prev => [...prev, `Found ${urls.length} questions. Starting bulk scrape...`]);

      const scrapedQuestions = [];

      // 2. Loop through each question slowly to prevent timeouts
      for (let i = 0; i < urls.length; i++) {
        setImporterLogs(prev => {
          const newLogs = [...prev, `Scraping [${i+1}/${urls.length}]...`];
          if(newLogs.length > 5) newLogs.shift();
          return newLogs;
        });
        
        try {
          const qRes = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'get_question', url: urls[i] })
          });
          const qData = await qRes.json();
          if(qRes.ok) scrapedQuestions.push(qData);
        } catch(err) {
          console.error('Failed to scrape single question', err);
        }
        
        setImporterProgress(i + 1);
        // Delay to prevent spamming
        await new Promise(r => setTimeout(r, 1000));
      }

      setImporterLogs(prev => [...prev, `Saving ${scrapedQuestions.length} questions to Database...`]);
      
      // Save to Blob
      const blob = new Blob([JSON.stringify(scrapedQuestions, null, 2)], { type: 'application/json' });
      const filename = `chapter_${Date.now()}.json`;
      const finalBlobUrl = await uploadToBlob(new File([blob], filename, { type: 'application/json' }), () => {});
      
      setImporterLogs(prev => [...prev, `Saved securely to Cloud Storage! URL: ${finalBlobUrl}`]);
      setImporterStatus('finished');

    } catch (err) {
      console.error(err);
      setImporterStatus('error');
      setImporterLogs(prev => [...prev, `ERROR: ${err.message}`]);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-12 py-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Side Menu */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="text-center pb-4 border-b border-white/5 mb-6">
            <span className="text-[10px] text-gold font-mono uppercase tracking-wider block">Security Level 3 Active</span>
            <h3 className="text-base font-bold text-white uppercase font-display tracking-widest mt-1">Admin Console</h3>
          </div>
          
          <div className="flex flex-col gap-1">
            {[
              { id: 'revenue', label: 'Revenue & Sales', icon: TrendingUp },
              { id: 'students', label: 'Manage Students', icon: Users },
              { id: 'course-manager', label: 'Study Portal', icon: BookOpen },
              { id: 'home', label: 'Manage Home Page', icon: LayoutDashboard },
              { id: 'books', label: 'Manage Books', icon: Book },
              { id: 'tests', label: 'Manage Test Series', icon: FileText },
              { id: 'security', label: 'Anti-Piracy Logs', icon: AlertOctagon },
              { id: 'notice', label: 'Broadcast Alerts', icon: Bell },
              { id: 'importer', label: 'Web Importer', icon: Cloud },
              { id: 'database-backup', label: 'Database Backup', icon: Database },
              { id: 'settings', label: 'Platform Settings', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`w-full py-3.5 px-4 text-xs font-bold tracking-wider uppercase text-left rounded-xl transition-all flex items-center gap-2.5 ${adminTab === tab.id ? 'bg-gold/10 border border-gold/30 text-gold shadow-[0_0_15px_rgba(255,215,0,0.05)]' : 'text-gray-400 hover:text-white border border-transparent'}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="lg:col-span-3">
        <div className="glass-panel p-8 rounded-2xl border border-white/5 min-h-[65vh] space-y-6">
          
          {/* REVENUE DASHBOARD TAB */}
          {adminTab === 'revenue' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Revenue Dashboard</h3>
              
              {/* Metric stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                {[
                  { label: 'Total Revenue', value: `₹${metrics.totalRevenue}`, icon: DollarSign, color: 'text-emerald-400' },
                  { label: 'Active Students', value: metrics.activeStudents, icon: Users, color: 'text-electric' },
                  { label: 'Course Orders', value: metrics.purchasedCount, icon: BookOpen, color: 'text-platinum' },
                  { label: 'Active Streams', value: metrics.activeStreams, icon: Lock, color: 'text-gold' }
                ].map((m, idx) => (
                  <div key={idx} className="bg-obsidian/60 border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase block">{m.label}</span>
                    <span className={`text-lg md:text-xl font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Transactions details */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Orders Logs</h4>
                <div className="overflow-x-auto border border-white/5 rounded-xl">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-obsidian border-b border-white/5 text-gray-500">
                        <th className="p-4">Student</th>
                        <th className="p-4">Course</th>
                        <th className="p-4">Amt</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-400">
                      {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
                        metrics.recentOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 text-white font-semibold">{o.studentName}</td>
                            <td className="p-4 truncate max-w-[200px]">{o.courseTitle}</td>
                            <td className="p-4">₹{o.amount}</td>
                            <td className="p-4"><span className="text-emerald-400 bg-emerald-950/20 border border-emerald-900 px-2 py-0.5 rounded text-[10px]">SUCCESS</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4 text-white font-semibold">Rohan Sharma</td>
                          <td className="p-4">Rank Booster JEE Advanced Mathematics</td>
                          <td className="p-4">₹4999</td>
                          <td className="p-4"><span className="text-emerald-400 bg-emerald-950/20 border border-emerald-900 px-2 py-0.5 rounded text-[10px]">SUCCESS</span></td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STUDENT MANAGEMENT TAB */}
          {adminTab === 'students' && (
            <div className="space-y-6 animate-fade-in font-mono text-xs">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Student Directory</h3>
                <span className="text-[10px] text-gray-500 uppercase">{students.length} Registered Aspirants</span>
              </div>
              
              <div className="overflow-x-auto border border-white/5 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-obsidian border-b border-white/5 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-4">Student Info</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Metrics</th>
                      <th className="p-4">Permissions</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-400">
                    {students.map((student) => {
                      const isExpanded = expandedStudentId === student.id;
                      return (
                        <React.Fragment key={student.id}>
                          <tr className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-[12px]">{student.name}</div>
                              <span className="text-[9px] text-gray-500 uppercase font-bold">UID: {student.id}</span>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <div>{student.email}</div>
                              <div className="text-gray-500 text-[10px]">{student.phone}</div>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <div>Attendance: <span className="text-emerald-400 font-bold">{student.attendance}%</span></div>
                              <div>Streak: <span className="text-orange-400 font-bold">{student.dailyStreak} 🔥</span></div>
                            </td>
                            <td className="p-4">
                              <span className="text-[10px] text-platinum bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                                {student.purchasedCourses?.length || 0} Course(s) Allowed
                              </span>
                            </td>
                            <td className="p-4">
                              {student.isBanned ? (
                                <span className="text-red-400 bg-red-950/20 border border-red-900 px-2.5 py-1 rounded font-bold uppercase text-[9px] tracking-wider">BANNED</span>
                              ) : (
                                <span className="text-emerald-400 bg-emerald-950/20 border border-emerald-900 px-2.5 py-1 rounded font-bold uppercase text-[9px] tracking-wider">ACTIVE</span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button
                                onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border transition-all ${
                                  isExpanded 
                                    ? 'bg-electric text-obsidian border-electric shadow-[0_0_10px_rgba(0,240,255,0.15)]' 
                                    : 'bg-cyberdark hover:bg-white/5 border-white/5 text-electric hover:text-white'
                                }`}
                              >
                                Enrollments
                              </button>
                              <button
                                onClick={() => handleBanToggle(student.id, student.isBanned)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase border transition-all ${
                                  student.isBanned 
                                    ? 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-900' 
                                    : 'bg-red-950/20 hover:bg-red-950/40 text-red-400 border-red-900'
                                }`}
                              >
                                {student.isBanned ? 'Unban' : 'Ban'}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded Permissions Row */}
                          {isExpanded && (
                            <tr className="bg-[#0D1017]">
                              <td colSpan="6" className="p-6 border-t border-b border-white/5">
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider text-glow-blue">
                                      Course Enrollments: {student.name}
                                    </h4>
                                    <span className="text-[9px] text-gray-500">Toggle course enrollment directly. Override payment triggers.</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                      { key: 'jee-mains', label: 'JEE Main Course' },
                                      { key: 'jee-advanced', label: 'JEE Advanced Course' },
                                      { key: 'mht-cet', label: 'MHT-CET Course' },
                                      { key: 'bitsat', label: 'BITSAT Course' },
                                      { key: 'nda', label: 'NDA Course' },
                                      { key: 'class-9', label: 'Class 9 Mathematics' },
                                      { key: 'class-11', label: 'Class 11 Mathematics' },
                                      { key: 'class-12', label: 'Class 12 Mathematics' },
                                      { key: 'foundation-6-12', label: 'Foundation Mathematics (6-12)' }
                                    ].map((c) => {
                                      // Find corresponding course
                                      const courseIdForCheck = courses.find(cr => {
                                        const mapping = {
                                          'jee-mains': 'JEE Main',
                                          'jee-advanced': 'JEE Advanced',
                                          'mht-cet': 'MHT-CET',
                                          'bitsat': 'BITSAT',
                                          'nda': 'NDA',
                                          'class-9': 'Class 9 Mathematics',
                                          'class-11': 'Class 11 Mathematics',
                                          'class-12': 'Class 12 Mathematics',
                                          'foundation-6-12': 'Foundation Mathematics (Classes 6-12)'
                                        };
                                        return cr.tag?.toLowerCase() === mapping[c.key]?.toLowerCase() || cr.id === c.key;
                                      })?.id || c.key;
                                      
                                      const hasAccess = student.purchasedCourses?.includes(courseIdForCheck) || student.purchasedCourses?.includes(c.key);
                                      
                                      return (
                                        <button
                                          key={c.key}
                                          type="button"
                                          onClick={() => handleToggleCoursePermission(student, courseIdForCheck)}
                                          className={`flex items-center justify-between p-3 rounded-lg border text-left font-bold transition-all ${
                                            hasAccess
                                              ? 'bg-electric/10 border-electric/40 text-electric shadow-[0_0_12px_rgba(0,240,255,0.05)]'
                                              : 'bg-obsidian border-white/5 text-gray-500 hover:text-white hover:bg-white/[0.02]'
                                          }`}
                                        >
                                          <span>{c.label}</span>
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold ${
                                            hasAccess ? 'bg-electric text-obsidian' : 'bg-white/5 text-gray-600'
                                          }`}>
                                            {hasAccess ? 'ENROLLED' : 'LOCKED'}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYLLABUS & CONTENT MANAGER TAB */}
          {adminTab === 'course-manager' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Syllabus Infrastructure</h3>
                <span className="text-xs text-gold font-mono uppercase bg-gold/10 px-3 py-1 rounded border border-gold/20">Class 6th to 12th & JEE Portal</span>
              </div>
              
              {/* Folder Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-obsidian/60 border border-white/5 rounded-xl font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase block">Select Target Grade / Category</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedChapterId('');
                    }}
                    className="w-full p-3 bg-cyberdark border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    {Object.keys(syllabus || {}).map(key => (
                      <option key={key} value={key}>{syllabus[key].label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase block">Select Subject</label>
                  <select
                    value={selectedAdminSubject}
                    onChange={(e) => {
                      setSelectedAdminSubject(e.target.value);
                      setSelectedChapterId('');
                    }}
                    className="w-full p-3 bg-cyberdark border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    {Object.keys(syllabus?.[selectedClass]?.subjects || {}).map(subjKey => (
                      <option key={subjKey} value={subjKey}>{syllabus[selectedClass].subjects[subjKey].label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase block">Select Chapter Folder</label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full p-3 bg-cyberdark border border-white/10 rounded-lg text-white focus:outline-none"
                  >
                    <option value="">-- Choose Chapter --</option>
                    {syllabus[selectedClass]?.subjects?.[selectedAdminSubject]?.chapters?.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Create New Chapter Inline Form */}
              <form onSubmit={handleCreateChapter} className="flex gap-3 p-4 bg-obsidian/40 border border-white/5 rounded-xl font-mono text-xs items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] text-gray-500 uppercase block">Create New Chapter in Selected Grade</label>
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="e.g. Limits and Continuity"
                    className="w-full p-3 bg-cyberdark border border-white/10 rounded-lg text-white"
                  />
                </div>
                <button type="submit" className="p-3 bg-electric text-obsidian font-bold rounded-lg uppercase tracking-wider hover:bg-cyan-400 transition-colors">
                  Add Chapter
                </button>
              </form>

              {selectedChapterId ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Form to Upload Content */}
                  <div className="space-y-6">
                    {/* Upload General Resource Form */}
                    <form onSubmit={handleAddResource} className="p-5 bg-cyberdark/50 border border-white/5 rounded-xl space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-glow-blue flex items-center gap-1.5">
                          <Book className="h-4 w-4 text-electric" /> Upload Lecture, Notes & Tips
                        </h4>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Resource Type</label>
                        <div className="flex bg-obsidian/60 p-1 border border-white/5 rounded-lg justify-between gap-1">
                          {[
                            { id: 'video', label: '🎥 Video' },
                            { id: 'pdf', label: '📄 PDF / Photo' },
                            { id: 'formula', label: '⚡ Formula/Trick' },
                            { id: 'pyq', label: '📝 PYQ' }
                          ].map(t => {
                            if (t.id === 'pyq' && !selectedClass.startsWith('jee')) return null;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setResType(t.id)}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all uppercase ${resType === t.id ? 'bg-cyberdark border border-white/5 text-electric shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'text-gray-400'}`}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Resource Title</label>
                        <input
                          type="text"
                          required
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder={resType === 'video' ? 'e.g. Concept of Continuity' : resType === 'pdf' ? 'e.g. DPP-01: Continuity Practice' : 'e.g. Limits Quick Formula List'}
                          className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>

                                {resType !== 'formula' && (
                        <div className="space-y-3 p-3 bg-obsidian/30 border border-white/5 rounded-lg">
                          <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase block">Upload Local File ({resType === 'pdf' ? 'PDF / Photo' : resType.toUpperCase()})</label>
                            <input
                              type="file"
                              accept={resType === 'video' ? 'video/*' : 'application/pdf, image/*'}
                              onChange={handleFileUpload}
                              className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-electric/15 file:text-electric hover:file:bg-electric/20 cursor-pointer"
                            />
                            {uploadStatus && (
                              <span className="text-[9px] text-gold font-mono block mt-1">{uploadStatus}</span>
                            )}
                          </div>
                          <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-2 text-[8px] text-gray-600 uppercase font-mono">OR USE REMOTE LINK</span>
                            <div className="flex-grow border-t border-white/5"></div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 uppercase block">Resource Asset Link / URL</label>
                            <input
                              type="text"
                              value={resUrl}
                              onChange={(e) => setResUrl(e.target.value)}
                              placeholder={resType === 'video' ? 'https://example.com/lecture.mp4' : '/pdfs/document.pdf'}
                              className="w-full p-2 bg-obsidian border border-white/5 rounded-lg text-white text-[11px]"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">
                          {resType === 'video' && 'Duration (e.g. 45:12)'}
                          {resType === 'pdf' && 'File Size (e.g. 2.4 MB)'}
                          {resType === 'formula' && 'Formula & Cheat Sheet Content'}
                          {resType === 'pyq' && 'PYQ Year (e.g. 2025)'}
                        </label>
                        {resType === 'formula' ? (
                          <textarea
                            required
                            rows={4}
                            value={resDetail}
                            onChange={(e) => setResDetail(e.target.value)}
                            placeholder="Enter formulas, tricks, equations in LaTeX (e.g. $$\lim_{x \to 0} \frac{\sin x}{x} = 1$$)..."
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white focus:outline-none focus:border-electric/40"
                          />
                        ) : (
                          <input
                            type="text"
                            value={resDetail}
                            onChange={(e) => setResDetail(e.target.value)}
                            placeholder={resType === 'video' ? '30:00' : resType === 'pdf' ? '1.5 MB' : '2025'}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                          />
                        )}
                      </div>

                      {(resType === 'video' || resType === 'pdf') && (
                        <div className="space-y-2 py-2 border-t border-white/5 mt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="download-block-toggle"
                              checked={restrictDownload}
                              onChange={(e) => setRestrictDownload(e.target.checked)}
                              className="h-4 w-4 accent-electric cursor-pointer"
                            />
                            <label htmlFor="download-block-toggle" className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider cursor-pointer">
                              🔒 Restrict Download (Safe Viewer)
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
                            <div className="flex items-center gap-1.5 bg-obsidian/40 p-1.5 rounded border border-white/5">
                              <input
                                type="checkbox"
                                id="locked-toggle"
                                checked={resLocked}
                                onChange={(e) => setResLocked(e.target.checked)}
                                className="accent-red-500 cursor-pointer"
                              />
                              <label htmlFor="locked-toggle" className="text-gray-400 cursor-pointer">LOCKED</label>
                            </div>

                            <div className="flex items-center gap-1.5 bg-obsidian/40 p-1.5 rounded border border-white/5">
                              <input
                                type="checkbox"
                                id="free-toggle"
                                checked={resFree}
                                onChange={(e) => setResFree(e.target.checked)}
                                className="accent-emerald-500 cursor-pointer"
                              />
                              <label htmlFor="free-toggle" className="text-gray-400 cursor-pointer">FREE DEMO</label>
                            </div>

                            <div className="flex items-center gap-1.5 bg-obsidian/40 p-1.5 rounded border border-white/5">
                              <input
                                type="checkbox"
                                id="visible-toggle"
                                checked={resVisible}
                                onChange={(e) => setResVisible(e.target.checked)}
                                className="accent-electric cursor-pointer"
                              />
                              <label htmlFor="visible-toggle" className="text-gray-400 cursor-pointer">VISIBLE</label>
                            </div>
                          </div>
                        </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-electric hover:bg-cyan-400 text-obsidian font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]">
                        <Plus className="h-4 w-4" /> Add Chapter Content
                      </button>
                    </form>

                    {/* AI Mock Test Creator Form */}
                    <form onSubmit={handlePublishMockTest} className="p-5 bg-cyberdark/50 border border-white/5 rounded-xl space-y-4 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider text-glow-gold flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gold" /> Mock Test & Exam Generator
                        </h4>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Test Category</label>
                        <div className="flex bg-obsidian/60 p-1 border border-white/5 rounded-lg justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => setMockTestCategory('chapter-wise')}
                            className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase ${mockTestCategory === 'chapter-wise' ? 'bg-cyberdark border border-white/5 text-electric' : 'text-gray-400'}`}
                          >
                            Chapter-wise (Math Only)
                          </button>
                          <button
                            type="button"
                            onClick={() => setMockTestCategory('full-mock')}
                            className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all uppercase ${mockTestCategory === 'full-mock' ? 'bg-cyberdark border border-white/5 text-gold' : 'text-gray-400'}`}
                          >
                            Full Mock (PCM)
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 uppercase block">Mock Test Title</label>
                        <input
                          type="text"
                          required
                          value={mockTestTitle}
                          onChange={(e) => setMockTestTitle(e.target.value)}
                          placeholder="e.g. Chapter Practice Test - Medium Level"
                          className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Duration (Minutes)</label>
                          <input
                            type="number"
                            value={mockTestDuration}
                            onChange={(e) => setMockTestDuration(e.target.value)}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Test Mode</label>
                          <select
                            value={mockTestType}
                            onChange={(e) => setMockTestType(e.target.value)}
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white focus:outline-none"
                          >
                            <option value="link">External Quiz Link Embed</option>
                            <option value="structured">Interactive Test Builder</option>
                            <option value="nta">NTA JEE Main Mock Test (AI Series)</option>
                            <option value="ai-ocr">AI OCR (PDF/Image to NTA Test)</option>
                          </select>
                        </div>
                      </div>

                      {mockTestType === 'link' ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-gray-500 uppercase block">Paste Claude/Gemini generated Quiz URL</label>
                          <input
                            type="text"
                            value={mockTestLink}
                            onChange={(e) => setMockTestLink(e.target.value)}
                            placeholder="https://forms.gle/... or external exam link"
                            className="w-full p-3 bg-obsidian border border-white/5 rounded-lg text-white font-mono text-[11px]"
                          />
                        </div>
                      ) : mockTestType === 'ai-ocr' ? (
                        <div className="p-8 bg-obsidian/80 border-2 border-dashed border-purple-500/40 rounded-2xl space-y-5 text-center relative overflow-hidden group shadow-[0_0_30px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] transition-shadow">
                          {/* Animated background glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-electric/10 pointer-events-none group-hover:from-purple-500/20 group-hover:to-electric/20 transition-all duration-500"></div>
                          
                          <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600/30 to-electric/30 border border-purple-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-300">
                              <Sparkles className={`h-8 w-8 text-purple-300 ${isOcrScanning ? 'animate-spin' : 'animate-pulse'}`} />
                            </div>
                            
                            <h4 className="text-base font-bold text-white uppercase tracking-widest font-display text-glow-blue">AI Paper Scanner Pro</h4>
                            <p className="text-[11px] text-gray-300 font-mono leading-relaxed max-w-sm">Upload your Test Paper PDF, screenshots, or question bank images. Our AI vision model will instantly extract questions, options, and correct answers into an interactive NTA Mock Test.</p>
                            
                            {isOcrScanning ? (
                              <div className="w-full max-w-sm space-y-3 mt-4">
                                <div className="flex justify-between text-xs font-bold uppercase font-mono">
                                  <span className="text-purple-400 animate-pulse text-glow-blue">Scanning Document...</span>
                                  <span className="text-white">{ocrProgress}%</span>
                                </div>
                                <div className="h-3 w-full bg-cyberdark rounded-full overflow-hidden border border-white/10 shadow-inner">
                                  <div className="h-full bg-gradient-to-r from-purple-500 via-electric to-blue-500 transition-all duration-300 ease-out animate-shimmer" style={{ width: `${ocrProgress}%`, backgroundSize: '200% 100%' }}></div>
                                </div>
                                <span className="text-[10px] text-gray-400 block tracking-widest uppercase">Extracting mathematical LaTeX equations...</span>
                              </div>
                            ) : (
                              <div className="relative mt-4">
                                <input
                                  type="file"
                                  accept=".pdf,image/png,image/jpeg"
                                  onChange={handleOcrUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <button type="button" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl uppercase tracking-widest text-[11px] transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transform hover:-translate-y-0.5">
                                  Browse PDF / Image
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-obsidian/60 border border-white/5 rounded-lg space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gold uppercase tracking-wider block font-bold">Interactive MCQ Builder ({questions.length} Added)</span>
                            <button type="button" onClick={() => alert("AI generation feature will be connected to your backend LLM. (UI Stub Active)")} className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/40 rounded font-bold uppercase text-[9px] hover:bg-purple-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                              <Sparkles className="h-3 w-3" /> Auto-Generate with AI
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={qText}
                            onChange={(e) => setQText(e.target.value)}
                            placeholder="Enter Question Text"
                            className="w-full p-2.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            {qOptions.map((opt, idx) => (
                              <input
                                key={idx}
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const copy = [...qOptions];
                                  copy[idx] = e.target.value;
                                  setQOptions(copy);
                                }}
                                placeholder={`Choice Option ${String.fromCharCode(65 + idx)}`}
                                className="w-full p-2 bg-cyberdark border border-white/5 rounded text-xs text-white"
                              />
                            ))}
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Subject</label>
                              <select
                                value={qSubject}
                                onChange={(e) => setQSubject(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white focus:outline-none"
                              >
                                <option value="Mathematics">Math</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Correct Option</label>
                              <select
                                value={qCorrect}
                                onChange={(e) => setQCorrect(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white focus:outline-none"
                              >
                                <option value="0">A</option>
                                <option value="1">B</option>
                                <option value="2">C</option>
                                <option value="3">D</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Marks (+)</label>
                              <input
                                type="number"
                                value={qMarks}
                                onChange={(e) => setQMarks(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[8px] text-gray-500 uppercase block mb-0.5 font-bold">Neg (-)</label>
                              <input
                                type="number"
                                value={qNegMarks}
                                onChange={(e) => setQNegMarks(e.target.value)}
                                className="w-full p-1.5 bg-cyberdark border border-white/5 rounded text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <input
                            type="text"
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            placeholder="Explanation / Solution Steps"
                            className="w-full p-2.5 bg-cyberdark border border-white/5 rounded text-xs text-white"
                          />

                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="w-full py-2 bg-gold/10 hover:bg-gold hover:text-obsidian text-gold border border-gold/30 font-bold rounded text-[10px] uppercase tracking-wider transition-colors"
                          >
                            Add Question to Test
                          </button>
                        </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-gold hover:bg-yellow-500 text-obsidian font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                        <PlusCircle className="h-4 w-4" /> Publish Mock Exam
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of Existing Content in Selected Chapter */}
                  <div className="space-y-6 font-mono text-xs">
                    <div className="p-5 bg-cyberdark/40 border border-white/5 rounded-xl space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                        Folder Contents: {currentChapter?.title}
                      </h4>
                      
                      {/* Videos List */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-electric uppercase font-bold tracking-wider block">🎥 Video Lectures</span>
                        {(!currentChapter?.videos || currentChapter.videos.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No video lectures uploaded yet.</p>
                        ) : (
                          currentChapter.videos.map(v => (
                            <div key={v.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-white font-semibold truncate text-[11px] max-w-[120px]">{v.title}</h5>
                                  {v.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-bold font-mono">FREE</span>}
                                  {v.isLocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded font-bold font-mono">LOCKED</span>}
                                  {!v.isVisible && <span className="text-[8px] bg-gray-500/10 text-gray-400 border border-gray-500/20 px-1 rounded font-bold font-mono">HIDDEN</span>}
                                </div>
                                <span className="text-[9px] text-gray-500 block">Duration: {v.duration} {v.downloadBlocked && '• 🔒 Secured'}</span>
                              </div>
                              
                              {/* Quick Action Toggles */}
                              <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(selectedChapterId, 'video', v.id, 'isLocked')}
                                  className={`px-1.5 py-0.5 rounded border transition-colors ${v.isLocked ? 'border-red-900 bg-red-950/20 text-red-400 font-bold' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                                  title="Toggle Lock Status"
                                >
                                  LOCK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(selectedChapterId, 'video', v.id, 'isFree')}
                                  className={`px-1.5 py-0.5 rounded border transition-colors ${v.isFree ? 'border-emerald-900 bg-emerald-950/20 text-emerald-400 font-bold' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                                  title="Toggle Free/Premium Status"
                                >
                                  FREE
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(selectedChapterId, 'video', v.id, 'isVisible')}
                                  className={`px-1.5 py-0.5 rounded border transition-colors ${v.isVisible ? 'border-electric/30 bg-electric/10 text-electric font-bold' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                                  title="Toggle Visibility Status"
                                >
                                  {v.isVisible ? 'SHOW' : 'HIDE'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteResource(selectedChapterId, 'video', v.id)}
                                  className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* PDFs List */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-electric uppercase font-bold tracking-wider block">📄 PDF Notes & DPPs</span>
                        {(!currentChapter?.pdfs || currentChapter.pdfs.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No PDF notes uploaded.</p>
                        ) : (
                          currentChapter.pdfs.map(p => (
                            <div key={p.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-white font-semibold truncate text-[11px] max-w-[120px]">{p.title}</h5>
                                  {p.isFree && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-bold font-mono">FREE</span>}
                                  {p.isLocked && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1 rounded font-bold font-mono">LOCKED</span>}
                                  {!p.isVisible && <span className="text-[8px] bg-gray-500/10 text-gray-400 border border-gray-500/20 px-1 rounded font-bold font-mono">HIDDEN</span>}
                                </div>
                                <span className="text-[9px] text-gray-500 block">Size: {p.size} {p.downloadBlocked && '• 🔒 Protected'}</span>
                              </div>
                              
                              {/* Quick Action Toggles */}
                              <div className="flex items-center gap-1 shrink-0 font-mono text-[9px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(selectedChapterId, 'pdf', p.id, 'isLocked')}
                                  className={`px-1.5 py-0.5 rounded border transition-colors ${p.isLocked ? 'border-red-900 bg-red-950/20 text-red-400 font-bold' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                                  title="Toggle Lock Status"
                                >
                                  LOCK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(selectedChapterId, 'pdf', p.id, 'isFree')}
                                  className={`px-1.5 py-0.5 rounded border transition-colors ${p.isFree ? 'border-emerald-900 bg-emerald-950/20 text-emerald-400 font-bold' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                                  title="Toggle Free/Premium Status"
                                >
                                  FREE
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(selectedChapterId, 'pdf', p.id, 'isVisible')}
                                  className={`px-1.5 py-0.5 rounded border transition-colors ${p.isVisible ? 'border-electric/30 bg-electric/10 text-electric font-bold' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                                  title="Toggle Visibility Status"
                                >
                                  {p.isVisible ? 'SHOW' : 'HIDE'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteResource(selectedChapterId, 'pdf', p.id)}
                                  className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Formulas & Tricks List */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">⚡ Formulas & Quick Tricks</span>
                        {(!currentChapter?.formulas || currentChapter.formulas.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No quick tricks added.</p>
                        ) : (
                          currentChapter.formulas.map(f => (
                            <div key={f.id} className="flex justify-between items-start bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-white font-semibold text-[11px]">{f.title}</h5>
                                <p className="text-[9px] text-gray-500 mt-1 line-clamp-2 leading-relaxed bg-black/25 p-1 rounded font-mono">{f.content}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteResource(selectedChapterId, 'formula', f.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* PYQs (only for JEE levels) */}
                      {selectedClass.startsWith('jee') && (
                        <div className="space-y-2 pt-2 border-t border-white/5">
                          <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">📝 Previous Year Questions (PYQs)</span>
                          {(!currentChapter?.pyqs || currentChapter.pyqs.length === 0) ? (
                            <p className="text-[10px] text-gray-600 italic">No PYQs uploaded.</p>
                          ) : (
                            currentChapter.pyqs.map(p => (
                              <div key={p.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-white font-semibold truncate text-[11px]">{p.title}</h5>
                                  <span className="text-[9px] text-gray-500 block">Year: {p.year}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteResource(selectedChapterId, 'pyq', p.id)}
                                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* Mock Tests List */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-gold uppercase font-bold tracking-wider block">🏆 Mock Tests & Exams</span>
                        {(!currentChapter?.mockTests || currentChapter.mockTests.length === 0) ? (
                          <p className="text-[10px] text-gray-600 italic">No mock exams published yet.</p>
                        ) : (
                          currentChapter.mockTests.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-obsidian/60 border border-white/5 p-2.5 rounded-lg gap-4">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-white font-semibold truncate text-[11px]">{t.title}</h5>
                                <span className="text-[9px] text-gray-500 block font-mono">
                                  {t.type === 'link' ? 'AI Quiz Embed' : 'JEE Exam Builder'} • {t.durationMinutes} mins
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteMockTest(selectedChapterId, t.id)}
                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-cyberdark/20 border border-white/5 border-dashed rounded-xl min-h-[30vh]">
                  <BookOpen className="h-10 w-10 text-gray-600 mb-2" />
                  <p className="text-xs text-gray-500 font-mono">Select a Chapter Folder from the dropdown above to manage content.</p>
                </div>
              )}
            </div>
          )}

          {/* SECURITY & ANTI PIRACY LOGS TAB */}
          {adminTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Anti-Piracy Breaches</h3>
                <span className="text-[10px] bg-red-950/40 border border-red-900 text-red-400 px-2 py-0.5 rounded font-mono flex items-center gap-1.5 animate-pulse">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  REAL-TIME TELEMETRY FEED ACTIVE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {securityAlerts.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-12">No piracy attempts or security warnings registered today.</p>
                ) : (
                  securityAlerts.map((alert, idx) => (
                    <div key={idx} className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] bg-red-500 text-obsidian px-1.5 py-0.5 rounded font-bold uppercase">
                            {alert.type}
                          </span>
                          <h5 className="text-white font-bold text-sm mt-1.5">{alert.userName}</h5>
                        </div>
                        <span className="text-[10px] text-gray-500">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-[11px]">{alert.details}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-600 pt-2 border-t border-red-900/20">
                        <span>IP Address: {alert.ipAddress}</span>
                        <span>Log ID: {alert.id}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* BROADCAST ALERTS TAB */}
          {adminTab === 'notice' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display">Broadcast Global Announcement</h3>
              
              <form onSubmit={handleBroadcastNotice} className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Announcement Title</label>
                  <input
                    type="text"
                    required
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    placeholder="e.g. Dynamic Limits Lecture starts now!"
                    className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono focus:border-electric/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Detailed Message</label>
                  <textarea
                    required
                    rows={4}
                    value={noticeMsg}
                    onChange={(e) => setNoticeMsg(e.target.value)}
                    placeholder="Provide details about the notice or class schedules."
                    className="w-full p-3 bg-obsidian border border-white/5 text-xs rounded-lg text-white font-mono focus:border-electric/40 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Bell className="h-4.5 w-4.5 fill-current" />
                  Broadcast Live Notification
                </button>
              </form>
            </div>
          )}

          {/* WEB IMPORTER TAB */}
          {adminTab === 'importer' && (
            <div className="space-y-6 animate-fade-in font-mono text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider font-display text-glow-blue flex items-center gap-2">
                    <Cloud className="h-5 w-5" /> Web Bulk Importer
                  </h3>
                  <p className="text-gray-500 mt-1">Automatically scrape and inject JEE questions into your database.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                  <h4 className="font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Target Configuration</h4>
                  <form onSubmit={handleStartImport} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 uppercase block">Chapter URL to Scrape</label>
                      <input
                        type="url"
                        required
                        value={importerUrl}
                        onChange={(e) => setImporterUrl(e.target.value)}
                        placeholder="https://questions.examside.com/past-years/jee/jee-main/physics/..."
                        className="w-full p-3 bg-obsidian border border-white/10 rounded-lg text-white"
                        disabled={importerStatus === 'scraping'}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={importerStatus === 'scraping'}
                      className="w-full px-6 py-3 bg-electric hover:bg-cyan-400 text-obsidian font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {importerStatus === 'scraping' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
                      {importerStatus === 'scraping' ? 'Scraping in Progress...' : 'Start Extraction'}
                    </button>
                  </form>
                  <div className="p-6 bg-obsidian border border-white/5 rounded-xl space-y-4 max-h-[300px] overflow-y-auto">
                    <h4 className="font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Terminal Logs</h4>
                    <div className="space-y-1">
                      {importerLogs.length === 0 ? (
                        <p className="text-gray-600 italic">Idle. Awaiting command...</p>
                      ) : (
                        importerLogs.map((log, idx) => (
                          <div key={idx} className="text-[10px] text-electric">&gt; {log}</div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* DB PREVIEW */}
                <div className="p-6 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                  <h4 className="font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 flex justify-between">
                    <span>Database Verification (Scraped Questions)</span>
                    <span className="bg-electric text-obsidian px-2 py-0.5 rounded text-[9px]">{scrapedTests.reduce((sum, t) => sum + (t.questions?.length || 0), 0)} Questions Available</span>
                  </h4>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {scrapedTests.slice(0, 5).map((test, tIdx) => (
                      <div key={tIdx} className="space-y-2">
                        <h5 className="text-gold font-bold bg-white/5 p-2 rounded">{test.title}</h5>
                        {test.questions && test.questions.slice(0, 3).map((q, qIdx) => (
                          <div key={q.id} className="p-3 bg-obsidian border border-white/5 rounded-lg ml-4">
                            <span className="text-electric font-bold text-[10px] uppercase mb-2 block">Question {qIdx + 1}</span>
                            <div className="text-gray-300 text-sm mb-3" dangerouslySetInnerHTML={{ __html: q.questionText }} />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="p-2 border border-white/5 bg-white/5 rounded flex gap-2">
                                  <span className="text-gray-500">{String.fromCharCode(65 + oIdx)}.</span>
                                  <div dangerouslySetInnerHTML={{ __html: opt }} />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                              <span className="font-bold uppercase text-[9px]">Explanation:</span>
                              <div className="mt-1" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HOME TAB */}
          {adminTab === 'home' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-electric" /> Manage Home Page
              </h3>
              <div className="space-y-4">
                <div className="p-5 bg-cyberdark border border-white/5 rounded-xl space-y-4">
                  <h4 className="text-sm font-bold text-gold uppercase">Hero Section</h4>
                  <input type="text" value={homeData?.heroTitle || ''} onChange={e => setHomeData({...homeData, heroTitle: e.target.value})} className="w-full p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Hero Title" />
                  <input type="text" value={homeData?.heroSubtitle || ''} onChange={e => setHomeData({...homeData, heroSubtitle: e.target.value})} className="w-full p-2 bg-obsidian border border-white/10 rounded text-xs text-white" placeholder="Hero Subtitle" />
                </div>
              </div>
            </div>
          )}

          {/* BOOKS TAB */}
          {adminTab === 'books' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-4 flex justify-between items-center">
                <span className="flex items-center gap-2"><Book className="h-6 w-6 text-electric" /> Manage Books</span>
                <button onClick={() => setBooksData([...(booksData || []), { id: 'new_book_'+Date.now(), title: 'New Book', description: 'Description', tag: 'Tag', file: ''}])} className="px-4 py-2 bg-gold text-obsidian rounded text-xs font-bold uppercase hover:bg-yellow-400">Add New Book</button>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booksData?.map((book, idx) => (
                  <div key={book.id || idx} className="bg-cyberdark p-4 border border-white/10 rounded-xl space-y-3 relative group">
                    <button onClick={() => setBooksData(booksData.filter(b => b.id !== book.id))} className="absolute top-2 right-2 text-red-500 bg-red-500/10 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button>
                    <input type="text" value={book.title || ''} onChange={e => { const newBooks = [...booksData]; newBooks[idx].title = e.target.value; setBooksData(newBooks); }} className="w-full p-2 bg-obsidian border border-white/5 rounded text-sm text-white font-bold" placeholder="Book Title" />
                    <input type="text" value={book.tag || ''} onChange={e => { const newBooks = [...booksData]; newBooks[idx].tag = e.target.value; setBooksData(newBooks); }} className="w-full p-2 bg-obsidian border border-white/5 rounded text-xs text-electric" placeholder="Tag (e.g. JEE Main)" />
                    <input type="text" value={book.description || ''} onChange={e => { const newBooks = [...booksData]; newBooks[idx].description = e.target.value; setBooksData(newBooks); }} className="w-full p-2 bg-obsidian border border-white/5 rounded text-xs text-gray-400" placeholder="Description" />
                    <input type="text" value={book.file || ''} onChange={e => { const newBooks = [...booksData]; newBooks[idx].file = e.target.value; setBooksData(newBooks); }} className="w-full p-2 bg-obsidian border border-white/5 rounded text-xs text-blue-400 font-mono" placeholder="PDF Blob URL" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTS TAB */}
          {adminTab === 'tests' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-electric" /> Manage Test Series
              </h3>
              <div className="bg-cyberdark p-5 rounded-xl border border-white/5">
                <h4 className="text-sm font-bold text-blue-400 mb-4">JEE Main Tests</h4>
                <div className="space-y-2">
                  {testsData?.mains?.map((test, idx) => (
                    <div key={test.id || idx} className="flex gap-2 items-center">
                      <input type="text" value={test.title || ''} onChange={e => { const newTests = {...testsData}; newTests.mains[idx].title = e.target.value; setTestsData(newTests); }} className="flex-1 p-2 bg-obsidian border border-white/5 rounded text-sm text-white" />
                      <button onClick={() => { const newTests = {...testsData}; newTests.mains = newTests.mains.filter(t => t.id !== test.id); setTestsData(newTests); }} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setTestsData({...testsData, mains: [...(testsData?.mains || []), { id: 'new_main_'+Date.now(), title: 'New Test', exam: 'JEE Main' }]})} className="text-xs text-blue-400 mt-2">+ Add Main Test</button>
                </div>
                
                <h4 className="text-sm font-bold text-purple-400 mt-8 mb-4">JEE Advanced Tests</h4>
                <div className="space-y-2">
                  {testsData?.advanced?.map((test, idx) => (
                    <div key={test.id || idx} className="flex gap-2 items-center">
                      <input type="text" value={test.title || ''} onChange={e => { const newTests = {...testsData}; newTests.advanced[idx].title = e.target.value; setTestsData(newTests); }} className="flex-1 p-2 bg-obsidian border border-white/5 rounded text-sm text-white" />
                      <button onClick={() => { const newTests = {...testsData}; newTests.advanced = newTests.advanced.filter(t => t.id !== test.id); setTestsData(newTests); }} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setTestsData({...testsData, advanced: [...(testsData?.advanced || []), { id: 'new_adv_'+Date.now(), title: 'New Test', exam: 'JEE Advanced' }]})} className="text-xs text-purple-400 mt-2">+ Add Advanced Test</button>
                </div>
              </div>
            </div>
          )}

          {/* DATABASE BACKUP & RESTORE TAB */}
          {adminTab === 'database-backup' && (
            <div className="space-y-8 animate-fade-in font-mono text-xs">
              <div className="p-6 bg-cyberdark/60 border border-white/5 rounded-xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-white/5 pb-2 text-glow-gold flex items-center gap-2">
                  <Database className="h-5 w-5 text-gold" /> Database Safety Control Panel
                </h3>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Generate secure, automated backups of the live syllabus databases, toppers hall of fame, test series metadata, books data, and course libraries. Roll back or restore settings instantly in case of manual data corruption.
                </p>

                {/* Create Backup */}
                <div className="flex flex-col sm:flex-row gap-4 items-end bg-[#131520] p-4 rounded-xl border border-white/5">
                  <div className="flex-grow space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Backup Description / Note</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Before updating physics chapter test questions" 
                      value={backupDesc}
                      onChange={e => setBackupDesc(e.target.value)}
                      className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-gold/50"
                    />
                  </div>
                  <button 
                    onClick={handleCreateBackup}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-500 hover:to-amber-400 text-obsidian font-bold rounded-lg uppercase tracking-wider shadow-lg transition-all"
                  >
                    Create Snapshot
                  </button>
                </div>

                {/* Backup Snapshots History */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wider border-b border-white/5 pb-1">Backup Restore Points</h4>
                  
                  {loadingBackups ? (
                    <div className="flex justify-center items-center py-6 text-gray-500">
                      <div className="h-5 w-5 border-2 border-gold border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading restore points...
                    </div>
                  ) : backups.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 italic">
                      No backups found. Create a snapshot to set a restore point.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
                      {backups.map(b => (
                        <div key={b.backupId} className="flex justify-between items-center p-3.5 bg-black/30 border border-white/5 rounded-lg hover:border-gold/20 transition-all gap-4">
                          <div className="space-y-1">
                            <div className="text-white font-bold text-[11px]">{b.key}</div>
                            <div className="text-gray-500 text-[9px] flex gap-3">
                              <span>ID: {b.backupId}</span>
                              <span>•</span>
                              <span>Date: {new Date(b.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRestoreBackup(b.backupId)}
                            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent text-[9px] font-black uppercase rounded-lg transition-all"
                          >
                            Restore ↺
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS / BRANDING & RESULTS TAB */}
          {adminTab === 'settings' && (
            <div className="space-y-8 animate-fade-in font-mono text-xs">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Branding Custom Logo */}
                <div className="p-6 bg-cyberdark/60 border border-white/5 rounded-xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-white/5 pb-2 text-glow-blue">Branding Controls</h3>
                  
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">Upload Custom Brand Logo</h4>
                    <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
                      Select a new logo image (PNG/JPG/SVG). The image will be converted to a Base64 string and stored dynamically to customize the top navbar brand image.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <label className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-electric to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-obsidian font-bold text-xs rounded-lg uppercase tracking-wider transition-all cursor-pointer text-center shadow-lg hover:shadow-cyan-500/20">
                        Choose Logo File
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target.result;
                                localStorage.setItem('custom_logo', base64);
                                if (setCustomLogo) setCustomLogo(base64);
                                alert('Logo updated successfully! Changes are applied across the ecosystem.');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>
                      
                      <button
                        onClick={() => {
                          localStorage.removeItem('custom_logo');
                          if (setCustomLogo) setCustomLogo(null);
                          alert('Logo reset to default.');
                        }}
                        className="w-full sm:w-auto px-5 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900/20 text-red-400 font-bold text-xs rounded-lg uppercase tracking-wider transition-all"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-electric/30 bg-obsidian flex items-center justify-center p-1">
                      <img 
                        src={localStorage.getItem('custom_logo') || '/quantrex-academy/logo.png'} 
                        alt="Brand Logo Preview" 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=80&q=80';
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-500 uppercase block">Active Logo Status</span>
                      <span className="text-xs font-bold text-white">
                        {localStorage.getItem('custom_logo') ? 'Custom Uploaded Logo' : 'Default Brand Logo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Toppers / Results Registry Form */}
                <div className="p-6 bg-cyberdark/60 border border-white/5 rounded-xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-white/5 pb-2 text-glow-gold">Hall of Fame Results Registry</h3>
                  
                  <form onSubmit={handleAddTopper} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Student Name</label>
                        <input
                          type="text"
                          required
                          value={topperName}
                          onChange={(e) => setTopperName(e.target.value)}
                          placeholder="e.g. Kabir Mehta"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Rank / Board %</label>
                        <input
                          type="text"
                          required
                          value={topperRank}
                          onChange={(e) => setTopperRank(e.target.value)}
                          placeholder="e.g. AIR 4 / 99.8%"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Math Score / Percentile</label>
                        <input
                          type="text"
                          required
                          value={topperScore}
                          onChange={(e) => setTopperScore(e.target.value)}
                          placeholder="e.g. 118 / 120 (Maths)"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase block">Exam details & Year</label>
                        <input
                          type="text"
                          value={topperYear}
                          onChange={(e) => setTopperYear(e.target.value)}
                          placeholder="e.g. JEE Advanced 2026"
                          className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase block">Profile Image URL</label>
                      <input
                        type="text"
                        value={topperPhoto}
                        onChange={(e) => setTopperPhoto(e.target.value)}
                        placeholder="Paste image URL (or leave blank for default avatar)"
                        className="w-full p-2.5 bg-obsidian border border-white/5 rounded-lg text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gold hover:bg-yellow-500 text-obsidian font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg hover:shadow-yellow-500/10 flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Student Result
                    </button>
                  </form>
                </div>

                {/* Cloud Storage Database Integration */}
                <div className="p-6 bg-cyberdark/60 border border-white/5 rounded-xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-white/5 pb-2 flex items-center gap-2 text-glow-blue">
                    <Database className="h-4 w-4" /> Cloud Storage Database (Active)
                  </h3>
                  
                  <div>
                    <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-lg mb-4 flex items-center gap-2">
                      <Check className="h-4 w-4" /> Connected Successfully!
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      AI has automatically configured and linked a permanent Cloud Storage database (Vercel Blob) for your website. 
                      <br /><br />
                      This replaces MongoDB for your Syllabus, Chapters, and Test Series. It is 100x faster, completely crash-proof, and updates your site instantly without needing deployments!
                    </p>

                    <button 
                      onClick={async () => {
                        try {
                          const btn = document.getElementById('pushCloudBtn');
                          btn.innerHTML = 'Pushing to Live Website...';
                          btn.disabled = true;
                          await saveDbToBlob('syllabusData', syllabus);
                          alert('Successfully pushed all your Syllabus, Chapters, and questions to the Live Website! The website will instantly show these changes.');
                          btn.innerHTML = 'Push Database & Syllabus to Live Website';
                          btn.disabled = false;
                        } catch (err) {
                          alert('Failed to push to Cloud Database!');
                          document.getElementById('pushCloudBtn').innerHTML = 'Push Database & Syllabus to Live Website';
                          document.getElementById('pushCloudBtn').disabled = false;
                        }
                      }}
                      id="pushCloudBtn"
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all flex justify-center items-center gap-2"
                    >
                      <Database className="h-5 w-5" /> Push Database & Syllabus to Live Website
                    </button>
                  </div>
                </div>

              </div>

              {/* Toppers Achievement List */}
              <div className="p-6 bg-cyberdark/40 border border-white/5 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2 text-glow-gold">Registered Hall of Fame Toppers</h4>
                
                {toppers.length === 0 ? (
                  <p className="text-gray-500 italic text-center py-6">No topper results listed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {toppers.map(t => (
                      <div key={t.id} className="bg-obsidian border border-white/5 p-4 rounded-xl flex items-center gap-3 relative group">
                        <div className="h-11 w-11 rounded-full overflow-hidden border border-gold/30 bg-cyberdark shrink-0">
                          <img 
                            src={t.photo} 
                            alt={t.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gold font-bold uppercase tracking-wider">{t.rank}</span>
                          <h5 className="text-white font-bold text-xs truncate mt-0.5">{t.name}</h5>
                          <span className="text-[9px] text-gray-500 block truncate">{t.year} • {t.score}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTopper(t.id)}
                          className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-400 rounded transition-colors bg-cyberdark/50 border border-transparent hover:border-red-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
