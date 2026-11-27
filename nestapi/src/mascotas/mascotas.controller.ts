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
import { MascotasService } from './mascotas.service.js';
import { CreateMascotaDto } from './dto/create-mascota.dto.js';
import { UpdateMascotaDto } from './dto/update-mascota.dto.js';

@Controller('mascotas')
export class MascotasController {
  constructor(private readonly mascotasService: MascotasService) {}

  @Get()
  public findAll() {
    return this.mascotasService.getAll();
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mascotasService.getOne(id);
  }

  @Post()
  public create(@Body() dto: CreateMascotaDto) {
    return this.mascotasService.create(dto);
  }

  @Put(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMascotaDto,
  ) {
    return this.mascotasService.update(id, dto);
  }

  @Patch(':id')
  public partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMascotaDto,
  ) {
    return this.mascotasService.partialUpdate(id, dto);
  }

  @Delete(':id')
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.mascotasService.remove(id);
  }
}
