import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import env from 'env-var';

const secretsPath = env.get('SECRETS_PATH').asString();

const getSecret = (name: string) => {
  const envValue = env.get(name).asString();

  if (envValue) {
    return envValue;
  }

  if (!secretsPath) {
    console.error({ secret: name }, 'SECRETS_PATH was not provided and secret does not exist in env');
    process.exit(1);
  }

  try {
    return readFileSync(join(secretsPath, name), { encoding: 'utf8' });
  } catch (error) {
    console.error({ err: error, secret: name }, 'could not load a required secret');
    process.exit(1);
  }
};

export const mongoUri = getSecret('MONGO_URI');
export const mongoDb = env.get('MONGO_DB').required().asString();
export const mongoCollection = env.get('MONGO_COLLECTION').required().asString();
export const kafkaBroker = env.get('KAFKA_BROKER').required().asString();
export const kafkaUsername = getSecret('KAFKA_USERNAME');
export const kafkaSaslPassword = getSecret('KAFKA_SASL_PASSWORD');
export const kafkaCaPath = env.get('KAFKA_CA_PATH').required().asString();
export const batcherName = getSecret('BATCHER_NAME');
export const jobs = env.get('JOBS').required().asArray();
export const topicSuffixKey = env.get('TOPIC_SUFFIX_KEY').asString();
