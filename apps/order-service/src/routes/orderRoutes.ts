import { Hono } from "hono";
import { OrderController } from "@/controllers/OrderController";
import { shouldBeAdmin, shouldBeUser } from "@/middleware/auth";

export const orderRoutes = new Hono()
  .get("/api/user-order", shouldBeUser, OrderController.getUserOrders)
  .get("/api/orders", shouldBeAdmin, OrderController.getAllOrders);
