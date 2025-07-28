const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    code: {type: String, required: true, unique: true},
    hostId: {type: String, required: true},
    title: { type: String, required: true },
    questionId: [{ type: String, required: true }],
    active: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session',sessionSchema);