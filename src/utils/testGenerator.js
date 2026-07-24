// Simple seeded random number generator (Mulberry32)
export function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Seeded shuffle array
export function shuffleArray(array, rng) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(rng() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export const generateCustomTest = async (baseUrl, chapterSlugs, types, questionCount, yearFilter, seed) => {
    try {
        let allQuestions = [];
        
        // Fetch all chapter JSONs
        for (const slug of chapterSlugs) {
            try {
                // Ensure slug is properly formatted
                let fetchSlug = String(slug);
                
                const response = await fetch(`${baseUrl}data/questions/${fetchSlug}.json`);
                if (!response.ok) continue;
                
                const data = await response.json();
                
                let questionsArray = [];
                if (Array.isArray(data)) {
                    questionsArray = data;
                } else if (data && data.questions && Array.isArray(data.questions)) {
                    questionsArray = data.questions;
                } else if (data && data.data && Array.isArray(data.data)) {
                    questionsArray = data.data;
                }

                if (questionsArray.length > 0) {
                    allQuestions = [...allQuestions, ...questionsArray];
                }
            } catch (err) {
                console.error(`Error fetching questions for ${slug}:`, err);
            }
        }

        if (allQuestions.length === 0) {
            throw new Error("No questions found for the selected chapters.");
        }

        // Filter out completely broken questions that have no text and no image
        allQuestions = allQuestions.filter(q => {
            if (q.questionText || q.question || q.text) return true;
            if (q.imageUrl || q.has_graph) return true;
            if (q.solution && q.solution.includes('<img')) return true;
            return false;
        });

        if (allQuestions.length === 0) {
            throw new Error("No valid questions found (all were missing question text/image).");
        }

        // Filter by Year
        const currentYear = new Date().getFullYear();
        let filteredQuestions = allQuestions;

        if (yearFilter !== 'All') {
            let cutoffYear = 0;
            if (yearFilter === 'Last 3 years') cutoffYear = currentYear - 3;
            if (yearFilter === 'Last 5 years') cutoffYear = currentYear - 5;
            if (yearFilter === 'Last 10 years') cutoffYear = currentYear - 10;
            
            if (cutoffYear > 0) {
                filteredQuestions = allQuestions.filter(q => {
                    if (q.year) {
                        return parseInt(q.year) >= cutoffYear;
                    }
                    // If no year is present, we might want to include it or exclude it. 
                    // To be safe and not drastically reduce the pool, we include it if year is unknown.
                    return true;
                });
            }
        }
        
        if (filteredQuestions.length === 0) {
             // Fallback to all questions if filtering removes everything
             filteredQuestions = allQuestions;
        }

        // Shuffle with seed
        const rng = mulberry32(seed);
        
        // Ensure IDs exist before checking seen status
        filteredQuestions.forEach((q, i) => {
            if (!q.id) {
                q.id = q.question_id || q._id || `q_${Date.now()}_${i}`;
            }
        });

        // Split into Seen and Unseen to prevent repetition
        let seenIds = [];
        try {
            seenIds = JSON.parse(localStorage.getItem('quantrex_seen_questions') || '[]');
        } catch (e) {
            seenIds = [];
        }
        
        let unseenQuestions = filteredQuestions.filter(q => !seenIds.includes(q.id));
        let seenQuestions = filteredQuestions.filter(q => seenIds.includes(q.id));
        
        unseenQuestions = shuffleArray([...unseenQuestions], rng);
        seenQuestions = shuffleArray([...seenQuestions], rng);
        
        const sortedQuestions = [...unseenQuestions, ...seenQuestions]; // Prioritize unseen

        // Pick questions based on types
        let finalQuestions = [];
        if (types && typeof types === 'object') {
            for (const [typeKey, count] of Object.entries(types)) {
                if (count <= 0) continue;
                const tk = typeKey.toUpperCase();
                const typeMatches = sortedQuestions.filter(q => {
                    const qType = (q.type || q.questionType || '').toUpperCase().trim();
                    const hasOptions = Array.isArray(q.options) && q.options.length > 0;
                    
                    if (tk === 'MCQ' || tk === 'SINGLE_CORRECT') {
                        return (qType === 'SINGLE_CORRECT' || qType === 'MCQ' || qType === 'SINGLE CORRECT' || qType === 'SCQ' || qType === '') && hasOptions;
                    } else if (tk === 'NUMERICAL') {
                        return qType === 'NUMERICAL' || qType === 'INTEGER' || !hasOptions;
                    } else if (tk === 'MULTI_CORRECT' || tk === 'MULTIPLE_CORRECT') {
                        return qType === 'MULTI_CORRECT' || qType === 'MCQM' || qType === 'MULTIPLE CORRECT' || qType === 'MULTIPLE_CORRECT';
                    } else if (tk === 'COMPREHENSION') {
                        return qType === 'COMPREHENSION' || qType === 'PARAGRAPH';
                    } else if (tk === 'MATCHING') {
                        return qType === 'MATCHING' || qType === 'MATRIX MATCH' || qType === 'MATRIX_MATCH';
                    }
                    return false;
                });
                finalQuestions.push(...typeMatches.slice(0, count));
            }
        } else {
            finalQuestions = sortedQuestions.slice(0, Math.min(questionCount, sortedQuestions.length));
        }
        
        // Shuffle the final combined list
        finalQuestions = shuffleArray(finalQuestions, rng);

        // Assign difficulty levels if missing, and record seen questions
        const newSeenIds = new Set(seenIds);
        finalQuestions.forEach(q => {
            newSeenIds.add(q.id);
            
            if (!q.difficulty) {
                // Generate deterministic pseudo-random number based on ID length or chars
                let hash = 0;
                for (let i = 0; i < String(q.id).length; i++) {
                    hash = ((hash << 5) - hash) + String(q.id).charCodeAt(i);
                    hash |= 0;
                }
                const diffNum = Math.abs(hash) % 100;
                if (diffNum < 30) q.difficulty = 'Easy';
                else if (diffNum < 80) q.difficulty = 'Medium';
                else q.difficulty = 'Hard';
            }
        });
        
        try {
            // Keep last 1000 seen questions to prevent localStorage from blowing up
            const updatedSeenArr = Array.from(newSeenIds).slice(-1000);
            localStorage.setItem('quantrex_seen_questions', JSON.stringify(updatedSeenArr));
        } catch(e) {
            console.error("Failed to save seen questions to localStorage", e);
        }

        return finalQuestions;

    } catch (error) {
        console.error("Failed to generate custom test:", error);
        throw error;
    }
};
