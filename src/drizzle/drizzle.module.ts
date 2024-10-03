import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dbConfig from 'src/config/db.config';
import * as schema from './schema/schema'
export const DRIZZLE = Symbol('drizzle-connection');
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig],
    }),

  ],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: async  (dbConfig:ConfigService) => {
        const pool = new Pool({
         connectionString: dbConfig.get('db.url')
        })
        const db = drizzle(pool,{schema})
        return db   
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
