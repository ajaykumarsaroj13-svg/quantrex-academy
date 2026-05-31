const { execSync } = require('child_process');

try {
  // Find vercel global path
  const vercelPath = execSync('where vercel', { encoding: 'utf8' }).trim().split('\n')[0];
  console.log('Vercel path:', vercelPath);
  
  // Find the vercel package
  const vercelPkg = execSync('npm root -g', { encoding: 'utf8' }).trim();
  console.log('Global npm root:', vercelPkg);
  
  // List vercel deps with native
  const fs = require('fs');
  const path = require('path');
  const vercelDir = path.join(vercelPkg, 'vercel');
  
  if (fs.existsSync(vercelDir)) {
    console.log('Vercel dir exists:', vercelDir);
    // Check package.json optionalDependencies
    const pkg = JSON.parse(fs.readFileSync(path.join(vercelDir, 'package.json'), 'utf8'));
    console.log('Optional deps:', JSON.stringify(pkg.optionalDependencies || {}, null, 2));
  }
} catch(e) {
  console.error('Error:', e.message);
}
