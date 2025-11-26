import { clerkMiddleware } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import type { Context, Next } from "hono";

// Create Clerk auth middleware instance
export const clerkAuthMiddleware = clerkMiddleware({
  publishableKey: Bun.env.CLERK_PUBLISHABLE_KEY!,
  secretKey: Bun.env.CLERK_SECRET_KEY!,
});

export const shouldBeUser = createMiddleware(async (c: Context, next: Next) => {
  const auth = c.get("clerkAuth");
  const authObject = auth();
  if (!authObject?.userId) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }
  c.set("userId", authObject.userId);
  await next();
});

export const shouldBeAdmin = createMiddleware(
  async (c: Context, next: Next) => {
    const auth = c.get("clerkAuth");
    const authObject = auth();
    if (!authObject?.userId) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    const clerkClient = c.get("clerk");
    const user = await clerkClient.users.getUser(authObject.userId);
    if (user.publicMetadata?.role !== "admin") {
      return c.json({ success: false, error: "Forbidden" }, 403);
    }
    c.set("userId", authObject.userId);
    await next();
  },
);
