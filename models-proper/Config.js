const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['default', 'usdt', 'redpacket'],
    default: 'default'
  },
  config: {
    type: Object,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 静态方法：获取配置
configSchema.statics.getConfig = async function(username, type = 'default') {
  try {
    const config = await this.findOne({ username, type });
    return config ? config.config : null;
  } catch (error) {
    console.error('获取配置失败:', error);
    return null;
  }
};

// 静态方法：更新配置
configSchema.statics.updateConfig = async function(username, type, configData) {
  try {
    const config = await this.findOneAndUpdate(
      { username, type },
      { 
        config: configData,
        updatedAt: new Date()
      },
      { 
        new: true,
        upsert: true
      }
    );
    return config;
  } catch (error) {
    console.error('更新配置失败:', error);
    throw error;
  }
};

module.exports = mongoose.model('Config', configSchema); 