import puppeteer from 'puppeteer';
import fs from 'fs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0';
const TARGET_SERIES_NAME = "JEE Main Ultimate Online Test Series - 2027";

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('quantrex');
    const collection = db.collection('testSeries2027');
    console.log('Connected to MongoDB.');

    console.log('Launching browser...');
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

    try {
        console.log('Navigating to login...');
        await page.goto('https://room.examgoal.com/login', { waitUntil: 'networkidle2' });
        
        console.log('Clicking "Phone" tab...');
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Phone') {
                await btn.click();
                console.log('Clicked Phone tab.');
                break;
            }
        }

        await delay(1000);

        console.log('Typing credentials...');
        const inputs = await page.$$('input');
        if (inputs.length >= 3) {
            await inputs[1].type('7750858874'); // Phone
            await inputs[2].type('12345678');   // Password
        } else if (inputs.length >= 2) {
            await inputs[inputs.length - 2].type('7750858874');
            await inputs[inputs.length - 1].type('12345678');
        }
        
        console.log('Pressing Login button...');
        const loginBtns = await page.$$('button');
        for (const btn of loginBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.trim() === 'Login') {
                await btn.click();
                break;
            }
        }

        console.log('Waiting for authentication...');
        await delay(5000);

        // Verify Auth by calling profile
        const profileData = await page.evaluate(async () => {
            const res = await fetch('https://room.examgoal.com/api/v1/auth/profile/me');
            return await res.json();
        });
        
        if (profileData.error || profileData.statusCode !== 0) {
            await page.screenshot({ path: 'scraper_failed.png' });
            throw new Error("Login failed. Profile returned: " + JSON.stringify(profileData));
        }

        console.log('Login successful! Profile:', profileData.data.displayName);

        console.log('Login successful! Profile:', profileData.data.displayName);

        // Intercept network requests to find the right endpoint
        console.log('Navigating to Test Series page to capture network requests...');
        
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (req.url().includes('api/')) {
                console.log('API Request:', req.url());
            }
            req.continue();
        });

        // Click on Test Series menu
        const menuButtons = await page.$$('a, button');
        for (const btn of menuButtons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.toLowerCase().includes('test series')) {
                await btn.click();
                console.log('Clicked test series button');
                break;
            }
        }

        await delay(8000);
        
        // Let's also check localStorage for the token
        const token = await page.evaluate(() => localStorage.getItem('token') || localStorage.getItem('auth.token'));
        console.log('Local Storage Token:', token ? 'Found' : 'Not Found');

        // Terminate early for debugging
        await browser.close();
        await client.close();
        return;
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close().catch(()=>console.log('browser already closed'));
        if (client) await client.close();
    }
}

run();
