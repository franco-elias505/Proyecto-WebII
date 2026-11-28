import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, CurrentUser, Roles } from '../auth/auth.guard';
import type { SessionUser } from '../auth/auth.guard';
import { IdParams } from '../common/request.dto';
import { CreateQuestionDto, SubmitQuizDto, UpdateQuestionDto } from './quizzes.dto';
import { QuizzesService } from './quizzes.service';

@ApiTags('Cuestionarios')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('api')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('lecciones/:id/cuestionario')
  @Roles('estudiante', 'instructor')
  getQuiz(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.quizzesService.getQuizForStudent(id, user);
  }

  @Post('lecciones/:id/cuestionario/responder')
  @Roles('estudiante')
  submitQuiz(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() body: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(id, user, body.respuestas);
  }

  @Get('lecciones/:id/preguntas')
  @Roles('instructor')
  listQuestions(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.quizzesService.listQuestionsForInstructor(id, user);
  }

  @Post('lecciones/:id/preguntas')
  @Roles('instructor')
  createQuestion(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() body: CreateQuestionDto,
  ) {
    return this.quizzesService.createQuestion(id, user, body);
  }

  @Put('preguntas/:id')
  @Roles('instructor')
  updateQuestion(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
    @Body() body: UpdateQuestionDto,
  ) {
    return this.quizzesService.updateQuestion(id, user, body);
  }

  @Delete('preguntas/:id')
  @Roles('instructor')
  @HttpCode(200)
  deleteQuestion(
    @Param() { id }: IdParams,
    @CurrentUser() user: SessionUser,
  ) {
    return this.quizzesService.deleteQuestion(id, user);
  }
}
