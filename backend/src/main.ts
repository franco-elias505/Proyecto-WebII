import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module';
import { sequelize } from './config/db.config';

async function bootstrap() {
  await sequelize.authenticate();
  Logger.log('Conexión a PostgreSQL establecida.', 'Database');

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MiniAula API')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('api/docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap().catch(async (error: unknown) => {
  Logger.error(error instanceof Error ? error.message : String(error), 'Bootstrap');
  await sequelize.close();
  process.exitCode = 1;
});
