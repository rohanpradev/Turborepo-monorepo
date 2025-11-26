import { Hono } from "hono";
import { logger } from "hono/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { orderRoutes } from "@/routes/orderRoutes";
import { healthRoutes } from "@/routes/healthRoutes";
import { openApiSpec } from "@/config/openapi";
import { clerkAuthMiddleware } from "@/middleware/auth";
import { connectOrderDB } from "@repo/order-db";
import { producer } from "@/utils/kafka";
import { runKafkaSubscriptions } from "@/utils/subscriptions";

const PORT = +(Bun.env.PORT ?? 8001);

// Initialize MongoDB connection
connectOrderDB()
  .then(() => {
    const green = Bun.color("#00FF00", "ansi");
    const reset = "\x1b[0m";
    console.log(`${green}✓ Connected to MongoDB${reset}`);
    // Initialize Kafka after DB connection
    return producer.start();
  })
  .then(() => {
    const green = Bun.color("#00FF00", "ansi");
    const reset = "\x1b[0m";
    console.log(`${green}✓ Kafka producer connected${reset}`);
    return runKafkaSubscriptions();
  })
  .then(() => {
    const green = Bun.color("#00FF00", "ansi");
    const reset = "\x1b[0m";
    console.log(`${green}✓ Kafka subscriptions started${reset}`);
  })
  .catch((error: Error) => {
    const red = Bun.color("#FF0000", "ansi");
    const reset = "\x1b[0m";
    console.error(`${red}✗ Failed to initialize services:${reset}`, error);
    process.exit(1);
  });

const app = new Hono()
  // Logger middleware
  .use("*", logger())
  // Apply Clerk auth middleware globally to make auth available
  .use("*", clerkAuthMiddleware)
  // Public routes (no authentication required)
  .route("/", healthRoutes)
  .get("/", (c) => c.json({ message: "Order Service API", version: "1.0.0" }))
  // OpenAPI document endpoint
  .get("/openapi.json", (c) => c.json(openApiSpec))
  // Scalar API documentation
  .get(
    "/docs",
    Scalar({
      url: "/openapi.json",
      theme: "kepler",
      pageTitle: "Order Service API Documentation",
    }),
  )
  // Protected routes (authentication enforced by route middleware)
  .route("/", orderRoutes);

// Startup banner with colors
const cyan = Bun.color("cyan", "ansi");
const yellow = Bun.color("yellow", "ansi");
const blue = Bun.color("blue", "ansi");
const magenta = Bun.color("magenta", "ansi");
const green = Bun.color("green", "ansi");
const reset = "\x1b[0m";

console.log(`
${cyan}📦 Order Service${reset} is running!

${yellow}🚀 Server:${reset}     http://localhost:${PORT}
${blue}📚 API Docs:${reset}   http://localhost:${PORT}/docs
${magenta}📄 OpenAPI:${reset}    http://localhost:${PORT}/openapi.json
${green}🏥 Health:${reset}     http://localhost:${PORT}/health
`);

export default {
  port: PORT,
  fetch: app.fetch,
};
