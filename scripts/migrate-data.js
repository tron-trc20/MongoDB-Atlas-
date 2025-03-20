const { MongoClient } = require('mongodb');

// 本地数据库连接串
const LOCAL_URI = 'mongodb://localhost:27017/red_packet_db';

// Atlas连接串 (需要替换)
const ATLAS_URI = 'your_atlas_connection_string';

async function migrateData() {
  try {
    // 连接本地数据库
    const localClient = await MongoClient.connect(LOCAL_URI);
    const localDb = localClient.db();

    // 连接Atlas数据库
    const atlasClient = await MongoClient.connect(ATLAS_URI);
    const atlasDb = atlasClient.db();

    // 获取所有集合
    const collections = await localDb.listCollections().toArray();

    // 迁移每个集合的数据
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);

      // 读取本地数据
      const data = await localDb.collection(collectionName).find({}).toArray();

      if (data.length > 0) {
        // 写入到Atlas
        await atlasDb.collection(collectionName).insertMany(data);
        console.log(`Migrated ${data.length} documents in ${collectionName}`);
      }
    }

    console.log('Migration completed successfully!');
    
    // 关闭连接
    await localClient.close();
    await atlasClient.close();
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData(); 