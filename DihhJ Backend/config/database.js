const { MongoClient } = require('mongodb');
const { connectMemoryDB, getMemoryDB } = require('./memory-database');

let db = null;
let client = null;
let usingMemoryDB = false;

const connectDB = async () => {
  try {
    // Get MongoDB URL from environment variables
    const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DATABASE_NAME || 'dihhj_backend';

    console.log('🔌 Connecting to MongoDB...');

    // Create MongoDB client
    client = new MongoClient(mongoURL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Connect to MongoDB
    await client.connect();

    // Get database
    db = client.db(dbName);

    // Test the connection
    await db.admin().ping();

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${dbName}`);

    // Create indexes for better performance
    await createIndexes();

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Falling back to in-memory database for testing...');

    // Fall back to memory database
    db = await connectMemoryDB();
    usingMemoryDB = true;

    return db;
  }
};



const createIndexes = async () => {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Tea posts collection indexes
    await db.collection('teas').createIndex({ created_at: -1 });
    await db.collection('teas').createIndex({ score: -1 });
    await db.collection('teas').createIndex({ tag: 1 });
    await db.collection('teas').createIndex({ author: 1 });
    
    // Votes collection indexes
    await db.collection('votes').createIndex({ user_id: 1, tea_id: 1 }, { unique: true });
    await db.collection('votes').createIndex({ tea_id: 1 });
    
    // Comments collection indexes
    await db.collection('comments').createIndex({ tea_id: 1 });
    await db.collection('comments').createIndex({ created_at: -1 });
    await db.collection('comments').createIndex({ author: 1 });
    
    // Comment votes collection indexes
    await db.collection('comment_votes').createIndex({ user_id: 1, comment_id: 1 }, { unique: true });
    
    console.log('📋 Database indexes created successfully');
  } catch (error) {
    console.error('⚠️ Error creating indexes:', error);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
};

const isUsingMemoryDB = () => usingMemoryDB;

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  getDB,
  closeDB,
  isUsingMemoryDB
};
