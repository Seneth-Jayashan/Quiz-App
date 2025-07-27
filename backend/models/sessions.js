const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    code: {type: String, required: true, unique: true},
    hostId: {type: String, required: true},
    name: { type: String, required: true },
    description: { type: String, default: '' },
    questionId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    active: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session',sessionSchema);