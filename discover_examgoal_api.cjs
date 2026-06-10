// Direct API-based ExamGoal scraper using native fetch (Node 18+)
// First discover login API, then fetch all test series data

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...(options.headers || {})
      }
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data, raw: true });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function main() {
  console.log('=== ExamGoal API Discovery ===\n');
  
  // Try various login endpoints
  const loginEndpoints = [
    { url: 'https://accounts.examgoal.com/api/v1/auth/login', body: { mobile: '7750858874', password: '12345678' } },
    { url: 'https://accounts.examgoal.com/api/v1/auth/login', body: { phone: '7750858874', password: '12345678' } },
    { url: 'https://accounts.examgoal.com/api/v1/auth/login', body: { email: '7750858874', password: '12345678' } },
    { url: 'https://accounts.examgoal.com/api/v1/auth/signin', body: { mobile: '7750858874', password: '12345678' } },
    { url: 'https://accounts.examgoal.com/api/v1/users/login', body: { mobile: '7750858874', password: '12345678' } },
  ];
  
  let token = null;
  let sessionCookies = null;
  
  for (const ep of loginEndpoints) {
    try {
      console.log('Trying:', ep.url);
      const result = await fetchJson(ep.url, { method: 'POST', body: ep.body });
      console.log('Status:', result.status);
      if (result.raw) {
        console.log('Raw response (first 200 chars):', String(result.data).substring(0, 200));
      } else {
        console.log('Response:', JSON.stringify(result.data).substring(0, 300));
        if (result.data.token || result.data.accessToken || result.data.access_token || result.data.data?.token) {
          token = result.data.token || result.data.accessToken || result.data.access_token || result.data.data?.token;
          console.log('✅ GOT TOKEN:', token.substring(0, 60));
          break;
        }
      }
      // Check for cookies in response
      if (result.headers['set-cookie']) {
        sessionCookies = result.headers['set-cookie'];
        console.log('Got cookies:', sessionCookies.length);
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
    console.log('---');
  }
  
  if (!token && !sessionCookies) {
    console.log('\n⚠️ Could not get token via API. Checking if room.examgoal.com has different auth...');
    
    // Try room.examgoal.com API
    const roomLogin = await fetchJson('https://room.examgoal.com/api/auth/login', {
      method: 'POST',
      body: { mobile: '7750858874', password: '12345678' }
    });
    console.log('Room login response:', JSON.stringify(roomLogin.data).substring(0, 300));
  }
  
  // Try fetching JEE Main test list without auth (might be public)
  console.log('\n=== Trying public endpoints ===');
  const publicEndpoints = [
    'https://api.examgoal.com/v1/full-test-series/jee-main',
    'https://api.examgoal.com/full-test-series/jee-main',
    'https://examgoal.com/_app/immutable/chunks/full-test-series.js',
    'https://www.examgoal.com/api/v1/tests',
    'https://www.examgoal.com/api/tests/jee-main',
  ];
  
  for (const url of publicEndpoints) {
    try {
      const r = await fetchJson(url);
      console.log(url.substring(0, 60), '-> Status:', r.status, '| Data type:', typeof r.data, r.raw ? '(raw text)' : '(JSON)');
      if (!r.raw && r.status === 200) {
        fs.writeFileSync('public_api_' + url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60) + '.json', JSON.stringify(r.data, null, 2));
        console.log('  Saved!');
      }
    } catch (e) {
      console.log(url.substring(0, 60), '-> Error:', e.message);
    }
  }
  
  // Save what we found
  fs.writeFileSync('login_result.json', JSON.stringify({ token, sessionCookies }, null, 2));
  console.log('\nDone. Token:', token ? 'FOUND' : 'NOT FOUND');
}

main().catch(console.error);
