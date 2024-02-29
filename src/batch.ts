/* eslint-disable no-await-in-loop */
import { groupBy, omit } from 'lodash-es';
import { getCollection } from './mongo.js';
import { mongoCollection, mongoDb, topicSuffixKey } from './environment.js';
import type { BatchDocument } from './types.js';
import { produce } from './kafka.js';

const getBatchesCollection = <T>() => getCollection<BatchDocument<T>>(mongoDb, mongoCollection);

export const process = async <T>(topic: string) => {
  const cursor = getBatchesCollection()
    .find<BatchDocument<T>>({
      topic,
    })
    .limit(1);
  let produceCount = 0;
  while (await cursor.hasNext()) {
    const batch: BatchDocument<T>[] = [];
    for (let i = 0; i < 1000; i++) {
      if (!(await cursor.hasNext())) {
        break;
      }
      const document = await cursor.next();
      if (document) {
        batch.push(omit(document, '_id'));
      }
    }
    await (topicSuffixKey
      ? Promise.all(
          Object.entries(groupBy(batch, topicSuffixKey)).map(([topicSuffixKey, documents]) =>
            produce(`${topic}-${topicSuffixKey}`, documents),
          ),
        )
      : produce(topic, batch));

    produceCount += batch.length;
    await getBatchesCollection().deleteMany({
      key: { $in: batch.map(({ key }) => key) },
    });
  }
  return { produceCount };
};
