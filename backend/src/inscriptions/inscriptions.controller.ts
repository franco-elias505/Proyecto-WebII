import {
  Body,
  Controller,
  Delete,
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
import { EnrollCourseDto } from './inscriptions.dto';
import { InscriptionsService } from './inscriptions.service';

@ApiTags('Inscripciones')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('estudiante')
@Controller('api')
export class InscriptionsController {
  constructor(private readonly inscriptionsService: InscriptionsService) {}

  @Post('cursos/:id/inscribirme')
  enrollByParam(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.inscriptionsService.enroll(id, user.id);
  }

  @Post('inscripciones')
  enrollByBody(
    @Body() body: EnrollCourseDto,
    @CurrentUser() user: SessionUser,
  ) {
    const courseId = body.curso_id;
    if (!courseId) {
      throw new Error('Debe proporcionar un curso_id válido.');
    }
    return this.inscriptionsService.enroll(courseId, user.id);
  }

  @Get('cursos/:id/inscripcion')
  status(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.inscriptionsService.status(id, user.id);
  }

  @Get('estudiante/cursos')
  myCourses(@CurrentUser() user: SessionUser) {
    return this.inscriptionsService.myCourses(user.id);
  }

  @Get('inscripciones/mis-cursos')
  myCoursesAlias(@CurrentUser() user: SessionUser) {
    return this.inscriptionsService.myCourses(user.id);
  }

  @Delete('inscripciones/:id')
  @HttpCode(200)
  cancel(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.inscriptionsService.cancel(id, user.id);
  }
}
