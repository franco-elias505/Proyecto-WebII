import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
  Req,
  Get,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  AuthGuard,
  CurrentUser,
  Roles,
  ResourceAccess,
} from '../auth/auth.guard';
import type { SessionUser } from '../auth/auth.guard';
import { IdParams } from '../common/request.dto';
import { LessonDto, LessonOrderDto } from './lessons.dto';
import { LessonsService } from './lessons.service';
import { FileParams } from './lessons.dto';
import { FileUploadInterceptor } from './file-upload.interceptor';
import type { Request, Response } from 'express';

@ApiTags('Lecciones')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get('cursos/:id/lecciones')
  @Roles('estudiante')
  @ResourceAccess('curso', 'enrolled')
  list(@Param() { id }: IdParams, @CurrentUser() user: SessionUser) {
    return this.lessons.list(id, user.id);
  }

  @Get('lecciones/:id')
  view(@Param() { id }: IdParams, @CurrentUser() user: SessionUser) {
    return this.lessons.view(id, user);
  }

  @Post('lecciones/:id/archivos')
  @Roles('instructor')
  @ResourceAccess('leccion', 'owner')
  @UseInterceptors(FileUploadInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['archivo'],
      properties: { archivo: { type: 'string', format: 'binary' } },
    },
  })
  upload(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Req() request: Request,
  ) {
    return this.lessons.upload(id, user.id, request);
  }

  @Get('lecciones/:id/archivos/:archivoId')
  async download(
    @Param() { id, archivoId }: FileParams,
    @CurrentUser() user: SessionUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.lessons.download(id, archivoId, user);
    response.attachment(file.nombre_original);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'private, no-store');
    return new StreamableFile(file.stream, {
      type: file.tipo_mime,
      length: file.tamano,
    });
  }

  @Delete('lecciones/:id/archivos/:archivoId')
  @HttpCode(204)
  @Roles('instructor')
  @ResourceAccess('leccion', 'owner')
  deleteFile(
    @Param() { id, archivoId }: FileParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.lessons.deleteFile(id, archivoId, user.id);
  }

  @Post('cursos/:id/lecciones')
  @Roles('instructor')
  @ResourceAccess('curso', 'owner')
  create(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() data: LessonDto,
  ) {
    return this.lessons.create(id, user.id, data);
  }

  @Put('lecciones/:id')
  @Roles('instructor')
  @ResourceAccess('leccion', 'owner')
  update(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() data: LessonDto,
  ) {
    return this.lessons.update(id, user.id, data);
  }

  @Delete('lecciones/:id')
  @Roles('instructor')
  @ResourceAccess('leccion', 'owner')
  @HttpCode(204)
  remove(@Param() { id }: IdParams, @CurrentUser() user: SessionUser) {
    return this.lessons.remove(id, user.id);
  }

  @Patch('cursos/:id/lecciones/orden')
  @Roles('instructor')
  @ResourceAccess('curso', 'owner')
  reorder(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() data: LessonOrderDto,
  ) {
    return this.lessons.reorder(id, user.id, data.lecciones);
  }
}
