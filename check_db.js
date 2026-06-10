require('dotenv').config({path: 'backend/.env'});
const mongoose = require('mongoose');
const { BlackBookQuestion } = require('./backend/models/schemas.js');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const docs = await BlackBookQuestion.find({ exerciseName: { $regex: /Exercise-(4|5)/ } });
  console.log(docs.map(d => ({ q: d.exerciseName, num: d.questionIndex, ans: d.answerKeyStr })));
  process.exit(0);
});
