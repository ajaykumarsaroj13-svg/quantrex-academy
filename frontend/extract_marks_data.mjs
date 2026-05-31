import axios from 'axios';
import fs from 'fs';

// WE NEED THE TOKEN FROM YOUR BROWSER
const BEARER_TOKEN = 'PASTE_YOUR_TOKEN_HERE';

// We also need the exact API endpoint for getting books/tests, e.g.:
// const API_URL = 'https://api.mathongo.com/v1/marks/...';

async function fetchMarksData() {
  if (BEARER_TOKEN === 'PASTE_YOUR_TOKEN_HERE') {
    console.log("Please provide the Bearer token from your browser's Network tab.");
    return;
  }

  try {
    const res = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    });
    fs.writeFileSync('marks_scraped_data.json', JSON.stringify(res.data, null, 2));
    console.log("Successfully scraped data!");
  } catch (err) {
    console.error("Error scraping data:", err.message);
  }
}

fetchMarksData();
