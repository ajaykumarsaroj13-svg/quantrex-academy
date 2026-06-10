const fs = require('fs');
const path = require('path');

const syllabusPath = path.join(__dirname, '..', 'backend', 'data', 'syllabus.json');
const syllabus = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));

const tests = [];
let testIdCounter = 1;

for (const [classKey, classData] of Object.entries(syllabus)) {
    for (const [subjectKey, subjectData] of Object.entries(classData.subjects)) {
        // Group by module to create module-wise mock tests
        const moduleMap = {};
        for (const ch of subjectData.chapters) {
            if (!moduleMap[ch.module]) moduleMap[ch.module] = [];
            moduleMap[ch.module].push(ch);
            
            // 1. Chapter-wise Test
            tests.push({
                id: `test_ch_${ch.id}`,
                title: `${ch.title} - Chapter Test (${subjectData.label})`,
                description: `Topic-wise mock test for ${ch.title} covering all previous year questions from this specific chapter.`,
                durationMinutes: 60,
                category: 'Chapter-Wise',
                subject: subjectData.label,
                questions: [] // will be loaded dynamically by the scraper
            });
        }
        
        // 2. Module-wise Test
        for (const [moduleName, chapters] of Object.entries(moduleMap)) {
            tests.push({
                id: `test_mod_${subjectKey}_${moduleName.replace(/[^a-z0-9]/gi, '_')}`,
                title: `${moduleName} - Unit Test (${subjectData.label})`,
                description: `Comprehensive mock test for the entire ${moduleName} module.`,
                durationMinutes: 90,
                category: 'Module-Wise',
                subject: subjectData.label,
                questions: []
            });
        }
        
        // 3. Subject-wise Full Test
        tests.push({
            id: `test_full_${subjectKey}`,
            title: `JEE Main ${subjectData.label} Full Syllabus Mock`,
            description: `Complete syllabus mock test for ${subjectData.label}. Standard JEE Main pattern.`,
            durationMinutes: 60,
            category: 'Full-Syllabus',
            subject: subjectData.label,
            questions: []
        });
    }
    
    // 4. Grand Mock Tests (Physics + Chemistry + Math)
    tests.push({
        id: `test_grand_mock_1`,
        title: `JEE Main Grand Mock Test - Full Syllabus`,
        description: `Complete JEE Main Mock Test covering Physics, Chemistry, and Mathematics (300 Marks, 3 Hours).`,
        durationMinutes: 180,
        category: 'Grand-Mock',
        subject: 'PCM',
        questions: []
    });
}

const outPath = path.join(__dirname, '..', 'backend', 'data', 'tests.json');
fs.writeFileSync(outPath, JSON.stringify(tests, null, 2));
console.log(`✅ Generated ${tests.length} tests and saved to ${outPath}`);
