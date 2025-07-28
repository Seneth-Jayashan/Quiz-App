const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new Schema({
    sessionCode: { type: Number, required: true, },
    questionId: { type: String, required:true},
    answerCount: [{
        optionNumber: {type: Number,required: true},
        count: { type: Number, required: true }
    }],
    correctCount: { type: Number, required: true }
});

module.exports = mongoose.model('Response',responseSchema);