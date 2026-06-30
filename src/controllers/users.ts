import type { Request, Response, NextFunction } from 'express';
import { usersRepo } from '../repositories/users.js';
import { UserRoles, type User } from '../models/user.js';
import { dbUserRepoOperationStatusCode } from '../constants/dbStatusCodes.js';
import { generate2FASecret, hashPassword } from '../utils/crypto.js';
import {
  InternalServerError,
  RequestInvalidDataError,
  RequestMissingDataError,
} from '../errors/errors.js';

export class userController {
  static #instance: userController;

  constructor() {
    if (!userController.#instance) {
      userController.#instance = this;
    }

    return userController.#instance;
  }

  public get(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    const { username } = req.body;

    if (!username || username == '') {
      throw new RequestMissingDataError('username');
    }
    try {
      const getResponse = usersRepoInstance.get(username);

      res.status(200).json(getResponse);
    } catch (error) {
      throw error;
    }
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    const { username, password, role } = req.body;

    if (!username || username == '') {
      throw new RequestMissingDataError('username');
    }

    if (!password || password == '') {
      throw new RequestMissingDataError('password');
    }

    if (!role || role == '') {
      throw new RequestMissingDataError('role');
    }

    if (!(role in UserRoles)) {
      throw new RequestInvalidDataError('role');
    }

    const secret = generate2FASecret({
      name: "Miriam's Portfolio",
      account: username,
    });

    if (!secret) {
      throw new InternalServerError();
    }

    // bookmark

    const encodedPassword = await hashPassword(password);

    const requestData = {
      username: username,
      password: encodedPassword,
      role: role,
      secret: secret,
    } as User;

    const createResponseStatusCode = usersRepoInstance.insert(requestData);

    if (createResponseStatusCode != dbUserRepoOperationStatusCode.success) {
      res.status(500).json({
        message: 'internal server error',
      });
      return;
    }
    res.status(200).json({ message: 'success', userSecret: secret });
    return;
  }

  public update(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    let { currentUsername, newUsername, password, role } = req.body;

    if (
      (!newUsername || newUsername == '') &&
      (!password || password == '') &&
      (!role || role == '')
    ) {
      throw new RequestMissingDataError(
        'at least one of new username, password, role',
      );
    }

    if (!currentUsername || currentUsername == '') {
      throw new RequestMissingDataError('username');
    }

    if (!newUsername) {
      newUsername = '';
    }

    if (!password) {
      password = '';
    }

    if (!role) {
      role = '';
    }

    const requestData = {
      username: newUsername,
      password: password,
      role: role,
    } as User;

    try {
      usersRepoInstance.update(currentUsername, requestData);
      res.status(200).json({
        message: 'success',
      });
    } catch (error) {
      throw error;
    }
  }

  public remove(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    let { username } = req.body;

    if (!username || username == '') {
      res.status(400).json({
        message: 'no username provided',
      });
      return;
    }

    const deleteRequestStatus = usersRepoInstance.delete(username);

    if (
      deleteRequestStatus == dbUserRepoOperationStatusCode.non_existent_entry
    ) {
      res.status(400).json({
        message: 'user does not exist',
      });
      return;
    }

    if (deleteRequestStatus != dbUserRepoOperationStatusCode.success) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    res.status(200).json({
      message: 'success',
    });
    return;
  }
}
