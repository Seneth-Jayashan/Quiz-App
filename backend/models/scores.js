const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, ref: 'Quiz.questions', required: true },
  selectedAnswers: [{ type: String }] 
});

const scoreSchema = new Schema({
  stdId: {type: String, required:true},
  stdName: {type: String, required:true},
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true }, 
  sessionCode: { type: Number, required: true },

  answers: [answerSchema],

  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, default: 0 },
  scorePercentage: { type: Number, default: 0 },
  timeTaken: {type:String, default:0},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt on save
scoreSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Score', scoreSchema);
