import type { Request, Response, NextFunction } from 'express';
import { usersRepo } from '../repositories/users.js';
import { dbUserRepoOperationStatusCode } from '../constants/dbStatusCodes.js';
import {
  comparePasswords,
  generateTempJWT,
  verifyToken,
  verify2FACode,
  generateJWT,
} from '../utils/crypto.js';

export class authController {
  static #instance: authController;

  constructor() {
    if (!authController.#instance) {
      authController.#instance = this;
    }

    return authController.#instance;
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    const usersRepoInstance = new usersRepo();

    const { username, password } = req.body;

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

    const [getUserStatusCode, getUserResult] = usersRepoInstance.get(username);

    if (getUserStatusCode == dbUserRepoOperationStatusCode.non_existent_entry) {
      res.status(400).json({
        message: 'user does not exist',
      });
      return;
    }

    // DEBUGGING
    console.log(getUserStatusCode);
    console.log(getUserResult);
    // DEBUGGING

    if (
      getUserStatusCode != dbUserRepoOperationStatusCode.success ||
      !getUserResult
    ) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    const passwordsMatch = await comparePasswords(
      password,
      getUserResult.password,
    );

    if (!passwordsMatch) {
      res.status(400).json({
        message: 'incorrect password',
      });
      return;
    }

    const tempToken = generateTempJWT({ username: username });

    res.status(200).json({
      message: 'success',
      token: tempToken,
    });

    return;
  }

  public validate2FA(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    const { twoFACode } = req.body;

    let tempToken = req.headers.authorization;

    if (!tempToken || tempToken == '') {
      res.status(401).json({
        message: 'no temporary JTW token provided',
      });
      return;
    }

    tempToken = tempToken.split(' ')[1];

    if (tempToken == undefined || !tempToken || tempToken == '') {
      res.status(401).json({ message: 'Malformed token' });
      return;
    }

    const [decryptTokenStatus, decryptedToken] = verifyToken(tempToken);

    if (
      decryptTokenStatus == false ||
      !decryptedToken ||
      !decryptedToken.username
    ) {
      res.status(401).json({
        message: 'invalid token',
      });
      return;
    }

    const twoFAStatus = verify2FACode(req.user.secret, twoFACode);

    if (!twoFAStatus) {
      res.status(401).json({
        message: 'invalid 2FA code, please try again',
      });
      return;
    }

    const jwtToken = generateJWT({
      username: req.user.username,
    });

    if (!jwtToken) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    res.status(200).json({
      message: 'success',
      token: jwtToken,
    });
    return;
  }

  public refreshToken(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    let jwtToken = req.headers.authorization;

    if (!jwtToken || jwtToken == '') {
      res.status(401).json({
        message: 'no jwt token provided',
      });
      return;
    }

    jwtToken = jwtToken.split(' ')[1];

    if (jwtToken == undefined || !jwtToken || jwtToken == '') {
      res.status(401).json({ message: 'Malformed token' });
      return;
    }

    const [decryptTokenStatus, decryptedToken] = verifyToken(jwtToken);

    if (
      decryptTokenStatus == false ||
      !decryptedToken ||
      !decryptedToken.username
    ) {
      res.status(401).json({
        message: 'invalid token',
      });
      return;
    }

    const newJwtToken = generateJWT({
      username: req.user.username,
    });

    if (!newJwtToken) {
      res.status(400).json({
        message: 'internal server error',
      });
      return;
    }

    res.status(200).json({
      message: 'success',
      token: newJwtToken,
    });
    return;
  }
}
