import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PersonasModule } from './personas/personas.module.js';
import { MascotasModule } from './mascotas/mascotas.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProductosModule } from './productos/productos.module.js';
import { CuestionariosModule } from './cuestionarios/cuestionarios.module.js';
import { InscripcionesProgresosModule } from './inscripciones-progresos/inscripciones-progresos.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('MYSQL_HOST', 'localhost'),
        port: Number(config.get<string>('MYSQL_PORT', '3307')),
        username: config.get<string>('MYSQL_USER', 'nestapi'),
        password: config.get<string>('MYSQL_PASSWORD', 'nestapi'),
        database: config.get<string>('MYSQL_DATABASE', 'nestapi'),
        autoLoadEntities: true,
        // Never auto-sync the schema in production; use migrations there.
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    PersonasModule,
    MascotasModule,
    CategoriasModule,
    ProductosModule,
    CuestionariosModule,
    InscripcionesProgresosModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
