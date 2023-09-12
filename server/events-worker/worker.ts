import 'dotenv/config';
import { Kafka } from 'kafkajs';
import { Event } from '../domain';
import database from '../database';
import { TOPIC } from '../queue';

const kafkaClient = new Kafka({
  clientId: 'worker',
  brokers: ['localhost:9092'],
});

const consumers = Array.from({ length: 3 }).map(() => kafkaClient.consumer({ groupId: 'group-test' }));

async function main() {
  await database.start();
  for await (const consumer of consumers) {
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  }

  const runs = consumers.map((consumer, index) => {
    return consumer.run({
      eachMessage: async (payload) => {
        console.log(`CONSUMER ${index}`);
        const eventData = JSON.parse(String(payload.message.value ?? '{}'));
        const event = Event.fromDTO(eventData);
        console.log(`Event arrived on topic ${payload.topic} at partition ${payload.partition}`);
        console.log('Data: ', event);
        await database.saveEvent(event);
        console.log('Event saved.');
      },
    });
  });

  await Promise.all(runs);
}

main().catch(console.error);
