import { useState, useEffect } from 'react';

// Custom hook to manage PYQ progress per chapter
export function usePYQProgress(chapterId) {
  const [progress, setProgress] = useState({});
  const [stats, setStats] = useState({ correct: 0, wrong: 0, accuracy: 0, timeSpent: 0 });
  const [bookmarkGroups, setBookmarkGroups] = useState([]);
  const storageKey = `quantrex_pyq_progress_${chapterId}`;

  // Load initial data from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress(parsed);
        calculateStats(parsed);
      }
    } catch (e) {
      console.error("Failed to load PYQ progress", e);
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
  }, [chapterId, storageKey]);

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
  // status: 'correct' | 'wrong' | 'unattempted' | 'skipped'
  const updateProgress = (questionId, updates) => {
    setProgress(prev => {
      const existing = prev[questionId] || { attempts: 0, timeSpent: 0, bookmarked: false, note: '', status: 'unattempted' };
      
      const updatedItem = { ...existing, ...updates };
      // if timeSpent is provided as a delta (timeSpentSeconds) rather than absolute
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
      
      // Save to local storage
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save PYQ progress", e);
      }
      
      calculateStats(updated);
      return updated;
    });
  };

  const clearProgress = () => {
    setProgress({});
    setStats({ correct: 0, wrong: 0, accuracy: 0, timeSpent: 0 });
    localStorage.removeItem(storageKey);
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
