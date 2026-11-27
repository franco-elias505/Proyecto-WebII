import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CuestionariosService } from './cuestionarios.service.js';
import { CreateCuestionarioDto } from './dto/create-cuestionario.dto.js';
import { UpdateCuestionarioDto } from './dto/update-cuestionario.dto.js';

@Controller('cuestionarios')
export class CuestionariosController {
  constructor(private readonly cuestionariosService: CuestionariosService) {}

  @Get()
  public findAll() {
    return this.cuestionariosService.getAll();
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cuestionariosService.getOne(id);
  }

  @Post()
  public create(@Body() dto: CreateCuestionarioDto) {
    return this.cuestionariosService.create(dto);
  }

  @Put(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCuestionarioDto,
  ) {
    return this.cuestionariosService.update(id, dto);
  }

  @Patch(':id')
  public partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCuestionarioDto,
  ) {
    return this.cuestionariosService.partialUpdate(id, dto);
  }

  @Delete(':id')
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.cuestionariosService.remove(id);
  }
}

