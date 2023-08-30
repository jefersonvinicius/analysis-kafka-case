import { CompressionTypes, Kafka, Partitioners } from 'kafkajs';
import { Event } from './domain';

const kafkaClient = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'],
});

const TOPIC = 'myevents';

const producer = kafkaClient.producer({ createPartitioner: Partitioners.DefaultPartitioner });

async function setup() {
  const result = await kafkaClient.admin().fetchTopicMetadata({ topics: [TOPIC] });
  console.log(result);
  if (!result.topics[0]) {
    console.log('Creating topic...');
    await kafkaClient.admin().createTopics({
      topics: [{ topic: TOPIC, numPartitions: 10, replicationFactor: 3 }],
    });
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
