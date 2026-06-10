const fs = require('fs');

const subagent_ids = [
    "c3dd2074-c548-4442-b8c2-76e01e8d74c4", "9785bb6e-d110-4ee7-adb2-bc0af67f3188", "c3f8a4d8-13ac-4399-8478-0495ac012be0",
    "cfb0a7bc-9a92-4959-ac79-7f95b43bc651", "c8ee1fca-7982-40d6-b35b-6df748419a94", "52f204e6-6450-4ec1-909d-e2afdd829e9f",
    "582f3e07-e0f5-4114-b972-08c635079923", "eed3e8b3-e7ea-4a19-89af-c50225b945b6", "f19c5d0a-2b0c-489b-8bd9-e77373fecfbc",
    "24ac35a1-6858-4df0-a841-d794e1ea76b1", "c0e1e5c8-2863-458d-a0e9-dc6809b1fcc9", "68c8b027-5f39-4ee9-a6fc-dad300617608",
    "bff9d3de-de45-4e19-b124-c3d43d868ad1", "e5e8b99b-d7e7-4935-813a-b49b07abbcb2", "d4a612bf-bede-4484-b11d-57c07cf58981"
];

let allQuestions = [];
let missing = [];

subagent_ids.forEach((sub_id, index) => {
    const log_path = `C:/Users/Admin/.gemini/antigravity/brain/${sub_id}/.system_generated/logs/transcript.jsonl`;
    if (!fs.existsSync(log_path)) {
        missing.push(index + 1);
        return;
    }

    const content = fs.readFileSync(log_path, 'utf8');
    const lines = content.trim().split('\n');
    let found = false;

    for (let i = lines.length - 1; i >= 0; i--) {
        try {
            const data = JSON.parse(lines[i]);
            if (data.source === 'MODEL') {
                const text = data.content || '';
                const match = text.match(/\[[\s\S]*\]/);
                if (match) {
                    let jsonStr = match[0];
                    // Replace backslashes correctly for evaluation
                    jsonStr = jsonStr.replace(/\\/g, '\\\\');
                    
                    // We can use eval to parse non-strict JSON
                    try {
                        const parsed = eval('(' + jsonStr + ')');
                        allQuestions = allQuestions.concat(parsed);
                        found = true;
                        break;
                    } catch (e) {
                        // ignore and try next line
                    }
                }
            }
        } catch (e) {}
    }
    
    if (!found) {
        missing.push(index + 1);
    }
});

if (missing.length === 0) {
    fs.writeFileSync('limits_extracted.json', JSON.stringify(allQuestions, null, 2), 'utf8');
    console.log(`Successfully extracted ${allQuestions.length} questions!`);
} else {
    console.log(`Still waiting for pages: ${missing.join(', ')}`);
}
