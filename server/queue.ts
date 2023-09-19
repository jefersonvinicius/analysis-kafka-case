import { CompressionTypes, Kafka, KafkaJSProtocolError, Partitioners } from 'kafkajs';
import { Event } from './domain';
import { randomUUID } from 'node:crypto';

const kafkaClient = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'],
});

export const TOPIC = 'myevents';

const producer = kafkaClient.producer({ createPartitioner: Partitioners.DefaultPartitioner });
const admin = kafkaClient.admin();

async function start() {
  try {
    await admin.fetchTopicMetadata({ topics: [TOPIC] });
  } catch (error: unknown) {
    if (error instanceof KafkaJSProtocolError && error.type === 'UNKNOWN_TOPIC_OR_PARTITION') {
      console.log('Creating topic...');
      await admin.createTopics({
        topics: [{ topic: TOPIC, numPartitions: 10 }],
      });
    } else {
      throw error;
    }
  }

  await producer.connect();
}

async function addEvent(event: Event) {
  await producer.send({
    topic: TOPIC,
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
    acks: 0,
  });
}

async function addEvents(events: Event[]) {
  const key = randomUUID();
  await producer.send({
    topic: TOPIC,
    messages: events.map((event) => ({
      key,
      value: JSON.stringify(event),
    })),
    acks: 0,
  });
}

const queue = { start, addEvent, addEvents };

export default queue;
