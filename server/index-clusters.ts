import os from 'node:os';
import cluster from 'node:cluster';
import { bootstrap } from './app';

const numCPUs = os.availableParallelism();

if (cluster.isPrimary) {
  for (let instance = 0; instance < numCPUs; instance++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} exited`);
  });
} else {
  console.log(`Starting worker ${process.pid}`);
  bootstrap();
}
