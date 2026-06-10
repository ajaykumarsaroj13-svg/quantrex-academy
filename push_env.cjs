const fs = require('fs');
const execSync = require('child_process').execSync;

const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n');
const uriLine = lines.find(line => line.startsWith('MONGODB_URI='));

if (uriLine) {
  const uri = uriLine.split('MONGODB_URI=')[1].trim();
  console.log('Adding MONGODB_URI to Vercel...');
  try {
    execSync(`npx vercel env add MONGODB_URI production --yes`, { input: uri, stdio: ['pipe', 'inherit', 'inherit'] });
    console.log('Successfully added.');
  } catch (e) {
    console.error('Failed to add via stdin.');
    // Let's try with vercel deploy -e
  }
} else {
  console.log('MONGODB_URI not found in .env');
}
