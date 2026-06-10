const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('binomial.html', 'utf-8');

// The __NEXT_DATA__ is usually in a script tag with id="__NEXT_DATA__"
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
if (match) {
  const data = JSON.parse(match[1]);
  fs.writeFileSync('next_data.json', JSON.stringify(data, null, 2));
  console.log('Extracted next_data.json');
} else {
  console.log('No __NEXT_DATA__ found');
}
