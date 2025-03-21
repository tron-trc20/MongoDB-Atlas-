const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
  customerService: {
    url: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  usdtRate: {
    type: Number,
    required: true,
    default: 7.2
  },
  payment: {
    usdt: {
      address: {
        type: String,
        default: ""
      },
      rate: {
        type: Number,
        default: 7.2
      }
    }
  },
  site: {
    domain: {
      type: String,
      default: "example.com"
    },
    port: {
      type: Number,
      default: 3000
    },
    ssl: {
      enabled: {
        type: Boolean,
        default: false
      },
      cert: String,
      key: String
    }
  },
  database: {
    type: {
      type: String,
      default: "mongodb"
    },
    path: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 使用单例模式，确保只有一个配置文档
siteConfigSchema.statics.getConfig = async function() {
  const config = await this.findOne({});
  if (config) {
    return config;
  }
  
  // 如果没有配置，创建默认配置
  return this.create({
    customerService: {
      url: "https://t.me/Juyy2",
      id: "@juyy21"
    },
    usdtRate: 7.2,
    payment: {
      usdt: {
        address: "TNE7mTdTQmYgy8ZgsxUkYeYVH6BnjKFzAU",
        rate: 7.2
      }
    },
    site: {
      domain: "example.com",
      port: 3000,
      ssl: {
        enabled: false
      }
    },
    database: {
      type: "mongodb"
    }
  });
};

// 更新配置
siteConfigSchema.statics.updateConfig = async function(newConfig) {
  const config = await this.findOne({});
  if (config) {
    Object.assign(config, newConfig, { updatedAt: new Date() });
    return config.save();
  }
  return this.create({
    ...newConfig,
    updatedAt: new Date()
  });
};

module.exports = mongoose.models.SiteConfig || mongoose.model('SiteConfig', siteConfigSchema); 