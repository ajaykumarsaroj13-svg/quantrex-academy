import mongoose from 'mongoose';
import fs from 'fs';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('ERROR: MONGODB_URI is not defined in the environment.');
  process.exit(1);
}

const BackupSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

const BackupData = mongoose.models.BackupData || mongoose.model('BackupData', BackupSchema);

async function runBackup() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully.');
    
    console.log('Reading data from JSON backup (temp_export_for_firebase.json)...');
    const allData = JSON.parse(fs.readFileSync('temp_export_for_firebase.json', 'utf8'));

    // Push each top level key as a document
    for (const [key, data] of Object.entries(allData)) {
      console.log(`Backing up ${key}...`);
      await BackupData.findOneAndUpdate(
        { key: key },
        { data: data, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    
    console.log('All current active data successfully secured to MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
}

runBackup();
