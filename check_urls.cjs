const fs = require('fs');
const js = fs.readFileSync('deployed_js.js', 'utf8');
const match = js.match(/api\/pyqs\/questions[^`'"}]+/g);
if (match) {
  console.log('Matches:', match);
} else {
  console.log('No matches found for API fetch URL in deployed JS');
}
