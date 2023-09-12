import 'dotenv/config';
import 'express-async-errors';
import express, { NextFunction, Request, Response } from 'express';
import database from './database';
import { ZodError, z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { Event } from './domain';
import { subDays } from 'date-fns';
import morgan from 'morgan';
import { formatSimpleDate } from './view';
import queue from './queue';

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.get('/healthy', (_, response) => {
  return response.sendStatus(200);
});

const eventSchema = z.object({
  name: z.string(),
  campaign: z.string(),
});

app.post('/events/sync', async (request: Request, response: Response) => {
  const eventDto = await eventSchema.parseAsync(request.body);
  const event = Event.fromDTO({ ...eventDto, dispatchedAt: new Date() });
  await database.saveEvent(event);
  return response.sendStatus(200);
});

app.post('/events/async', async (request: Request, response: Response) => {
  const eventDto = await eventSchema.parseAsync(request.body);
  const event = Event.fromDTO({ ...eventDto, dispatchedAt: new Date() });
  await queue.addEvent(event);
  return response.sendStatus(200);
});

const reportParamsSchema = z
  .object({
    start_at: z.date().default(subDays(new Date(), 30)),
    final_at: z.date().default(new Date()),
  })
  .transform((input) => ({ startAt: input.start_at, finalAt: input.final_at }));

app.get('/report', async (request: Request, response: Response) => {
  const params = await reportParamsSchema.parseAsync(request.query);
  const events = await database.getAllEvents(params);
  return response.json({
    events,
    startAt: formatSimpleDate(params.startAt),
    finalAt: formatSimpleDate(params.finalAt),
  });
});

app.use((error: any, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof ZodError) {
    const friendlyError = fromZodError(error);
    response.status(400).json({ message: friendlyError.message, details: friendlyError.details });
  } else {
    response.status(500).json({ message: 'Server Error' });
  }
  next(error);
});

export async function bootstrap() {
  await queue.setup();
  await database.start();
  app.listen(3000, () => {
    console.log('Serving at 3000');
  });
}
