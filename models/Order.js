const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  redPacket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RedPacket',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['alipay', 'usdt'],
    required: true
  },
  paymentId: {
    type: String,
    unique: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Order', orderSchema); 