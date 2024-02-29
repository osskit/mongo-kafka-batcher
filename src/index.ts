import 'dotenv/config.js';

import { init as initMongo } from './mongo.js';
import { init as initKafka } from './kafka.js';

import { process } from './batch.js';
import { jobs } from './environment.js';

console.log('starting batcher..');
const disposeMongo = await initMongo();
const disposeKafka = await initKafka();

await Promise.all(jobs.map((job) => process(job)));

await disposeMongo();
await disposeKafka();
console.log('batcher completed successfully');
