const { MongoClient } = require('mongodb');

async function check() {
    const uri = "mongodb+srv://quantrexacademy:quantrex2024@cluster0.mongodb.net/quantrex?retryWrites=true&w=majority";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('quantrex');
        const count = await db.collection('pyqs').countDocuments();
        console.log('Total PYQs in MongoDB:', count);
        
        if (count > 0) {
            const sample = await db.collection('pyqs').findOne({});
            console.log('Sample PYQ chapter:', sample.chapter, 'subject:', sample.subject);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
check();
