import { Order } from "@repo/order-db";
import type { OrderSchemaType } from "@repo/order-db";

export const createOrder = async (order: OrderSchemaType) => {
  const newOrder = new Order(order);
  await newOrder.save();
  console.log(`✓ Order created: ${newOrder._id}`);
};
