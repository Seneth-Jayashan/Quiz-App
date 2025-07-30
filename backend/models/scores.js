const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new Schema ({
    stdId: {type: String, required:true, unique:true},
    stdName: {type: String, required:true},
    sessionCode : {type: Number, required:true},
    answers: [{
        questionId: {type: String, required:true},
        selectAnswer: {type: Number, required: true},
    }],
    correctAnswers: {type: Number},
    createdAt: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Score',scoreSchema);