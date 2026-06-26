import type { Request, Response, NextFunction } from 'express';
import { generateToken, verifyToken } from 'node-2fa';
import { usersRepo } from '../repositories/users.js';
import { dbUserRepoOperationStatusCode } from '../constants/dbStatusCodes.js';

export class authController {
  static #instance: authController;

  constructor() {
    if (!authController.#instance) {
      authController.#instance = this;
    }

    return authController.#instance;
  }

  public login(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    const { username, password, token } = req.body;

    if (!username || username == '') {
      res.status(400).json({
        message: 'no username provided',
      });
      return;
    }

    if (!password || password == '') {
      res.status(400).json({
        message: 'no password provided',
      });
      return;
    }

    if (!token || token == '') {
      res.status(400).json({
        message: 'no 2FA token provided',
      });
      return;
    }

    const [getUserStatusCode, getUserResult] = usersRepoInstance.get(username);

    if (getUserStatusCode == dbUserRepoOperationStatusCode.non_existent_entry) {
      res.status(400).json({
        message: 'user does not exist',
      });
      return;
    }

    if (
      getUserStatusCode != dbUserRepoOperationStatusCode.success ||
      !getUserResult
    ) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    if (getUserResult.password != password) {
      res.status(400).json({
        message: 'incorrect password',
      });
      return;
    }

    next();
  }

  public validate2FA() {}

  public refreshToken(req: Request, res: Response, next: NextFunction) {}
}
