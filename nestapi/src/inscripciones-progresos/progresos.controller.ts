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
import { ProgresosService } from './progresos.service.js';
import { CreateProgresoDto } from './dto/create-progreso.dto.js';
import { UpdateProgresoDto } from './dto/update-progreso.dto.js';

@Controller('progresos')
export class ProgresosController {
  constructor(private readonly progresosService: ProgresosService) {}

  @Get()
  public findAll() {
    return this.progresosService.getAll();
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.progresosService.getOne(id);
  }

  @Post()
  public create(@Body() dto: CreateProgresoDto) {
    return this.progresosService.create(dto);
  }

  @Put(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProgresoDto,
  ) {
    return this.progresosService.update(id, dto);
  }

  @Patch(':id')
  public partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgresoDto,
  ) {
    return this.progresosService.partialUpdate(id, dto);
  }

  @Delete(':id')
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.progresosService.remove(id);
  }
}
