const mongoose = require('mongoose');

const URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0";

async function checkMongo() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(URI);
    console.log("Connected!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`\nFound ${collections.length} collections:`, collections.map(c => c.name));
    
    for (const collInfo of collections) {
      const coll = db.collection(collInfo.name);
      const count = await coll.countDocuments();
      console.log(`\nCollection '${collInfo.name}' has ${count} documents.`);
      
      if (count > 0) {
        const sample = await coll.findOne({});
        console.log(`Sample keys:`, Object.keys(sample));
        if (sample.title) console.log("Sample title:", sample.title);
        if (sample.subject) console.log("Sample subject:", sample.subject);
        if (sample.examType) console.log("Sample examType:", sample.examType);
      }
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await mongoose.disconnect();
  }
}

checkMongo();
