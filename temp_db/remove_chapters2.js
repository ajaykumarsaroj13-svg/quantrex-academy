const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'utils', 'syllabusData.js');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"id": "ch_adv_math_21"')) {
        // Find the closing brace for this chapter
        for (let j = i; j < lines.length; j++) {
            if (lines[j].trim() === '},' || lines[j].trim() === '}') {
                startLine = j; // This is the '},' after ch_adv_math_21
                break;
            }
        }
        break;
    }
}

if (startLine !== -1) {
    for (let i = startLine + 1; i < lines.length; i++) {
        if (lines[i].includes('"id": "ch_adv_math_26"')) {
            // Find the closing brace for this last chapter
            for (let j = i; j < lines.length; j++) {
                if (lines[j].trim() === '}' || lines[j].trim() === '},') {
                    endLine = j; // This is the '}' after ch_adv_math_26
                    break;
                }
            }
            break;
        }
    }
}

console.log("Start line:", startLine, "End line:", endLine);

if (startLine !== -1 && endLine !== -1) {
    // We want to keep everything up to and including startLine, but we need to change the '},' to '}' since it will now be the last item.
    if (lines[startLine].trim() === '},') {
        lines[startLine] = lines[startLine].replace('},', '}');
    }
    
    // Remove lines from startLine + 1 to endLine
    const newLines = [...lines.slice(0, startLine + 1), ...lines.slice(endLine + 1)];
    
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log("Successfully removed chapters.");
} else {
    console.log("Could not find chapter boundaries.");
}
