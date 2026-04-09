import type { RequestHandler } from "express";

export const withOrg: RequestHandler = (req, _res, next) => {
  const auth = (req as { auth?: { orgId?: string; userId?: string } }).auth;
  req.orgId = auth?.orgId ?? auth?.userId ?? "dev-org";
  next();
};
