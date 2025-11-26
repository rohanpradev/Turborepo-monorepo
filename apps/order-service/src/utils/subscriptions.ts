import { consumer } from "@/utils/kafka";
import { createOrder } from "@/utils/order";
import { Topics, type TopicHandler, type PaymentSuccessfulMessage } from "@repo/kafka";

export const runKafkaSubscriptions = async () => {
  const handlers: TopicHandler[] = [
    {
      topicName: Topics.PAYMENT_SUCCESSFUL,
      topicHandler: async (message: PaymentSuccessfulMessage) => {
        console.log(`Received payment.successful event for order: ${message.orderId}`);
        await createOrder({
          userId: message.userId,
          email: "",
          amount: message.amount,
          status: "success",
          products: message.items.map((item: any) => ({
            name: "",
            price: item.price,
            quantity: item.quantity,
          })),
        } as any);
      },
    },
  ];
  await consumer.start(handlers);
};
