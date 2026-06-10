async function check() {
  const html = await fetch('https://quantrex-academy.vercel.app').then(r=>r.text());
  const match = html.match(/src="\/assets\/(index-[^"]+\.js)"/);
  if(match) {
    const jsUrl = 'https://quantrex-academy.vercel.app/assets/' + match[1];
    const js = await fetch(jsUrl).then(r=>r.text());
    console.log('Has new error logic:', js.includes('Failed to load test (ID:'));
    console.log('Has intercept logic:', js.includes('startsWith("d")'));
    console.log('JS URL:', jsUrl);
  } else {
    console.log('JS not found in HTML');
  }
}
check();
