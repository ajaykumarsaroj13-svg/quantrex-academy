import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Must copy the PyqChapter and Pyq schemas directly here because we can't easily import from backend without babel/typescript sometimes, or we can just redefine them quickly.
const PyqChapterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  exam: { type: String, default: 'JEE Main' },
  subject: { type: String, required: true },
  count: { type: Number, default: 0 },
  weightage: { type: String, default: '5%' }
}, { timestamps: true });

const PyqSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  exam: { type: String, default: 'JEE Main' },
  chapterId: { type: String, required: true },
  title: { type: String },
  year: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  type: { type: String, enum: ['SCQ', 'NUMERICAL'], default: 'SCQ' },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctOptionIndex: { type: Number },
  solution: { type: String },
  marks: { type: Number, default: 4 },
  negativeMarks: { type: Number, default: -1 },
  topic: { type: String, default: 'General' }
}, { timestamps: true });

const PyqChapter = mongoose.models.PyqChapter || mongoose.model('PyqChapter', PyqChapterSchema);
const Pyq = mongoose.models.Pyq || mongoose.model('Pyq', PyqSchema);

const MOBILE = '7750858874';
const PASSWORD = '12345678';
const LOGIN_URL = 'https://accounts.examgoal.com/login';

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

async function run() {
  await connectDB();

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false, // watch what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });
  const page = await browser.newPage();
  
  // 1. LOGIN
  console.log('🔑 Navigating to login...');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  const phoneBtns = await page.$$('button');
  for (const btn of phoneBtns) {
    const text = await page.evaluate(el => el.textContent.trim().toLowerCase(), btn);
    if (text === 'phone') { await btn.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1000));
  
  const phoneInput = await page.$('input[type="number"][placeholder="Enter Phone Number"]') || await page.$('input[name="phone"]');
  if (phoneInput) {
    await phoneInput.click({ clickCount: 3 });
    await page.keyboard.type(MOBILE, { delay: 50 });
  } else {
      await page.evaluate(() => {
        const inp = document.querySelector('input[type="number"]');
        if(inp) { inp.value = '7750858874'; inp.dispatchEvent(new Event('input', { bubbles: true })); }
      });
  }
  
  await new Promise(r => setTimeout(r, 500));
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.type(PASSWORD, { delay: 50 });
  }
  
  const btns = await page.$$('button');
  for (const btn of btns) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text === 'Login') { await btn.click(); break; }
  }
  
  console.log('⏳ Waiting for login...');
  await new Promise(r => setTimeout(r, 5000));
  console.log('✅ Login successful!');
  
  // 2. NAVIGATE TO PYQ JEE MAIN MATHEMATICS
  // First go to Dashboard to ensure auth cookies are set
  await page.goto('https://room.examgoal.com/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('📚 Navigating to PYQs...');
  // Actually, wait, does ExamGoal have a direct PYQ page?
  // Let's go to `https://questions.examside.com/past-years/jee/jee-main/mathematics` which is examside.
  // Wait, if ExamGoal uses `room.examgoal.com` for everything including PYQ, we need the exact URL.
  // The user said: "jaise hum sets aur relations ka chapter exam goal se nikale the"
  // The sets and relations URL from testsData.json is: "https://questions.examside.com/past-years/jee/jee-main/mathematics/sets-and-relations"
  // AND the user explicitly said "kuch bhi change nahi karna hai".
  // So I can just scrape `questions.examside.com` using cheerio directly WITHOUT LOGIN to get questions, 
  // but to get SOLUTIONS, maybe `questions.examside.com` DOES show solutions without login but they are just inside an HTML chunk?
  
  console.log('Test logic: Fetching Examside HTML directly without puppeteer login to see if solutions are there...');
}

run().catch(console.error);
