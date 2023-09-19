import { Client } from 'pg';
import fs from 'node:fs/promises';
import { Event } from './domain';
import { startOfDay, endOfDay } from 'date-fns';

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
});

async function start() {
  await client.connect();
  const sql = String(await fs.readFile('./schema.sql'));
  await client.query(sql);
}

async function saveEvent(event: Event) {
  const insertSQL = 'INSERT INTO events (name, campaign, dispatched_at) VALUES($1,$2,$3)';
  await client.query(insertSQL, [event.name, event.campaign, event.dispatchedAt]);
}

async function saveEvents(events: Event[]) {
  const insertSQL =
    'INSERT INTO events (name, campaign, dispatched_at) VALUES ' +
    events
      .map((_, index) => {
        const factor = index * 3;
        return `($${1 + factor}, $${2 + factor}, $${3 + factor})`;
      })
      .join(',');
  const values = events.map((event) => [event.name, event.campaign, event.dispatchedAt]).flat();
  await client.query(insertSQL, values);
}

type GetAllEventsParams = {
  startAt: Date;
  finalAt: Date;
};

async function getAllEvents({ startAt, finalAt }: GetAllEventsParams) {
  const getSQL = 'SELECT * FROM events WHERE dispatched_at >= $1 AND dispatched_at <= $2';
  const result = await client.query(getSQL, [startOfDay(startAt), endOfDay(finalAt)]);
  return result.rows.map(rowToEvent);
}

function rowToEvent(row: any) {
  return new Event(row.id, row.name, row.campaign, row.created_at, row.dispatched_at);
}

const database = {
  start,
  saveEvent,
  getAllEvents,
  saveEvents,
};

export default database;
