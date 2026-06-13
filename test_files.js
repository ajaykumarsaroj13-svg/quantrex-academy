const fs = require('fs');
const path = require('path');
const { transformSync } = require('@swc/core');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('src');
for (const file of files) {
    console.log('Testing: ' + file);
    const start = Date.now();
    try {
        const code = fs.readFileSync(file, 'utf8');
        transformSync(code, {
            jsc: {
                parser: { syntax: 'ecmascript', jsx: true }
            }
        });
        const duration = Date.now() - start;
        if (duration > 500) console.log('SLOW: ' + file + ' took ' + duration + 'ms');
    } catch (e) {
        console.log('Error in ' + file + ': ' + e.message);
    }
}
console.log('Done testing all files.');
