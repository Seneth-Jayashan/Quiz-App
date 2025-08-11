const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  
  amount: { type: Number, required: true },    
  currency: { type: String, default: 'LKR' }, 
  
  paymentMethod: { type: String, required: true },  
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },

  transactionId: { type: String, unique: true,default:null }, 
  paymentDate: { type: Date, default: Date.now },

  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema);
