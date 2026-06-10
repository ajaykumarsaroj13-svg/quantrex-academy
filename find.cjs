const fs = require('fs'); 
const html = fs.readFileSync('maths.html', 'utf-8'); 
const matches = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/g)]; 
const links = matches.map(m => m[1] + ' : ' + m[2].replace(/<[^>]+>/g, '').trim()); 
console.log(links.filter(l => l.toLowerCase().includes('matric') || l.toLowerCase().includes('determinant')));
