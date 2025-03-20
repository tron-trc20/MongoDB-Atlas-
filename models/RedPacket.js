const mongoose = require('mongoose');

const redPacketSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  count: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['alipay', 'usdt'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending'
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  remainingCount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('RedPacket', redPacketSchema); 