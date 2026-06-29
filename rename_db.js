import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    const targetName = "Quantrex Academy";
    
    // Check fulltestseries
    const fullTests = await db.collection('fulltestseries').find({}).toArray();
    let ftCount = 0;
    for (let test of fullTests) {
       if (test.title && test.title.toLowerCase().includes('examgoal')) {
           const newTitle = test.title.replace(/examgoal/ig, targetName);
           await db.collection('fulltestseries').updateOne({_id: test._id}, {$set: {title: newTitle}});
           ftCount++;
       }
    }
    console.log(`Updated ${ftCount} documents in fulltestseries.`);
    
    // Check tests
    const tests = await db.collection('tests').find({}).toArray();
    let tCount = 0;
    for (let test of tests) {
       if (test.title && test.title.toLowerCase().includes('examgoal')) {
           const newTitle = test.title.replace(/examgoal/ig, targetName);
           await db.collection('tests').updateOne({_id: test._id}, {$set: {title: newTitle}});
           tCount++;
       }
       if (test.name && test.name.toLowerCase().includes('examgoal')) {
           const newName = test.name.replace(/examgoal/ig, targetName);
           await db.collection('tests').updateOne({_id: test._id}, {$set: {name: newName}});
           tCount++;
       }
    }
    console.log(`Updated ${tCount} documents in tests.`);
    
    // Check courses
    const courses = await db.collection('courses').find({}).toArray();
    let cCount = 0;
    for (let course of courses) {
       if (course.title && course.title.toLowerCase().includes('examgoal')) {
           const newTitle = course.title.replace(/examgoal/ig, targetName);
           await db.collection('courses').updateOne({_id: course._id}, {$set: {title: newTitle}});
           cCount++;
       }
    }
    console.log(`Updated ${cCount} documents in courses.`);
    
    // Check pyqchapters
    const pyqchapters = await db.collection('pyqchapters').find({}).toArray();
    let pcCount = 0;
    for (let ch of pyqchapters) {
       if (ch.title && ch.title.toLowerCase().includes('examgoal')) {
           const newTitle = ch.title.replace(/examgoal/ig, targetName);
           await db.collection('pyqchapters').updateOne({_id: ch._id}, {$set: {title: newTitle}});
           pcCount++;
       }
    }
    console.log(`Updated ${pcCount} documents in pyqchapters.`);
    
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();
