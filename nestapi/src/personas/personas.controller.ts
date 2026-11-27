import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { PersonasService } from './personas.service.js';
import { CreatePersonaDto } from './dto/create-persona.dto.js';
import { UpdatePersonaDto } from './dto/update-persona.dto.js';

@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  public findAll() {
    return this.personasService.getAll();
  }

  @Get(':id')
  public findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.getOne(id);
  }

  @Post()
  public create(@Body() dto: CreatePersonaDto) {
    return this.personasService.create(dto);
  }

  @Put(':id')
  public update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePersonaDto,
  ) {
    return this.personasService.update(id, dto);
  }

  @Patch(':id')
  public partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonaDto,
  ) {
    return this.personasService.partialUpdate(id, dto);
  }

  @Delete(':id')
  public remove(@Param('id', ParseIntPipe) id: number) {
    return this.personasService.remove(id);
  }
}
