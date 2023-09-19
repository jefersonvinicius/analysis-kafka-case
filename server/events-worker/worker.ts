import 'dotenv/config';
import { Kafka } from 'kafkajs';
import database from '../database';
import { TOPIC } from '../queue';
import { Event } from '../domain';

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
      partitionsConsumedConcurrently: 10,
      eachBatch: async (payload) => {
        const eventsDto = payload.batch.messages.map((m) => JSON.parse(String(m.value) ?? '{}'));
        const events = eventsDto.map(Event.fromDTO);
        console.log(`Receiving batch of ${events.length} events on partition ${payload.batch.partition}`);
        await database.saveEvents(events);
      },
    });
  });

  await Promise.all(runs);
}

main().catch(console.error);
