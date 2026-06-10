import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        await mongoose.connection.collection('pyqs').dropIndex('question_id_1');
        console.log('dropped');
    } catch(e) {
        console.log('Not dropped or no such index:', e.message);
    }
    process.exit(0);
});
