import { registerAs } from '@nestjs/config';

export const NATS_SERVICE = 'NATS_SERVICE';

export default registerAs('nats-config', () => {
  const natsServers = process.env.NATS_SERVERS
    ? process.env.NATS_SERVERS.split(',')
    : ['nats://nats'];
  if (!natsServers || natsServers.length === 0)
    throw new Error(
      'Config validation error: NATS_SERVERS is missing or empty',
    );

  return {
    servers: natsServers,
  };
});
