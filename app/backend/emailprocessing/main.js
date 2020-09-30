import 'bluebird';

import amqp from 'amqplib';
import process from './process';

const listenAndProcess = async () => {
  console.log('listenting and processing');
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'alpine_rabbit_mq_test';

  channel.assertQueue(queue, {
    durable: false,
  });

  console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);

  channel.consume(queue, process, {
    noAck: true,
  });
};

Promise.all([listenAndProcess()]);
