import type { Request, Response, NextFunction } from 'express';
import { usersRepo } from '../repositories/users.js';
import { UserRoles, type User } from '../models/user.js';
import { dbUserRepoOperationStatusCode } from '../constants/dbStatusCodes.js';
import { generate2FASecret, hashPassword } from '../utils/crypto.js';

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
      res.status(400).json({
        message: 'no username provided',
      });
      return;
    }

    const [getResponseStatusCode, getResponse] =
      usersRepoInstance.get(username);

    if (
      getResponseStatusCode == dbUserRepoOperationStatusCode.non_existent_entry
    ) {
      res.status(400).json({
        message: 'user does not exist',
      });
      return;
    }

    if (
      getResponseStatusCode == dbUserRepoOperationStatusCode.error_querying_db
    ) {
      res.status(400).json({
        message: 'error querying DB',
      });
      return;
    }

    if (getResponseStatusCode != dbUserRepoOperationStatusCode.success) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    res.status(200).json(getResponse);
    return;
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    const { username, password, role } = req.body;

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

    if (!role || role == '') {
      res.status(400).json({
        message: 'no role provided',
      });
      return;
    }

    if (!(role in UserRoles)) {
      res.status(400).json({
        message: 'role ' + role + ' not valid',
      });
      return;
    }

    const secret = generate2FASecret({
      name: "Miriam's Portfolio",
      account: username,
    });

    if (!secret) {
      res.status(500).json({
        message: 'internal 2FA error',
      });
      return;
    }

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
      res.status(400).json({
        message: 'please provide at least one parameter to update',
      });
      return;
    }

    if (!currentUsername || currentUsername == '') {
      res.status(400).json({
        message: 'please provide current username',
      });
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

    const updateResponseStatusCode = usersRepoInstance.update(
      currentUsername,
      requestData,
    );

    if (
      updateResponseStatusCode ==
      dbUserRepoOperationStatusCode.non_existent_entry
    ) {
      res.status(400).json({
        message: 'user does not exist',
      });
      return;
    }

    if (updateResponseStatusCode != dbUserRepoOperationStatusCode.success) {
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
