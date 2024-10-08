import 'dotenv/config';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
}

// Validación manual de PORT
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
if (!port || isNaN(port))  throw new Error('Config validation error: PORT is missing or invalid');

const natsServers = process.env.NATS_SERVERS ? process.env.NATS_SERVERS.split(',') : undefined;
if (!natsServers || natsServers.length === 0)  throw new Error('Config validation error: NATS_SERVERS is missing or empty');

const envVars: EnvVars = {
  PORT: port,
  NATS_SERVERS: natsServers,
};

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
};
