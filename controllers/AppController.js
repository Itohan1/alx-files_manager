import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    res.status(200).json({
      redis: redisAlive,
      db: dbAlive,
    });
  }

  static getStats(request, response) {
    response.status(200).json({
      users: dbClient.nbUsers(),
      files: dbClient.nbFiles(),
    });
  }
}

export default AppController;
