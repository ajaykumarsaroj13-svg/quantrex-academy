const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('src');
const replacements = {
    'icons/check-circle2': 'icons/check-circle-2',
    'icons/bar-chart2': 'icons/bar-chart-2',
    'icons/maximize2': 'icons/maximize-2',
    'icons/trash2': 'icons/trash-2',
    'icons/volume2': 'icons/volume-2'
};

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    for (const [oldStr, newStr] of Object.entries(replacements)) {
        newContent = newContent.split(oldStr).join(newStr);
    }
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(Updated );
    }
});
