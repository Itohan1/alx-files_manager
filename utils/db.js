const { MongoClient } = require('mongodb');
require('dotenv').config();

class DBClient {
  constructor() {
    const dbport = process.env.DB_PORT || 27017;
    const dbhost = process.env.DB_HOST || 'localhost';
    const dbstorage = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${dbhost}:${dbport}`;
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    this.client.connect()
      .then(() => {
        this.db = this.client.db(dbstorage);
      })
      .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
      });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const userCollection = this.db.collection('users');
      const userCount = await userCollection.countDocuments();
      return userCount;
    } catch (err) {
      console.error('Error counting users', err);
      return 0;
    }
  }

  async nbFiles() {
    try {
      const userCollection = this.db.collection('files');
      const userCount = userCollection.countDocuments();
      return userCount;
    } catch (err) {
      console.error('Error counting files', err);
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
