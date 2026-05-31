const fs = require('fs');

async function fixIntegerTypes() {
    console.log("🛠️ Fixing Integer Types for JEE Advanced...");
    const dataPath = './src/utils/advancedTestsData.json';
    if (!fs.existsSync(dataPath)) {
        console.log("File not found yet. Waiting for scrape to finish.");
        return;
    }
    
    let allTests = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    let fixedCount = 0;

    allTests.forEach(test => {
        test.questions.forEach(q => {
            // If all options except maybe the first one are N/A, it's an integer type
            if (q.options && q.options[1] === "N/A" && q.options[2] === "N/A" && q.options[3] === "N/A") {
                q.options = []; // Empty options triggers Integer Type UI
                // For examside, sometimes the answer is in the explanation
                // We'll leave correctOption as it is (it might be "A" or the actual number)
                fixedCount++;
            }
        });
    });

    fs.writeFileSync(dataPath, JSON.stringify(allTests, null, 2));
    console.log(`✅ Fixed ${fixedCount} integer-type questions in Advanced DB!`);
}

fixIntegerTypes();
