import type { Request, Response, NextFunction } from 'express';

export class userController {
  static #instance: userController;

  constructor() {
    if (!userController.#instance) {
      userController.#instance = this;
    }

    return userController.#instance;
  }

  public get(req: Request, res: Response, next: NextFunction) {}

  public create(req: Request, res: Response, next: NextFunction) {}

  public update(req: Request, res: Response, next: NextFunction) {}

  public remove(req: Request, res: Response, next: NextFunction) {}
}
