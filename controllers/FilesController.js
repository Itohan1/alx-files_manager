import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const acceptType = ['folder', 'file', 'image'];
    if (!type || !acceptType.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const fileData = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId ? ObjectId(parentId) : 0,
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileData);
      const file = result.ops[0];
      return res.status(201).json({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    }

    const filename = uuidv4();
    const filepath = path.join(FOLDER_PATH, filename);

    await fs.mkdir(FOLDER_PATH, { recursive: true });

    const buffer = Buffer.from(data, 'base64');
    await fs.writeFile(filepath, buffer);

    fileData.localPath = filepath;
    const result = await dbClient.db.collection('files').insertOne(fileData);

    return res.status(201).json(result.ops[0]);
  }
}

export default FilesController;
