const fs = require('fs');

console.log("Starting injection...");
const newChapter = JSON.parse(fs.readFileSync('E:\\\\quantrexacademy\\\\quadratic_temp.json', 'utf8'));

const filesToUpdate = [
    'E:\\\\quantrexacademy\\\\blackBookDataFull.json',
    'E:\\\\quantrexacademy\\\\public\\\\blackbook-script.js'
];

let data = JSON.parse(fs.readFileSync(filesToUpdate[0], 'utf8'));
let idx = data.findIndex(c => c.id === 'adv-quadratic-equations');
if (idx >= 0) {
    data[idx] = newChapter;
} else {
    data.push(newChapter);
}

filesToUpdate.forEach(fpath => {
    if (fpath.endsWith('.js')) {
        fs.writeFileSync(fpath, 'window.DEFAULT_BLACKBOOK = ' + JSON.stringify(data) + ';\n');
    } else {
        fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
    }
    console.log("Written to: " + fpath);
});
console.log("Injected via Node!");
