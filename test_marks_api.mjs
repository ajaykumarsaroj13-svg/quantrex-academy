import axios from 'axios';

const EMAIL = 'ajaykumarsaroj13@gmail.com';
const PASSWORD = 'Saroj13@';

const endpointsToTest = [
  'https://api.getmarks.app/api/v1/auth/login',
  'https://api.getmarks.app/api/auth/login',
  'https://backend.getmarks.app/api/v1/auth/login',
  'https://backend.getmarks.app/api/auth/login',
  'https://backend.mathongo.com/api/v1/auth/login' // Marks is by Mathongo
];

async function testEndpoints() {
  console.log('Testing common login endpoints...');
  for (const url of endpointsToTest) {
    try {
      console.log(`Trying ${url}...`);
      const res = await axios.post(url, {
        email: EMAIL,
        password: PASSWORD
      }, { timeout: 5000 });
      console.log(`[SUCCESS] ${url} returned ${res.status}`);
      console.log(res.data);
      return;
    } catch (err) {
      if (err.response) {
        console.log(`[FAILED] ${url} returned ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else {
        console.log(`[FAILED] ${url} network error or timeout`);
      }
    }
  }
}

testEndpoints();
