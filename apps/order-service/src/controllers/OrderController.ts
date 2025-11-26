import type { Context } from "hono";
import { OrderService } from "@/services/OrderService";

export class OrderController {
  static async getUserOrders(c: Context): Promise<Response> {
    const userId = c.get("userId") as string;
    const orders = await OrderService.getUserOrders(userId);
    return c.json({ success: true, data: orders });
  }

  static async getAllOrders(c: Context): Promise<Response> {
    const orders = await OrderService.getAllOrders();
    return c.json({ success: true, data: orders });
  }
}
