import amqp, { Channel, Connection } from 'amqplib';

import process from 'process';

type Config = {
  host?: string;
  queue: string;
  durable?: boolean;
};
type RabbitmqResponse = {
  connection: Connection;
  channel: Channel;
  publish: (msg: string, options?: Record<string, unknown>) => void;
};
type Rabbitmq = (config: Config) => Promise<RabbitmqResponse>;
const rabbitmq: Rabbitmq = async ({
  host = process.env.RABBITMQ_HOST,
  queue,
  ...config
}) => {
  console.log('host = ', host);
  const connection = await amqp.connect({
    hostname: host,
    username: process.env.RABBITMQ_USERNMAE,
    password: process.env.RABBITMQ_PASSWORD,
  });
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, {
    durable: config.durable || true,
  });

  return {
    connection,
    channel,
    publish: (msg, options) => {
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
        ...(options || {}),
      });
    },
  };
};

export default rabbitmq;
