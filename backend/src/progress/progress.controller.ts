import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser, Roles } from '../auth/auth.guard';
import type { SessionUser } from '../auth/auth.guard';
import { IdParams } from '../common/request.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progreso')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('estudiante')
@Controller('api')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lecciones/:id/completar')
  @HttpCode(200)
  completeLesson(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.progressService.completeContentLesson(id, user);
  }

  @Get('cursos/:id/progreso')
  getCourseProgress(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.progressService.getCourseProgress(id, user);
  }
}
