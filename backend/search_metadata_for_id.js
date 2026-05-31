import fs from 'fs';

const filePath = "C:/Users/Admin/.gemini/antigravity/scratch/quantrex-academy/backend/metadata.json";
const content = fs.readFileSync(filePath, 'utf8');

const id = "65f55b3f-ebcd-51b9-8d4f-ec4f7943e29a";
const index = content.indexOf(id);

if (index >= 0) {
  console.log(`Found ID at character position: ${index}`);
  console.log('Surrounding text:');
  console.log(content.substring(index - 150, index + 150));
} else {
  console.log('ID not found in metadata.json.');
}
