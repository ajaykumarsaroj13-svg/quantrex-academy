// Pure JavaScript helpers for the Study Portal inside StudentDashboard

export const stripLatex = (html) => {
  if (!html) return '';
  let text = html;
  if (typeof text === 'object') {
    text = text.en?.content || text.en?.questionText || text.en?.direction || text.content || text.questionText || '';
  }
  if (typeof text !== 'string') {
    text = String(text);
  }
  text = text.replace(/\$\$[^$]*\$\$/g, '[Math]');
  text = text.replace(/\$[^$]*\$/g, '[Math]');
  text = text.replace(/\\\([^)]*\\\)/g, '[Math]');
  text = text.replace(/\\\[[^\]]*\\\]/g, '[Math]');
  text = text.replace(/<[^>]+>/g, '');
  return text.trim();
};

export const formatTimeSpent = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00:00';
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

// Deterministic random generator for realistic chapter leaderboards
export const getLeaderboardForChapter = (chapterId, totalQuestions) => {
  if (!chapterId) return [];
  
  // Seedable simple RNG using chapterId string hash
  let hash = 0;
  for (let i = 0; i < chapterId.length; i++) {
    hash = chapterId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const studentPool = [
    { name: "Rohit Sharma", avatar: "👤" },
    { name: "Priya Patel", avatar: "👩" },
    { name: "Aarav Mehta", avatar: "👦" },
    { name: "Sneha Reddy", avatar: "👧" },
    { name: "Vikram Malhotra", avatar: "👨" },
    { name: "Ananya Iyer", avatar: "👩" },
    { name: "Kabir Singh", avatar: "🧔" },
    { name: "Diya Joshi", avatar: "👱‍♀️" },
    { name: "Ishaan Verma", avatar: "👨‍🎓" },
    { name: "Tanvi Rao", avatar: "👩‍🎓" }
  ];

  const board = [];
  const poolSize = studentPool.length;

  for (let rank = 1; rank <= 7; rank++) {
    const rIdx = Math.floor(pseudoRandom(hash + rank) * poolSize);
    const student = studentPool[rIdx];
    
    // Calculate realistic accuracy & score
    const accuracyVal = 70 + Math.floor(pseudoRandom(hash + rank * 2) * 28); // 70% to 98%
    const attemptedVal = Math.max(1, Math.floor((0.7 + pseudoRandom(hash + rank * 3) * 0.3) * totalQuestions));
    const scoreVal = Math.floor((accuracyVal / 100) * attemptedVal * 4); // Standard JEE marking (approx)

    board.push({
      rank,
      name: student.name,
      avatar: student.avatar,
      accuracy: `${accuracyVal}%`,
      score: scoreVal,
      attempted: attemptedVal
    });
  }

  // Sort by score desc, rank asc
  return board.sort((a, b) => b.score - a.score).map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));
};
