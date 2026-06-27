import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/crypto.js';
import { usersRepo } from '../repositories/users.js';
import { dbUserRepoOperationStatusCode } from '../constants/dbStatusCodes.js';
var jwt = require('jsonwebtoken');

async function protect(req: Request, res: Response, next: NextFunction) {
  const usersRepoInstance = new usersRepo();
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (token == undefined || !token || token == '') {
      res.status(401).json({ message: 'Malformed token' });
      return;
    }

    const [decodeStatus, decodedToken] = verifyToken(token);

    if (decodeStatus == false || !decodedToken) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }
    //call user service to get user
    const [statusCode, userObject] = usersRepoInstance.get(
      decodedToken.username,
    );

    // req.user = await User.findById(decoded.id).select('-password');

    if (statusCode == dbUserRepoOperationStatusCode.non_existent_entry) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (
      statusCode == dbUserRepoOperationStatusCode.error_querying_db ||
      !userObject ||
      userObject == null
    ) {
      res.status(400).json({ error: 'Internal server error' });
      return;
    }

    req.user = userObject;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }
}
