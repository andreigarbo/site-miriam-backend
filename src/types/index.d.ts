import express from 'express';

declare global {
  interface Error {
    status?: number;
  }

  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}
