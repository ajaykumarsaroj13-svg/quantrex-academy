const { MongoClient } = require('mongodb');
async function run() {
  const c = new MongoClient('mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0');
  await c.connect();
  const db = c.db('quantrex');
  const count = await db.collection('testSeries2027').countDocuments();
  console.log('Total docs in testSeries2027:', count);
  if(count > 0) {
    const all = await db.collection('testSeries2027').find({}, {projection:{testTitle:1, categoryName:1, questions:1}}).toArray();
    for(const t of all) {
      console.log(`- [${t.categoryName}] ${t.testTitle}: ${t.questions?.length || 0} questions`);
    }
  }
  await c.close();
}
run().catch(console.error);
