import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const tests = mongoose.connection.collection('fulltestseries');
    const all = await tests.find({}, { projection: { exam: 1, title: 1 } }).toArray();
    console.log(`Total tests: ${all.length}`);
    const exams = {};
    all.forEach(t => {
        exams[t.exam] = (exams[t.exam] || 0) + 1;
    });
    console.log(exams);
    process.exit(0);
});
