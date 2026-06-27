const API_KEY = 'AIzaSyCmqAEfiqO-H9MCjmKHuv4Ea9h3sqbKK2s';

async function testAuth(email, password) {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
        })
    });
    
    const data = await res.json();
    console.log(`Email: ${email} -> Response:`, data.error ? data.error.message : 'SUCCESS! Token: ' + data.idToken.substring(0, 20) + '...');
}

async function run() {
    await testAuth('7750858874', '12345678');
    await testAuth('+917750858874@examgoal.com', '12345678');
    await testAuth('7750858874@examgoal.com', '12345678');
    await testAuth('+917750858874', '12345678');
}

run();
