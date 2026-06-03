const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const r = await fetch('https://quantrexacademy.vercel.app');
  const d = await r.text();
  const match = d.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (match) {
    const r2 = await fetch('https://quantrexacademy.vercel.app' + match[1]);
    const js = await r2.text();
    fs.writeFileSync('deployed_js.js', js);
    console.log('Saved to deployed_js.js');
  }
}
run().catch(console.error);
