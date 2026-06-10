const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const cheerio = require('cheerio');
require('dotenv').config({ path: '../backend/.env' });

const { PyqChapter, Pyq } = require('../backend/models/schemas.js'); // Assuming we can require this if we configure it correctly. Wait, schemas.js uses "export const" (ES modules).
