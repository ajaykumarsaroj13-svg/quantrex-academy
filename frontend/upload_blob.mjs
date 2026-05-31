import { put } from '@vercel/blob';
import fs from 'fs';

const BLOB_TOKEN = "vercel_blob_rw_9fPWnWWgz32uFQdO_kTjaJqwhqsGgDLXQtv4Ei1wJcP8Ief";

// Read the latest syllabusData.js
let syllabusStr = fs.readFileSync('./src/utils/syllabusData.js', 'utf8');
let codeToEval = syllabusStr.replace('export const DEFAULT_SYLLABUS =', 'const DEFAULT_SYLLABUS =').replace('export const DEFAULT_TOPPERS =', 'const DEFAULT_TOPPERS =') + '\nreturn { DEFAULT_SYLLABUS };';
const { DEFAULT_SYLLABUS } = new Function(codeToEval)();

async function upload() {
    try {
        const jsonStr = JSON.stringify(DEFAULT_SYLLABUS);
        console.log("Uploading syllabus to Vercel Blob...");
        const blob = await put('db/syllabus.json', jsonStr, {
            access: 'public',
            token: BLOB_TOKEN,
            addRandomSuffix: false,
            contentType: 'application/json'
        });
        console.log("✅ Successfully updated syllabus blob:", blob.url);
    } catch (err) {
        console.error("Upload failed", err);
    }
}

upload();
