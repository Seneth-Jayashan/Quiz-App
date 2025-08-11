const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  code: { type: Number, required: true, unique: true, index: true },
  hostId: { type: Number, required: true },
  title: { type: String, required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  active: { type: Boolean, default: true },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
