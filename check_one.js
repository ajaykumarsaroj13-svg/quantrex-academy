import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const doc = await db.collection('jee_main_ultimate_series_2027').findOne();
    console.log(JSON.stringify(doc, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
