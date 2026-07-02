import { useState, useEffect } from 'react';

// Custom hook to manage PYQ progress per chapter with online/offline database sync
export function usePYQProgress(chapterId) {
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState({ correct: 0, wrong: 0, accuracy: 0, timeSpent: 0 });
  const [bookmarkGroups, setBookmarkGroups] = useState([]);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user ? user.id || user._id : null;
  
  const storageKey = `quantrex_pyq_progress_${chapterId}`;

  // Load initial data from local storage & sync with MongoDB
  useEffect(() => {
    // 1. Load local cache first for instant UI response (zero blank screen)
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
        calculateStats(parsed);
      }
    } catch (e) {
      console.error("Failed to load local PYQ progress", e);
    }
    
    // 2. Fetch from MongoDB if logged in
    if (userId) {
      const fetchProgress = async () => {
        try {
          const res = await fetch(`/api/progress?userId=${userId}&type=pyq&chapterId=${chapterId}`);
          if (res.ok) {
            const dbData = await res.json();
            if (dbData && Object.keys(dbData).length > 0) {
              // Merge local and DB progress, prioritizing newer attempt dates if any
              const merged = { ...progress, ...dbData };
              setProgress(merged);
              calculateStats(merged);
              localStorage.setItem(storageKey, JSON.stringify(merged));
            }
          }
        } catch (err) {
          console.warn("Offline or failed to sync PYQ progress with server. Using local cache.");
        }
      };
      fetchProgress();
    }

    // Load global bookmark groups
    try {
      const storedGroups = localStorage.getItem('quantrex_bookmark_groups');
      if (storedGroups) {
        setBookmarkGroups(JSON.parse(storedGroups));
      }
    } catch (e) {
      console.error("Failed to load bookmark groups", e);
    }
  }, [chapterId, storageKey, userId]);

  // Handle auto-sync of queued offline items when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      console.log("Device is online. Syncing queued PYQ progress...");
      const queueKey = 'quantrex_pyq_sync_queue';
      try {
        const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
        if (queue.length === 0) return;

        const remainingQueue = [];
        for (const item of queue) {
          try {
            const res = await fetch('/api/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
            if (!res.ok) throw new Error();
          } catch (e) {
            remainingQueue.push(item); // Put back in queue if it fails again
          }
        }

        if (remainingQueue.length > 0) {
          localStorage.setItem(queueKey, JSON.stringify(remainingQueue));
        } else {
          localStorage.removeItem(queueKey);
        }
      } catch (err) {
        console.error("Failed to sync offline queue:", err);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // Calculate top-level stats
  const calculateStats = (progObj) => {
    let c = 0;
    let w = 0;
    let t = 0;
    Object.values(progObj).forEach(item => {
      if (item.status === 'correct') c++;
      else if (item.status === 'wrong') w++;
      t += (item.timeSpent || 0);
    });
    
    let acc = 0;
    if (c + w > 0) {
      acc = ((c / (c + w)) * 100).toFixed(2);
    }
    
    setStats({ correct: c, wrong: w, accuracy: acc, timeSpent: t });
  };

  // Update a single question's progress
  const updateProgress = (questionId, updates) => {
    setProgress(prev => {
      const existing = prev[questionId] || { attempts: 0, timeSpent: 0, bookmarked: false, note: '', status: 'unattempted' };
      
      const updatedItem = { ...existing, ...updates };
      if (updates.timeSpentSeconds) {
        updatedItem.timeSpent = existing.timeSpent + updates.timeSpentSeconds;
        delete updatedItem.timeSpentSeconds;
      }
      
      if (updates.status && updates.status !== 'unattempted' && updates.status !== existing.status) {
         updatedItem.attempts = existing.attempts + 1;
         updatedItem.lastAttemptDate = new Date().toISOString();
      }

      const updated = {
        ...prev,
        [questionId]: updatedItem
      };
      
      // 1. Save to local storage (instantly)
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save local progress", e);
      }
      
      // 2. Sync to MongoDB (async)
      if (userId) {
        const payload = {
          userId,
          type: 'pyq',
          chapterId,
          progressData: updated
        };

        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {
          // If fetch fails (offline), queue the save payload in local storage for later sync
          try {
            const queueKey = 'quantrex_pyq_sync_queue';
            const queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
            // Avoid duplicate chapter sync in queue
            const cleanQueue = queue.filter(item => !(item.userId === userId && item.chapterId === chapterId));
            cleanQueue.push(payload);
            localStorage.setItem(queueKey, JSON.stringify(cleanQueue));
          } catch (e) {}
        });
      }
      
      calculateStats(updated);
      return updated;
    });
  };

  const clearProgress = () => {
    setProgress({});
    setStats({ correct: 0, wrong: 0, accuracy: 0, timeSpent: 0 });
    localStorage.removeItem(storageKey);
    
    // Clear on server
    if (userId) {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type: 'pyq', chapterId, progressData: {} })
      }).catch(() => {});
    }
  };

  const addBookmarkGroup = (groupName) => {
    setBookmarkGroups(prev => {
      if (prev.includes(groupName)) return prev;
      const next = [...prev, groupName];
      try {
        localStorage.setItem('quantrex_bookmark_groups', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return { progress, stats, updateProgress, clearProgress, bookmarkGroups, addBookmarkGroup };
}
