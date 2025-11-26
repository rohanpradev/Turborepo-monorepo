import type { Order } from "../types/order";

export class OrderModel {
  private static orders: Order[] = [];

  static async create(
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
  ): Promise<Order> {
    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.push(order);
    return order;
  }

  static async findById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) || null;
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId);
  }

  static async updateStatus(
    id: string,
    status: Order["status"],
  ): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
    }
    return order || null;
  }

  static async findAll(): Promise<Order[]> {
    return this.orders;
  }
}
