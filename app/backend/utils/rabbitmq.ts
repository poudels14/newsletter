import amqp, { Channel, Connection, Message } from 'amqplib';

type Config = {
  host?: string;
  queue: string;
};
type RabbitmqResponse = {
  connection: Connection;
  channel: Channel;
  publish: (msg: Message) => void;
};
type Rabbitmq = (config: Config) => Promise<RabbitmqResponse>;
const rabbitmq: Rabbitmq = async ({ host = 'localhost', queue }) => {
  const connection = await amqp.connect(`amqp://${host}`);
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, {
    durable: false,
  });

  return {
    connection,
    channel,
    publish: (msg) => {
      channel.sendToQueue(queue, Buffer.from(msg));
    },
  };
};

export default rabbitmq;
