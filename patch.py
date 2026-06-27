import re

with open('src/components/ChapterPYQDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add exam prop
content = content.replace('initialTab = ''topic'' })', 'initialTab = ''topic'', exam })')

# 2. Add typeFilter state
content = content.replace("const [yearFilter, setYearFilter] = useState('All');", "const [yearFilter, setYearFilter] = useState('All');\n  const [typeFilter, setTypeFilter] = useState('All');")

# 3. Add type logic in getFilteredQuestions
old_filter = "if (searchQuery) list = list.filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()));"
new_filter = """if (typeFilter !== 'All') {
      list = list.filter(q => {
        const t = (q.type || q.questionType || '').toUpperCase().trim();
        if (typeFilter === 'Single Correct') return t === 'SINGLE_CORRECT' || t === 'SCQ' || t === 'SINGLE CORRECT' || t === 'MCQ (SINGLE CORRECT)';
        if (typeFilter === 'Multi Correct') return t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)';
        if (typeFilter === 'Numerical/Integer') return t === 'NUMERICAL' || t === 'NUMERICAL VALUE' || t === 'INTEGER' || t === 'INTEGER-VALUE';
        if (typeFilter === 'Subjective') return t === 'SUBJECTIVE';
        if (typeFilter === 'Match the Following') return t === 'MATCH' || t === 'MATCH_FOLLOWING' || t === 'MATCH THE FOLLOWING';
        if (typeFilter === 'Comprehension') return t === 'COMPREHENSION';
        if (typeFilter === 'True or False') return t === 'TRUE_FALSE' || t === 'TRUE AND FALSE';
        if (typeFilter === 'Filling the Blanks') return t === 'FIB' || t === 'FILL_IN_THE_BLANKS' || t === 'FILL IN THE BLANKS';
        return true;
      });
    }
    if (searchQuery) list = list.filter(q => (q.question?.en?.content || q.question || '').toLowerCase().includes(searchQuery.toLowerCase()));"""
content = content.replace(old_filter, new_filter)

# 4. Add availableTypes useMemo
old_stats = "const getProgressStats = (questions) => {"
new_stats = """const availableTypes = useMemo(() => {
    if (exam === 'jee-mains') return ['Single Correct', 'Numerical/Integer'];
    if (exam === 'jee-advanced') return ['Single Correct', 'Numerical/Integer', 'Multi Correct', 'Subjective', 'Filling the Blanks', 'True or False', 'Match the Following', 'Comprehension'];
    
    const types = new Set();
    allQuestions.forEach(q => {
      const t = (q.type || q.questionType || '').toUpperCase().trim();
      if (t === 'SINGLE_CORRECT' || t === 'SCQ' || t === 'SINGLE CORRECT' || t === 'MCQ (SINGLE CORRECT)') types.add('Single Correct');
      if (t === 'MULTI_CORRECT' || t === 'MCQM' || t === 'MULTIPLE_CORRECT' || t === 'MULTIPLE CORRECT' || t === 'MCQ (MULTIPLE CORRECT)') types.add('Multi Correct');
      if (t === 'NUMERICAL' || t === 'NUMERICAL VALUE' || t === 'INTEGER' || t === 'INTEGER-VALUE') types.add('Numerical/Integer');
      if (t === 'SUBJECTIVE') types.add('Subjective');
      if (t === 'MATCH' || t === 'MATCH_FOLLOWING' || t === 'MATCH THE FOLLOWING') types.add('Match the Following');
      if (t === 'COMPREHENSION') types.add('Comprehension');
      if (t === 'TRUE_FALSE' || t === 'TRUE AND FALSE') types.add('True or False');
      if (t === 'FIB' || t === 'FILL_IN_THE_BLANKS' || t === 'FILL IN THE BLANKS') types.add('Filling the Blanks');
    });
    return Array.from(types).sort();
  }, [allQuestions, exam]);

  const getProgressStats = (questions) => {"""
content = content.replace(old_stats, new_stats)

# 5. Add dropdown in 'all' view
# Find: <select \n                value={yearFilter} onChange={e => setYearFilter(e.target.value)}
# Because it might vary, let's use regex
dropdown_regex = r'(<select\s+value=\{yearFilter\} onChange=\{e => setYearFilter\(e\.target\.value\)\})'
type_dropdown = """<select 
                value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className={order  px-4 py-2 rounded-lg outline-none focus:border-blue-500}
              >
                <option value="All">All Types</option>
                {availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              \\1"""
content = re.sub(dropdown_regex, type_dropdown, content)

with open('src/components/ChapterPYQDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
