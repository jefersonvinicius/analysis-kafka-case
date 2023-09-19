import autocannon from 'autocannon';
import { faker } from '@faker-js/faker';

const instance = autocannon(
  {
    url: 'http://localhost:3000/events/async',
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: faker.lorem.word(), campaign: faker.internet.domainWord() }),
    connections: 20,
    duration: 10,
  },
  () => {}
);

autocannon.track(instance);
