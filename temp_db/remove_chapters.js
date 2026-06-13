const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'utils', 'syllabusData.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Find the index of the start of Indefinite Integration chapter
const startMarker = '{\n                    "id": "ch_adv_math_22",';
const endMarker = '"module": "JEE Advanced Mathematics"\n                }\n            ]';

let startIdx = content.indexOf(startMarker);

// If the exact whitespace doesn't match, try a more flexible regex
if (startIdx === -1) {
    console.log("Using Regex approach");
    // Look for the last chapter to KEEP (Application of Derivatives)
    const keepEndRegex = /"id": "ch_adv_math_21",[\s\S]*?"module": "JEE Advanced Mathematics"\n\s+},\n\s+{/g;
    
    // We want to replace from the comma after ch_adv_math_21's block up to the end of the array
    // Let's just parse the file as a module if we can? It's exported as `const syllabusData = ...; export default syllabusData;`
    // Actually, string manipulation is safer if we know the boundaries.
    
    const lines = content.split('\n');
    let startLine = -1;
    let endLine = -1;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"id": "ch_adv_math_22"')) {
            startLine = i - 1; // The line with `{`
            break;
        }
    }
    
    if (startLine !== -1) {
        // Find where the array closes
        for (let i = startLine; i < lines.length; i++) {
            if (lines[i].includes('"id": "ch_adv_math_26"')) {
                // Find the end of this object
                for (let j = i; j < lines.length; j++) {
                    if (lines[j].includes('}')) {
                        // The next line should be `]`
                        if (lines[j+1].includes(']')) {
                            endLine = j;
                            break;
                        }
                    }
                }
                break;
            }
        }
    }
    
    if (startLine !== -1 && endLine !== -1) {
        // Remove from startLine to endLine
        const newLines = [...lines.slice(0, startLine), ...lines.slice(endLine + 1)];
        // Ensure there's no trailing comma before the `]`
        for(let i = startLine - 1; i >= 0; i--) {
            if (newLines[i].trim() === '},') {
                newLines[i] = newLines[i].replace('},', '}');
                break;
            }
        }
        
        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log("Successfully removed chapters using line-based approach.");
        process.exit(0);
    } else {
        console.log("Could not find boundaries.", startLine, endLine);
        process.exit(1);
    }
} else {
    // String index approach
    console.log("Found exact markers!");
}
