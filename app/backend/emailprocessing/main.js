import 'bluebird';

import process from './process';
import { rabbitmq } from 'Utils';

const listenAndProcess = async () => {
  console.log('listenting and processing');
  const queue = 'gmail-import';
  const { channel } = await rabbitmq({
    queue,
  });

  console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

  channel.consume(
    queue,
    (msg) =>
      process({
        message: msg,
        channel,
      }),
    {
      noAck: false,
    }
  );
};

Promise.all([listenAndProcess()]);
