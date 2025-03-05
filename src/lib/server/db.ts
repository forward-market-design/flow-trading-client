import { env } from '$env/dynamic/private';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export const db = drizzle(new Database(env.APP_DATABASE || ':memory:'), { schema });
migrate(db, { migrationsFolder: './drizzle' });
