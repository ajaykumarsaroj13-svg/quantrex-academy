const fs = require('fs');
const { parse } = require('devalue');

const text = fs.readFileSync('q_data.json', 'utf8');
const data = JSON.parse(text);

let foundOptions = false;
data.nodes.forEach((node, idx) => {
  if (node && node.data) {
    try {
      // The actual node.data is an array that devalue reconstructs
      // It's not standard devalue string, but a serialized array
      const arr = node.data;
      console.log(`Node ${idx} array length: ${arr.length}`);
      
      // Let's just find strings that look like answers
      const strings = arr.filter(x => typeof x === 'string');
      // MCQ Multiple Correct options might look like "A, B" or "[0, 1]"
      
      // Let's find arrays of numbers for correctOptionIndex
      const arrays = arr.filter(x => Array.isArray(x));
      arrays.forEach(a => {
        if (a.length > 0 && typeof a[0] === 'number') {
           // could be correct option index array
           // console.log("Possible array:", a);
        }
      });
    } catch(e) {}
  }
});
