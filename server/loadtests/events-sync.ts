import autocannon from 'autocannon';
import { faker } from '@faker-js/faker';

const instance = autocannon(
  {
    url: 'http://localhost:3000/events/sync',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: faker.lorem.word(), campaign: faker.internet.domainWord() }),
    connections: 10,
    duration: 5,
  },
  () => {}
);

autocannon.track(instance);
