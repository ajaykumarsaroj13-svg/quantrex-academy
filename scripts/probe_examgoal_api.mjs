
import fs from 'fs';

const token = "FIREBASE_INSTALLATIONS_AUTH eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjE6OTg5ODIwNDIzMjQxOndlYjowNjAwYjRiMmRhNjMyNzhjOGI0Mzk4IiwiZXhwIjoxNzgxNDAzMTA1LCJmaWQiOiJkOEtwLXl1MDd6ZG4xZmR5UTZ1dmcxIiwicHJvamVjdE51bWJlciI6OTg5ODIwNDIzMjQxfQ.AB2LPV8wRgIhAKrEoqK2tDuyADfL1CxHpPc4CUtqHyYPhMWtQu1D2CDoAiEArftIuti7FGlzwYl6d0KBeT358uCwzRYcx7jFdmSxF3c";

async function probe() {
  const headers = {
    'Authorization': token,
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0'
  };

  const urls = [
    'https://room.examgoal.com/api/v1/metadata/chapters?exam=jee-main&subject=mathematics',
    'https://room.examgoal.com/api/v1/metadata/topics?exam=jee-main&subject=mathematics',
    'https://room.examgoal.com/api/v1/metadata/syllabus?exam=jee-main',
    'https://room.examgoal.com/api/v1/past-question/syllabus?exam=jee-main',
    'https://api.examgoal.com/v1/syllabus/jee-main'
  ];

  for(const url of urls) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await fetch(url, { headers });
      console.log(`Status: ${res.status}`);
      if(res.status === 200) {
        const data = await res.json();
        fs.writeFileSync('probe_' + url.replace(/[^a-zA-Z]/g, '_') + '.json', JSON.stringify(data, null, 2));
        console.log(`✅ Saved data for ${url}`);
      }
    } catch(e) { console.error(e.message); }
  }
}
probe();
