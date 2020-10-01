import 'bluebird';

import process from './process';
import { rabbitmq } from 'Utils';

const listenAndProcess = async () => {
  console.log('listenting and processing');
  const queue = 'alpine_rabbit_mq_test';
  const { connection, channel, publish } = await rabbitmq({
    queue,
  });

  console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

  channel.consume(
    queue,
    (msg) => console.log('Received: ', msg.content.toString()),
    {
      noAck: true,
    }
  );
};

Promise.all([listenAndProcess()]);
