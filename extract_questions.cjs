const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('binomial.html', 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

const questions = [];

const qDivs = document.querySelectorAll('.question-box, .q-box, [class*="question"]'); // Find the exact selector

// For a quick look, let's see what class names contain "question"
const classes = new Set();
document.querySelectorAll('*').forEach(el => {
  if (el.className && typeof el.className === 'string' && el.className.includes('question')) {
    classes.add(el.className);
  }
});
console.log('Classes with "question":', Array.from(classes));

// Let's just find elements that start with a number like "1." or "Q1" or have data attributes
const cards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.rounded-xl.shadow-sm.border.border-gray-200');
console.log('Found question cards:', cards.length);

if (cards.length === 0) {
    // try another selector
    const another = document.querySelectorAll('div[data-v-something]');
} else {
    // parse the first card
    const first = cards[0];
    console.log('First card HTML:', first.innerHTML.substring(0, 500));
}
