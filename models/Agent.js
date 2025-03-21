const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4]
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  source: {
    type: String,
    required: true,
    enum: ['admin', 'agent'],
    default: 'agent'
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  inviteCode: String,
  parentId: String,
  siteConfig: {
    usdt: {
      address: String,
      qrcode: String
    },
    alipay: {
      name: String,
      account: String,
      qrcode: String
    },
    customerService: {
      url: String,
      id: String
    }
  },
  balance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  }
});

// 更新时自动设置updatedAt
agentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 获取所有代理
agentSchema.statics.getAllAgents = async function() {
  return this.find({}, { password: 0 }).sort({ level: 1, createdAt: -1 });
};

// 根据ID查找代理
agentSchema.statics.findAgentById = async function(id) {
  return this.findOne({ id }, { password: 0 });
};

// 根据用户名查找代理
agentSchema.statics.findAgentByUsername = async function(username) {
  return this.findOne({ username });
};

// 创建新代理
agentSchema.statics.createAgent = async function(agentData) {
  return this.create(agentData);
};

// 更新代理信息
agentSchema.statics.updateAgent = async function(id, updateData) {
  updateData.updatedAt = new Date();
  return this.findOneAndUpdate({ id }, updateData, { new: true });
};

// 删除代理
agentSchema.statics.deleteAgent = async function(id) {
  return this.deleteOne({ id });
};

// 查找某代理的下级代理
agentSchema.statics.findSubordinates = async function(parentId) {
  return this.find({ parentId }, { password: 0 });
};

module.exports = mongoose.models.Agent || mongoose.model('Agent', agentSchema); 