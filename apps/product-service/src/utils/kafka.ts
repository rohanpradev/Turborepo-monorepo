import { createKafkaClient, KafkaProducer, KafkaConsumer } from "@repo/kafka";

const kafkaClient = createKafkaClient("product-service");

export const producer = new KafkaProducer(kafkaClient);
export const consumer = new KafkaConsumer(kafkaClient, "product-group");
