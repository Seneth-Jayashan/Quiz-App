const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{
    optionNumber: { type: Number, required: true },
    optionText: { type: String, required: true }
  }],
  correctAnswer: { type: Number, required: true },
  hostId: {type: Number, required: true},
  createdAt: {type: Date, default: Date.now()}
});



module.exports = mongoose.model('Question',questionSchema);