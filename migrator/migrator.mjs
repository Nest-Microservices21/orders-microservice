import postgres from 'pg';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import dotenv from 'dotenv'; // Importar dotenv

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verifica que la variable de entorno esté definida
if (!process.env.DATABASE_URL) {
  throw new Error('process.env.DATABASE_URL is undefined.');
}

const url = process.env.DATABASE_URL; // Utiliza DATABASE_URL directamente
console.log({ url });

// Crea el cliente de PostgreSQL
const client = new postgres.Client({
  connectionString: url,
});

// Inicializa Drizzle ORM
const db = drizzle(client);

async function main() {
  console.info(`Running migrations...`);
  const migrationsFolder = path.join(__dirname, '../drizzle'); // Cambia la ruta de migración si es necesario

  // Conéctate a la base de datos
  await client.connect();

  // Ejecuta las migraciones
  await migrate(db, { migrationsFolder });
  console.info('Migrated successfully');

  await client.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('Migration failed');
  console.error(e);
  process.exit(1);
});
