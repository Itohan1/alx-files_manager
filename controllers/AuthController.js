import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const basecredentials = authHeader.split(' ')[1];
    // const basecredentials1 = basecredentials.replace('=', '');
    const credentials = Buffer.from(basecredentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const hashedPassword = createHash('sha1').update(password).digest('hex');

      const user = await dbClient.db.collection('users').findOne({
        email,
        password: hashedPassword,
      });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();

      const redisK = `auth_${token}`;
      await redisClient.set(redisK, user._id.toString(), 864000);

      return res.status(200).json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userid = await redisClient.get(`auth_${token}`);
    if (!userid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default AuthController;
