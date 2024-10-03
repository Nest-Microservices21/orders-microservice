import { registerAs } from '@nestjs/config';

export default registerAs('db', () => {
  const url = process.env.DB_URL;
  // Validaciones
  if (!url) throw new Error('DB_URL environment variable is not set');

  return {
    url
  };
});
