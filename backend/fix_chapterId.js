import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Pyq } from './models/schemas.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const res = await Pyq.updateMany(
            { chapterId: 'binomial-theorem' },
            { $set: { chapterId: 'ch_mathematics_algebra_5' } }
        );
        console.log('Update result:', res);
    } catch(e) {
        console.log('Error:', e.message);
    }
    process.exit(0);
});
