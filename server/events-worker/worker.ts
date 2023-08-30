import 'dotenv/config';
import { Kafka } from 'kafkajs';
import { Event } from '../domain';
import database from '../database';

const kafkaClient = new Kafka({
  clientId: 'server',
  brokers: ['localhost:9092'],
});

const consumer = kafkaClient.consumer({ groupId: 'group-test' });

async function main() {
  await database.start();
  await consumer.connect();
  await consumer.subscribe({ topic: 'events', fromBeginning: true });
  await consumer.run({
    eachMessage: async (payload) => {
      const eventData = JSON.parse(String(payload.message.value ?? '{}'));
      const event = Event.fromDTO(eventData);
      console.log(`Event arrived on topic ${payload.topic} at partition ${payload.partition}`);
      console.log('Data: ', event);
      // throw new Error('Any error');
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      await database.saveEvent(event);
      console.log('Event saved.');
    },
  });
}

main().catch(console.error);
