import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error('There is an error with requesting server', err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          console.error('could not get key and value', err);
          return reject(err);
        }
        return resolve(value);
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err) => {
        if (err) {
          console.error('Could not get key and value', err);
          return reject(err);
        }
        return resolve();
      });
    });
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (err) {
      console.error('Could not remove key from redis', err);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
