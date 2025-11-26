import {
  Kafka,
  type Consumer,
  type ConsumerSubscribeTopics,
  type EachMessagePayload,
  type EachBatchPayload,
} from "kafkajs";

export interface TopicHandler<T = any> {
  topicName: string;
  topicHandler: (message: T) => Promise<void>;
}

export class KafkaConsumer {
  private kafkaConsumer: Consumer;
  private handlers: Map<string, (message: any) => Promise<void>> = new Map();

  constructor(
    private kafka: Kafka,
    private groupId: string,
  ) {
    this.kafkaConsumer = this.createKafkaConsumer();
  }

  public async start<T = any>(topics: Array<TopicHandler<T>>): Promise<void> {
    // Store handlers
    topics.forEach(({ topicName, topicHandler }) => {
      this.handlers.set(topicName, topicHandler);
    });

    const subscribeTopics: ConsumerSubscribeTopics = {
      topics: topics.map((t) => t.topicName),
      fromBeginning: true,
    };

    try {
      await this.kafkaConsumer.connect();
      console.log(`Kafka consumer connected: ${this.groupId}`);

      await this.kafkaConsumer.subscribe(subscribeTopics);

      await this.kafkaConsumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;

          try {
            const handler = this.handlers.get(topic);
            if (handler) {
              const value = message.value?.toString();
              if (value) {
                const parsedMessage = JSON.parse(value);
                await handler(parsedMessage);
                console.log(`- ${prefix} processed successfully`);
              }
            } else {
              console.warn(`No handler found for topic: ${topic}`);
            }
          } catch (error) {
            console.error(`Error processing message ${prefix}:`, error);
            throw error;
          }
        },
      });
    } catch (error) {
      console.error("Error in consumer:", error);
      // Don't throw error to prevent service crash during Kafka startup
      console.log("Consumer will retry connection automatically");
    }
  }

  public async startBatch<T = any>(
    topics: Array<TopicHandler<T>>,
  ): Promise<void> {
    // Store handlers
    topics.forEach(({ topicName, topicHandler }) => {
      this.handlers.set(topicName, topicHandler);
    });

    const subscribeTopics: ConsumerSubscribeTopics = {
      topics: topics.map((t) => t.topicName),
      fromBeginning: true,
    };

    try {
      await this.kafkaConsumer.connect();
      console.log(`Kafka consumer connected: ${this.groupId}`);

      await this.kafkaConsumer.subscribe(subscribeTopics);

      await this.kafkaConsumer.run({
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload;
          const handler = this.handlers.get(batch.topic);

          if (!handler) {
            console.warn(`No handler found for topic: ${batch.topic}`);
            return;
          }

          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            try {
              const value = message.value?.toString();
              if (value) {
                const parsedMessage = JSON.parse(value);
                await handler(parsedMessage);
                console.log(`- ${prefix} processed successfully`);
              }
            } catch (error) {
              console.error(`Error processing message ${prefix}:`, error);
              throw error;
            }
          }
        },
      });
    } catch (error) {
      console.error("Error in batch consumer:", error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      await this.kafkaConsumer.disconnect();
      console.log(`Kafka consumer disconnected: ${this.groupId}`);
    } catch (error) {
      console.error("Error disconnecting the consumer:", error);
      throw error;
    }
  }

  private createKafkaConsumer(): Consumer {
    return this.kafka.consumer({ groupId: this.groupId });
  }
}

// Factory function for backward compatibility
export const createConsumer = (
  kafka: Kafka,
  groupId: string,
): KafkaConsumer => {
  return new KafkaConsumer(kafka, groupId);
};
