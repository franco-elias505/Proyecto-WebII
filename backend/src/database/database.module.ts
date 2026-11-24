import { Global, Module } from '@nestjs/common';
import { DatabaseRepository } from './database.repository';

@Global()
@Module({
  providers: [DatabaseRepository],
  exports: [DatabaseRepository],
})
export class DatabaseModule {}
