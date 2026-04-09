import "express";

declare global {
  namespace Express {
    interface Request {
      orgId?: string;
    }
  }
}

export {};
