const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const r = await fetch('https://quantrexacademy.vercel.app');
  const d = await r.text();
  const match = d.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (match) {
    console.log('Found JS:', match[1]);
    const r2 = await fetch('https://quantrexacademy.vercel.app' + match[1]);
    const js = await r2.text();
    console.log('Does it contain toExamSlug?', js.includes('toExamSlug'));
    console.log('Does it contain fetchPyqsByChapter?', js.includes('fetchPyqsByChapter'));
    // Find what it passes for exam
    if (js.includes('jee-main')) console.log('Contains jee-main slug');
    if (js.includes('JEE Main')) console.log('Contains JEE Main text');
  } else {
    console.log('No JS match found');
  }
}
run().catch(console.error);
