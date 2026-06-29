import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    // Check jee_main_ultimate_series_2027 collection
    const ultimateCollection = db.collection('jee_main_ultimate_series_2027');
    const docs = await ultimateCollection.find({ title: { $regex: /ExamGoal/i } }).toArray();
    console.log(`Found ${docs.length} documents in jee_main_ultimate_series_2027 with 'ExamGoal' in title.`);
    
    if (docs.length > 0) {
      console.log("Sample title:", docs[0].title);
    }
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
