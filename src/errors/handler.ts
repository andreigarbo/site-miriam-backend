import type { Request, Response } from 'express';

export const errorHandler = (error: Error, req: Request, res: Response) => {
  console.error(error.name + ': ' + error.message);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  });
  return;
};

/*
import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};

class errorHandler {
  static #instance: errorHandler;

  constructor() {
    if (!errorHandler.#instance) {
      errorHandler.#instance = this;
    }

    return errorHandler.#instance;
  }

  public handle(error: Error, req: Request, res: Response) {
    console.error(error.name + ': ' + error.message);
    res.status(error.status || 500).json({
      message: error.message || 'Internal server error',
    });
    return;
  }
}

export { errorHandler };
*/
