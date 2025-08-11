const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerCountSchema = new Schema({
  optionId: { type: Schema.Types.ObjectId, required: true },
  count: { type: Number, default: 0 }
}, { _id: false });

const responseSchema = new Schema({
  sessionCode: { type: Number, required: true, index: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  questionId: { type: Schema.Types.ObjectId, ref: 'Quiz.questions', required: true, index: true },
  answerCount: [answerCountSchema],
  correctCount: { type: Number, required: true, default: 0 },
  totalResponses: { type: Number, required: true, default: 0 },
}, {
  timestamps: true
});

responseSchema.index({ sessionCode: 1, quizId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
