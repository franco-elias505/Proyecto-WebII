import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import {
  CoursesController,
  InstructorCoursesController,
} from './courses.controller';
import { CoursesRepository } from './courses.repository';
import { CoursesService } from './courses.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [CoursesController, InstructorCoursesController],
  providers: [CoursesRepository, CoursesService],
  exports: [CoursesRepository, CoursesService],
})
export class CoursesModule {}
