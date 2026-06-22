import fs from 'fs';
import vm from 'vm';

// Provide a mock window object
const sandbox = { window: {} };
vm.createContext(sandbox);

// Read data-v5.js
const code = fs.readFileSync('./public/data-v5.js', 'utf8');

// Execute code in sandbox
vm.runInContext(code, sandbox);

const toppers = sandbox.window.DEFAULT_TOPPERS;
const syllabus = sandbox.window.DEFAULT_SYLLABUS;

// Upload toppers
fetch('https://quantrex-9c898-default-rtdb.firebaseio.com/toppers.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toppers)
}).then(r => r.json()).then(data => {
    console.log('Toppers uploaded successfully!');
}).catch(console.error);

// Upload syllabus
fetch('https://quantrex-9c898-default-rtdb.firebaseio.com/syllabus.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syllabus)
}).then(r => r.json()).then(data => {
    console.log('Syllabus uploaded successfully!');
}).catch(console.error);

