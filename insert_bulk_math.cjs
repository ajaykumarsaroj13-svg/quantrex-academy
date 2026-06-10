require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('quantrex');
    const collection = db.collection('pyqs');

    const data = JSON.parse(fs.readFileSync('all_math_pyqs_fixed.json', 'utf-8'));
    console.log(`Loaded ${data.length} questions from JSON.`);

    // Get all unique chapterIds from the data
    const chapterIds = [...new Set(data.map(q => q.chapterId))];
    console.log(`Found ${chapterIds.length} unique chapter IDs.`);

    // Delete existing questions in these chapters to avoid duplicates
    console.log('Deleting existing questions for these chapters in pyqs...');
    const deleteResult = await collection.deleteMany({ chapterId: { $in: chapterIds } });
    console.log(`Deleted ${deleteResult.deletedCount} existing questions.`);

    // Insert in batches of 500
    const BATCH_SIZE = 500;
    let insertedCount = 0;
    console.log('Starting bulk insert...');

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        const result = await collection.insertMany(batch);
        insertedCount += result.insertedCount;
        console.log(`Inserted batch ${i / BATCH_SIZE + 1}: +${result.insertedCount} questions (${insertedCount}/${data.length})`);
    }

    console.log('All questions inserted successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

run();
