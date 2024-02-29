import { readFileSync } from 'node:fs';
import type { Producer } from 'kafkajs';
import { Kafka, Partitioners } from 'kafkajs';
import { batcherName, kafkaBroker, kafkaCaPath, kafkaSaslPassword, kafkaUsername } from './environment.js';
import type { BatchDocument } from './types.js';

export let producer: Producer;

export const produce = async <T>(topic: string, documents: BatchDocument<T>[]) => {
  if (!producer) {
    throw new Error('producer is not initialized');
  }
  const messages = documents.map(({ key, payload }) => ({
    key,
    value: JSON.stringify(payload),
  }));
  await producer.send({
    topic,
    messages,
  });
  console.log('aaaaaa', messages, topic);
  console.log(`produced ${messages.length} jobs`);
};

export const init = async () => {
  const kafka = new Kafka({
    ...(kafkaCaPath
      ? {
          ssl: {
            ca: readFileSync(kafkaCaPath).toString(),
          },
        }
      : {}),
    sasl: {
      username: kafkaUsername,
      password: kafkaSaslPassword,
      mechanism: 'plain',
    },
    clientId: batcherName,
    brokers: [kafkaBroker],
  });

  producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
  });
  await producer.connect();
  console.log('kafka init success');

  return () => producer.disconnect();
};
