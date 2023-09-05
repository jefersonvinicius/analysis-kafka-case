import { CompressionTypes, Kafka, KafkaJSProtocolError, Partitioners } from 'kafkajs';
import { Event } from './domain';

const kafkaClient = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'],
});

export const TOPIC = 'myevents';

const producer = kafkaClient.producer({ createPartitioner: Partitioners.DefaultPartitioner });
const admin = kafkaClient.admin();

async function setup() {
  try {
    await admin.fetchTopicMetadata({ topics: [TOPIC] });
  } catch (error: unknown) {
    if (error instanceof KafkaJSProtocolError && error.type === 'UNKNOWN_TOPIC_OR_PARTITION') {
      console.log('Creating topic...');
      await admin.createTopics({
        topics: [{ topic: TOPIC, numPartitions: 10 }],
      });
      return;
    }

    throw error;
  }

  await producer.connect();
}

async function addEvent(event: Event) {
  await producer.send({
    topic: TOPIC,
    messages: [
      {
        key: event.campaign,
        value: JSON.stringify(event),
      },
    ],
    acks: 0,
  });
}

const queue = { setup, addEvent };

export default queue;
