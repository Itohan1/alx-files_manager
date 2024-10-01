import { createHash } from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const user = await dbClient.db.collection('users').findOne({ email });

      if (user) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const newpassword = createHash('sha1').update(password).digest('hex');

      const newUser = {
        email,
        password: newpassword,
      };

      const result = await dbClient.db.collection('users').insertOne(newUser);

      return res.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default UsersController;
