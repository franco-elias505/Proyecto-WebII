import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { Sequelize } from 'sequelize';

const envPath = resolve(__dirname, '../../../.env');
if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT ?? 5432),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  dialectOptions: { connectionTimeoutMillis: 5000 },
  logging: false,
});
