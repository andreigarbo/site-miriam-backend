import type { Request, Response, NextFunction } from 'express';

export class authController {
  static #instance: authController;

  constructor() {
    if (!authController.#instance) {
      authController.#instance = this;
    }

    return authController.#instance;
  }

  public login(req: Request, res: Response, next: NextFunction) {}

  public refreshToken(req: Request, res: Response, next: NextFunction) {}
}
