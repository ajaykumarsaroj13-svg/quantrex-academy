import fs from 'fs';

// ExamGoal uses a Nuxt app with Firebase auth
// Let's try to login directly via their API
const loginData = {
    mobile: '7750858874',
    password: '12345678'
};

async function tryLogin() {
    console.log('Trying direct API login...');
    
    // Try phone login endpoint
    try {
        const res = await fetch('https://accounts.examgoal.com/api/v1/auth/login/phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://accounts.examgoal.com',
                'Referer': 'https://accounts.examgoal.com/login',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: JSON.stringify({
                mobile: loginData.mobile,
                password: loginData.password
            })
        });
        const text = await res.text();
        console.log('Login response status:', res.status);
        console.log('Login response body:', text.substring(0, 1000));
        fs.writeFileSync('login_response.json', text);
    } catch (e) {
        console.log('Error:', e.message);
    }

    // Try alternate endpoint
    try {
        const res2 = await fetch('https://room.examgoal.com/api/v1/auth/login/phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://room.examgoal.com',
                'Referer': 'https://accounts.examgoal.com/login'
            },
            body: JSON.stringify({
                mobile: loginData.mobile,
                password: loginData.password
            })
        });
        const text2 = await res2.text();
        console.log('Alt Login response status:', res2.status);
        console.log('Alt Login response body:', text2.substring(0, 1000));
    } catch (e) {
        console.log('Alt Error:', e.message);
    }
}

tryLogin();
