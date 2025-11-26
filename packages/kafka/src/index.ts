export { createKafkaClient } from "./client.js";
export { createProducer, KafkaProducer } from "./producer.js";
export { createConsumer, KafkaConsumer, type TopicHandler } from "./consumer.js";
export { Topics, type ProductCreatedMessage, type ProductDeletedMessage, type PaymentSuccessfulMessage } from "./types.js";
