// models/Quiz.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, default: false } 
    }
  ],
  points: { type: Number, default: 1 }
});

const quizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: null }, 
  createdBy: { type: Number, required: true }, 
  questions: [questionSchema],
  timeLimit: { type: Number, default: null }, 
  isPublished: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

quizSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
