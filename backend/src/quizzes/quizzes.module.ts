import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CoursesModule } from '../courses/courses.module';
import { InscriptionsModule } from '../inscriptions/inscriptions.module';
import { LessonsModule } from '../lessons/lessons.module';
import { QuizzesController } from './quizzes.controller';
import { QuizzesRepository } from './quizzes.repository';
import { QuizzesService } from './quizzes.service';

@Module({
  imports: [AuthModule, CoursesModule, LessonsModule, InscriptionsModule],
  controllers: [QuizzesController],
  providers: [QuizzesRepository, QuizzesService],
  exports: [QuizzesRepository, QuizzesService],
})
export class QuizzesModule {}
