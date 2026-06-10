fetch('https://quantrexacadmy.vercel.app/')
  .then(res => res.text())
  .then(text => {
     const match = text.match(/src="(\/assets\/index-[^"]+\.js)"/);
     if (match) {
         return fetch('https://quantrexacadmy.vercel.app' + match[1]);
     }
     throw new Error('JS bundle not found');
  })
  .then(res => res.text())
  .then(js => {
     if (js.includes('nta-option.wrong mjx-container')) {
         console.log('STYLES ARE DEPLOYED!');
     } else {
         console.log('STYLES NOT DEPLOYED!');
     }
  })
  .catch(console.error);
