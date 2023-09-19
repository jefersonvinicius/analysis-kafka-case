import { createClient } from 'redis';
import { Event } from './domain';

const client = createClient();

const key = 'events-cache';

async function getEvents(): Promise<Event[]> {
  const events = await client.get(key);
  return events ? JSON.parse(events).map((dto: any) => Event.fromDTO(dto)) : [];
}

async function clearEvents() {
  await client.del(key);
}

async function saveEvents(events: Event[]) {
  await client.set(key, JSON.stringify(events));
}

async function start() {
  await client.connect();
}

const cache = { getEvents, clearEvents, saveEvents, start };

export default cache;
