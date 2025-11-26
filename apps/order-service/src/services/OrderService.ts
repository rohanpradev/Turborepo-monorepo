import { Order } from "@repo/order-db";
import type { OrderType } from "@repo/types";

export class OrderService {
  static async getUserOrders(userId: string): Promise<OrderType[]> {
    const orders = await Order.find({ userId });
    return orders.map((order) => ({
      ...order.toObject(),
      _id: order._id.toString(),
    }));
  }

  static async getAllOrders(): Promise<OrderType[]> {
    const orders = await Order.find();
    return orders.map((order) => ({
      ...order.toObject(),
      _id: order._id.toString(),
    }));
  }
}
