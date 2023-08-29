import { Kafka } from 'kafkajs';
import { Event } from './domain';

const kafkaClient = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'],
});

const producer = kafkaClient.producer();

async function setup() {
  const result = await kafkaClient.admin().fetchTopicMetadata({ topics: ['events'] });
  if (!result.topics[0]) {
    console.log('Creating top');
    await kafkaClient.admin().createTopics({
      topics: [{ topic: 'events' }],
    });
  }
  await producer.connect();
}

async function addEvent(event: Event) {
  await producer.send({
    topic: 'events',
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
