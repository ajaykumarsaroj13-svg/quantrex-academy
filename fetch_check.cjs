fetch('https://quantrexacadmy.vercel.app/')
  .then(res => res.text())
  .then(html => {
    const jsUrl = html.match(/src="\/assets\/(index-[^"]+)"/)[1];
    console.log("Found JS:", jsUrl);
    fetch('https://quantrexacadmy.vercel.app/assets/' + jsUrl)
      .then(res => res.text())
      .then(js => {
         console.log('Does JS contain Sec?:', js.includes('startsWith("Sec")') || js.includes('startsWith(\\"Sec\\")'));
      });
  })
  .catch(console.error);
