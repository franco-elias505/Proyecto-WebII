import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  AuthGuard,
  CurrentUser,
  Roles,
  ResourceAccess,
} from '../auth/auth.guard';
import type { SessionUser } from '../auth/auth.guard';
import { CatalogDto, IdParams } from '../common/request.dto';
import { CourseDto, CourseStateDto } from './courses.dto';
import { CoursesService } from './courses.service';

@ApiTags('Cursos')
@Controller('api/cursos')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  catalog(@Query() query: CatalogDto) {
    return this.courses.catalog(query);
  }

  @Get('categorias')
  categories() {
    return this.courses.categories();
  }

  @Get(':id')
  detail(@Param() { id }: IdParams) {
    return this.courses.detail(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles('instructor')
  create(@CurrentUser() user: SessionUser, @Body() data: CourseDto) {
    return this.courses.create(user.id, data);
  }

  @Put(':id')
  @ResourceAccess('curso', 'owner')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles('instructor')
  update(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() data: CourseDto,
  ) {
    return this.courses.update(id, user.id, data);
  }

  @Patch(':id/estado')
  @ResourceAccess('curso', 'owner')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles('instructor')
  state(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() data: CourseStateDto,
  ) {
    return this.courses.state(id, user.id, data.estado);
  }

  @Delete(':id')
  @ResourceAccess('curso', 'owner')
  @HttpCode(204)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Roles('instructor')
  remove(@Param() { id }: IdParams, @CurrentUser() user: SessionUser) {
    return this.courses.remove(id, user.id);
  }
}

@ApiTags('Cursos del instructor')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Roles('instructor')
@Controller('api/instructor/cursos')
export class InstructorCoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  mine(@CurrentUser() user: SessionUser, @Query() query: CatalogDto) {
    return this.courses.mine(user.id, query);
  }

  @Get(':id')
  @ResourceAccess('curso', 'owner')
  editor(@Param() { id }: IdParams, @CurrentUser() user: SessionUser) {
    return this.courses.editor(id, user.id);
  }
}
