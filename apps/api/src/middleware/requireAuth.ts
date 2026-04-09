import type { RequestHandler } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const clerkGuard = ClerkExpressRequireAuth();
const clerkSecretKey = process.env.CLERK_SECRET_KEY?.trim();
const clerkPublishableKey = (process.env.CLERK_PUBLISHABLE_KEY ?? process.env.VITE_CLERK_PUBLISHABLE_KEY)?.trim();
const authDisabled = process.env.DISABLE_AUTH?.trim().toLowerCase() === "true";

export const requireAuth: RequestHandler = (req, res, next) => {
  // Local/dev environments can bypass Clerk explicitly, or implicitly when keys are absent.
  if (authDisabled || !clerkSecretKey || !clerkPublishableKey) {
    (req as typeof req & { auth?: { userId: string; orgId: string } }).auth = {
      userId: "dev-user",
      orgId: "dev-org"
    };
    next();
    return;
  }

  return clerkGuard(req, res, next);
};
