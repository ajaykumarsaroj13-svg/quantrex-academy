import fs from 'fs';
import * as devalue from 'devalue';

const text = fs.readFileSync('scratch/q2_data.json', 'utf8');
const parsed = JSON.parse(text);
const nodes = parsed.nodes;

for (let i = 0; i < nodes.length; i++) {
  if (nodes[i] && nodes[i].data) {
    try {
      const data = devalue.parse(JSON.stringify(nodes[i].data)); // wait, devalue.parse takes string of array?
      // Actually, devalue.parse takes the original string: `devalue.parse(text_of_array)`
      // Let's see if we can find 'correctOption' in the flat array
    } catch(e) {}
  }
}
