import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    const targetName = "Quantrex Academy";
    
    // 1. Update jee_main_ultimate_series_2027
    const ultimateCollection = db.collection('jee_main_ultimate_series_2027');
    const docs = await ultimateCollection.find({}).toArray();
    let uCount = 0;
    for (let doc of docs) {
      let changed = false;
      let updateFields = {};
      
      if (doc.title && doc.title.toLowerCase().includes('examgoal')) {
        updateFields.title = doc.title.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.category && doc.category.toLowerCase().includes('examgoal')) {
        updateFields.category = doc.category.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.sectionName && doc.sectionName.toLowerCase().includes('examgoal')) {
        updateFields.sectionName = doc.sectionName.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.name && doc.name.toLowerCase().includes('examgoal')) {
        updateFields.name = doc.name.replace(/examgoal/ig, targetName);
        changed = true;
      }
      
      if (changed) {
        await ultimateCollection.updateOne({ _id: doc._id }, { $set: updateFields });
        uCount++;
      }
    }
    console.log(`Updated ${uCount} documents in jee_main_ultimate_series_2027 collection.`);

    // 2. Double check tests collection
    const testsCollection = db.collection('tests');
    const tDocs = await testsCollection.find({}).toArray();
    let tCount = 0;
    for (let doc of tDocs) {
      let changed = false;
      let updateFields = {};
      if (doc.title && doc.title.toLowerCase().includes('examgoal')) {
        updateFields.title = doc.title.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.category && doc.category.toLowerCase().includes('examgoal')) {
        updateFields.category = doc.category.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.sectionName && doc.sectionName.toLowerCase().includes('examgoal')) {
        updateFields.sectionName = doc.sectionName.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.name && doc.name.toLowerCase().includes('examgoal')) {
        updateFields.name = doc.name.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (changed) {
        await testsCollection.updateOne({ _id: doc._id }, { $set: updateFields });
        tCount++;
      }
    }
    console.log(`Updated ${tCount} documents in tests collection.`);
    
    // 3. Double check fulltestseries
    const ftCollection = db.collection('fulltestseries');
    const ftDocs = await ftCollection.find({}).toArray();
    let ftCount = 0;
    for (let doc of ftDocs) {
      let changed = false;
      let updateFields = {};
      if (doc.title && doc.title.toLowerCase().includes('examgoal')) {
        updateFields.title = doc.title.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.category && doc.category.toLowerCase().includes('examgoal')) {
        updateFields.category = doc.category.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (doc.name && doc.name.toLowerCase().includes('examgoal')) {
        updateFields.name = doc.name.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (changed) {
        await ftCollection.updateOne({ _id: doc._id }, { $set: updateFields });
        ftCount++;
      }
    }
    console.log(`Updated ${ftCount} documents in fulltestseries collection.`);

    // 4. Double check pyqchapters
    const pcCollection = db.collection('pyqchapters');
    const pcDocs = await pcCollection.find({}).toArray();
    let pcCount = 0;
    for (let doc of pcDocs) {
      let changed = false;
      let updateFields = {};
      if (doc.title && doc.title.toLowerCase().includes('examgoal')) {
        updateFields.title = doc.title.replace(/examgoal/ig, targetName);
        changed = true;
      }
      if (changed) {
        await pcCollection.updateOne({ _id: doc._id }, { $set: updateFields });
        pcCount++;
      }
    }
    console.log(`Updated ${pcCount} documents in pyqchapters collection.`);

    // 5. Update backupdatas collection (this stores JSON backups by key)
    const backupCollection = db.collection('backupdatas');
    const backupDocs = await backupCollection.find({}).toArray();
    let bCount = 0;
    for (let doc of backupDocs) {
      if (doc.data) {
        let str = JSON.stringify(doc.data);
        if (str.toLowerCase().includes('examgoal')) {
          // Replace it globally in the JSON data, but avoid replacing net links if possible, though vercel blob/mongodb backup probably doesn't use the net links or we want to clean them too.
          // Let's do case-insensitive replacement but preserve .net/cdn links if any
          const newStr = str.replace(/examgoal(?!.*net)/ig, targetName);
          await backupCollection.updateOne({ _id: doc._id }, { $set: { data: JSON.parse(newStr) } });
          bCount++;
        }
      }
    }
    console.log(`Updated ${bCount} documents in backupdatas collection.`);

  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
