import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { sequelize } from './config/db.config';

async function bootstrap() {
  await sequelize.authenticate();
  Logger.log('Conexión a PostgreSQL establecida.', 'Database');

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap().catch(async (error: unknown) => {
  Logger.error(error instanceof Error ? error.message : String(error), 'Bootstrap');
  await sequelize.close();
  process.exitCode = 1;
});
