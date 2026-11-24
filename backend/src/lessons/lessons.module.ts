import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CoursesModule } from '../courses/courses.module';
import { LessonsController } from './lessons.controller';
import { LessonsRepository } from './lessons.repository';
import { LessonsService } from './lessons.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, CoursesModule, StorageModule],
  controllers: [LessonsController],
  providers: [LessonsRepository, LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
