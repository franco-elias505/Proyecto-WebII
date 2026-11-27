import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CoursesModule } from '../courses/courses.module';
import { InscriptionsController } from './inscriptions.controller';
import { InscriptionsRepository } from './inscriptions.repository';
import { InscriptionsService } from './inscriptions.service';

@Module({
  imports: [AuthModule, CoursesModule],
  controllers: [InscriptionsController],
  providers: [InscriptionsRepository, InscriptionsService],
  exports: [InscriptionsRepository, InscriptionsService],
})
export class InscriptionsModule {}
