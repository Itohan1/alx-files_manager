import RedisClient from '../utils/redis';
import DBClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisAlive = RedisClient.isAlive();
    const dbAlive = DBClient.isAlive();

    res.status(200).json({
      redis: redisAlive,
      db: dbAlive,
    });
  }

  static getStats(request, response) {
    response.status(200).json({
      users: DBClient.nbUsers(),
      files: DBClient.nbFiles(),
    });
  }
}

export default AppController;
