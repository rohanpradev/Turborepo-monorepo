import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { productRoutes } from "@/routes/productRoutes";
import { categoryRoutes } from "@/routes/categoryRoutes";
import { openApiSpec } from "@/config/openapi";
import { healthRoutes } from "@/routes/healthRoutes";
import { clerkAuthMiddleware } from "@/middleware/auth";
import { producer } from "@/utils/kafka";

// Initialize Kafka producer
producer
  .start()
  .then(() => {
    console.log("✓ Kafka producer connected");
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize Kafka producer:", error);
  });

// OpenAPI spec moved to ./config/openapi.ts

const app = new Hono();

// Logger middleware
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  }),
);

// Apply Clerk auth middleware globally to make auth available
app.use("*", clerkAuthMiddleware);

// Public routes (no authentication required)
app.route("/", healthRoutes);
app.get("/", (c) =>
  c.json({ message: "Product Service API", version: "1.0.0" }),
);
// OpenAPI document endpoint
app.get("/openapi.json", (c) => c.json(openApiSpec));
// Scalar API documentation
app.get(
  "/docs",
  Scalar({
    url: "/openapi.json",
    theme: "purple",
    pageTitle: "Product Service API Documentation",
  }),
);

// Routes with per-route auth middleware
app.route("/", productRoutes);
app.route("/", categoryRoutes);

export default {
  port: +(Bun.env.PORT ?? 3000),
  fetch: app.fetch,
};
