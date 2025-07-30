const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

const Counter = mongoose.models.counter || mongoose.model("counter", counterSchema);

const userSchema = new Schema({
    userId: {type: Number, unique: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profilePicture: {type: String, default: '/uploads/default.jpg'},
    resetToken: {type: String, default: null},
    resetTokenExpiration: {type: Date, default: null},
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: {type: Boolean, default: false},
    lastLogin: {type: Date, default: null},
    createdAt: {type: Date, default: Date.now}
});

userSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "userId" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } 
    );
    this.userId = counter.value; 
    next();
  } catch (error) {
    next(error);
  }
});


module.exports = mongoose.model('User',userSchema);