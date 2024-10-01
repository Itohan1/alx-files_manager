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

  static async getStats(request, response) {
    try {
      const dusers = await dbClient.nbUsers();
      const dfiles = await dbClient.nbFiles();

      response.status(200).json({
        users: dusers,
        files: dfiles,
      });
    } catch (error) {
      response.status(500).json({ error: 'Error fetching stata' });
    }
  }
}

export default AppController;
