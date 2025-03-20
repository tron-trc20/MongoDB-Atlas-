const mongoose = require('mongoose');

const uri = 'mongodb+srv://panzer:DOOVc93kEDQKT7kL@cluster0.28fll.mongodb.net/red_packet_db?retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      tlsAllowInvalidCertificates: true
    });
    console.log('成功连接到MongoDB Atlas!');
  } catch (error) {
    console.error('MongoDB连接错误:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 