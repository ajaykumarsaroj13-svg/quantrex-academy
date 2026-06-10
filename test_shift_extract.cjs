const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
    const url = 'https://questions.examside.com/past-years/jee/question/let-a-1-2-3-and-r-1-2-2-3-1-4-be-a-relation-on-a-let-jee-main-mathematics-sets-and-relations-p9q3xksr';
    const html = await fetchHtml(url);
    
    const startStr = '<script>\\n\\t\\t\\t{\\n\\t\\t\\t\\t__sveltekit';
    let startIndex = html.indexOf(startStr);
    
    // Sometimes it's stored in <script type="application/json" data-sveltekit-fetched>
    // Or let's just use regex to find ANY JSON looking thing that has "year" or "shift"
    const shiftMatch = html.match(/"exam_year"\s*:\s*"?([^",}]+)"?/);
    const dateMatch = html.match(/"exam_date"\s*:\s*"?([^",}]+)"?/);
    const shift2Match = html.match(/"shift"\s*:\s*"?([^",}]+)"?/);
    const tagsMatch = html.match(/"tags"\s*:\s*(\[[^\]]+\])/);

    console.log("Exam Year:", shiftMatch ? shiftMatch[1] : null);
    console.log("Exam Date:", dateMatch ? dateMatch[1] : null);
    console.log("Exam Shift:", shift2Match ? shift2Match[1] : null);
    console.log("Tags:", tagsMatch ? tagsMatch[1] : null);
    
    // Just dump a regex of ANY string that has 2019, 2020, 2021, etc near "JEE"
    const generalMatch = html.match(/JEE Main 20\d\d[^"']*/g);
    console.log("General Matches:", generalMatch ? [...new Set(generalMatch)] : null);
}

test();
