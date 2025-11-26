import { Hono } from "hono";

export const healthRoutes = new Hono().get("/health", (c) =>
  c.json({
    status: "ok",
    service: "product-service",
    timestamp: new Date().toISOString(),
  }),
);
