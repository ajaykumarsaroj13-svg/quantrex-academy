/**
 * deploy_via_api.cjs - Deploy to Vercel using REST API
 * Uses the OIDC token from .env.local if still valid
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the OIDC token from .env.local
const envLocal = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = envLocal.match(/VERCEL_OIDC_TOKEN="([^"]+)"/);
if (!tokenMatch) {
  console.error('Could not find VERCEL_OIDC_TOKEN in .env.local');
  process.exit(1);
}
const token = tokenMatch[1].replace(/\r\n/g, '').replace(/\n/g, '');

// Decode JWT to check expiry
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
const now = Math.floor(Date.now() / 1000);
console.log('Token issued at:', new Date(payload.iat * 1000).toISOString());
console.log('Token expires at:', new Date(payload.exp * 1000).toISOString());
console.log('Current time:', new Date().toISOString());
console.log('Token valid:', payload.exp > now ? 'YES' : 'NO (expired)');
console.log('Project ID:', payload.project_id);
console.log('Owner:', payload.owner);

if (payload.exp <= now) {
  console.error('\nToken is EXPIRED. Cannot deploy via API.');
  console.error('Please run: vercel login');
  console.error('Or get a personal access token from: https://vercel.com/account/tokens');
  process.exit(1);
}

// Token is valid! Try to trigger deployment via API
console.log('\nToken is still valid! Attempting deployment...');

const projectId = payload.project_id;
const teamId = payload.owner_id;

// Use the Vercel API to create a deployment
// We'll use the git integration by triggering via API
const postData = JSON.stringify({
  name: 'quantrexacademy',
  gitSource: {
    type: 'github',
    repo: 'ajaykumarsaroj13-svg/quantrex-academy',
    ref: 'main'
  },
  target: 'production'
});

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v13/deployments?teamId=${teamId}`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\nAPI Response Status:', res.statusCode);
      if (result.url) {
        console.log('Deployment URL:', result.url);
        console.log('Deployment ID:', result.id);
        console.log('Status:', result.readyState);
      } else if (result.error) {
        console.error('API Error:', result.error.message || JSON.stringify(result.error));
        console.log('Full response:', JSON.stringify(result, null, 2));
      } else {
        console.log('Response:', JSON.stringify(result, null, 2));
      }
    } catch(e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(postData);
req.end();
