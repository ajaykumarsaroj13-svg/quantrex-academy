import fs from 'fs';

let code = fs.readFileSync('src/utils/blackBookData.js', 'utf8');
if (!code.includes('fullData.slice(0, 4)')) {
  code = code.replace('fullData.map', 'fullData.slice(0, 4).map');
  fs.writeFileSync('src/utils/blackBookData.js', code);
  console.log('done blackBookData');
} else {
  console.log('already sliced');
}
